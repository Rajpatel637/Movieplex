import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Clock, Star, Calendar, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import './EnhancedSearch.css';

const EnhancedSearch = ({ onClose, isOpen = false }) => {
  const navigate = useNavigate();
  const { searchMovies } = useMovies();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    minRating: '',
    sortBy: 'popularity'
  });

  const searchInputRef = useRef(null);
  const searchTimeout = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('movieSearchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search function with filters
  const debouncedSearch = useCallback(async (searchQuery, searchFilters = filters) => {
    console.log('🔍 debouncedSearch called with:', searchQuery, 'filters:', searchFilters);
    
    setLoading(true);
    try {
      console.log('🔍 Calling searchMovies with filters...');
      const searchResults = await searchMovies(searchQuery, searchFilters);
      console.log('🔍 Search results received:', searchResults);
      
      const resultsArray = Array.isArray(searchResults) ? searchResults : (searchResults.results || []);
      console.log('🔍 Final results array:', resultsArray);
      
      setResults(resultsArray.slice(0, 8)); // Limit to 8 results for dropdown
    } catch (error) {
      console.error('🔍 Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchMovies, filters]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // If query is empty, clear results but still apply filters if any are set
    if (!value.trim()) {
      // Check if any filters are active
      const hasActiveFilters = Object.values(filters).some(filter => filter && filter !== '');
      
      if (hasActiveFilters) {
        setLoading(true);
        searchTimeout.current = setTimeout(() => {
          console.log('🔍 Searching with filters only:', filters);
          debouncedSearch('', filters);
        }, 300);
      } else {
        setResults([]);
        setLoading(false);
      }
      return;
    }

    // Set loading state immediately for better UX
    setLoading(true);

    // Set new timeout for debounced search
    searchTimeout.current = setTimeout(() => {
      console.log('🔍 Searching for:', value, 'with filters:', filters);
      debouncedSearch(value, filters);
    }, 300);
  };

  // Handle search submission
  const handleSearchSubmit = (searchQuery = query) => {
    if (!searchQuery.trim() && !Object.values(filters).some(filter => filter && filter !== '')) return;

    // Add to search history
    if (searchQuery.trim()) {
      const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('movieSearchHistory', JSON.stringify(newHistory));
    }

    // Build query string with filters
    const searchParams = new URLSearchParams();
    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery);
    }
    
    // Add active filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        searchParams.set(key, value);
      }
    });

    // Navigate to search results page
    const queryString = searchParams.toString();
    navigate(`/search${queryString ? `?${queryString}` : ''}`);
    onClose?.();
  };

  // Handle movie selection
  const handleMovieSelect = (movie) => {
    navigate(`/movie/${movie.imdbID || movie.id}`);
    onClose?.();
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setLoading(false);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    
    setFilters(newFilters);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Trigger search with new filters
    setLoading(true);
    searchTimeout.current = setTimeout(() => {
      console.log('🔍 Filter changed, searching with:', query, 'filters:', newFilters);
      debouncedSearch(query, newFilters);
    }, 300);
  };

  // Get movie year for display
  const getMovieYear = (movie) => {
    return movie.release_date ? new Date(movie.release_date).getFullYear() : 
           movie.Year ? movie.Year : 'N/A';
  };

  // Get movie rating for display
  const getMovieRating = (movie) => {
    return movie.vote_average ? movie.vote_average.toFixed(1) : 
           movie.imdbRating ? movie.imdbRating : 'N/A';
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="enhanced-search-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="enhanced-search-container"
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="search-header">
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search for movies, actors, directors..."
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            {query && (
              <button className="clear-search" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
            {loading && (
              <div className="search-loading">
                <Loader className="spin" size={16} />
              </div>
            )}
          </div>
          
          <div className="search-actions">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filters
            </button>
            <button className="search-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Results - Appears immediately after search header */}
        {query && (
          <div className="search-results-immediate">
            {/* Loading State */}
            {loading && (
              <motion.div 
                className="loading-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="loading-spinner"></div>
                <p>Searching for movies...</p>
              </motion.div>
            )}

            {/* Search Results */}
            {!loading && results.length > 0 && (
              <motion.div 
                className="search-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="results-header">
                  <h3>Search Results</h3>
                  <button 
                    className="view-all-btn"
                    onClick={() => handleSearchSubmit()}
                  >
                    View All Results
                  </button>
                </div>
                
                <div className="results-list">
                  {results.map((movie, index) => (
                    <motion.div
                      key={movie.imdbID || movie.id}
                      className="result-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleMovieSelect(movie)}
                    >
                      <div className="result-poster">
                        <img 
                          src={movie.poster_path ? 
                            `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 
                            movie.Poster !== 'N/A' ? movie.Poster : 
                            '/placeholder-movie.jpg'
                          }
                          alt={movie.title || movie.Title}
                          onError={(e) => {
                            e.target.src = '/placeholder-movie.jpg';
                          }}
                        />
                      </div>
                      
                      <div className="result-info">
                        <h4 className="result-title">{movie.title || movie.Title}</h4>
                        <div className="result-meta">
                          <span className="result-year">
                            <Calendar size={12} />
                            {getMovieYear(movie)}
                          </span>
                          <span className="result-rating">
                            <Star size={12} />
                            {getMovieRating(movie)}
                          </span>
                        </div>
                        <p className="result-overview">
                          {movie.overview || movie.Plot || 'No description available.'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty Results */}
            {!loading && results.length === 0 && (
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="empty-icon">🔍</div>
                <h3>No movies found</h3>
                <p>Try adjusting your search terms or check the spelling</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="filters-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Genre</label>
                  <select 
                    value={filters.genre} 
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                  >
                    <option value="">All Genres</option>
                    <option value="action">Action</option>
                    <option value="adventure">Adventure</option>
                    <option value="animation">Animation</option>
                    <option value="comedy">Comedy</option>
                    <option value="crime">Crime</option>
                    <option value="documentary">Documentary</option>
                    <option value="drama">Drama</option>
                    <option value="family">Family</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="history">History</option>
                    <option value="horror">Horror</option>
                    <option value="music">Music</option>
                    <option value="mystery">Mystery</option>
                    <option value="romance">Romance</option>
                    <option value="science fiction">Sci-Fi</option>
                    <option value="thriller">Thriller</option>
                    <option value="war">War</option>
                    <option value="western">Western</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Year</label>
                  <select 
                    value={filters.year} 
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                  >
                    <option value="">Any Year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                    <option value="2018">2018</option>
                    <option value="2017">2017</option>
                    <option value="2016">2016</option>
                    <option value="2015">2015</option>
                    <option value="2010">2010s</option>
                    <option value="2000">2000s</option>
                    <option value="1990">1990s</option>
                    <option value="1980">1980s</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Min Rating</label>
                  <select 
                    value={filters.minRating} 
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  >
                    <option value="">Any Rating</option>
                    <option value="9">9.0+ (Masterpiece)</option>
                    <option value="8">8.0+ (Excellent)</option>
                    <option value="7">7.0+ (Good)</option>
                    <option value="6">6.0+ (Decent)</option>
                    <option value="5">5.0+ (Average)</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <select 
                    value={filters.sortBy} 
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="popularity">Popularity</option>
                    <option value="rating">Rating</option>
                    <option value="release_date">Release Date</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="filter-actions">
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    const clearedFilters = {
                      genre: '',
                      year: '',
                      minRating: '',
                      sortBy: 'popularity'
                    };
                    setFilters(clearedFilters);
                    setLoading(true);
                    setTimeout(() => {
                      debouncedSearch(query, clearedFilters);
                    }, 100);
                  }}
                >
                  Clear Filters
                </button>
                <button 
                  className="apply-filters-btn"
                  onClick={() => {
                    setLoading(true);
                    debouncedSearch(query, filters);
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Content - Non-search states only */}
        <div className="search-content">
          {!query && (
            <>
              {/* Search History */}
              {searchHistory.length > 0 && (
                <motion.div 
                  className="search-history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3>Recent Searches</h3>
                  <div className="history-list">
                    {searchHistory.map((historyItem, index) => (
                      <motion.button
                        key={index}
                        className="history-item"
                        onClick={() => {
                          setQuery(historyItem);
                          handleSearchSubmit(historyItem);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Clock size={14} />
                        {historyItem}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Default State */}
              {searchHistory.length === 0 && (
                <motion.div 
                  className="default-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="default-icon">🎬</div>
                  <h3>Search for movies</h3>
                  <p>Find your next favorite movie by title, actor, or director</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSearch;
