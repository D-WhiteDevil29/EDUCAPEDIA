import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import aboutImg from '../../images/library-img.jpg';
import './About.css';

const features = [
  'Project Gutenberg powered',
  '70,000+ free classics',
  'Full in-browser reading',
  'Real-time search',
  'Subject & genre browsing',
  'Font size controls'
];

const stats = [
  { number: '70k+', label: 'Books Available' },
  { number: '150+', label: 'Languages' },
  { number: '100%', label: 'Free Forever' }
];

const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <>
      <Navbar />
      <motion.section
        className="about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
      <div className="container">
        <div className="about-content grid" ref={ref}>
          <motion.div
            className="about-img-wrapper"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="about-img">
              <img src={aboutImg} alt="Library" />
              <div className="about-img-overlay" />
            </div>
            <div className="about-img-border" />
          </motion.div>

          <div className="about-text">
            <motion.span
              className="about-eyebrow"
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              About Us
            </motion.span>

            <motion.h2
              className="about-title"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Knowledge without <span>boundaries</span>
            </motion.h2>

            <motion.p
              className="about-body"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              EducaPedia is a free reading platform powered by Project Gutenberg — the world's
              oldest digital library. Every book in our catalogue is fully readable in your
              browser, no account needed, no cost, ever.
            </motion.p>

            <motion.div
              className="about-features"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {features.map((f, i) => (
                <div key={i} className="about-feature">
                  <div className="about-feature-dot" />
                  {f}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          className="about-stats"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {stats.map((s, i) => (
            <div key={i} className="about-stat">
              <div className="about-stat-number">{s.number}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
      </motion.section>
      <Footer />
    </>
  );
};

export default About;
