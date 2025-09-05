import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import MovieCard from '../MovieCard/MovieCard';
import './MovieGrid.css';

const MovieGrid = () => {
  const { movies, loading, activeSection } = useMovies();
  const location = useLocation();

  // Ensure movies is always an array
  const moviesArray = Array.isArray(movies) ? movies : [];

  const getSectionTitle = () => {
    switch (location.pathname) {
      case '/popular':
        return 'Popular Movies';
      case '/trending':
        return 'Trending Now';
      case '/top-rated':
        return 'Top Rated Movies';
      case '/':
        // On homepage, show title based on what's currently loaded
        switch (activeSection) {
          case 'popular':
            return 'Popular Movies';
          case 'trending':
            return 'Trending Now';
          case 'topRated':
            return 'Top Rated Movies';
          default:
            return 'Featured Movies';
        }
      default:
        return 'Movies';
    }
  };

  if (loading) {
    return (
      <section className="movie-grid-section">
        <div className="container">
          <h2 className="section-title">Loading Movies...</h2>
          <div className="movie-grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="movie-card skeleton">
                <div className="movie-poster skeleton"></div>
                <div className="movie-info">
                  <div className="skeleton" style={{ height: '20px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ height: '16px', width: '60%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="movie-grid-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">{getSectionTitle()}</h2>
          <div className="section-count">
            {moviesArray.length} {moviesArray.length === 1 ? 'movie' : 'movies'}
          </div>
        </motion.div>
        
        <motion.div 
          className="movie-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {moviesArray.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.08,
                ease: [0.4, 0, 0.2, 1],
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </motion.div>

        {moviesArray.length === 0 && !loading && (
          <motion.div 
            className="no-movies"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3>No movies found</h3>
            <p>Try adjusting your search or mood selection</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MovieGrid;
