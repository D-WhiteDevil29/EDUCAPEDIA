import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiArrowRight, HiChevronLeft } from 'react-icons/hi';
import { getGutenbergBookById, getTextUrl, fetchBookText, parseIntoPages } from '../../services/gutenberg';
import './Reader.css';

const FONT_SIZES = [15, 17, 19, 22, 25];

const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.25 }
  })
};

const Reader = () => {
  const { gutenbergId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookTitle = searchParams.get('title') ?? '';

  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getGutenbergBookById(gutenbergId)
      .then((book) => {
        const textUrl = getTextUrl(book);
        if (!textUrl) throw new Error('No readable text format available for this book.');
        return fetchBookText(textUrl);
      })
      .then((text) => {
        if (cancelled) return;
        setPages(parseIntoPages(text));
        setCurrentPage(0);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [gutenbergId]);

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, pages.length]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const progress = pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0;
  const fontSize = FONT_SIZES[fontSizeIndex];

  return (
    <div className="reader-page">
      <div className="reader-topbar">
        <motion.button
          className="reader-back-btn"
          onClick={() => navigate(-1)}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <HiChevronLeft size={18} /> Back
        </motion.button>

        <div className="reader-progress-bar">
          <div className="reader-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="reader-controls">
          <button
            className="reader-font-btn"
            onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
            disabled={fontSizeIndex === 0}
            title="Decrease font size"
          >
            A-
          </button>
          <button
            className="reader-font-btn"
            onClick={() => setFontSizeIndex((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
            disabled={fontSizeIndex === FONT_SIZES.length - 1}
            title="Increase font size"
          >
            A+
          </button>
          {pages.length > 0 && (
            <span className="reader-page-info">
              {currentPage + 1} / {pages.length}
            </span>
          )}
        </div>
      </div>

      <div className="reader-body">
        <div className="reader-content-wrapper">
          {bookTitle && <div className="reader-book-title">{bookTitle}</div>}

          {loading && (
            <div className="reader-loading">
              <div className="reader-loading-spinner" />
              <span>Loading book content...</span>
            </div>
          )}

          {error && (
            <div className="reader-error">
              <h2>Unable to load book</h2>
              <p>{error}</p>
              <motion.button
                className="reader-nav-btn primary"
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Go back
              </motion.button>
            </div>
          )}

          {!loading && !error && pages.length > 0 && (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <p className="reader-text" style={{ fontSize: `${fontSize}px` }}>
                  {pages[currentPage]}
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {!loading && !error && pages.length > 0 && (
        <div className="reader-nav-bar">
          <motion.button
            className="reader-nav-btn"
            onClick={goPrev}
            disabled={currentPage === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <HiArrowLeft size={16} /> Previous
          </motion.button>
          <motion.button
            className={`reader-nav-btn${currentPage < pages.length - 1 ? ' primary' : ''}`}
            onClick={goNext}
            disabled={currentPage >= pages.length - 1}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Next <HiArrowRight size={16} />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Reader;
