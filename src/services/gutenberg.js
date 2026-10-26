const GUTENDEX = 'https://gutendex.com/books';

export async function getGutenbergBookById(id) {
  const res = await fetch(`${GUTENDEX}/${id}`);
  if (!res.ok) throw new Error('Book not found');
  return res.json();
}

export function getTextUrl(book) {
  const f = book.formats ?? {};
  return (
    f['text/plain; charset=utf-8'] ||
    f['text/plain; charset=us-ascii'] ||
    f['text/plain'] ||
    null
  );
}

export async function fetchBookText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch book text');
  return res.text();
}

export function parseIntoPages(rawText, charsPerPage = 3200) {
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const paragraphs = cleaned.split('\n\n').filter((p) => p.trim().length > 0);
  const pages = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length > charsPerPage && current.length > 0) {
      pages.push(current.trim());
      current = para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }

  if (current.trim()) pages.push(current.trim());
  return pages;
}
