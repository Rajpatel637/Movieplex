import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Award } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import './MovieSections.css';

const MovieSections = () => {
  const { 
    activeSection, 
    loadPopularMovies, 
    loadTrendingMovies, 
    loadTopRatedMovies,
    loading 
  } = useMovies();

  const sections = [
    {
      id: 'popular',
      label: 'Popular',
      icon: TrendingUp,
      color: '#ff6b35',
      handler: loadPopularMovies
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: Star,
      color: '#ffc107',
      handler: loadTrendingMovies
    },
    {
      id: 'topRated',
      label: 'Top Rated',
      icon: Award,
      color: '#4ecdc4',
      handler: loadTopRatedMovies
    }
  ];

  const handleSectionClick = (section) => {
    if (loading || activeSection === section.id) return;
    section.handler();
  };

  return (
    <div className="movie-sections">
      <div className="container">
        <motion.div
          className="sections-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="sections-title">Explore Movies</h2>
          <p className="sections-subtitle">Discover movies by category</p>
        </motion.div>

        <motion.div
          className="sections-nav"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <motion.button
                key={section.id}
                className={`section-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleSectionClick(section)}
                disabled={loading}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ 
                  scale: isActive ? 1 : 1.05,
                  y: isActive ? 0 : -2
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  '--section-color': section.color,
                  '--section-color-light': `${section.color}20`,
                  '--section-color-dark': `${section.color}40`
                }}
              >
                <div className="section-icon">
                  <IconComponent size={20} />
                </div>
                <span className="section-label">{section.label}</span>
                {isActive && (
                  <motion.div
                    className="section-indicator"
                    layoutId="activeSection"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default MovieSections;
