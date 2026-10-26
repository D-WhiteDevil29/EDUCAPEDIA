import React from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/Header/Header';
import Genres from '../../components/Genres/Genres';
import BookList from '../../components/BookList/BookList';
import Footer from '../../components/Footer/Footer';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Header />
      <Genres />
      <BookList />
      <Footer />
    </motion.div>
  );
};

export default Home;
