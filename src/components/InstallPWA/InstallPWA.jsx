import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDownload, HiX } from 'react-icons/hi';
import './InstallPWA.css';

const InstallPWA = () => {
  const [prompt, setPrompt]       = useState(null);
  const [visible, setVisible]     = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('educapedia-pwa-dismissed') === '1'
  );

  useEffect(() => {
    if (dismissed) return;
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('educapedia-pwa-dismissed', '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pwa-banner"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: 'spring', damping: 22, stiffness: 260 } }}
          exit={{ y: 80, opacity: 0, transition: { duration: 0.25 } }}
        >
          <div className="pwa-banner-info">
            <div className="pwa-banner-icon">
              <HiDownload size={20} />
            </div>
            <div>
              <p className="pwa-banner-title">Install EducaPedia</p>
              <p className="pwa-banner-body">Add to home screen for offline reading</p>
            </div>
          </div>
          <div className="pwa-banner-actions">
            <motion.button
              className="pwa-install-btn"
              onClick={install}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Install
            </motion.button>
            <button className="pwa-dismiss-btn" onClick={dismiss}>
              <HiX size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;
