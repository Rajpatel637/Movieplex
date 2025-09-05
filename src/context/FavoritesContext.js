import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('movieplex-favorites') || '[]');
    const savedWatchlist = JSON.parse(localStorage.getItem('movieplex-watchlist') || '[]');
    setFavorites(savedFavorites);
    setWatchlist(savedWatchlist);
  }, []);

  // Save to localStorage whenever lists change
  useEffect(() => {
    localStorage.setItem('movieplex-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('movieplex-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Add to favorites
  const addToFavorites = (movie) => {
    if (!isFavorite(movie.imdbID || movie.id)) {
      const movieData = {
        id: movie.imdbID || movie.id,
        title: movie.title || movie.Title,
        poster: movie.poster_path ? 
          `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
          movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.jpg',
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : movie.Year,
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : movie.imdbRating,
        addedDate: new Date().toISOString(),
        ...movie
      };
      setFavorites(prev => [movieData, ...prev]);
      return true;
    }
    return false;
  };

  // Remove from favorites
  const removeFromFavorites = (movieId) => {
    setFavorites(prev => prev.filter(movie => movie.id !== movieId));
  };

  // Check if movie is in favorites
  const isFavorite = (movieId) => {
    return favorites.some(movie => movie.id === movieId);
  };

  // Toggle favorite status
  const toggleFavorite = (movie) => {
    if (isFavorite(movie.imdbID || movie.id)) {
      removeFromFavorites(movie.imdbID || movie.id);
      return false;
    } else {
      addToFavorites(movie);
      return true;
    }
  };

  // Add to watchlist
  const addToWatchlist = (movie) => {
    if (!isInWatchlist(movie.imdbID || movie.id)) {
      const movieData = {
        id: movie.imdbID || movie.id,
        title: movie.title || movie.Title,
        poster: movie.poster_path ? 
          `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
          movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.jpg',
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : movie.Year,
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : movie.imdbRating,
        addedDate: new Date().toISOString(),
        ...movie
      };
      setWatchlist(prev => [movieData, ...prev]);
      return true;
    }
    return false;
  };

  // Remove from watchlist
  const removeFromWatchlist = (movieId) => {
    setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
  };

  // Check if movie is in watchlist
  const isInWatchlist = (movieId) => {
    return watchlist.some(movie => movie.id === movieId);
  };

  // Toggle watchlist status
  const toggleWatchlist = (movie) => {
    if (isInWatchlist(movie.imdbID || movie.id)) {
      removeFromWatchlist(movie.imdbID || movie.id);
      return false;
    } else {
      addToWatchlist(movie);
      return true;
    }
  };

  // Get favorites with sorting and filtering
  const getFavorites = (sortBy = 'addedDate', filterBy = null) => {
    let sortedFavorites = [...favorites];
    
    // Apply filter
    if (filterBy) {
      if (filterBy.year) {
        sortedFavorites = sortedFavorites.filter(movie => 
          movie.year && movie.year.toString() === filterBy.year
        );
      }
      if (filterBy.minRating) {
        sortedFavorites = sortedFavorites.filter(movie => 
          parseFloat(movie.rating || 0) >= parseFloat(filterBy.minRating)
        );
      }
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'title':
        return sortedFavorites.sort((a, b) => a.title.localeCompare(b.title));
      case 'year':
        return sortedFavorites.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'rating':
        return sortedFavorites.sort((a, b) => (parseFloat(b.rating || 0)) - (parseFloat(a.rating || 0)));
      case 'addedDate':
      default:
        return sortedFavorites.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    }
  };

  // Get watchlist with sorting and filtering
  const getWatchlist = (sortBy = 'addedDate', filterBy = null) => {
    let sortedWatchlist = [...watchlist];
    
    // Apply filter
    if (filterBy) {
      if (filterBy.year) {
        sortedWatchlist = sortedWatchlist.filter(movie => 
          movie.year && movie.year.toString() === filterBy.year
        );
      }
      if (filterBy.minRating) {
        sortedWatchlist = sortedWatchlist.filter(movie => 
          parseFloat(movie.rating || 0) >= parseFloat(filterBy.minRating)
        );
      }
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'title':
        return sortedWatchlist.sort((a, b) => a.title.localeCompare(b.title));
      case 'year':
        return sortedWatchlist.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'rating':
        return sortedWatchlist.sort((a, b) => (parseFloat(b.rating || 0)) - (parseFloat(a.rating || 0)));
      case 'addedDate':
      default:
        return sortedWatchlist.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    }
  };

  // Clear all favorites
  const clearFavorites = () => {
    setFavorites([]);
  };

  // Clear all watchlist
  const clearWatchlist = () => {
    setWatchlist([]);
  };

  // Export data
  const exportData = () => {
    const data = {
      favorites,
      watchlist,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  };

  // Import data
  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.favorites && Array.isArray(data.favorites)) {
        setFavorites(data.favorites);
      }
      if (data.watchlist && Array.isArray(data.watchlist)) {
        setWatchlist(data.watchlist);
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  };

  const value = {
    // State
    favorites,
    watchlist,
    
    // Favorites methods
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getFavorites,
    clearFavorites,
    
    // Watchlist methods
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    getWatchlist,
    clearWatchlist,
    
    // Utility methods
    exportData,
    importData,
    
    // Statistics
    favoritesCount: favorites.length,
    watchlistCount: watchlist.length
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
