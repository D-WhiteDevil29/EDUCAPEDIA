import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowLeft, HiBookOpen, HiDownload, HiTranslate, HiRefresh,
  HiBookmark, HiCheck
} from 'react-icons/hi';
import { getProgress, clearProgress } from '../../services/readingProgress';
import { addToWantToRead, removeFromWantToRead, isInWantToRead } from '../../services/bookshelf';
import Navbar from '../Navbar/Navbar';
import coverFallback from '../../images/cover_not_found.jpg';
import './BookDetails.css';

const GUTENDEX = 'https://gutendex.com/books';

const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  visible: (d = 0) => ({
    y: 0, opacity: 1,
    transition: { delay: d, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
};

function formatAuthorName(name) {
  if (!name || !name.includes(',')) return name ?? 'Unknown';
  const [last, first] = name.split(', ');
  return first ? `${first.trim()} ${last.trim()}` : last.trim();
}

function getTextUrl(formats) {
  return (
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain; charset=us-ascii'] ||
    formats['text/plain'] || null
  );
}

function formatCount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const BookDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [savedProgress, setSavedProgress] = useState(null);
  const [onShelf, setOnShelf] = useState(() => isInWantToRead(id));
  const navigate = useNavigate();

  useEffect(() => {
    setSavedProgress(getProgress(id));
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setBook(null);

    fetch(`${GUTENDEX}/${id}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        if (cancelled) return;
        const f = data.formats ?? {};
        setBook({
          title:          data.title,
          authors:        data.authors ?? [],
          cover_img:      f['image/jpeg'] ?? coverFallback,
          subjects:       (data.subjects ?? []).slice(0, 12),
          bookshelves:    data.bookshelves ?? [],
          languages:      data.languages ?? [],
          download_count: data.download_count ?? 0,
          epub_url:  f['application/epub+zip'] ?? null,
          html_url:  f['text/html'] ?? null,
          text_url:  getTextUrl(f),
        });
      })
      .catch(() => { if (!cancelled) setBook(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="book-detail-skeleton">
          <div className="book-detail-hero-skeleton">
            <div className="skeleton-pulse bds-cover" />
            <div className="bds-info">
              {[280, 160, 120, 200].map((w, i) => (
                <div key={i} className="skeleton-pulse" style={{ height: i === 0 ? 40 : 14, width: w, borderRadius: 8, maxWidth: '100%' }} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Navbar />
        <section className="book-details-empty">
          <div className="container">
            <motion.button className="back-btn" onClick={() => navigate(-1)} whileHover={{ x: -4 }}>
              <HiArrowLeft size={18} /> Go back
            </motion.button>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.8rem' }}>Book not found.</p>
          </div>
        </section>
      </>
    );
  }

  const readUrl = book.epub_url
    ? `/read/${id}?title=${encodeURIComponent(book.title)}&cover=${encodeURIComponent(book.cover_img || '')}`
    : null;

  return (
    <>
      <Navbar />

      <div className="book-detail-page">
        <section className="book-detail-hero">
          <div
            className="book-detail-hero-bg"
            style={{ backgroundImage: `url(${book.cover_img})` }}
            aria-hidden="true"
          />

          <div className="container book-detail-hero-inner">
            <motion.button
              className="back-btn"
              onClick={() => navigate(-1)}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.45 }}
              whileHover={{ x: -4 }}
            >
              <HiArrowLeft size={16} /> Go back
            </motion.button>

            <div className="book-detail-main">
              <motion.div
                className="book-detail-cover-wrap"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={book.cover_img} alt={book.title} className="book-detail-cover" />
                <div className="book-detail-formats">
                  {book.epub_url && <span className="fmt-badge epub">EPUB</span>}
                  {book.html_url && <span className="fmt-badge html">HTML</span>}
                  {book.text_url && <span className="fmt-badge txt">TXT</span>}
                </div>
              </motion.div>

              <div className="book-detail-info">
                <motion.h1
                  className="book-detail-title"
                  custom={0.1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  {book.title}
                </motion.h1>

                <motion.div
                  className="book-detail-authors"
                  custom={0.2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  {book.authors.map((a, i) => (
                    <span key={i} className="book-detail-author">
                      {formatAuthorName(a.name)}
                      {a.birth_year && (
                        <span className="author-lifespan">
                          {a.birth_year}–{a.death_year ?? ''}
                        </span>
                      )}
                    </span>
                  ))}
                </motion.div>

                <motion.div
                  className="book-detail-meta"
                  custom={0.3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <span className="book-meta-pill">
                    <HiDownload size={13} />
                    {formatCount(book.download_count)} downloads
                  </span>
                  {book.languages.length > 0 && (
                    <span className="book-meta-pill">
                      <HiTranslate size={13} />
                      {book.languages.map((l) => l.toUpperCase()).join(', ')}
                    </span>
                  )}
                </motion.div>

                {readUrl && (
                  <>
                  <motion.div
                    custom={0.35}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    <button
                      className={`book-shelf-toggle-btn${onShelf ? ' on-shelf' : ''}`}
                      onClick={() => {
                        if (onShelf) {
                          removeFromWantToRead(id);
                        } else {
                          addToWantToRead({
                            id,
                            title: book.title,
                            author: book.authors?.map(a => a.name?.split(', ').reverse().join(' ')).join(', '),
                            cover_img: book.cover_img,
                          });
                        }
                        setOnShelf(!onShelf);
                      }}
                    >
                      {onShelf ? <HiCheck size={16} /> : <HiBookmark size={16} />}
                      {onShelf ? 'Saved to shelf' : 'Save to shelf'}
                    </button>
                  </motion.div>

                  <motion.div
                    custom={0.4}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="book-read-actions"
                  >
                    {savedProgress && !savedProgress.finished ? (
                      <>
                        <Link to={readUrl} className="read-now-btn">
                          <HiRefresh size={18} />
                          Continue reading
                          <span className="read-now-badge">{savedProgress.progress}% done</span>
                        </Link>
                        <button
                          className="book-restart-btn"
                          onClick={() => { clearProgress(id); setSavedProgress(null); }}
                        >
                          Start over
                        </button>
                      </>
                    ) : savedProgress?.finished ? (
                      <>
                        <Link to={readUrl} className="read-now-btn">
                          <HiBookOpen size={18} />
                          Read again
                          <span className="read-now-badge">Finished</span>
                        </Link>
                        <button
                          className="book-restart-btn"
                          onClick={() => { clearProgress(id); setSavedProgress(null); }}
                        >
                          Clear
                        </button>
                      </>
                    ) : (
                      <Link to={readUrl} className="read-now-btn">
                        <HiBookOpen size={18} />
                        Read this book free
                        <span className="read-now-badge">EPUB Reader</span>
                      </Link>
                    )}
                  </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="book-detail-body">
          <div className="container">
            {book.subjects.length > 0 && (
              <motion.div
                className="bd-tag-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <span className="bd-tag-label">Subjects</span>
                <div className="bd-tags">
                  {book.subjects.map((s, i) => <span key={i} className="book-tag">{s}</span>)}
                </div>
              </motion.div>
            )}

            {book.bookshelves.length > 0 && (
              <motion.div
                className="bd-tag-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <span className="bd-tag-label">Bookshelves</span>
                <div className="bd-tags">
                  {book.bookshelves.map((s, i) => <span key={i} className="book-tag">{s}</span>)}
                </div>
              </motion.div>
            )}

          </div>
        </section>
      </div>
    </>
  );
};

export default BookDetails;
