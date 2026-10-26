import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { HiX, HiClock } from 'react-icons/hi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../../context';
import { getHistory, saveSearch, removeSearch } from '../../services/searchHistory';
import './SearchForm.css';

const SUGGEST_URL = 'https://gutendex.com/books/?languages=en&search=';

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const scrollToResults = () => {
  requestAnimationFrame(() => {
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

const SearchForm = () => {
  const { setSearchTerm, setResultTitle } = useGlobalContext();
  const inputRef    = useRef('');
  const wrapperRef  = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  const [open,        setOpen]        = useState(false);
  const [inputVal,    setInputVal]    = useState('');
  const [history,     setHistory]     = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [fetching,    setFetching]    = useState(false);

  useEffect(() => { inputRef.current.focus(); }, []);

  useEffect(() => {
    if (open) setHistory(getHistory());
  }, [open]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    debounce(async (val) => {
      if (val.length < 2) { setSuggestions([]); return; }
      setFetching(true);
      try {
        const res  = await fetch(`${SUGGEST_URL}${encodeURIComponent(val)}`);
        const data = await res.json();
        setSuggestions(
          (data.results || []).slice(0, 5).map((b) => b.title).filter(Boolean)
        );
      } catch {
        setSuggestions([]);
      } finally {
        setFetching(false);
      }
    }, 320),
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    fetchSuggestions(val);
  };

  const submit = (term) => {
    const raw = (term ?? inputVal).trim();
    if (!raw) { setSearchTerm(''); setResultTitle('Please enter something...'); }
    else       { setSearchTerm(raw); saveSearch(raw); setInputVal(raw); }
    setOpen(false);
    if (location.pathname !== '/book') {
      navigate('/book');
      setTimeout(scrollToResults, 600);
    } else {
      setTimeout(scrollToResults, 300);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); submit(); };

  const handleRemove = (e, term) => {
    e.stopPropagation();
    removeSearch(term);
    setHistory(getHistory());
  };

  const showHistory     = open && history.length > 0 && inputVal.length === 0;
  const showSuggestions = open && suggestions.length > 0 && inputVal.length >= 2;
  const showDropdown    = showHistory || showSuggestions;

  return (
    <div className="search-form-wrapper" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <motion.div className="search-input-container" whileFocus={{ scale: 1.01 }}>
          <FaSearch className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, subject..."
            ref={inputRef}
            value={inputVal}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            autoComplete="off"
          />
          {inputVal && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => { setInputVal(''); setSuggestions([]); inputRef.current.focus(); }}
            >
              <HiX size={16} />
            </button>
          )}
          <motion.button
            type="submit"
            className="search-submit-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Search
          </motion.button>
        </motion.div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="search-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {showHistory && (
              <>
                <div className="search-dropdown-label">
                  <HiClock size={13} /> Recent searches
                </div>
                {history.map((term) => (
                  <div
                    key={term}
                    className="search-dropdown-item"
                    onClick={() => submit(term)}
                  >
                    <span className="search-dropdown-text">{term}</span>
                    <button
                      className="search-dropdown-remove"
                      onClick={(e) => handleRemove(e, term)}
                      title="Remove"
                    >
                      <HiX size={12} />
                    </button>
                  </div>
                ))}
              </>
            )}

            {showSuggestions && (
              <>
                <div className="search-dropdown-label">
                  <FaSearch size={11} />
                  {fetching ? 'Searching...' : 'Suggestions'}
                </div>
                {suggestions.map((title) => (
                  <div
                    key={title}
                    className="search-dropdown-item"
                    onClick={() => submit(title)}
                  >
                    <span className="search-dropdown-text">{title}</span>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchForm;
