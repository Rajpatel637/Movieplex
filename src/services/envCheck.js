// Test if environment variables are being loaded correctly
console.log('🔧 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_TMDB_API_KEY:', process.env.REACT_APP_TMDB_API_KEY ? 'SET' : 'NOT SET');
console.log('REACT_APP_YOUTUBE_API_KEY:', process.env.REACT_APP_YOUTUBE_API_KEY ? 'SET' : 'NOT SET');

export const envCheck = () => {
  return {
    tmdbKey: process.env.REACT_APP_TMDB_API_KEY ? 'SET' : 'NOT SET',
    youtubeKey: process.env.REACT_APP_YOUTUBE_API_KEY ? 'SET' : 'NOT SET'
  };
};
