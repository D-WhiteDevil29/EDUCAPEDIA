import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import BookDetails from './components/BookDetails/BookDetails';
import EpubReader from './pages/Reader/EpubReader';
import Shelf from './pages/Shelf/Shelf';
import InstallPWA from './components/InstallPWA/InstallPWA';
import { AppProvider } from './context';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './index.css';

window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded') {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.style.display = 'none';
    e.stopImmediatePropagation();
  }
}, true);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"              element={<Navigate to="/book" replace />} />
        <Route path="/book"          element={<Home />} />
        <Route path="/book/:id"      element={<BookDetails />} />
        <Route path="/about"         element={<About />} />
        <Route path="/shelf"         element={<Shelf />} />
        <Route path="/read/:gutenbergId" element={<EpubReader />} />
      </Routes>
    </AnimatePresence>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AppProvider>
    <BrowserRouter>
      <AnimatedRoutes />
      <InstallPWA />
    </BrowserRouter>
  </AppProvider>
);

serviceWorkerRegistration.register();
