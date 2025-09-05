import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import './TrailerSection.css';

const TrailerSection = ({ movie }) => {
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(true);

  // Set up initial trailer when movie data loads
  useEffect(() => {
    if (movie && movie.videos && movie.videos.results && movie.videos.results.length > 0) {
      const trailer = movie.videos.results.find(video => 
        video.site === 'YouTube' && video.type === 'Trailer'
      ) || movie.videos.results[0];
      setSelectedTrailer(trailer);
      setTrailerLoading(true);
    }
  }, [movie]);

  const selectTrailer = (trailer) => {
    setSelectedTrailer(trailer);
    setTrailerLoading(true);
  };

  const getTrailerEmbedUrl = (trailer, autoplay = false) => {
    if (!trailer) return null;
    const autoplayParam = autoplay ? '&autoplay=1' : '';
    return `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1&controls=1${autoplayParam}`;
  };

  const getVideoTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'trailer':
        return '🎬';
      case 'teaser':
        return '👀';
      case 'clip':
        return '🎥';
      case 'featurette':
        return '🎪';
      case 'behind the scenes':
        return '🎭';
      default:
        return '📹';
    }
  };

  const getVideoQualityBadge = (size) => {
    if (size >= 1080) return { label: 'HD', class: 'quality-hd' };
    if (size >= 720) return { label: 'HD', class: 'quality-hd' };
    if (size >= 480) return { label: 'SD', class: 'quality-sd' };
    return { label: 'SD', class: 'quality-sd' };
  };

  // Don't render if no videos available
  if (!movie?.videos?.results?.length || !selectedTrailer) {
    return null;
  }

  return (
    <motion.div 
      className="trailer-section-component"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.52 }}
    >
      <div className="trailer-header">
        <h2 className="trailer-section-title">
          <span className="title-icon">🎬</span>
          Watch Trailer
        </h2>
        <div className="trailer-count">
          {movie.videos.results.length} video{movie.videos.results.length > 1 ? 's' : ''} available
        </div>
      </div>
      
      <div className="trailer-container">
        {/* Main Video Player */}
        <div className="trailer-player-wrapper">
          <div className="trailer-player">
            {trailerLoading && (
              <div className="trailer-loading">
                <div className="trailer-spinner"></div>
                <p>Loading trailer...</p>
              </div>
            )}
            <iframe
              src={getTrailerEmbedUrl(selectedTrailer)}
              title={`${movie.title} - ${selectedTrailer.name || 'Trailer'}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="trailer-iframe"
              onLoad={() => setTrailerLoading(false)}
            ></iframe>
          </div>
          
          {/* Video Info */}
          <div className="current-video-info">
            <div className="video-main-info">
              <h3 className="video-title">
                {getVideoTypeIcon(selectedTrailer.type)} {selectedTrailer.name || 'Official Trailer'}
              </h3>
              <div className="video-meta">
                <span className="video-type">{selectedTrailer.type}</span>
                <span className="video-site">{selectedTrailer.site}</span>
                {selectedTrailer.size && (
                  <span className={`video-quality ${getVideoQualityBadge(selectedTrailer.size).class}`}>
                    {getVideoQualityBadge(selectedTrailer.size).label}
                  </span>
                )}
                {selectedTrailer.published_at && (
                  <span className="video-date">
                    {new Date(selectedTrailer.published_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Selector - Only show if multiple videos */}
        {movie.videos.results.length > 1 && (
          <div className="trailer-selector">
            <h4 className="selector-title">Available Videos</h4>
            <div className="trailer-grid">
              {movie.videos.results.map((trailer, index) => (
                <motion.button
                  key={trailer.id}
                  className={`trailer-option ${selectedTrailer.id === trailer.id ? 'active' : ''}`}
                  onClick={() => selectTrailer(trailer)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="option-thumbnail">
                    <img 
                      src={`https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg`}
                      alt={trailer.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="thumbnail-fallback" style={{ display: 'none' }}>
                      <Play size={24} />
                    </div>
                    <div className="play-overlay-small">
                      <Play size={16} fill="currentColor" />
                    </div>
                    {selectedTrailer.id === trailer.id && (
                      <div className="now-playing-indicator">
                        <span>Now Playing</span>
                      </div>
                    )}
                  </div>
                  <div className="option-content">
                    <div className="option-header">
                      <span className="option-type-icon">{getVideoTypeIcon(trailer.type)}</span>
                      <span className="option-name">{trailer.name}</span>
                    </div>
                    <div className="option-meta">
                      <span className="option-type">{trailer.type}</span>
                      {trailer.size && (
                        <span className={`option-quality ${getVideoQualityBadge(trailer.size).class}`}>
                          {getVideoQualityBadge(trailer.size).label}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrailerSection;
