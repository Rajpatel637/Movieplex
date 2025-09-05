import React, { useState, useEffect } from 'react';
import APIStatus from '../APIStatus/APIStatus';

const APIStatusChecker = () => {
  const [showAPIStatus, setShowAPIStatus] = useState(false);
  const [hasTestedOnce, setHasTestedOnce] = useState(false);

  useEffect(() => {
    const checkTMDBAPIStatus = async () => {
      // Only test once on initial load to avoid spamming failed requests
      if (hasTestedOnce) return;
      
      try {
        console.log('🔧 Testing TMDB API connection...');
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(
          `https://api.themoviedb.org/3/configuration?api_key=${process.env.REACT_APP_TMDB_API_KEY}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);
        setHasTestedOnce(true);

        if (response.ok) {
          console.log('✅ TMDB API connection successful');
          setShowAPIStatus(false);
        } else {
          console.log('⚠️ TMDB API responded with error:', response.status);
          setShowAPIStatus(true);
        }
      } catch (error) {
        console.log('❌ TMDB API connection failed:', error.name, error.message);
        setShowAPIStatus(true);
        setHasTestedOnce(true);
      }
    };

    // Check API status on mount with a small delay
    const timer = setTimeout(checkTMDBAPIStatus, 1000);

    return () => clearTimeout(timer);
  }, [hasTestedOnce]);

  return showAPIStatus ? <APIStatus /> : null;
};

export default APIStatusChecker;
