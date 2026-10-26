import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Navbar/Navbar';
import SearchForm from '../SearchForm/SearchForm';
import './Header.css';

const fadeUp = (delay = 0) => ({
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
});

const Header = () => {
  return (
    <header className="header">
      <Navbar />

      <div className="header-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="header-grid" />
      </div>

      <div className="header-content">
        <motion.div
          variants={fadeUp(0.2)}
          initial="hidden"
          animate="visible"
          className="header-badge"
        >
          <span className="header-badge-dot" />
          Powered by Project Gutenberg
        </motion.div>

        <motion.h1
          variants={fadeUp(0.35)}
          initial="hidden"
          animate="visible"
          className="header-title"
        >
          Read the world's{' '}
          <span className="header-title-accent">greatest books</span>
        </motion.h1>

        <motion.p
          variants={fadeUp(0.5)}
          initial="hidden"
          animate="visible"
          className="header-text"
        >
          70,000+ free public domain classics — fully readable, always free,
          no sign-up required.
        </motion.p>

        <motion.div
          variants={fadeUp(0.65)}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <SearchForm />
        </motion.div>

        <motion.div
          variants={fadeUp(0.85)}
          initial="hidden"
          animate="visible"
          className="header-stats"
        >
          <div className="header-stat">
            <div className="header-stat-number">70k+</div>
            <div className="header-stat-label">Books</div>
          </div>
          <div className="header-divider" />
          <div className="header-stat">
            <div className="header-stat-number">150+</div>
            <div className="header-stat-label">Languages</div>
          </div>
          <div className="header-divider" />
          <div className="header-stat">
            <div className="header-stat-number">100%</div>
            <div className="header-stat-label">Free</div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
