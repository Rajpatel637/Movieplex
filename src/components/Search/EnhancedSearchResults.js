import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, SortAsc, Star, Calendar, Clock } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import MovieCard from '../MovieCard/MovieCard';
import './SearchResults.css';

const EnhancedSearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchMovies } = useMovies();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('popularity');
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    minRating: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  const query = searchParams.get('q') || '';
  const resultsPerPage = 20;

  // Search effect
  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, sortBy, filters, currentPage]);

  const performSearch = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const searchResults = await searchMovies(query, {
        page: currentPage,
        sort_by: sortBy,
        ...filters
      });
      
      setResults(searchResults.results || searchResults);
      setTotalResults(searchResults.total_results || searchResults.length);
      setSearchTime(Date.now() - startTime);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-results-page">
      <div className="search-header-section">
        <div className="search-header-content">
          <h1 className="search-title">
            Search Results for "{query}"
          </h1>
          
          <div className="search-meta">
            <span className="results-count">
              {totalResults.toLocaleString()} results found
            </span>
            <span className="search-time">
              <Clock size={14} />
              {searchTime}ms
            </span>
          </div>
        </div>
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

export default EnhancedSearchResults;
