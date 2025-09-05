import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, SortAsc, Star, Calendar, Clock } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import MovieCard from '../MovieCard/MovieCard';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchMovies } = useMovies();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') || '';
  const filters = {
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'popularity'
  };

  // Search effect - trigger search when query or filters change
  useEffect(() => {
    performSearch();
  }, [query, filters.genre, filters.year, filters.minRating, filters.sortBy]);

  const performSearch = async () => {
    setLoading(true);
    try {
      console.log('🔍 SearchResults: Searching with query:', query, 'filters:', filters);
      const searchResults = await searchMovies(query, filters);
      const moviesArray = searchResults.results || searchResults || [];
      setResults(moviesArray);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (value && value !== '') {
      newSearchParams.set(filterType, value);
    } else {
      newSearchParams.delete(filterType);
    }
    
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const newSearchParams = new URLSearchParams();
    if (query) {
      newSearchParams.set('q', query);
    }
    setSearchParams(newSearchParams);
  };

  const getSearchTitle = () => {
    if (query) {
      return `Search Results for "${query}"`;
    }
    
    const activeFilters = Object.entries(filters).filter(([key, value]) => value && value !== '' && key !== 'sortBy');
    if (activeFilters.length > 0) {
      return 'Filtered Results';
    }
    
    return 'Browse Movies';
  };

  return (
    <div className="search-results-page">
      <div className="search-header-section">
        <div className="search-header-content">
          <h1 className="search-title">
            {getSearchTitle()}
          </h1>
          
          <div className="search-controls">
            <div className="search-meta">
              <span className="results-count">
                {loading ? 'Searching...' : `${results.length} results found`}
              </span>
            </div>
            
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="search-filters-panel"
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
              
              <div className="filter-actions">
                <button 
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
                <button 
                  className="apply-filters-btn"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="results-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Searching for movies...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="results-grid">
            {results.map((movie, index) => (
              <motion.div
                key={movie.imdbID || movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <div className="empty-icon">🔍</div>
            <h2>No movies found</h2>
            <p>Try adjusting your search terms</p>
            <button 
              className="back-btn"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
