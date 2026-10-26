import React from 'react';
import { motion } from 'framer-motion';
import {
  HiViewGrid, HiMap, HiLightningBolt, HiSearch, HiHeart,
  HiEye, HiBookOpen, HiClock, HiPencilAlt, HiStar,
  HiSparkles, HiUser, HiFilm, HiGlobe
} from 'react-icons/hi';
import { useGlobalContext } from '../../context';
import './Genres.css';

const GENRES = [
  { id: null,              label: 'All',          Icon: HiViewGrid },
  { id: 'adventure',       label: 'Adventure',    Icon: HiMap },
  { id: 'science fiction', label: 'Sci-Fi',       Icon: HiLightningBolt },
  { id: 'mystery',         label: 'Mystery',      Icon: HiSearch },
  { id: 'romance',         label: 'Romance',      Icon: HiHeart },
  { id: 'horror',          label: 'Horror',       Icon: HiEye },
  { id: 'philosophy',      label: 'Philosophy',   Icon: HiBookOpen },
  { id: 'history',         label: 'History',      Icon: HiClock },
  { id: 'poetry',          label: 'Poetry',       Icon: HiPencilAlt },
  { id: 'children',        label: "Children's",   Icon: HiStar },
  { id: 'fantasy',         label: 'Fantasy',      Icon: HiSparkles },
  { id: 'biography',       label: 'Biography',    Icon: HiUser },
  { id: 'travel',          label: 'Travel',       Icon: HiGlobe },
  { id: 'drama',           label: 'Drama',        Icon: HiFilm },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } }
};

const chipVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const Genres = () => {
  const { topic, setTopic } = useGlobalContext();

  return (
    <section className="genres-section">
      <div className="container">
        <motion.div
          className="genres-strip"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {GENRES.map((g) => {
            const active = topic === g.id;
            return (
              <motion.button
                key={g.label}
                className={`genre-chip${active ? ' active' : ''}`}
                variants={chipVariants}
                onClick={() => setTopic(g.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <g.Icon size={15} />
                <span>{g.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Genres;
