import React from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const SkeletonCard = ({ delay }) => (
  <motion.div
    className="skeleton-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="skeleton-pulse skeleton-img" />
    <div className="skeleton-pulse skeleton-line title" />
    <div className="skeleton-pulse skeleton-line author" />
    <div className="skeleton-pulse skeleton-line meta" />
    <div className="skeleton-pulse skeleton-line short" />
  </motion.div>
);

const Loader = () => {
  return (
    <section className="skeleton-section">
      <div className="container">
        <div className="booklist-content grid skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Loader;
