import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, SortAsc, Filter, Download, Upload, Trash2, Calendar, Star } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import MovieCard from '../MovieCard/MovieCard';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const {
    getFavorites,
    getWatchlist,
    clearFavorites,
    clearWatchlist,
    exportData,
    importData,
    favoritesCount,
    watchlistCount
  } = useFavorites();

  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'watchlist'
  const [sortBy, setSortBy] = useState('addedDate');
  const [filterBy, setFilterBy] = useState({
    year: '',
    minRating: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get current list based on active tab
  const getCurrentList = () => {
    const filterOptions = Object.keys(filterBy).some(key => filterBy[key]) ? filterBy : null;
    
    if (activeTab === 'favorites') {
      return getFavorites(sortBy, filterOptions);
    } else {
      return getWatchlist(sortBy, filterOptions);
    }
  };

  // Handle export
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movieplex-${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const success = importData(e.target.result);
        if (success) {
          alert('Data imported successfully!');
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle clear list
  const handleClearList = () => {
    const listName = activeTab === 'favorites' ? 'favorites' : 'watchlist';
    if (window.confirm(`Are you sure you want to clear all ${listName}? This action cannot be undone.`)) {
      if (activeTab === 'favorites') {
        clearFavorites();
      } else {
        clearWatchlist();
      }
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilterBy(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const currentList = getCurrentList();

  return (
    <div className="favorites-page">
      {/* Header */}
      <div className="favorites-header">
        <div className="favorites-header-content">
          <h1 className="favorites-title">My Collection</h1>
          <p className="favorites-subtitle">
            Your personal movie collection and watchlist
          </p>
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <Heart size={18} />
              Favorites ({favoritesCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('watchlist')}
            >
              <Bookmark size={18} />
              Watchlist ({watchlistCount})
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="favorites-controls">
        <div className="controls-left">
          <div className="sort-section">
            <SortAsc size={16} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="addedDate">Date Added</option>
              <option value="title">Title</option>
              <option value="year">Year</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="controls-right">
          <button className="action-btn" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
          
          <label className="action-btn import-btn">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>

          {currentList.length > 0 && (
            <button 
              className="action-btn danger"
              onClick={handleClearList}
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

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
                <label>Year</label>
                <select 
                  value={filterBy.year} 
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
                </select>
              </div>

              <div className="filter-group">
                <label>Min Rating</label>
                <select 
                  value={filterBy.minRating} 
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                >
                  <option value="">Any Rating</option>
                  <option value="9">9.0+</option>
                  <option value="8">8.0+</option>
                  <option value="7">7.0+</option>
                  <option value="6">6.0+</option>
                  <option value="5">5.0+</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="favorites-content">
        {currentList.length > 0 ? (
          <motion.div 
            className="favorites-grid"
            layout
          >
            <AnimatePresence>
              {currentList.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    layout: { duration: 0.3 }
                  }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'favorites' ? '💝' : '📋'}
            </div>
            <h2>
              {activeTab === 'favorites' 
                ? 'No favorite movies yet' 
                : 'Your watchlist is empty'
              }
            </h2>
            <p>
              {activeTab === 'favorites' 
                ? 'Start adding movies to your favorites by clicking the heart icon on any movie card.' 
                : 'Add movies to your watchlist to keep track of what you want to watch next.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      {(favoritesCount > 0 || watchlistCount > 0) && (
        <div className="favorites-stats">
          <div className="stats-container">
            <div className="stat-item">
              <Heart size={20} />
              <span className="stat-number">{favoritesCount}</span>
              <span className="stat-label">Favorites</span>
            </div>
            <div className="stat-item">
              <Bookmark size={20} />
              <span className="stat-number">{watchlistCount}</span>
              <span className="stat-label">Watchlist</span>
            </div>
            <div className="stat-item">
              <Calendar size={20} />
              <span className="stat-number">{favoritesCount + watchlistCount}</span>
              <span className="stat-label">Total Movies</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
