import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ePub from 'epubjs';
import {
  HiChevronLeft, HiArrowLeft, HiArrowRight,
  HiMenuAlt2, HiAdjustments, HiX, HiTranslate, HiRefresh, HiCursorClick
} from 'react-icons/hi';
import { getCachedEpub, cacheEpub } from '../../services/epubCache';
import { saveProgress, getProgress, markFinished } from '../../services/readingProgress';
import './EpubReader.css';

const EPUB_SOURCES = (id) => [
  `/epub-proxy/gutenberg/${id}/pg${id}-images.epub`,
  `/epub-proxy/gutenberg/${id}/pg${id}.epub`,
  `/epub-proxy/archive/pg${id}/pg${id}.epub`,
  `/epub-proxy/archive/pg${id}/pg${id}-images.epub`,
];

async function fetchEpubBuffer(id, title, onStatus) {
  const cached = await getCachedEpub(id);
  if (cached) {
    onStatus('Loading from local cache...');
    return cached;
  }

  onStatus('Downloading book...');

  for (const url of EPUB_SOURCES(id)) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 5000) {
          onStatus('Saving to local cache...');
          cacheEpub(id, buf, title).catch(() => {});
          return buf;
        }
      }
    } catch {
      // try next source
    }
  }

  throw new Error('This book could not be loaded. Please try a different title.');
}

const FONT_SIZES = [80, 90, 100, 110, 120, 140, 160];
const FONT_FAMILIES = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
  mono: '"Courier New", Courier, monospace',
};

const READING_THEMES = {
  dark: {
    body: {
      background: '#08080F', color: '#E2E0FF',
      'line-height': '1.9', padding: '32px 48px', 'box-sizing': 'border-box', 'max-width': '820px', margin: '0 auto',
    },
    p: { color: '#C8C6F0', 'margin-bottom': '1.3em' },
    h1: { color: '#F5F3FF', 'font-weight': '700', 'margin-bottom': '0.6em' },
    h2: { color: '#EDE9FF', 'font-weight': '600', 'margin-bottom': '0.5em' },
    h3: { color: '#E2DFFF', 'font-weight': '600' },
    h4: { color: '#D8D4FF', 'font-weight': '500' },
    a:  { color: '#8B5CF6', 'text-decoration': 'none' },
    blockquote: {
      'border-left': '3px solid #8B5CF6',
      'padding-left': '1.2em',
      color: '#9CA3AF',
      'font-style': 'italic',
    },
  },
  sepia: {
    body: {
      background: '#F5EDD6', color: '#4A3728',
      'line-height': '1.9', padding: '32px 48px', 'box-sizing': 'border-box', 'max-width': '820px', margin: '0 auto',
    },
    p: { color: '#5C4B37', 'margin-bottom': '1.3em' },
    h1: { color: '#3A2C1E', 'font-weight': '700' },
    h2: { color: '#4A3728', 'font-weight': '600' },
    h3: { color: '#5C4B37', 'font-weight': '600' },
    a:  { color: '#8B5CF6', 'text-decoration': 'none' },
    blockquote: {
      'border-left': '3px solid #C4A882',
      'padding-left': '1.2em',
      color: '#7A6249',
      'font-style': 'italic',
    },
  },
  light: {
    body: {
      background: '#FAFAFA', color: '#1A1A2E',
      'line-height': '1.9', padding: '32px 48px', 'box-sizing': 'border-box', 'max-width': '820px', margin: '0 auto',
    },
    p: { color: '#2D2D44', 'margin-bottom': '1.3em' },
    h1: { color: '#0F0F1A', 'font-weight': '700' },
    h2: { color: '#1A1A2E', 'font-weight': '600' },
    h3: { color: '#2D2D44', 'font-weight': '600' },
    a:  { color: '#8B5CF6', 'text-decoration': 'none' },
    blockquote: {
      'border-left': '3px solid #8B5CF6',
      'padding-left': '1.2em',
      color: '#6B7280',
      'font-style': 'italic',
    },
  },
};

const panelVariants = {
  hidden: (dir) => ({ x: dir === 'left' ? -320 : 320, opacity: 0 }),
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({ x: dir === 'left' ? -320 : 320, opacity: 0, transition: { duration: 0.25 } }),
};

const EpubReader = () => {
  const { gutenbergId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookTitle  = searchParams.get('title') ?? '';
  const bookCover  = searchParams.get('cover')  ?? '';

  const viewerRef       = useRef(null);
  const bookRef         = useRef(null);
  const renditionRef    = useRef(null);
  const locationsReadyRef = useRef(false);
  const touchStartX     = useRef(null);
  const currentCfiRef   = useRef(null);
  const saveTimerRef    = useRef(null);

  const [loading,            setLoading]            = useState(true);
  const [loadingStatus,      setLoadingStatus]      = useState('Opening book...');
  const [error,              setError]              = useState(null);
  const [toc,                setToc]                = useState([]);
  const [currentHref,        setCurrentHref]        = useState('');
  const [progress,           setProgress]           = useState(0);
  const [atStart,            setAtStart]            = useState(true);
  const [atEnd,              setAtEnd]              = useState(false);
  const [showTOC,            setShowTOC]            = useState(false);
  const [showSettings,       setShowSettings]       = useState(false);
  const [theme,              setTheme]              = useState('dark');
  const [fontSizeIdx,        setFontSizeIdx]        = useState(2);
  const [fontFamily,         setFontFamily]         = useState('serif');
  const basePageRef = useRef(0);
  const [translateLang,      setTranslateLang]      = useState('');
  const [translatedText,     setTranslatedText]     = useState('');
  const [isTranslating,      setIsTranslating]      = useState(false);
  const [showTranslatePanel, setShowTranslatePanel] = useState(false);
  const [selectedText,       setSelectedText]       = useState('');
  const [pageInfo,           setPageInfo]           = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!viewerRef.current) return;
    let book = null;

    const init = async () => {
      try {
        if (!viewerRef.current) return;

        const buffer = await fetchEpubBuffer(gutenbergId, bookTitle, setLoadingStatus);
        if (!viewerRef.current) return;
        setLoadingStatus('Rendering pages...');

        book = ePub(buffer);
        bookRef.current = book;

        await book.opened;
        if (!viewerRef.current) return;

        if (book.package?.metadata)   { book.package.metadata.spread   = 'none'; book.package.metadata.layout = 'reflowable'; }
        if (book.packaging?.metadata) { book.packaging.metadata.spread = 'none'; book.packaging.metadata.layout = 'reflowable'; }

        const rect = viewerRef.current.getBoundingClientRect();
        const vw = rect.width  || window.innerWidth;
        const vh = (rect.height || (window.innerHeight - 120)) - 4;

        const rendition = book.renderTo(viewerRef.current, {
          width:               vw,
          height:              vh,
          flow:                'scrolled-doc',
          allowScriptedContent: true,
        });
        renditionRef.current = rendition;

        Object.entries(READING_THEMES).forEach(([name, rules]) => {
          rendition.themes.register(name, rules);
        });
        rendition.themes.select('dark');
        rendition.themes.fontSize(`${FONT_SIZES[2]}%`);
        rendition.themes.font(FONT_FAMILIES.serif);

        rendition.hooks.content.register((contents) => {
          contents.addStylesheetCss(`
            html {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              width: 100% !important;
            }
            body {
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            *, *::before, *::after {
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            img, svg, video, canvas, figure, picture {
              max-width: 100% !important;
              height: auto !important;
            }
            table {
              max-width: 100% !important;
              table-layout: fixed !important;
              word-break: break-word !important;
            }
            pre, code {
              white-space: pre-wrap !important;
              word-break: break-all !important;
            }
            [style*="position:fixed"], [style*="position: fixed"] {
              position: relative !important;
            }
          `, 'educapedia-overflow-fix');
        });

        rendition.on('rendered', () => {
          const iframe = viewerRef.current?.querySelector('iframe');
          if (!iframe?.contentDocument) return;
          const doc = iframe.contentDocument.documentElement;
          const viewerH = iframe.clientHeight;

          const onScroll = () => {
            if (!viewerH) return;
            const scrollPage = Math.floor(doc.scrollTop / viewerH);
            const maxScroll  = doc.scrollHeight - viewerH;
            const sectionPct = maxScroll > 0 ? Math.round((doc.scrollTop / maxScroll) * 100) : 0;

            setPageInfo((p) => ({ ...p, current: basePageRef.current + scrollPage + 1 }));
            if (maxScroll > 0) setProgress(sectionPct);
            setAtStart(doc.scrollTop <= 4);
            setAtEnd(doc.scrollTop >= maxScroll - 4);

            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
              if (!currentCfiRef.current) return;
              const overallPct = locationsReadyRef.current && book.locations.total > 0
                ? Math.round((book.locations.percentageFromCfi(currentCfiRef.current) ?? 0) * 100)
                : sectionPct;
              saveProgress(gutenbergId, {
                cfi:       currentCfiRef.current,
                scrollTop: doc.scrollTop,
                progress:  overallPct,
                title:     bookTitle,
                cover_img: bookCover,
              });
              if (overallPct >= 98) markFinished(gutenbergId);
            }, 1200);
          };

          doc.addEventListener('scroll', onScroll, { passive: true });
          onScroll();
        });

        const saved = getProgress(gutenbergId);
        if (saved?.cfi) {
          await rendition.display(saved.cfi);
          if (saved.scrollTop > 0) {
            requestAnimationFrame(() => {
              const iframe = viewerRef.current?.querySelector('iframe');
              if (iframe?.contentDocument) {
                iframe.contentDocument.documentElement.scrollTop = saved.scrollTop;
              }
            });
          }
        } else {
          await rendition.display();
        }
        setLoading(false);

        book.loaded.navigation.then((nav) => setToc(nav.toc ?? []));

        book.ready.then(() => {
          book.locations.generate(1024).then(() => {
            locationsReadyRef.current = true;
          });
        });

        rendition.on('relocated', (location) => {
          setCurrentHref(location.start?.href ?? '');
          setSelectedText('');
          currentCfiRef.current = location.start.cfi;

          if (locationsReadyRef.current && book.locations.total > 0) {
            const locIdx = book.locations.locationFromCfi(location.start.cfi) ?? 0;
            basePageRef.current = locIdx;
            setPageInfo({ current: locIdx + 1, total: book.locations.total });
          }

          const overallPct = locationsReadyRef.current && book.locations.total > 0
            ? Math.round((book.locations.percentageFromCfi(location.start.cfi) ?? 0) * 100)
            : (getProgress(gutenbergId)?.progress ?? 0);
          saveProgress(gutenbergId, {
            cfi:       location.start.cfi,
            scrollTop: 0,
            progress:  overallPct,
            title:     bookTitle,
            cover_img: bookCover,
          });
        });

        rendition.on('selected', (cfiRange, contents) => {
          const text = contents?.window?.getSelection()?.toString().trim() ?? '';
          setSelectedText(text);
        });

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    init();
    return () => {
      clearTimeout(saveTimerRef.current);
      book?.destroy();
      bookRef.current = null;
      renditionRef.current = null;
      locationsReadyRef.current = false;
      currentCfiRef.current = null;
    };
  }, [gutenbergId, bookTitle]);

  useEffect(() => {
    let rafId;
    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!renditionRef.current || !viewerRef.current) return;
          const rect = viewerRef.current.getBoundingClientRect();
          const vw = rect.width  || window.innerWidth;
          const vh = (rect.height || (window.innerHeight - 120)) - 4;
          renditionRef.current.resize(vw, vh);
        })
      );
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.themes.select(theme);
  }, [theme]);

  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.themes.fontSize(`${FONT_SIZES[fontSizeIdx]}%`);
  }, [fontSizeIdx]);

  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.themes.font(FONT_FAMILIES[fontFamily]);
  }, [fontFamily]);

  const getIframeDoc = () => {
    const iframe = viewerRef.current?.querySelector('iframe');
    return iframe ? { doc: iframe.contentDocument?.documentElement, h: iframe.clientHeight } : null;
  };

  const goNext = useCallback(() => {
    const state = getIframeDoc();
    if (!state?.doc) { renditionRef.current?.next(); return; }
    const { doc, h } = state;
    const maxScroll = doc.scrollHeight - h;
    if (doc.scrollTop >= maxScroll - 8) {
      renditionRef.current?.next();
    } else {
      doc.scrollTop = Math.min(doc.scrollTop + h, maxScroll);
    }
  }, []);

  const goPrev = useCallback(() => {
    const state = getIframeDoc();
    if (!state?.doc) { renditionRef.current?.prev(); return; }
    const { doc, h } = state;
    if (doc.scrollTop <= 8) {
      renditionRef.current?.prev();
    } else {
      doc.scrollTop = Math.max(doc.scrollTop - h, 0);
    }
  }, []);

  const handleTranslate = useCallback(async (overrideText) => {
    if (!translateLang) return;
    const text = (overrideText || selectedText || '').trim().slice(0, 900);
    if (!text) return;
    setIsTranslating(true);
    setShowTranslatePanel(true);
    setShowSettings(false);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${translateLang}`
      );
      const data = await res.json();
      setTranslatedText(data.responseData?.translatedText ?? 'Translation unavailable.');
    } catch {
      setTranslatedText('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  }, [translateLang, selectedText]);

  const goToChapter = useCallback((href) => {
    renditionRef.current?.display(href);
    setShowTOC(false);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'PageDown') goNext();
      if (e.key === 'PageUp')   goPrev();
      if (e.key === 'ArrowRight') renditionRef.current?.next();
      if (e.key === 'ArrowLeft')  renditionRef.current?.prev();
      if (e.key === 'Escape') {
        setShowTOC(false);
        setShowSettings(false);
        setShowTranslatePanel(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 60) delta > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  const closeAllPanels = () => {
    setShowTOC(false);
    setShowSettings(false);
  };

  const currentTocItem = toc.find((item) =>
    item.href && currentHref && currentHref.includes(item.href.split('#')[0])
  );

  return (
    <div
      className={`epub-reader theme-${theme}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="epub-topbar">
        <motion.button
          className="epub-back-btn"
          onClick={() => navigate(-1)}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiChevronLeft size={18} />
          <span>Back</span>
        </motion.button>

        <div className="epub-topbar-title">
          {bookTitle}
          {currentTocItem && (
            <span className="epub-chapter-label"> · {currentTocItem.label}</span>
          )}
        </div>

        <div className="epub-topbar-actions">
          {translateLang && showTranslatePanel && (
            <motion.button
              className="epub-action-btn active"
              onClick={() => setShowTranslatePanel(false)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              title="Close translation"
            >
              <HiTranslate size={15} />
              <span>Translate</span>
            </motion.button>
          )}

          <motion.button
            className={`epub-action-btn${showTOC ? ' active' : ''}`}
            onClick={() => { setShowTOC(!showTOC); setShowSettings(false); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiMenuAlt2 size={15} />
            <span>Contents</span>
          </motion.button>

          <motion.button
            className={`epub-action-btn${showSettings ? ' active' : ''}`}
            onClick={() => { setShowSettings(!showSettings); setShowTOC(false); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiAdjustments size={15} />
            <span>Display</span>
          </motion.button>
        </div>
      </div>

      <div className="epub-main">
        {loading && (
          <div className="epub-loading">
            <div className="epub-loading-spinner" />
            <p className="epub-loading-text">{loadingStatus}</p>
            <p className="epub-loading-sub">Large books may take up to 30 seconds on first load. Cached books open instantly.</p>
          </div>
        )}

        {error && (
          <div className="epub-error">
            <div className="epub-error-icon" />
            <h2>Book could not be loaded</h2>
            <p>{error}</p>
            <motion.button
              className="epub-nav-btn primary"
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{ marginTop: '0.8rem' }}
            >
              <HiArrowLeft size={16} /> Go back
            </motion.button>
          </div>
        )}

        <div ref={viewerRef} className="epub-viewer" />

      </div>

      {!loading && !error && (
        <div className="epub-bottombar">
          <motion.button
            className="epub-nav-btn"
            onClick={goPrev}
            disabled={atStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <HiArrowLeft size={15} /> Prev
          </motion.button>

          <div className="epub-progress-wrap">
            <div className="epub-progress-bar">
              <div className="epub-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="epub-progress-meta">
              {pageInfo.total > 0 ? (
                <span className="epub-progress-label">
                  Page {pageInfo.current} <span className="epub-page-total">of {pageInfo.total}</span>
                </span>
              ) : (
                <span className="epub-progress-label">{progress > 0 ? `${progress}%` : 'Scroll to read'}</span>
              )}
            </div>
          </div>

          <motion.button
            className="epub-nav-btn"
            onClick={goNext}
            disabled={atEnd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Next <HiArrowRight size={15} />
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {(showTOC || showSettings) && (
          <motion.div
            className="epub-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAllPanels}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTOC && (
          <motion.div
            className="epub-toc-panel"
            custom="left"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="epub-panel-header">
              <span className="epub-panel-title">Contents</span>
              <motion.button
                className="epub-topbar-btn"
                onClick={() => setShowTOC(false)}
                whileTap={{ scale: 0.92 }}
              >
                <HiX size={18} />
              </motion.button>
            </div>
            <div className="epub-toc-list">
              {toc.length === 0 ? (
                <p style={{ padding: '2rem', fontSize: '1.4rem', opacity: 0.5 }}>
                  No chapters available
                </p>
              ) : (
                toc.map((item, i) => (
                  <button
                    key={i}
                    className={`epub-toc-item${currentTocItem?.href === item.href ? ' active' : ''}`}
                    onClick={() => goToChapter(item.href)}
                  >
                    {item.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="epub-settings-panel"
            custom="right"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="epub-panel-header">
              <span className="epub-panel-title">Settings</span>
              <motion.button
                className="epub-topbar-btn"
                onClick={() => setShowSettings(false)}
                whileTap={{ scale: 0.92 }}
              >
                <HiX size={18} />
              </motion.button>
            </div>

            <div className="epub-settings-body">
              <div className="epub-setting-group">
                <span className="epub-setting-label">Theme</span>
                <div className="epub-theme-row">
                  {['dark', 'sepia', 'light'].map((t) => (
                    <button
                      key={t}
                      className={`epub-theme-btn t-${t}${theme === t ? ' active' : ''}`}
                      onClick={() => setTheme(t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="epub-setting-group">
                <span className="epub-setting-label">Font Size</span>
                <div className="epub-font-size-row">
                  <button
                    className="epub-font-size-btn"
                    onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))}
                    disabled={fontSizeIdx === 0}
                    style={{ fontSize: '1.6rem' }}
                  >
                    A-
                  </button>
                  <span className="epub-font-size-value">{FONT_SIZES[fontSizeIdx]}%</span>
                  <button
                    className="epub-font-size-btn"
                    onClick={() => setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
                    disabled={fontSizeIdx === FONT_SIZES.length - 1}
                    style={{ fontSize: '1.8rem' }}
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="epub-setting-group">
                <span className="epub-setting-label">Font</span>
                <div className="epub-font-family-row">
                  {[
                    { id: 'serif', label: 'Serif' },
                    { id: 'sans',  label: 'Sans' },
                    { id: 'mono',  label: 'Mono' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      className={`epub-font-btn ff-${f.id}${fontFamily === f.id ? ' active' : ''}`}
                      onClick={() => setFontFamily(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="epub-setting-group">
                <span className="epub-setting-label">Translate</span>
                <select
                  className="epub-lang-select"
                  value={translateLang}
                  onChange={(e) => {
                    setTranslateLang(e.target.value);
                    setShowTranslatePanel(false);
                    setTranslatedText('');
                  }}
                >
                  <option value="">Off</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="ru">Russian</option>
                </select>
                {translateLang && !selectedText && (
                  <p className="epub-translate-hint">
                    <HiCursorClick size={13} />
                    Highlight text in the book to translate it
                  </p>
                )}
                {translateLang && selectedText && (
                  <motion.button
                    className="epub-translate-btn"
                    onClick={() => handleTranslate(selectedText)}
                    disabled={isTranslating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isTranslating ? (
                      <><HiRefresh size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Translating...</>
                    ) : (
                      <><HiTranslate size={14} /> Translate "{selectedText.slice(0, 28)}{selectedText.length > 28 ? '…' : ''}"</>
                    )}
                  </motion.button>
                )}
              </div>

              <div className="epub-setting-group">
                <span className="epub-setting-label">Keyboard</span>
                <div className="epub-keyboard-list">
                  {[
                    ['Page Down / Up', 'Scroll one page'],
                    ['← / → Arrow keys', 'Prev / Next chapter'],
                    ['Esc', 'Close panels'],
                  ].map(([key, desc]) => (
                    <div key={key} className="epub-keyboard-row">
                      <span className="epub-keyboard-desc">{desc}</span>
                      <code className="epub-keyboard-key">{key}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTranslatePanel && (
          <motion.div
            className="epub-translate-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { type: 'spring', damping: 28, stiffness: 280 } }}
            exit={{ y: '100%', transition: { duration: 0.25 } }}
          >
            <div className="epub-translate-header">
              <span className="epub-translate-title">
                Translation · {translateLang.toUpperCase()}
              </span>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <motion.button
                  className="epub-topbar-btn"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  whileTap={{ scale: 0.92 }}
                  title="Retranslate"
                >
                  <HiRefresh size={16} />
                </motion.button>
                <motion.button
                  className="epub-topbar-btn"
                  onClick={() => setShowTranslatePanel(false)}
                  whileTap={{ scale: 0.92 }}
                >
                  <HiX size={18} />
                </motion.button>
              </div>
            </div>
            <div className="epub-translate-body">
              {isTranslating ? (
                <div className="epub-translate-loading">
                  <div className="epub-loading-spinner" style={{ width: 32, height: 32 }} />
                  <span>Translating page...</span>
                </div>
              ) : (
                <p className="epub-translate-text">{translatedText}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedText && translateLang && !showTranslatePanel && (
          <motion.div
            className="epub-selection-bar"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <HiTranslate size={14} style={{ flexShrink: 0, color: 'var(--accent-purple)' }} />
            <span className="epub-selection-preview">
              "{selectedText.slice(0, 48)}{selectedText.length > 48 ? '…' : ''}"
            </span>
            <motion.button
              className="epub-selection-translate-btn"
              onClick={() => handleTranslate(selectedText)}
              whileTap={{ scale: 0.96 }}
            >
              Translate
            </motion.button>
            <button className="epub-selection-clear" onClick={() => setSelectedText('')}>
              <HiX size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EpubReader;
