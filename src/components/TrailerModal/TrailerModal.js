import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import './TrailerModal.css';

const TrailerModal = ({ isOpen, onClose, movie, trailerUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('🎬 TrailerModal opened with data:', {
        movie: movie?.title,
        trailerUrl,
        isOpen
      });
    }
  }, [isOpen, movie, trailerUrl]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      setHasError(false);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getEmbedUrl = (url) => {
    console.log('🎬 TrailerModal - Original URL:', url);
    if (!url) return null;

    try {
      // YouTube URL conversion
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (!videoId) throw new Error('Invalid YouTube URL');
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=${isMuted ? 1 : 0}&rel=0&showinfo=0&controls=1`;
        console.log('🎬 TrailerModal - YouTube embed URL:', embedUrl);
        return embedUrl;
      }
      
      // YouTube short URL
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (!videoId) throw new Error('Invalid YouTube short URL');
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=${isMuted ? 1 : 0}&rel=0&showinfo=0&controls=1`;
        console.log('🎬 TrailerModal - YouTube short embed URL:', embedUrl);
        return embedUrl;
      }

      // Vimeo URL
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        if (!videoId) throw new Error('Invalid Vimeo URL');
        const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=${isMuted ? 1 : 0}`;
        console.log('🎬 TrailerModal - Vimeo embed URL:', embedUrl);
        return embedUrl;
      }

      // Already an embed URL
      if (url.includes('embed')) {
        console.log('🎬 TrailerModal - Already embed URL:', url);
        return url;
      }

      console.log('🎬 TrailerModal - Unknown URL format, returning as-is:', url);
      return url;
    } catch (error) {
      console.error('🎬 TrailerModal - Error parsing URL:', error);
      setHasError(true);
      return null;
    }
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  // Additional debugging
  console.log('🎬 TrailerModal - Final embed URL:', embedUrl);
  console.log('🎬 TrailerModal - hasError:', hasError);
  console.log('🎬 TrailerModal - isLoading:', isLoading);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trailer-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="trailer-modal"
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Modal Header */}
            <motion.div 
              className="trailer-modal-header"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="trailer-modal-title">
                <Play size={20} />
                <span>{movie?.title} - Official Trailer</span>
              </div>
              <div className="trailer-modal-controls">
                <button
                  className="trailer-control-btn"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                {embedUrl && (
                  <a
                    href={trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="trailer-control-btn"
                    title="Open in new tab"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
                <button
                  className="trailer-close-btn"
                  onClick={handleClose}
                  title="Close trailer"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>

            {/* Modal Content */}
            <motion.div 
              className="trailer-modal-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isLoading && (
                <div className="trailer-loading">
                  <div className="trailer-loading-spinner">
                    <Play size={48} />
                  </div>
                  <p>Loading trailer...</p>
                </div>
              )}

              {hasError || !embedUrl ? (
                <div className="trailer-error">
                  <div className="trailer-error-icon">
                    <Play size={48} />
                  </div>
                  <h3>Trailer Unavailable</h3>
                  <p>Sorry, we couldn't load the trailer for this movie.</p>
                  <button className="btn btn-primary" onClick={handleClose}>
                    Close
                  </button>
                </div>
              ) : (
                <div className="trailer-video-container">
                  <iframe
                    src={embedUrl}
                    title={`${movie?.title} Trailer`}
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    className="trailer-video"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '400px',
                      background: '#000'
                    }}
                  />
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      padding: '5px 10px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      zIndex: 10
                    }}>
                      URL: {embedUrl}
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Movie Info Footer */}
            <motion.div 
              className="trailer-modal-footer"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="trailer-movie-info">
                <img src={movie?.poster_path} alt={movie?.title} className="trailer-movie-poster" />
                <div className="trailer-movie-details">
                  <h4>{movie?.title}</h4>
                  <p>{movie?.genres?.join(', ')}</p>
                  <div className="trailer-movie-meta">
                    <span>{new Date(movie?.release_date).getFullYear()}</span>
                    <span>•</span>
                    <span>{movie?.runtime}m</span>
                    <span>•</span>
                    <span>⭐ {movie?.vote_average?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;
