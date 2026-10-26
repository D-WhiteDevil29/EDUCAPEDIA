import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiDownload, HiBookmark, HiCheck } from 'react-icons/hi';
import { addToWantToRead, removeFromWantToRead, isInWantToRead } from '../../services/bookshelf';
import './BookList.css';

const formatCount = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const Book = ({ id, title, author, cover_img, download_count, subjects }) => {
  const [saved, setSaved] = useState(() => isInWantToRead(id));

  const toggleShelf = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeFromWantToRead(id);
    } else {
      addToWantToRead({ id, title, author, cover_img });
    }
    setSaved(!saved);
  }, [saved, id, title, author, cover_img]);

  return (
    <motion.div
      className="book-item flex flex-column"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="book-readable-badge">Readable</div>

      <motion.button
        className={`book-shelf-btn${saved ? ' saved' : ''}`}
        onClick={toggleShelf}
        whileTap={{ scale: 0.88 }}
        title={saved ? 'Remove from shelf' : 'Save to shelf'}
      >
        {saved ? <HiCheck size={14} /> : <HiBookmark size={14} />}
      </motion.button>

      <div className="book-item-img">
        <img src={cover_img} alt={title} loading="lazy" />
      </div>

      <div className="book-item-info">
        <Link to={`/book/${id}`} className="book-item-link">
          <div className="book-item-info-item title">
            <span>{title}</span>
          </div>
        </Link>
      </div>

      <div className="book-item-divider" />

      <div className="book-item-info-item author fs-15">
        <span className="fw-6">Author</span>
        <br />
        <span>{author || 'Unknown'}</span>
      </div>

      {subjects.length > 0 && (
        <div className="book-item-info-item fs-15" style={{ marginTop: '0.6rem' }}>
          <span className="fw-6">Genre</span>
          <br />
          <span className="book-item-subject">{subjects[0]}</span>
        </div>
      )}

      <div className="book-item-downloads">
        <HiDownload size={13} />
        <span>{formatCount(download_count)} downloads</span>
      </div>

      <Link to={`/book/${id}`} className="view-details-hint">
        Read now <HiArrowRight size={14} />
      </Link>
    </motion.div>
  );
};

export default Book;
