import React, { useState, useContext, useEffect, useCallback } from 'react';

const GUTENDEX = 'https://gutendex.com/books';
const AppContext = React.createContext();

function getTextUrl(formats) {
  return (
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain; charset=us-ascii'] ||
    formats['text/plain'] ||
    null
  );
}

function formatAuthorName(name) {
  if (!name || !name.includes(',')) return name ?? 'Unknown';
  const [last, first] = name.split(', ');
  return first ? `${first.trim()} ${last.trim()}` : last.trim();
}

function mapBook(raw) {
  const f = raw.formats ?? {};
  return {
    id: String(raw.id),
    title: raw.title,
    author: raw.authors.map((a) => formatAuthorName(a.name)).join(', ') || 'Unknown',
    authors: raw.authors,
    cover_img: f['image/jpeg'] ?? null,
    subjects: (raw.subjects ?? []).slice(0, 8),
    bookshelves: raw.bookshelves ?? [],
    languages: raw.languages ?? [],
    download_count: raw.download_count ?? 0,
    epub_url: f['application/epub+zip'] ?? null,
    text_url: getTextUrl(f),
    formats: f
  };
}

const AppProvider = ({ children }) => {
  const [searchTerm, setSearchTermInternal] = useState('');
  const [topic, setTopicInternal] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultTitle, setResultTitle] = useState('');

  const setSearchTerm = useCallback((term) => {
    setTopicInternal(null);
    setSearchTermInternal(term);
  }, []);

  const setTopic = useCallback((t) => {
    setSearchTermInternal('');
    setTopicInternal(t);
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const query = searchTerm.trim();
      let url;
      if (topic) {
        url = `${GUTENDEX}/?topic=${encodeURIComponent(topic)}&languages=en`;
      } else if (query) {
        url = `${GUTENDEX}/?search=${encodeURIComponent(query)}&languages=en`;
      } else {
        url = `${GUTENDEX}/?languages=en`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();

      const readable = (data.results ?? [])
        .filter((b) => b.formats?.['application/epub+zip'] || getTextUrl(b.formats ?? {}))
        .map(mapBook);

      setBooks(readable);

      const label = topic
        ? `${topic.charAt(0).toUpperCase()}${topic.slice(1)} Books`
        : query
        ? 'Search Results'
        : 'Popular Books';

      setResultTitle(readable.length > 0 ? label : 'No books found');
    } catch {
      setBooks([]);
      setResultTitle('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, topic]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <AppContext.Provider value={{
      loading, books, setSearchTerm, setTopic, topic, resultTitle, setResultTitle
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
export { AppContext, AppProvider };
