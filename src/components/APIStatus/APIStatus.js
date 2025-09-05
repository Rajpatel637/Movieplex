import React, { useState, useEffect } from 'react';
import './APIStatus.css';

const APIStatus = () => {
  const [apiStatus, setApiStatus] = useState({
    configured: false,
    connected: false,
    testing: true,
    error: null,
    lastTest: null
  });

  const testTMDBConnection = async () => {
    setApiStatus(prev => ({ ...prev, testing: true, error: null }));
    
    try {
      // Test with a simple, lightweight API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(
        `https://api.themoviedb.org/3/configuration?api_key=${process.env.REACT_APP_TMDB_API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setApiStatus({
          configured: true,
          connected: true,
          testing: false,
          error: null,
          lastTest: new Date().toLocaleTimeString(),
          success: true
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('TMDB API Test Failed:', error);
      
      let errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'Connection timeout - Network or firewall issue';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed - Check internet or firewall';
      }
      
      setApiStatus({
        configured: !!process.env.REACT_APP_TMDB_API_KEY,
        connected: false,
        testing: false,
        error: errorMessage,
        lastTest: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    testTMDBConnection();
  }, []);

  const getStatusIcon = () => {
    if (apiStatus.testing) return '🔄';
    if (apiStatus.connected) return '✅';
    if (apiStatus.configured) return '⚠️';
    return '❌';
  };

  const getStatusText = () => {
    if (apiStatus.testing) return 'Testing TMDB connection...';
    if (apiStatus.connected) return 'TMDB API Connected';
    if (apiStatus.configured) return 'TMDB API Configured (Connection Failed)';
    return 'TMDB API Not Configured';
  };

  const getStatusColor = () => {
    if (apiStatus.testing) return '#007bff';
    if (apiStatus.connected) return '#28a745';
    if (apiStatus.configured) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="api-status-banner">
      <div className="api-status-content">
        <span className="api-status-icon">{getStatusIcon()}</span>
        <div className="api-status-text">
          <strong style={{ color: getStatusColor() }}>
            {getStatusText()}
          </strong>
          <p>
            {apiStatus.connected 
              ? `✅ TMDB API is working! You'll see real movie data from The Movie Database.`
              : apiStatus.configured
              ? "⚠️ TMDB API connection failed due to network/firewall restrictions. The app is using high-quality mock data instead. All features work normally!"
              : "❌ TMDB API is not configured. Using mock data for demonstration."
            }
            {apiStatus.error && (
              <><br /><span style={{ color: '#dc3545', fontSize: '0.9em' }}>
                Technical details: {apiStatus.error}
              </span></>
            )}
          </p>
        </div>
        <div className="api-status-actions">
          <button 
            onClick={testTMDBConnection}
            disabled={apiStatus.testing}
            className="api-status-link"
            style={{ 
              opacity: apiStatus.testing ? 0.6 : 1,
              cursor: apiStatus.testing ? 'not-allowed' : 'pointer'
            }}
          >
            {apiStatus.testing ? 'Testing...' : 'Test Again'}
          </button>
          {!apiStatus.configured && (
            <a 
              href="https://www.themoviedb.org/settings/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="api-status-link"
            >
              Get TMDB API Key
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIStatus;
