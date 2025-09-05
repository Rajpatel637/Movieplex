import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import './ApiStatusNotification.css';

const ApiStatusNotification = () => {
  const [apiStatus, setApiStatus] = useState(null); // null, 'online', 'offline'
  const [showNotification, setShowNotification] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let statusCheckInterval;

    const checkApiStatus = async () => {
      try {
        setIsConnecting(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://api.themoviedb.org/3/configuration?api_key=6f6be86639baea7b316cd829090eb7e7', {
          method: 'GET',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        const newStatus = response.ok ? 'online' : 'offline';
        
        // Only show notification if status changed or on first load
        if (apiStatus === null || (apiStatus !== null && apiStatus !== newStatus)) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 4000); // Hide after 4 seconds
        }
        
        setApiStatus(newStatus);
      } catch (error) {
        const newStatus = 'offline';
        
        // Only show notification if status changed or on first load
        if (apiStatus === null || (apiStatus !== null && apiStatus !== newStatus)) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 4000);
        }
        
        setApiStatus(newStatus);
      } finally {
        setIsConnecting(false);
      }
    };

    // Check immediately
    checkApiStatus();

    // Then check every 45 seconds (less frequent)
    statusCheckInterval = setInterval(checkApiStatus, 45000);

    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [apiStatus]);

  const getStatusIcon = () => {
    if (isConnecting) return <AlertCircle className="spin" size={16} />;
    if (apiStatus === 'online') return <CheckCircle size={16} />;
    return <WifiOff size={16} />;
  };

  const getStatusMessage = () => {
    if (isConnecting) return 'Checking TMDB API connection...';
    if (apiStatus === 'online') return 'Live movie data available';
    return 'Using offline mode with sample movie data';
  };

  const getDetailedMessage = () => {
    if (apiStatus === 'online') return 'Connected to TMDB API - All features available';
    return 'TMDB API unavailable due to network restrictions';
  };

  const showVpnHelper = () => {
    return apiStatus === 'offline' && showNotification;
  };

  const getStatusClass = () => {
    if (isConnecting) return 'connecting';
    if (apiStatus === 'online') return 'online';
    return 'offline';
  };

  return (
    <>
      {/* Status indicator in corner */}
      <div className={`api-status-indicator ${getStatusClass()}`}>
        {getStatusIcon()}
      </div>

      {/* Notification popup */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className={`api-status-notification ${getStatusClass()}`}
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            transition={{ duration: 0.3 }}
          >
            <div className="notification-content">
              <div className="notification-icon">
                {getStatusIcon()}
              </div>
              <div className="notification-message">
                <div className="message-primary">{getStatusMessage()}</div>
                <div className="message-secondary">{getDetailedMessage()}</div>
                {showVpnHelper() && (
                  <div className="vpn-helper">
                    💡 Try using a VPN (like 1.1.1.1) to access live movie data
                  </div>
                )}
              </div>
              <button
                className="notification-close"
                onClick={() => setShowNotification(false)}
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApiStatusNotification;
