import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBookOpen, HiBookmark, HiCheck, HiTrash, HiArrowRight } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import coverFallback from '../../images/cover_not_found.jpg';
import {
  getWantToRead, getCurrentlyReading, getFinished,
  removeFromWantToRead, getShelfCounts,
} from '../../services/bookshelf';
import { clearProgress, getReadingStats } from '../../services/readingProgress';
import './Shelf.css';

const TABS = [
  { id: 'reading',  label: 'Currently Reading', icon: HiBookOpen },
  { id: 'want',     label: 'Want to Read',       icon: HiBookmark },
  { id: 'finished', label: 'Finished',           icon: HiCheck },
];

const EMPTY_MESSAGES = {
  reading:  { title: 'Nothing in progress', body: 'Open any book and start reading — it will appear here automatically.' },
  want:     { title: 'Your reading list is empty', body: 'Browse books and tap the bookmark icon to save them here.' },
  finished: { title: 'No finished books yet', body: 'Books you complete will appear here automatically.' },
};

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m} month${m > 1 ? 's' : ''} ago`;
  return `${Math.floor(m / 12)} year${Math.floor(m / 12) > 1 ? 's' : ''} ago`;
}

const ShelfCard = ({ book, tab, onRemove }) => {
  const readUrl = `/read/${book.id}?title=${encodeURIComponent(book.title || '')}`;
  const detailUrl = `/book/${book.id}`;

  return (
    <motion.div
      className="shelf-book-card"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={detailUrl} className="shelf-book-cover">
        <img
          src={
            book.cover_img ||
            `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`
          }
          alt={book.title}
          loading="lazy"
          onError={(e) => { e.target.src = coverFallback; }}
        />
        {tab === 'reading' && book.progress > 0 && (
          <div className="shelf-book-progress">
            <div className="shelf-book-progress-fill" style={{ width: `${book.progress}%` }} />
          </div>
        )}
        {tab === 'finished' && (
          <span className="shelf-book-finished-badge">Done</span>
        )}
      </Link>

      <div className="shelf-book-body">
        <Link to={detailUrl} className="shelf-book-title">{book.title}</Link>
        {book.author && <div className="shelf-book-author">{book.author}</div>}
        <div className="shelf-book-meta">
          {tab === 'reading'  && book.progress > 0 && `${book.progress}% read`}
          {tab === 'want'     && book.addedAt && `Added ${timeAgo(book.addedAt)}`}
          {tab === 'finished' && book.finishedAt && `Finished ${timeAgo(book.finishedAt)}`}
        </div>
      </div>

      <div className="shelf-book-actions">
        <Link
          to={readUrl}
          className="shelf-book-read-btn"
        >
          {tab === 'reading'  ? 'Continue' : tab === 'finished' ? 'Read again' : 'Read'}
          <HiArrowRight size={13} />
        </Link>
        <button
          className="shelf-book-remove-btn"
          onClick={() => onRemove(book.id)}
          title="Remove from shelf"
        >
          <HiTrash size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const Shelf = () => {
  const [activeTab, setActiveTab] = useState('reading');
  const [counts, setCounts] = useState({ want: 0, reading: 0, finished: 0 });
  const [books, setBooks] = useState([]);
  const stats = getReadingStats();

  const refresh = useCallback(() => {
    setCounts(getShelfCounts());
    if (activeTab === 'reading')  setBooks(getCurrentlyReading());
    if (activeTab === 'want')     setBooks(getWantToRead());
    if (activeTab === 'finished') setBooks(getFinished());
  }, [activeTab]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRemove = useCallback((id) => {
    if (activeTab === 'want') {
      removeFromWantToRead(id);
    } else {
      clearProgress(id);
    }
    refresh();
  }, [activeTab, refresh]);

  return (
    <>
      <Navbar />
      <motion.div
        className="shelf-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="container">
          <div className="shelf-header">
            <h1 className="shelf-title">My <span>Shelf</span></h1>
            <p className="shelf-subtitle">Your personal reading collection</p>
          </div>

          {stats.booksStarted > 0 && (
            <motion.div
              className="shelf-stats-bar"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {[
                { label: 'Books Finished',   value: stats.booksFinished },
                { label: 'In Progress',      value: stats.inProgress },
                { label: 'Est. Pages Read',  value: stats.estimatedPages.toLocaleString() },
                { label: 'Reading Streak',   value: `${stats.streak} day${stats.streak !== 1 ? 's' : ''}` },
              ].map(({ label, value }) => (
                <div key={label} className="shelf-stat-item">
                  <span className="shelf-stat-value">{value}</span>
                  <span className="shelf-stat-label">{label}</span>
                </div>
              ))}
            </motion.div>
          )}

          <div className="shelf-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`shelf-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className="shelf-tab-count">{counts[tab.id]}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="shelf-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {books.length === 0 ? (
                <div className="shelf-empty">
                  <div className="shelf-empty-icon">
                    {activeTab === 'reading'  ? <HiBookOpen /> : activeTab === 'finished' ? <HiCheck /> : <HiBookmark />}
                  </div>
                  <p className="shelf-empty-title">{EMPTY_MESSAGES[activeTab].title}</p>
                  <p className="shelf-empty-body">{EMPTY_MESSAGES[activeTab].body}</p>
                  <Link to="/book" className="shelf-empty-link">Browse books</Link>
                </div>
              ) : (
                <AnimatePresence>
                  {books.map((book) => (
                    <ShelfCard
                      key={book.id}
                      book={book}
                      tab={activeTab}
                      onRemove={handleRemove}
                    />
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default Shelf;
