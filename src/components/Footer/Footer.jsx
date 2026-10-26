import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../images/logo_site.png';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <img src={logoImg} alt="EducaPedia" className="footer-logo" />
          <span className="footer-brand-name">EducaPedia</span>
          <span className="footer-sep">·</span>
          <span className="footer-tagline">Free classics, beautifully read.</span>
        </div>

        <div className="footer-center">
          <Link to="/book" className="footer-link">Home</Link>
          <span className="footer-dot" />
          <Link to="/about" className="footer-link">About</Link>
        </div>

        <div className="footer-right">
          <span className="footer-copy">
            &copy; {year} <strong>Digvijay Shingare</strong>
          </span>
          <span className="footer-sep">·</span>
          <span className="footer-powered">
            Powered by{' '}
            <a href="https://www.gutenberg.org" target="_blank" rel="noreferrer" className="footer-ext-link">
              Gutenberg
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
