import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Heart, 
  Bookmark, 
  Star, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Users,
  Globe,
  DollarSign,
  Award,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Music,
  Edit3,
  User,
  MessageCircle,
  ThumbsUp,
  ExternalLink,
  Film,
  Sparkles,
  Tv,
  Smartphone,
  Monitor,
  ShoppingCart
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import TrailerModal from '../TrailerModal/TrailerModal';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMovieDetails } = useMovies();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for user interactions
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  // Trailer modal state
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [modalTrailerUrl, setModalTrailerUrl] = useState(null);
  
  // Gallery state
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // New state for additional sections
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Generate streaming platform URL
  const generateProviderUrl = (provider, movieTitle, movieYear) => {
    const encodedTitle = encodeURIComponent(movieTitle);
    const encodedQuery = encodeURIComponent(`${movieTitle} ${movieYear}`);
    
    // Map provider IDs to their search/browse URLs
    const providerUrls = {
      // Streaming Services
      8: `https://www.netflix.com/search?q=${encodedTitle}`, // Netflix
      337: `https://www.disneyplus.com/search?q=${encodedTitle}`, // Disney Plus
      119: `https://www.amazon.com/s?k=${encodedQuery}&i=prime-instant-video`, // Amazon Prime Video
      15: `https://www.hulu.com/search?q=${encodedTitle}`, // Hulu
      384: `https://www.hbomax.com/search?q=${encodedTitle}`, // HBO Max
      531: `https://www.paramountplus.com/search/?query=${encodedTitle}`, // Paramount Plus
      43: `https://tv.apple.com/search?term=${encodedTitle}`, // Apple TV Plus
      
      // Rental/Purchase Services  
      2: `https://tv.apple.com/search?term=${encodedTitle}`, // Apple TV
      3: `https://play.google.com/store/search?q=${encodedQuery}&c=movies`, // Google Play Movies
      68: `https://www.microsoft.com/en-us/search?q=${encodedQuery}`, // Microsoft Store
      10: `https://www.amazon.com/s?k=${encodedQuery}&i=movies-tv`, // Amazon Video
      7: `https://www.vudu.com/content/movies/search/${encodedTitle}`, // Vudu
      192: `https://www.youtube.com/results?search_query=${encodedQuery}`, // YouTube Movies
      
      // International Services
      146: `https://www.peacocktv.com/search?q=${encodedTitle}`, // Peacock
      386: `https://www.starz.com/search?query=${encodedTitle}`, // Starz
      387: `https://www.showtime.com/search/${encodedTitle}`, // Showtime
      
      // UK Services
      130: `https://www.skystore.com/search?query=${encodedTitle}`, // Sky Store
      
      // Default fallback - Google search for the service + movie
      default: `https://www.google.com/search?q=${provider.provider_name}+${encodedQuery}`
    };
    
    return providerUrls[provider.provider_id] || providerUrls.default;
  };

  // Handle provider click
  const handleProviderClick = (provider, movieTitle, movieYear) => {
    const url = generateProviderUrl(provider, movieTitle, movieYear);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle provider keydown for accessibility
  const handleProviderKeyDown = (event, provider, movieTitle, movieYear) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleProviderClick(provider, movieTitle, movieYear);
    }
  };

  const loadMovieDetails = useCallback(async () => {
    if (!id) {
      setError('No movie ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const movieData = await getMovieDetails(id);
      
      if (!movieData) {
        throw new Error('Failed to load movie details');
      }
      
      setMovie(movieData);
    } catch (err) {
      console.error('Error loading movie details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, getMovieDetails]);

  useEffect(() => {
    loadMovieDetails();
  }, [loadMovieDetails]);

  const openTrailerModal = () => {
    if (movie && movie.videos && movie.videos.results && movie.videos.results.length > 0) {
      const trailer = movie.videos.results.find(video => 
        video.site === 'YouTube' && video.type === 'Trailer'
      ) || movie.videos.results[0];
      
      const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`;
      setModalTrailerUrl(youtubeUrl);
      setIsTrailerModalOpen(true);
    }
  };

  const closeTrailerModal = () => {
    setIsTrailerModalOpen(false);
    setModalTrailerUrl(null);
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMoney = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRatingClass = () => {
    const rating = movie?.vote_average || 0;
    if (rating >= 8) return 'excellent';
    if (rating >= 7) return 'good';
    if (rating >= 6) return 'average';
    return 'poor';
  };

  const openImageGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setShowImageGallery(true);
  };

  const closeImageGallery = () => {
    setShowImageGallery(false);
  };

  const nextImage = () => {
    if (movie?.images?.backdrops) {
      setCurrentImageIndex((prev) => 
        prev >= movie.images.backdrops.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (movie?.images?.backdrops) {
      setCurrentImageIndex((prev) => 
        prev <= 0 ? movie.images.backdrops.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="movie-details-loading-redesigned">
        <div className="loading-container">
          <div className="loading-spinner-redesigned"></div>
          <h2>Loading Movie Details</h2>
          <p>Preparing your cinematic experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-details-error-redesigned">
        <div className="error-container">
          <h2>Something Went Wrong</h2>
          <p>{error}</p>
          <button onClick={loadMovieDetails} className="retry-button-redesigned">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-details-error-redesigned">
        <div className="error-container">
          <h2>Movie Not Found</h2>
          <p>The movie you're looking for doesn't exist in our database.</p>
          <Link to="/" className="back-to-home-redesigned">
            <ArrowLeft size={20} />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const hasTrailer = movie.videos && movie.videos.results && movie.videos.results.length > 0;
  const backdropUrl = movie.backdrop_path ? 
    `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;

  return (
    <div className="movie-details-redesigned">
      {/* Hero Section with Backdrop */}
      <div className="hero-section" style={{
        backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Link to="/" className="back-button-redesigned">
            <ArrowLeft size={20} />
            <span>Back to Movies</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-container">
          
          {/* Movie Header */}
          <div className="movie-header">
            <div className="poster-section">
              <div className="poster-container">
                <img 
                  src={movie.poster_path ? 
                    `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
                    '/placeholder-movie.jpg'
                  }
                  alt={movie.title}
                  className="movie-poster-large-redesigned"
                  onError={(e) => {
                    e.target.src = '/placeholder-movie.jpg';
                  }}
                />
                <div className="poster-shadow"></div>
              </div>
            </div>

            <div className="movie-info-main">
              <motion.h1 
                className="movie-title-main"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {movie.title}
              </motion.h1>
              
              {movie.tagline && (
                <motion.p 
                  className="movie-tagline-redesigned"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  "{movie.tagline}"
                </motion.p>
              )}

              <motion.div 
                className="movie-meta-main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className={`rating-display ${getRatingClass()}`}>
                  <Star className="rating-icon" fill="currentColor" />
                  <span className="rating-number">
                    {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                  </span>
                  <span className="rating-total">/10</span>
                </div>
                <div className="meta-item-main">
                  <Calendar className="meta-icon" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>
                <div className="meta-item-main">
                  <Clock className="meta-icon" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                {movie.vote_count && (
                  <div className="meta-item-main">
                    <Eye className="meta-icon" />
                    <span>{movie.vote_count.toLocaleString()} votes</span>
                  </div>
                )}
              </motion.div>

              <motion.div 
                className="movie-genres-main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {movie.genres && movie.genres.map((genre, index) => (
                  <span key={genre.id} className="genre-tag-main">
                    {genre.name}
                  </span>
                ))}
              </motion.div>

              <motion.div 
                className="movie-actions-main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <button 
                  className="action-button-main play-trailer-main"
                  onClick={openTrailerModal}
                  disabled={!hasTrailer}
                >
                  <Play size={20} fill="currentColor" />
                  {hasTrailer ? 'Watch Trailer' : 'No Trailer Available'}
                </button>
                
                <button 
                  className={`action-button-main favorite-main ${isFavorite ? 'active' : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
                
                <button 
                  className={`action-button-main watchlist-main ${isInWatchlist ? 'active' : ''}`}
                  onClick={() => setIsInWatchlist(!isInWatchlist)}
                >
                  <Bookmark size={20} fill={isInWatchlist ? 'currentColor' : 'none'} />
                  {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </motion.div>
            </div>
          </div>

          {/* Overview Section */}
          <motion.div 
            className="overview-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="section-title">Overview</h2>
            <p className="overview-text">
              {movie.overview || 'No overview available for this movie.'}
            </p>
          </motion.div>

          {/* Movie Stats */}
          <motion.div 
            className="stats-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="section-title">Movie Details</h2>
            <div className="stats-grid">
              {movie.budget && (
                <div className="stat-card">
                  <DollarSign className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-label">Budget</span>
                    <span className="stat-value">{formatMoney(movie.budget)}</span>
                  </div>
                </div>
              )}
              {movie.revenue && (
                <div className="stat-card">
                  <Award className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-value">{formatMoney(movie.revenue)}</span>
                  </div>
                </div>
              )}
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div className="stat-card">
                  <Users className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-label">Production</span>
                    <span className="stat-value">
                      {movie.production_companies[0].name}
                    </span>
                  </div>
                </div>
              )}
              {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                <div className="stat-card">
                  <Globe className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-label">Language</span>
                    <span className="stat-value">
                      {movie.spoken_languages[0].english_name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Cast Section */}
          {movie.cast && movie.cast.length > 0 && (
            <motion.div 
              className="cast-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="section-header">
                <h2 className="section-title">
                  <Users className="section-icon" />
                  Cast
                </h2>
                {movie.cast.length > 6 && (
                  <button 
                    className="view-all-btn"
                    onClick={() => setShowAllCast(!showAllCast)}
                  >
                    {showAllCast ? 'Show Less' : `View All (${movie.cast.length})`}
                  </button>
                )}
              </div>
              
              <div className="cast-grid">
                {(showAllCast ? movie.cast : movie.cast.slice(0, 6)).map((actor, index) => (
                  <motion.div
                    key={actor.id}
                    className="cast-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="cast-image-container">
                      <img 
                        src={actor.profile_path || 'https://via.placeholder.com/185x278/333/fff?text=No+Photo'}
                        alt={actor.name}
                        className="cast-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/185x278/333/fff?text=No+Photo';
                        }}
                      />
                    </div>
                    <div className="cast-info">
                      <h4 className="cast-name">{actor.name}</h4>
                      <p className="cast-character">{actor.character}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Crew Section */}
          {(movie.director || movie.producer || movie.writer || movie.cinematographer || movie.composer) && (
            <motion.div 
              className="crew-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="section-title">
                <Camera className="section-icon" />
                Key Crew
              </h2>
              
              <div className="crew-grid">
                {movie.director && (
                  <div className="crew-card">
                    <div className="crew-role">
                      <Film className="crew-icon" />
                      <span>Director</span>
                    </div>
                    <p className="crew-name">{movie.director}</p>
                  </div>
                )}
                {movie.producer && (
                  <div className="crew-card">
                    <div className="crew-role">
                      <Sparkles className="crew-icon" />
                      <span>Producer</span>
                    </div>
                    <p className="crew-name">{movie.producer}</p>
                  </div>
                )}
                {movie.writer && (
                  <div className="crew-card">
                    <div className="crew-role">
                      <Edit3 className="crew-icon" />
                      <span>Writer</span>
                    </div>
                    <p className="crew-name">{movie.writer}</p>
                  </div>
                )}
                {movie.cinematographer && (
                  <div className="crew-card">
                    <div className="crew-role">
                      <Camera className="crew-icon" />
                      <span>Cinematographer</span>
                    </div>
                    <p className="crew-name">{movie.cinematographer}</p>
                  </div>
                )}
                {movie.composer && (
                  <div className="crew-card">
                    <div className="crew-role">
                      <Music className="crew-icon" />
                      <span>Composer</span>
                    </div>
                    <p className="crew-name">{movie.composer}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Additional Information Section */}
          <motion.div 
            className="additional-info-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <h2 className="section-title">Additional Information</h2>
            
            <div className="info-tabs">
              <button 
                className={`info-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`info-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              {movie.keywords && movie.keywords.length > 0 && (
                <button 
                  className={`info-tab ${activeTab === 'keywords' ? 'active' : ''}`}
                  onClick={() => setActiveTab('keywords')}
                >
                  Keywords
                </button>
              )}
            </div>

            <div className="info-content">
              {activeTab === 'overview' && (
                <div className="overview-content">
                  <p className="overview-text">
                    {movie.overview || 'No overview available for this movie.'}
                  </p>
                  {movie.tagline && (
                    <blockquote className="movie-tagline-extended">
                      "{movie.tagline}"
                    </blockquote>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="details-content">
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value">{movie.status || 'Released'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Original Language</span>
                      <span className="detail-value">
                        {movie.spoken_languages && movie.spoken_languages[0]?.english_name || 'English'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Runtime</span>
                      <span className="detail-value">{formatRuntime(movie.runtime)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Budget</span>
                      <span className="detail-value">{formatMoney(movie.budget)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Revenue</span>
                      <span className="detail-value">{formatMoney(movie.revenue)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Vote Count</span>
                      <span className="detail-value">{movie.vote_count?.toLocaleString() || 'N/A'}</span>
                    </div>
                    {movie.production_companies && movie.production_companies.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Production Companies</span>
                        <span className="detail-value">
                          {movie.production_companies.map(company => company.name).join(', ')}
                        </span>
                      </div>
                    )}
                    {movie.production_countries && movie.production_countries.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Countries</span>
                        <span className="detail-value">
                          {movie.production_countries.map(country => country.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'keywords' && movie.keywords && (
                <div className="keywords-content">
                  <div className="keywords-grid">
                    {movie.keywords.map((keyword, index) => (
                      <span key={keyword.id || index} className="keyword-tag">
                        {keyword.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Watch Providers Section */}
          {movie.watchProviders && Object.keys(movie.watchProviders).length > 0 && (
            <motion.div 
              className="watch-providers-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div className="section-header">
                <h2 className="section-title">
                  <Tv size={24} />
                  Where to Watch
                </h2>
              </div>

              <div className="watch-providers-content">
                {/* Consolidate all providers from all regions into unified categories */}
                {(() => {
                  const allProviders = {
                    flatrate: [], // Stream
                    rent: [],     // Rent
                    buy: []       // Buy
                  };

                  // Collect unique providers from all regions
                  ['US', 'GB', 'CA', 'AU', 'DE', 'FR'].forEach(region => {
                    const providers = movie.watchProviders[region];
                    if (!providers) return;

                    // Add providers to each category, avoiding duplicates
                    ['flatrate', 'rent', 'buy'].forEach(category => {
                      if (providers[category]) {
                        providers[category].forEach(provider => {
                          const exists = allProviders[category].find(p => p.provider_id === provider.provider_id);
                          if (!exists) {
                            allProviders[category].push({
                              ...provider,
                              region // Keep track of which region this provider is from
                            });
                          }
                        });
                      }
                    });
                  });

                  return (
                    <div className="unified-providers">
                      {/* Streaming Services */}
                      {allProviders.flatrate.length > 0 && (
                        <div className="provider-category">
                          <h4 className="category-title">
                            <Monitor size={16} />
                            Stream
                          </h4>
                          <div className="providers-grid">
                            {allProviders.flatrate.slice(0, 8).map((provider, index) => (
                              <div 
                                key={`stream-${provider.provider_id}-${index}`} 
                                className="provider-card clickable"
                                onClick={() => handleProviderClick(provider, movie.title, new Date(movie.release_date).getFullYear())}
                                onKeyDown={(e) => handleProviderKeyDown(e, provider, movie.title, new Date(movie.release_date).getFullYear())}
                                tabIndex={0}
                                role="button"
                                aria-label={`Watch ${movie.title} on ${provider.provider_name}`}
                                title={`Watch ${movie.title} on ${provider.provider_name}`}
                              >
                                <img 
                                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                  alt={provider.provider_name}
                                  className="provider-logo"
                                />
                                <span className="provider-name">{provider.provider_name}</span>
                                <ExternalLink size={12} className="external-link-icon" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rental Services */}
                      {allProviders.rent.length > 0 && (
                        <div className="provider-category">
                          <h4 className="category-title">
                            <DollarSign size={16} />
                            Rent
                          </h4>
                          <div className="providers-grid">
                            {allProviders.rent.slice(0, 6).map((provider, index) => (
                              <div 
                                key={`rent-${provider.provider_id}-${index}`} 
                                className="provider-card clickable"
                                onClick={() => handleProviderClick(provider, movie.title, new Date(movie.release_date).getFullYear())}
                                onKeyDown={(e) => handleProviderKeyDown(e, provider, movie.title, new Date(movie.release_date).getFullYear())}
                                tabIndex={0}
                                role="button"
                                aria-label={`Rent ${movie.title} on ${provider.provider_name}`}
                                title={`Rent ${movie.title} on ${provider.provider_name}`}
                              >
                                <img 
                                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                  alt={provider.provider_name}
                                  className="provider-logo"
                                />
                                <span className="provider-name">{provider.provider_name}</span>
                                <ExternalLink size={12} className="external-link-icon" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Purchase Services */}
                      {allProviders.buy.length > 0 && (
                        <div className="provider-category">
                          <h4 className="category-title">
                            <ShoppingCart size={16} />
                            Buy
                          </h4>
                          <div className="providers-grid">
                            {allProviders.buy.slice(0, 6).map((provider, index) => (
                              <div 
                                key={`buy-${provider.provider_id}-${index}`} 
                                className="provider-card clickable"
                                onClick={() => handleProviderClick(provider, movie.title, new Date(movie.release_date).getFullYear())}
                                onKeyDown={(e) => handleProviderKeyDown(e, provider, movie.title, new Date(movie.release_date).getFullYear())}
                                tabIndex={0}
                                role="button"
                                aria-label={`Buy ${movie.title} on ${provider.provider_name}`}
                                title={`Buy ${movie.title} on ${provider.provider_name}`}
                              >
                                <img 
                                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                  alt={provider.provider_name}
                                  className="provider-logo"
                                />
                                <span className="provider-name">{provider.provider_name}</span>
                                <ExternalLink size={12} className="external-link-icon" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Fallback message if no providers found for major regions */}
                {!['US', 'GB', 'CA', 'AU', 'DE', 'FR'].some(region => movie.watchProviders[region]) && (
                  <div className="no-providers-message">
                    <p>Streaming availability information not available for your region.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Reviews Section */}
          {movie.reviews && movie.reviews.results && movie.reviews.results.length > 0 && (
            <motion.div 
              className="reviews-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="section-header">
                <h2 className="section-title">
                  <MessageCircle className="section-icon" />
                  Reviews
                </h2>
                {movie.reviews.results.length > 2 && (
                  <button 
                    className="view-all-btn"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                  >
                    {showAllReviews ? 'Show Less' : `View All (${movie.reviews.results.length})`}
                  </button>
                )}
              </div>
              
              <div className="reviews-list">
                {(showAllReviews ? movie.reviews.results : movie.reviews.results.slice(0, 2)).map((review, index) => (
                  <motion.div
                    key={review.id}
                    className="review-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="review-header">
                      <div className="review-author">
                        <User className="author-icon" />
                        <span className="author-name">{review.author}</span>
                      </div>
                      {review.rating && (
                        <div className="review-rating">
                          <Star className="rating-icon" fill="currentColor" />
                          <span>{review.rating}/10</span>
                        </div>
                      )}
                    </div>
                    <p className="review-content">{review.content}</p>
                    <div className="review-footer">
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {review.url && (
                        <a 
                          href={review.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="review-link"
                        >
                          <ExternalLink size={16} />
                          Read Full Review
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Similar Movies Section */}
          {movie.similar && movie.similar.results && movie.similar.results.length > 0 && (
            <motion.div 
              className="similar-movies-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <h2 className="section-title">
                <Film className="section-icon" />
                Similar Movies
              </h2>
              
              <div className="similar-movies-grid">
                {movie.similar.results.slice(0, 6).map((similarMovie, index) => (
                  <motion.div
                    key={similarMovie.id}
                    className="similar-movie-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/movie/${similarMovie.id}`)}
                  >
                    <div className="similar-movie-image">
                      <img 
                        src={similarMovie.poster_path ? 
                          `https://image.tmdb.org/t/p/w300${similarMovie.poster_path}` : 
                          '/placeholder-movie.jpg'
                        }
                        alt={similarMovie.title}
                        onError={(e) => {
                          e.target.src = '/placeholder-movie.jpg';
                        }}
                      />
                      <div className="similar-movie-overlay">
                        <Play size={24} />
                      </div>
                    </div>
                    <div className="similar-movie-info">
                      <h4 className="similar-movie-title">{similarMovie.title}</h4>
                      <div className="similar-movie-meta">
                        <span className="similar-movie-year">
                          {similarMovie.release_date ? new Date(similarMovie.release_date).getFullYear() : 'N/A'}
                        </span>
                        <div className="similar-movie-rating">
                          <Star size={12} fill="currentColor" />
                          <span>{similarMovie.vote_average ? similarMovie.vote_average.toFixed(1) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Image Gallery Section */}
          {movie.images && movie.images.backdrops && movie.images.backdrops.length > 0 && (
            <motion.div 
              className="gallery-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h2 className="section-title">Gallery</h2>
              <div className="gallery-grid">
                {movie.images.backdrops.slice(0, 6).map((image, index) => (
                  <div 
                    key={index} 
                    className="gallery-item"
                    onClick={() => openImageGallery(index)}
                  >
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                      alt={`${movie.title} screenshot ${index + 1}`}
                      className="gallery-image"
                    />
                    <div className="gallery-overlay">
                      <Eye size={24} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageGallery && movie.images && movie.images.backdrops && (
          <motion.div 
            className="gallery-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageGallery}
          >
            <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="gallery-close" onClick={closeImageGallery}>
                <X size={24} />
              </button>
              <button className="gallery-nav gallery-prev" onClick={prevImage}>
                <ChevronLeft size={24} />
              </button>
              <button className="gallery-nav gallery-next" onClick={nextImage}>
                <ChevronRight size={24} />
              </button>
              <img 
                src={`https://image.tmdb.org/t/p/original${movie.images.backdrops[currentImageIndex]?.file_path}`}
                alt={`${movie.title} screenshot`}
                className="gallery-modal-image"
              />
              <div className="gallery-counter">
                {currentImageIndex + 1} / {movie.images.backdrops.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={closeTrailerModal}
        trailerUrl={modalTrailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
};

export default MovieDetails;
