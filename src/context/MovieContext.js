import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getPopularMovies, getTrendingMovies, getTopRatedMovies, searchMovies as apiSearchMovies, getMovieDetails } from '../services/movieAPI';

const MovieContext = createContext();

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [activeSection, setActiveSection] = useState('popular');

  const loadAllSections = useCallback(async () => {
    console.log('🔧 MovieContext: loadAllSections called');
    setLoading(true);
    try {
      console.log('🔧 MovieContext: Starting API calls...');
      const [popular, trending, topRated] = await Promise.all([
        getPopularMovies(),
        getTrendingMovies(),
        getTopRatedMovies()
      ]);
      
      console.log('🔧 MovieContext: API calls completed');
      console.log('🔧 MovieContext: Popular:', popular);
      console.log('🔧 MovieContext: Trending:', trending);
      console.log('🔧 MovieContext: Top Rated:', topRated);
      
      // Handle API response structure - extract results array
      const popularMovies = popular.results || popular || [];
      const trendingMovies = trending.results || trending || [];
      const topRatedMoviesData = topRated.results || topRated || [];
      
      console.log('🔧 MovieContext: Setting movies - Popular count:', popularMovies.length);
      console.log('🔧 MovieContext: Setting featured movies:', popularMovies.slice(0, 5));
      
      setMovies(popularMovies);
      setFeaturedMovies(popularMovies.slice(0, 5));
      setTrendingMovies(trendingMovies);
      setTopRatedMovies(topRatedMoviesData);
    } catch (error) {
      console.error('❌ MovieContext: Error loading movies:', error);
      // Set empty arrays on error
      setMovies([]);
      setFeaturedMovies([]);
      setTrendingMovies([]);
      setTopRatedMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial movies for homepage display
  useEffect(() => {
    loadAllSections();
  }, [loadAllSections]);

  const loadPopularMovies = useCallback(async () => {
    setLoading(true);
    setActiveSection('popular');
    try {
      const popularMovies = await getPopularMovies();
      const moviesArray = popularMovies.results || popularMovies || [];
      setMovies(moviesArray);
      setFeaturedMovies(moviesArray.slice(0, 5));
    } catch (error) {
      console.error('Error loading popular movies:', error);
      setMovies([]);
      setFeaturedMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrendingMovies = useCallback(async () => {
    setLoading(true);
    setActiveSection('trending');
    try {
      const trending = await getTrendingMovies();
      const moviesArray = trending.results || trending || [];
      setMovies(moviesArray);
      setTrendingMovies(moviesArray);
    } catch (error) {
      console.error('Error loading trending movies:', error);
      setMovies([]);
      setTrendingMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTopRatedMovies = useCallback(async () => {
    setLoading(true);
    setActiveSection('topRated');
    try {
      const topRated = await getTopRatedMovies();
      const moviesArray = topRated.results || topRated || [];
      setMovies(moviesArray);
      setTopRatedMovies(moviesArray);
    } catch (error) {
      console.error('Error loading top rated movies:', error);
      setMovies([]);
      setTopRatedMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMovies = useCallback(async (query, filters = {}) => {
    if (!query.trim() && (!filters || Object.keys(filters).length === 0)) {
      loadPopularMovies();
      return [];
    }
    
    setLoading(true);
    setSearchQuery(query);
    try {
      console.log('🔧 MovieContext: Searching for:', query, 'with filters:', filters);
      const searchResults = await apiSearchMovies(query, 1, filters);
      console.log('🔧 MovieContext: Search results:', searchResults);
      const moviesArray = searchResults.results || searchResults || [];
      setMovies(moviesArray);
      return moviesArray; // Return the results for Enhanced Search
    } catch (error) {
      console.error('Error searching movies:', error);
      setMovies([]);
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  }, [loadPopularMovies]);

  const getMovieDetailsById = useCallback(async (id) => {
    try {
      return await getMovieDetails(id);
    } catch (error) {
      console.error('Error loading movie details:', error);
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    movies,
    loading,
    searchQuery,
    featuredMovies,
    trendingMovies,
    topRatedMovies,
    activeSection,
    searchMovies,
    getMovieDetails: getMovieDetailsById,
    loadPopularMovies,
    loadTrendingMovies,
    loadTopRatedMovies,
    loadAllSections
  }), [
    movies,
    loading,
    searchQuery,
    featuredMovies,
    trendingMovies,
    topRatedMovies,
    activeSection,
    searchMovies,
    getMovieDetailsById,
    loadPopularMovies,
    loadTrendingMovies,
    loadTopRatedMovies,
    loadAllSections
  ]);

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};
