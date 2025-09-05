import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Clock, Play, Heart, Bookmark, Info } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import trailerService from '../../services/trailerService';
import TrailerModal from '../TrailerModal/TrailerModal';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const navigate = useNavigate();
  
  const { 
    isFavorite, 
    isInWatchlist, 
    toggleFavorite, 
    toggleWatchlist 
  } = useFavorites();

  const movieId = movie.imdbID || movie.id;
  const movieIsFavorite = isFavorite(movieId);
  const movieIsInWatchlist = isInWatchlist(movieId);

  // Debug logging to see what data we're getting
  console.log('MovieCard received movie data:', movie);

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavorite(movie);
    console.log(added ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWatchlist(movie);
    console.log(added ? 'Added to watchlist' : 'Removed from watchlist');
  };

  const handlePlayTrailer = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (trailerLoading) return;
    
    setTrailerLoading(true);
    
    try {
      const trailer = await trailerService.getMovieTrailer(movie);
      
      if (trailer) {
        setTrailerUrl(trailer.url);
        setIsTrailerModalOpen(true);
      } else {
        // Fallback to YouTube search
        const searchQuery = `${movie.title} ${movie.release_date ? new Date(movie.release_date).getFullYear() : ''} official trailer`;
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        window.open(youtubeSearchUrl, '_blank');
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      // Fallback to YouTube search
      const searchQuery = `${movie.title} ${movie.release_date ? new Date(movie.release_date).getFullYear() : ''} official trailer`;
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      window.open(youtubeSearchUrl, '_blank');
    } finally {
      setTrailerLoading(false);
    }
  };

  const handleCloseTrailerModal = () => {
    setIsTrailerModalOpen(false);
    setTrailerUrl(null);
  };

  const handleMoreInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/movie/${movie.id}`);
  };

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  // Helper functions for safe data access
  const getRating = () => {
    return movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  };

  const getYear = () => {
    if (!movie.release_date) return 'Unknown';
    try {
      return new Date(movie.release_date).getFullYear();
    } catch {
      return 'Unknown';
    }
  };

  const getGenres = () => {
    if (!movie.genres) return [];
    return Array.isArray(movie.genres) ? movie.genres.slice(0, 2) : [];
  };

  const getRuntime = () => {
    return movie.runtime ? `${movie.runtime}m` : null;
  };

  const getDescription = () => {
    if (!movie.overview) return 'No description available.';
    return movie.overview.length > 120 
      ? `${movie.overview.substring(0, 120)}...` 
      : movie.overview;
  };

  const getRatingClass = () => {
    const rating = movie.vote_average || 0;
    if (rating >= 8) return 'excellent';
    if (rating >= 7) return 'good';
    if (rating >= 6) return 'average';
    return 'poor';
  };

  return (
    <div
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Background Gradient */}
      <div className="card-background"></div>
      
      {/* Poster Section */}
      <div className="movie-poster-section">
        {!imageLoaded && (
          <div className="poster-skeleton">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        <img
          src={movie.poster_path || 'https://via.placeholder.com/400x600/2a2a2a/666?text=No+Image'}
          alt={movie.title}
          className={`movie-poster-img ${imageLoaded ? 'loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x600/2a2a2a/666?text=No+Image';
            setImageLoaded(true);
          }}
        />
        
        {/* Rating Badge */}
        <div className={`rating-badge ${getRatingClass()}`}>
          <Star size={12} fill="currentColor" />
          <span>{getRating()}</span>
        </div>

        {/* Hover Overlay */}
        <div className={`movie-overlay ${isHovered ? 'visible' : ''}`}>
          <div className="overlay-gradient"></div>
          <div className="movie-actions">
            <button
              className={`action-btn play-btn ${trailerLoading ? 'loading' : ''}`}
              onClick={handlePlayTrailer}
              disabled={trailerLoading}
              title="Watch Trailer"
            >
              <Play size={16} fill="currentColor" />
            </button>
            <button
              className={`action-btn favorite-btn ${movieIsFavorite ? 'active' : ''}`}
              onClick={handleFavoriteToggle}
              title={movieIsFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart size={16} fill={movieIsFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              className={`action-btn watchlist-btn ${movieIsInWatchlist ? 'active' : ''}`}
              onClick={handleWatchlistToggle}
              title={movieIsInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark size={16} fill={movieIsInWatchlist ? 'currentColor' : 'none'} />
            </button>
            <button
              className="action-btn info-btn"
              onClick={handleMoreInfo}
              title="More Info"
            >
              <Info size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="movie-content">
        <h3 className="movie-title">{movie.title || 'Unknown Title'}</h3>
        
        <div className="movie-meta-info">
          <div className="meta-item">
            <Calendar size={12} />
            <span>{getYear()}</span>
          </div>
          {getRuntime() && (
            <div className="meta-item">
              <Clock size={12} />
              <span>{getRuntime()}</span>
            </div>
          )}
        </div>

        <div className="movie-genres">
          {getGenres().map((genre, index) => (
            <span key={index} className="genre-chip">
              {typeof genre === 'string' ? genre : genre.name}
            </span>
          ))}
        </div>

        <p className="movie-overview">
          {getDescription()}
        </p>

        {/* Bottom Actions for Mobile */}
        <div className="mobile-actions">
          <button
            className="mobile-action-btn primary"
            onClick={handleMoreInfo}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={handleCloseTrailerModal}
        movie={movie}
        trailerUrl={trailerUrl}
      />
    </div>
  );
};

export default MovieCard;
