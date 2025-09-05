import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Menu, X, Film, TrendingUp, Star, Award, BarChart3, LogIn, UserPlus, Heart, Bookmark } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import SearchBar from '../Search/SearchBar';
import EnhancedSearch from '../EnhancedSearch/EnhancedSearch';
import UserProfile from '../Auth/UserProfile';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { favoritesCount, watchlistCount } = useFavorites();
  const { 
    searchMovies, 
    loadPopularMovies, 
    loadTrendingMovies, 
    loadTopRatedMovies
  } = useMovies();

  // Load appropriate content based on current route
  useEffect(() => {
    if (location.pathname === '/popular') {
      loadPopularMovies();
    } else if (location.pathname === '/trending') {
      loadTrendingMovies();
    } else if (location.pathname === '/top-rated') {
      loadTopRatedMovies();
    }
  }, [location.pathname, loadPopularMovies, loadTrendingMovies, loadTopRatedMovies]);

  const handleSearch = (query) => {
    searchMovies(query);
    navigate('/search');
    setIsSearchOpen(false);
  };

  const handleSectionClick = (route) => {
    navigate(route);
    setIsMenuOpen(false);
  };

  const getActiveSection = () => {
    switch (location.pathname) {
      case '/popular':
        return 'popular';
      case '/trending':
        return 'trending';
      case '/top-rated':
        return 'topRated';
      case '/analytics':
        return 'analytics';
      case '/favorites':
      case '/watchlist':
        return 'favorites';
      default:
        return 'home';
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header 
      className="header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="header-container">
        <div className="header-content">
          {/* Logo with gentle hover animation */}
          <motion.div 
            className="header-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="logo-link">
              <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Film className="logo-icon" />
              </motion.div>
              <span className="logo-text">MoviePlex</span>
            </Link>
          </motion.div>

          {/* Search Bar - Centered */}
          <div className="header-search">
            <div className="search-actions">
              <motion.button
                className="search-btn"
                onClick={() => setIsSearchOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search size={18} />
              </motion.button>
              
              {user && (
                <motion.div
                  className="favorites-btn"
                  onClick={() => navigate('/favorites')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart size={18} />
                  {favoritesCount > 0 && (
                    <span className="favorites-count">{favoritesCount}</span>
                  )}
                </motion.div>
              )}
              
              {user && (
                <motion.div
                  className="watchlist-btn"
                  onClick={() => navigate('/watchlist')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bookmark size={18} />
                  {watchlistCount > 0 && (
                    <span className="watchlist-count">{watchlistCount}</span>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Desktop Navigation - Right Aligned */}
          <nav className="desktop-nav">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" className="nav-link">Home</Link>
            </motion.div>
            
            <motion.button 
              className={`nav-link nav-button ${getActiveSection() === 'trending' ? 'active' : ''}`}
              onClick={() => handleSectionClick('/trending')}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <TrendingUp size={12} />
              Trending
            </motion.button>
            
            <motion.button 
              className={`nav-link nav-button ${getActiveSection() === 'popular' ? 'active' : ''}`}
              onClick={() => handleSectionClick('/popular')}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Star size={12} />
              Popular
            </motion.button>
            
            <motion.button 
              className={`nav-link nav-button ${getActiveSection() === 'topRated' ? 'active' : ''}`}
              onClick={() => handleSectionClick('/top-rated')}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Award size={12} />
              Top Rated
            </motion.button>
            
            {/* Authentication Section */}
            {user ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <UserProfile user={user} onLogout={logout} />
              </motion.div>
            ) : (
              <div className="auth-buttons">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/login" className="nav-link auth-link">
                    <LogIn size={12} />
                    Sign In
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/register" className="nav-link auth-link register">
                    <UserPlus size={12} />
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ThemeToggle />
            </motion.div>
          </nav>

          {/* Menu Toggle for Mobile */}
          <div className="header-actions">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="menu-toggle"
              onClick={toggleMenu}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
          initial={false}
          animate={{ 
            height: isMenuOpen ? 'auto' : 0, 
            opacity: isMenuOpen ? 1 : 0 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <button 
              className={`mobile-nav-link nav-button ${getActiveSection() === 'trending' ? 'active' : ''}`}
              onClick={() => handleSectionClick('/trending')}
            >
              <TrendingUp size={16} />
              Trending
            </button>
            <button 
              className={`mobile-nav-link nav-button ${getActiveSection() === 'popular' ? 'active' : ''}`}
              onClick={() => handleSectionClick('/popular')}
            >
              <Star size={16} />
              Popular
            </button>
            <button 
              className={`mobile-nav-link nav-button ${getActiveSection() === 'topRated' ? 'active' : ''}`}
              onClick={() => handleSectionClick('/top-rated')}
            >
              <Award size={16} />
              Top Rated
            </button>
            <button 
              className={`mobile-nav-link nav-button ${getActiveSection() === 'analytics' ? 'active' : ''}`}
              onClick={() => handleSectionClick('/analytics')}
            >
              <BarChart3 size={16} />
              Analytics
            </button>
            
            {/* Mobile Authentication */}
            {user ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <span>Welcome, {user.name}</span>
                </div>
                <button 
                  className="mobile-nav-link nav-button danger"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogIn size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mobile-auth-section">
                <Link 
                  to="/login" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="mobile-nav-link register"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus size={16} />
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </motion.div>
      </div>
      
      {/* Enhanced Search Modal */}
      <EnhancedSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </motion.header>
  );
};

export default Header;
