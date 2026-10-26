import React from 'react';
import { motion } from 'framer-motion';
import { useGlobalContext } from '../../context';
import Book from './Book';
import Loader from '../Loader/Loader';
import coverImg from '../../images/cover_not_found.jpg';
import './BookList.css';

let lastBooksKey = null;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const BookList = () => {
  const { books, loading, resultTitle } = useGlobalContext();

  const booksWithCovers = books.map((book) => ({
    ...book,
    cover_img: book.cover_img ?? coverImg
  }));

  if (loading) return <Loader />;

  const currentKey = booksWithCovers.length > 0 ? booksWithCovers[0].id : null;
  const skipAnimation = currentKey !== null && currentKey === lastBooksKey;
  if (currentKey !== null) lastBooksKey = currentKey;

  return (
    <section className="booklist" id="results">
      <div className="container">
        <motion.div
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2>
            {resultTitle}
            {booksWithCovers.length > 0 && (
              <span className="result-count">({booksWithCovers.length} books)</span>
            )}
          </h2>
        </motion.div>

        <motion.div
          className="booklist-content grid"
          variants={skipAnimation ? undefined : containerVariants}
          initial={skipAnimation ? false : 'hidden'}
          animate={skipAnimation ? undefined : 'visible'}
        >
          {booksWithCovers.slice(0, 30).map((book) => (
            <motion.div
              key={book.id}
              variants={skipAnimation ? undefined : itemVariants}
              initial={skipAnimation ? false : undefined}
            >
              <Book {...book} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BookList;
