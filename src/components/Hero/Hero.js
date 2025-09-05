import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import './Hero.css';

const Hero = () => {
  const { featuredMovies } = useMovies();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Optimize slide change with useCallback
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  }, [featuredMovies.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Optimize auto-slide with better cleanup
  useEffect(() => {
    if (featuredMovies.length > 1) {
      const timer = setInterval(nextSlide, 5000); // Reduced from 6000ms for faster transitions
      return () => clearInterval(timer);
    }
  }, [featuredMovies.length, nextSlide]);

  // Handle loading state
  useEffect(() => {
    if (featuredMovies.length > 0) {
      setIsLoading(false);
    }
  }, [featuredMovies.length]);

  // Memoize current movie to prevent unnecessary re-renders
  const currentMovie = useMemo(() => {
    return featuredMovies[currentSlide] || {};
  }, [featuredMovies, currentSlide]);

  if (isLoading || !featuredMovies.length) {
    return (
      <section className="hero">
        <div className="hero-skeleton">
          <div className="skeleton hero-skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-description"></div>
            <div className="skeleton-buttons"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <div className="hero-slider">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero-slide active"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              backgroundImage: `url(${currentMovie.backdrop_path || currentMovie.Poster || 'https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Movie+Poster'})`,
            }}
          >
            <div className="hero-overlay" />
            
            <div className="container">
              <div className="hero-content">
                <motion.div
                  className="hero-text"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.2,
                    ease: "easeOut"
                  }}
                >
                  <h1 className="hero-title">
                    {currentMovie.title || currentMovie.name || currentMovie.Title || 'Featured Movie'}
                  </h1>
                  <p className="hero-description">
                    {currentMovie.overview || currentMovie.Plot || 'No description available.'}
                  </p>
                  
                  <div className="hero-meta">
                    {currentMovie.vote_average && (
                      <span className="hero-rating">
                        <Star size={16} style={{ marginRight: '4px' }} />
                        {currentMovie.vote_average}/10
                      </span>
                    )}
                    {currentMovie.release_date && (
                      <span className="hero-year">
                        {new Date(currentMovie.release_date).getFullYear()}
                      </span>
                    )}
                    {currentMovie.genres && currentMovie.genres.length > 0 && (
                      <span className="hero-genres">
                        {currentMovie.genres.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="hero-actions">
                    <motion.button
                      className="btn btn-primary hero-btn"
                      whileHover={{ 
                        scale: 1.08,
                        boxShadow: "0 15px 35px rgba(255, 107, 53, 0.5)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                      }}
                    >
                      <Play size={20} />
                      Watch Now
                    </motion.button>
                    <motion.button
                      className="btn btn-secondary hero-btn"
                      whileHover={{ 
                        scale: 1.06,
                        backgroundColor: "rgba(255, 255, 255, 0.25)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                      }}
                    >
                      <Info size={20} />
                      More Info
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {featuredMovies.length > 1 && (
        <div className="hero-controls">
          <motion.button
            className="hero-nav prev"
            onClick={prevSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={24} />
          </motion.button>
          <motion.button
            className="hero-nav next"
            onClick={nextSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      )}

      {/* Dots Indicator */}
      {featuredMovies.length > 1 && (
        <div className="hero-dots">
          {featuredMovies.map((_, index) => (
            <motion.button
              key={index}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
