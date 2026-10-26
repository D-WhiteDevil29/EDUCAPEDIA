const https   = require('https');
const http    = require('http');
const { URL } = require('url');

const HTTPS_AGENT = new https.Agent({ rejectUnauthorized: false });

function proxyFetch(targetUrl, res, hops = 0) {
  if (hops > 8) {
    res.status(502).end('Too many redirects');
    return;
  }

  const isHttps = targetUrl.startsWith('https');
  const lib = isHttps ? https : http;

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; EducaPedia)',
      'Accept':     'application/epub+zip, */*',
    },
  };
  if (isHttps) options.agent = HTTPS_AGENT;

  const req = lib.get(targetUrl, options, (upstream) => {
    const { statusCode, headers } = upstream;

    if ([301, 302, 307, 308].includes(statusCode)) {
      const loc = headers['location'];
      if (!loc) { res.status(502).end('Redirect without location'); return; }
      const next = loc.startsWith('http') ? loc : new URL(loc, targetUrl).href;
      upstream.resume();
      proxyFetch(next, res, hops + 1);
      return;
    }

    if (statusCode !== 200) {
      upstream.resume();
      res.status(statusCode).end(`Upstream ${statusCode}`);
      return;
    }

    res.setHeader('Content-Type',  headers['content-type']  || 'application/epub+zip');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (headers['content-length']) {
      res.setHeader('Content-Length', headers['content-length']);
    }
    res.status(200);
    upstream.pipe(res);
  });

  req.setTimeout(30000, () => {
    req.destroy();
    if (!res.headersSent) res.status(504).end('Proxy timeout');
  });

  req.on('error', (err) => {
    console.error('[epub-proxy]', err.code, targetUrl);
    if (!res.headersSent) res.status(502).end(err.code);
  });
}

module.exports = function (app) {
  app.get('/epub-proxy/archive/:path(*)', (req, res) => {
    proxyFetch(`https://archive.org/download/${req.params.path}`, res);
  });

  app.get('/epub-proxy/gutenberg/:path(*)', (req, res) => {
    proxyFetch(`https://www.gutenberg.org/cache/epub/${req.params.path}`, res);
  });
};
