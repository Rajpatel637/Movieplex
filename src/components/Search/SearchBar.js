import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import './SearchBar.css';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search movies, genres, or moods...",
  showSuggestions = true 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchRef = useRef(null);

  // Popular suggestions
  const popularSuggestions = [
    '🎬 Action Movies',
    '🦸 Marvel Universe', 
    '⭐ Top Rated',
    '😄 Comedy Movies',
    '👻 Horror Films',
    '🚀 Sci-Fi Adventures'
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('movieplex-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e, searchQuery = query) => {
    e?.preventDefault();
    const finalQuery = searchQuery.replace(/[🎬🦸⭐😄👻🚀]/g, '').trim();
    
    if (finalQuery) {
      // Add to recent searches
      const newRecentSearches = [
        finalQuery,
        ...recentSearches.filter(search => search !== finalQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('movieplex-recent-searches', JSON.stringify(newRecentSearches));

      // Track search query
      analyticsService.trackSearch(finalQuery);
      onSearch(finalQuery);
      setShowDropdown(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions) {
      setShowDropdown(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSubmit(null, suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('movieplex-recent-searches');
  };

  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (showSuggestions && value.trim()) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <motion.form
        className={`search-bar ${isFocused ? 'focused' : ''}`}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="search-input-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
          />
          {query && (
            <motion.button
              type="button"
              className="search-clear"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </motion.button>
          )}
        </div>
        
        {query && !showDropdown && (
          <motion.button
            type="submit"
            className="search-submit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Search
          </motion.button>
        )}
      </motion.form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && showSuggestions && (
          <motion.div
            className="search-suggestions"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="suggestion-section">
                <div className="section-header">
                  <Clock size={14} />
                  <span>Recent Searches</span>
                  <button onClick={clearRecentSearches} className="clear-btn">
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={`recent-${index}`}
                    className="suggestion-item recent-item"
                    onClick={() => handleSuggestionClick(search)}
                    whileHover={{ backgroundColor: 'rgba(255, 107, 53, 0.1)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Clock size={14} />
                    <span>{search}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Popular Suggestions */}
            <div className="suggestion-section">
              <div className="section-header">
                <TrendingUp size={14} />
                <span>{query ? 'Suggestions' : 'Popular Searches'}</span>
              </div>
              {popularSuggestions
                .filter(suggestion => 
                  !query || suggestion.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 6)
                .map((suggestion, index) => (
                  <motion.div
                    key={`popular-${index}`}
                    className="suggestion-item popular-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                    whileHover={{ backgroundColor: 'rgba(255, 107, 53, 0.1)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="suggestion-text">{suggestion}</span>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
