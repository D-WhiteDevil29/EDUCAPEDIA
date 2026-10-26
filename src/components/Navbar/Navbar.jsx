import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import logoImg from '../../images/logo_site.png';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHeroPage = location.pathname === '/book' || location.pathname === '/';
  const [scrolled, setScrolled] = useState(!isHeroPage);

  useEffect(() => {
    if (!isHeroPage) { setScrolled(true); return; }
    setScrolled(window.scrollY > 40);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHeroPage]);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { to: '/book',  label: 'Home' },
    { to: '/shelf', label: 'My Shelf' },
    { to: '/about', label: 'About' },
  ];

  const navVariants = {
    hidden: { y: -80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const overlayVariants = {
    hidden:   { opacity: 0 },
    visible:  { opacity: 1, transition: { duration: 0.25 } },
    exit:     { opacity: 0, transition: { duration: 0.25 } },
  };

  const itemVariants = {
    hidden:   { y: 32, opacity: 0 },
    visible:  (i) => ({ y: 0, opacity: 1, transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
    exit:     (i) => ({ y: -16, opacity: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
  };

  return (
    <>
      <motion.nav
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container navbar-content flex flex-sb">
          <Link to="/book" className="navbar-brand flex">
            <img src={logoImg} alt="EducaPedia" />
            <span className="navbar-brand-text">EducaPedia</span>
          </Link>

          <div className="navbar-collapse">
            <ul className="navbar-nav">
              {navLinks.map((link) => (
                <li key={link.to} className="nav-item">
                  <Link
                    to={link.to}
                    className={`nav-link${location.pathname === link.to ? ' active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <motion.button
            className="navbar-toggler-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            whileTap={{ scale: 0.88 }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className={`burger${menuOpen ? ' open' : ''}`}>
              <span />
              <span />
              <span />
            </div>
          </motion.button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              className="mobile-close-btn"
              onClick={() => setMenuOpen(false)}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0, transition: { delay: 0.15 } }}
              aria-label="Close menu"
            >
              <HiX size={24} />
            </motion.button>

            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mobile-nav-item"
              >
                <span className="mobile-nav-index">0{i + 1}</span>
                <Link to={link.to} className="mobile-nav-link">
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
