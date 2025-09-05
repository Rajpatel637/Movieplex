// TMDB API Service for Movieplex
import { mockMovies, mockMovieDetails, getMockMoviesByMood } from './mockData';

// Cache to store API responses
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// TMDB API Configuration
const TMDB_BASE_URL = process.env.REACT_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_ACCESS_TOKEN = process.env.REACT_APP_TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MjY1YmQxNjc5NjYzYTdlYTEyYWMxNjhkYTg0ZDJlOCIsIm5iZiI6MTczNTcyNTA5MS4wMzYsInN1YiI6IjY3NzU5Mzc4ZDMzYjM5ODI4N2QyZDUzZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9z_L1RYqcVAm8hWVP0d5xKqz1Pt2qNyJGfZNOKj0QE4';

// Debug logging
console.log('🔧 TMDB API Configuration:');
console.log('  Base URL:', TMDB_BASE_URL);
console.log('  API Key:', TMDB_API_KEY ? `${TMDB_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log('  Access Token:', TMDB_ACCESS_TOKEN ? `${TMDB_ACCESS_TOKEN.substring(0, 10)}...` : 'NOT SET');

// Helper function to get cached data or fetch new data
const getCachedData = async (key, fetchFunction) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🔧 Using cached data for:', key);
    return cached.data;
  }
  
  try {
    const data = await fetchFunction();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    // Return cached data if API fails
    if (cached) {
      console.warn('API failed, returning cached data:', error);
      return cached.data;
    }
    throw error;
  }
};

// Convert TMDB movie data to our app format (already in correct format mostly)
const convertTMDBToAppFormat = (tmdbMovie) => {
  const movie = {
    id: tmdbMovie.id || tmdbMovie.imdbID,
    title: tmdbMovie.title || tmdbMovie.name || tmdbMovie.Title,
    overview: tmdbMovie.overview || tmdbMovie.Plot || 'No description available',
    poster_path: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : (tmdbMovie.Poster && tmdbMovie.Poster !== 'N/A' ? tmdbMovie.Poster : null),
    backdrop_path: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` : (tmdbMovie.Poster && tmdbMovie.Poster !== 'N/A' ? tmdbMovie.Poster : null),
    release_date: tmdbMovie.release_date || tmdbMovie.first_air_date || tmdbMovie.Released,
    vote_average: tmdbMovie.vote_average || (tmdbMovie.imdbRating && tmdbMovie.imdbRating !== 'N/A' ? parseFloat(tmdbMovie.imdbRating) : 0),
    vote_count: tmdbMovie.vote_count || 0,
    popularity: tmdbMovie.popularity || 0,
    genre_ids: tmdbMovie.genre_ids || [],
    genres: tmdbMovie.genres || (tmdbMovie.Genre && tmdbMovie.Genre !== 'N/A' ? tmdbMovie.Genre.split(', ') : []),
    adult: tmdbMovie.adult || false,
    original_language: tmdbMovie.original_language || 'en',
    original_title: tmdbMovie.original_title || tmdbMovie.original_name || tmdbMovie.Title,
    video: tmdbMovie.video || false,
    // Additional fields from OMDb for backward compatibility
    runtime: tmdbMovie.runtime || (tmdbMovie.Runtime && tmdbMovie.Runtime !== 'N/A' ? parseInt(tmdbMovie.Runtime) : 0),
    year: tmdbMovie.year || (tmdbMovie.Year ? parseInt(tmdbMovie.Year) : 0),
    director: tmdbMovie.director || (tmdbMovie.Director && tmdbMovie.Director !== 'N/A' ? tmdbMovie.Director : 'Unknown'),
    actors: tmdbMovie.actors || (tmdbMovie.Actors && tmdbMovie.Actors !== 'N/A' ? tmdbMovie.Actors.split(', ') : []),
    // Video data from TMDB
    videos: tmdbMovie.videos || null,
    credits: tmdbMovie.credits || null,
    reviews: tmdbMovie.reviews || null
  };

  console.log('🔧 Converted TMDB movie:', movie);
  return movie;
};

// API Functions
class MovieAPI {
  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.accessToken = TMDB_ACCESS_TOKEN;
    this.baseUrl = TMDB_BASE_URL;
    this.isApiAvailable = null; // null = not tested, true = available, false = unavailable
    this.lastConnectivityCheck = 0;
    this.connectivityCheckInterval = 30000; // Check every 30 seconds
    
    // Add detailed logging for debugging
    console.log('🔧 MovieAPI initialized with configuration:');
    console.log('🔧 Base URL:', this.baseUrl);
    console.log('🔧 API Key present:', !!this.apiKey);
    console.log('🔧 Access Token present:', !!this.accessToken);
    console.log('🔧 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      API_KEY_FROM_ENV: !!process.env.REACT_APP_TMDB_API_KEY,
      BASE_URL_FROM_ENV: !!process.env.REACT_APP_TMDB_BASE_URL
    });

    // Start with a connectivity check
    this.checkConnectivity();
  }

  // Check API connectivity
  async checkConnectivity() {
    const now = Date.now();
    if (this.lastConnectivityCheck && (now - this.lastConnectivityCheck) < this.connectivityCheckInterval) {
      return this.isApiAvailable;
    }

    try {
      console.log('🔧 Checking TMDB API connectivity...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Short timeout for connectivity check

      const testUrl = `${this.baseUrl}/configuration`;
      const params = this.apiKey ? `?api_key=${this.apiKey}` : '';
      
      const response = await fetch(`${testUrl}${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      this.isApiAvailable = response.ok;
      this.lastConnectivityCheck = now;
      
      if (this.isApiAvailable) {
        console.log('✅ TMDB API is accessible');
      } else {
        console.log('❌ TMDB API returned error:', response.status);
      }
      
      return this.isApiAvailable;
    } catch (error) {
      console.log('❌ TMDB API connectivity check failed:', error.name);
      this.isApiAvailable = false;
      this.lastConnectivityCheck = now;
      return false;
    }
  }

  // Check if API is configured and available
  async isConfiguredAndAvailable() {
    const configured = (this.apiKey && this.apiKey !== '');
    if (!configured) {
      console.log('🔧 API not configured - missing API key');
      return false;
    }

    const available = await this.checkConnectivity();
    console.log('🔧 API Configuration Check:', {
      configured,
      available,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0
    });
    
    return configured && available;
  }

  // Check if API is configured (legacy method)
  isConfigured() {
    const configured = (this.apiKey && this.apiKey !== '');
    console.log('🔧 API Configuration Check (legacy):', {
      configured,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0
    });
    return configured;
  }

  // Get request headers
  getHeaders() {
    // Always use simple headers for API key method - Bearer token is causing issues
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Make API request with retry logic and better timeout handling
  async makeRequest(endpoint, params = {}, retries = 2) {
    if (!this.isConfigured()) {
      console.warn('🔧 TMDB API not configured, will use fallback data');
      throw new Error('TMDB API not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Always add API key to params - this is more reliable than Bearer token
    if (this.apiKey) {
      params.api_key = this.apiKey;
    }

    // Add params to URL
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    console.log('🔧 Making TMDB API request:', url.toString());

    const headers = this.getHeaders();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔧 TMDB API request attempt ${attempt} of ${retries}`);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('🔧 Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔧 Response error:', errorText);
          throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('🔧 TMDB API response successful:', Object.keys(data));
        return data;

      } catch (error) {
        console.warn(`🔧 TMDB API request attempt ${attempt} failed:`, error.name, error.message);
        
        if (attempt === retries) {
          console.error('🔧 All TMDB API attempts failed, will use fallback data');
          throw new Error(`TMDB API connection failed after ${retries} attempts: ${error.message}`);
        }
        
        // Wait before retrying (shorter wait time)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Search movies by title with filters
  async searchMovies(query, page = 1, filters = {}) {
    console.log('🔧 searchMovies called with query:', query, 'page:', page, 'filters:', filters);
    
    try {
      const isAvailable = await this.isConfiguredAndAvailable();
      if (!isAvailable) {
        console.log('🔧 API not available, using fallback search');
        return this.getFallbackSearchResults(query, filters);
      }

      if (!query || query.trim() === '') {
        console.log('🔧 Empty query, using discover with filters');
        return this.discoverMoviesWithFilters(filters, page);
      }

      const searchParams = {
        query: query.trim(),
        page: page,
        include_adult: false
      };

      // Add year filter if specified
      if (filters.year && filters.year !== '') {
        searchParams.year = parseInt(filters.year);
      }

      const data = await this.makeRequest('/search/movie', searchParams);

      console.log('🔧 Search results before filtering:', data);

      let results = data.results.map(movie => convertTMDBToAppFormat(movie));

      // Apply client-side filters for genre and rating since TMDB search doesn't support them directly
      results = this.applyClientSideFilters(results, filters);

      // Sort results based on sortBy filter
      results = this.sortResults(results, filters.sortBy);

      console.log('🔧 Final filtered and sorted results:', results);

      return {
        results: results,
        total_results: results.length,
        total_pages: Math.ceil(results.length / 20),
        page: page
      };
    } catch (error) {
      console.warn('🔄 TMDB search failed, using fallback data:', error.message);
      return this.getFallbackSearchResults(query, filters);
    }
  }

  // Discover movies with filters (when no search query)
  async discoverMoviesWithFilters(filters = {}, page = 1) {
    try {
      const discoverParams = {
        page: page,
        include_adult: false,
        sort_by: this.getSortByParam(filters.sortBy)
      };

      // Add genre filter
      if (filters.genre && filters.genre !== '') {
        const genreId = this.getGenreId(filters.genre);
        if (genreId) {
          discoverParams.with_genres = genreId;
        }
      }

      // Add year filter
      if (filters.year && filters.year !== '') {
        discoverParams.year = parseInt(filters.year);
      }

      // Add rating filter
      if (filters.minRating && filters.minRating !== '') {
        discoverParams['vote_average.gte'] = parseFloat(filters.minRating);
        discoverParams['vote_count.gte'] = 100; // Minimum vote count for reliability
      }

      const data = await this.makeRequest('/discover/movie', discoverParams);

      return {
        results: data.results.map(movie => convertTMDBToAppFormat(movie)),
        total_results: data.total_results,
        total_pages: data.total_pages,
        page: data.page
      };
    } catch (error) {
      console.warn('🔄 TMDB discover failed, using fallback data:', error.message);
      return this.getFallbackSearchResults('', filters);
    }
  }

  // Apply client-side filters
  applyClientSideFilters(results, filters) {
    let filteredResults = [...results];

    // Filter by genre
    if (filters.genre && filters.genre !== '') {
      filteredResults = filteredResults.filter(movie => {
        if (movie.genres && Array.isArray(movie.genres)) {
          return movie.genres.some(genre => 
            genre.toLowerCase().includes(filters.genre.toLowerCase())
          );
        }
        return false;
      });
    }

    // Filter by minimum rating
    if (filters.minRating && filters.minRating !== '') {
      const minRating = parseFloat(filters.minRating);
      filteredResults = filteredResults.filter(movie => {
        const rating = movie.vote_average || 0;
        return rating >= minRating;
      });
    }

    return filteredResults;
  }

  // Sort results
  sortResults(results, sortBy) {
    if (!sortBy || sortBy === 'popularity') {
      return results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    switch (sortBy) {
      case 'rating':
        return results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'release_date':
        return results.sort((a, b) => {
          const dateA = new Date(a.release_date || '1900-01-01');
          const dateB = new Date(b.release_date || '1900-01-01');
          return dateB - dateA;
        });
      case 'title':
        return results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      default:
        return results;
    }
  }

  // Get TMDB sort parameter
  getSortByParam(sortBy) {
    switch (sortBy) {
      case 'rating':
        return 'vote_average.desc';
      case 'release_date':
        return 'release_date.desc';
      case 'title':
        return 'title.asc';
      case 'popularity':
      default:
        return 'popularity.desc';
    }
  }

  // Get TMDB genre ID from genre name
  getGenreId(genreName) {
    const genreMap = {
      'action': 28,
      'adventure': 12,
      'animation': 16,
      'comedy': 35,
      'crime': 80,
      'documentary': 99,
      'drama': 18,
      'family': 10751,
      'fantasy': 14,
      'history': 36,
      'horror': 27,
      'music': 10402,
      'mystery': 9648,
      'romance': 10749,
      'science fiction': 878,
      'sci-fi': 878,
      'tv movie': 10770,
      'thriller': 53,
      'war': 10752,
      'western': 37
    };
    
    return genreMap[genreName.toLowerCase()] || null;
  }

  // Test API connection
  async testConnection() {
    try {
      console.log('🔧 Testing TMDB API connection...');
      const data = await this.makeRequest('/movie/popular', { page: 1 });
      console.log('✅ TMDB API connection successful:', data);
      return true;
    } catch (error) {
      console.error('❌ TMDB API connection failed:', error);
      return false;
    }
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    console.log('🔧 getPopularMovies called, page:', page);
    
    try {
      const isAvailable = await this.isConfiguredAndAvailable();
      if (!isAvailable) {
        console.log('🔧 API not available, using fallback popular movies');
        return this.getFallbackPopularMovies();
      }

      console.log('🔧 Making TMDB API request for popular movies...');
      const data = await this.makeRequest('/movie/popular', { page });

      return {
        results: data.results.map(movie => convertTMDBToAppFormat(movie)),
        total_results: data.total_results,
        total_pages: data.total_pages,
        page: data.page
      };
    } catch (error) {
      console.warn('🔄 TMDB popular movies failed, using fallback data:', error.message);
      return this.getFallbackPopularMovies();
    }
  }

  // Get trending movies
  async getTrendingMovies(page = 1) {
    try {
      if (!this.isConfigured()) {
        return this.getFallbackTrendingMovies();
      }

      const data = await this.makeRequest('/trending/movie/week', {
        page: page
      });

      return {
        results: data.results.map(movie => convertTMDBToAppFormat(movie)),
        total_results: data.total_results,
        total_pages: data.total_pages,
        page: data.page
      };
    } catch (error) {
      console.warn('🔄 TMDB trending movies failed, using fallback data:', error.message);
      return this.getFallbackTrendingMovies();
    }
  }

  // Get top rated movies
  async getTopRatedMovies(page = 1) {
    try {
      if (!this.isConfigured()) {
        return this.getFallbackTopRatedMovies();
      }

      const data = await this.makeRequest('/movie/top_rated', {
        page: page
      });

      return {
        results: data.results.map(movie => convertTMDBToAppFormat(movie)),
        total_results: data.total_results,
        total_pages: data.total_pages,
        page: data.page
      };
    } catch (error) {
      console.warn('🔄 TMDB top rated movies failed, using fallback data:', error.message);
      return this.getFallbackTopRatedMovies();
    }
  }

  // Get movie details
  async getMovieDetails(movieId, includeExtras = true) {
    try {
      const isAvailable = await this.isConfiguredAndAvailable();
      if (!isAvailable) {
        console.log('🔧 API not available, using fallback movie details');
        return this.getFallbackMovieDetails(movieId);
      }

      let appendParams = '';
      if (includeExtras) {
        // Include comprehensive data: cast/crew, videos, reviews, images, similar movies, recommendations
        appendParams = 'credits,videos,reviews,images,similar,recommendations,keywords,watch/providers';
      }

      const data = await this.makeRequest(`/movie/${movieId}`, 
        appendParams ? { append_to_response: appendParams } : {}
      );

      // Enhanced conversion with additional data processing
      const movieDetails = convertTMDBToAppFormat(data);
      
      // Process cast data to ensure we have profile images
      if (data.credits && data.credits.cast) {
        movieDetails.cast = data.credits.cast.map(actor => ({
          id: actor.id,
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path ? 
            `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null,
          order: actor.order,
          known_for_department: actor.known_for_department,
          gender: actor.gender,
          popularity: actor.popularity
        })).slice(0, 20); // Limit to top 20 cast members
      }

      // Process crew data
      if (data.credits && data.credits.crew) {
        movieDetails.crew = data.credits.crew.map(member => ({
          id: member.id,
          name: member.name,
          job: member.job,
          department: member.department,
          profile_path: member.profile_path ? 
            `https://image.tmdb.org/t/p/w185${member.profile_path}` : null,
          known_for_department: member.known_for_department
        }));

        // Extract key crew members
        movieDetails.director = data.credits.crew.find(member => member.job === 'Director')?.name || 'Unknown';
        movieDetails.producer = data.credits.crew.find(member => member.job === 'Producer')?.name || 'Unknown';
        movieDetails.writer = data.credits.crew.find(member => member.job === 'Writer' || member.job === 'Screenplay')?.name || 'Unknown';
        movieDetails.cinematographer = data.credits.crew.find(member => member.job === 'Director of Photography')?.name || 'Unknown';
        movieDetails.composer = data.credits.crew.find(member => member.job === 'Original Music Composer')?.name || 'Unknown';
      }

      // Process images
      if (data.images) {
        movieDetails.images = {
          backdrops: data.images.backdrops?.slice(0, 10) || [],
          posters: data.images.posters?.slice(0, 6) || []
        };
      }

      // Process videos/trailers
      if (data.videos && data.videos.results) {
        movieDetails.videos = {
          results: data.videos.results.filter(video => 
            video.site === 'YouTube' && 
            (video.type === 'Trailer' || video.type === 'Teaser' || video.type === 'Clip')
          ).slice(0, 5)
        };
      }

      // Process reviews
      if (data.reviews && data.reviews.results) {
        movieDetails.reviews = {
          results: data.reviews.results.slice(0, 3).map(review => ({
            id: review.id,
            author: review.author,
            content: review.content.length > 500 ? 
              review.content.substring(0, 500) + '...' : review.content,
            rating: review.author_details?.rating || null,
            created_at: review.created_at,
            url: review.url
          }))
        };
      }

      // Process similar movies
      if (data.similar && data.similar.results) {
        movieDetails.similar = {
          results: data.similar.results.slice(0, 6).map(movie => convertTMDBToAppFormat(movie))
        };
      }

      // Process recommendations
      if (data.recommendations && data.recommendations.results) {
        movieDetails.recommendations = {
          results: data.recommendations.results.slice(0, 6).map(movie => convertTMDBToAppFormat(movie))
        };
      }

      // Process keywords
      if (data.keywords && data.keywords.keywords) {
        movieDetails.keywords = data.keywords.keywords.slice(0, 10);
      }

      // Process watch providers
      if (data['watch/providers'] && data['watch/providers'].results) {
        movieDetails.watchProviders = data['watch/providers'].results;
      }

      console.log('🔧 Enhanced movie details loaded:', movieDetails);
      return movieDetails;
    } catch (error) {
      console.warn('🔄 TMDB movie details failed, using fallback data:', error.message);
      return this.getFallbackMovieDetails(movieId);
    }
  }

  // Get movies by mood
  async getMoviesByMood(mood, page = 1) {
    try {
      if (!this.isConfigured()) {
        return this.getFallbackMoviesByMood(mood);
      }

      // Map moods to TMDB genre IDs
      const moodToGenres = {
        happy: [35, 10751], // Comedy, Family
        sad: [18], // Drama
        excited: [28, 12], // Action, Adventure
        romantic: [10749], // Romance
        scared: [27], // Horror
        adventurous: [12, 878], // Adventure, Sci-Fi
        nostalgic: [36], // History
        funny: [35], // Comedy
        dramatic: [18], // Drama
        thrilling: [53, 9648] // Thriller, Mystery
      };

      const genreIds = moodToGenres[mood.toLowerCase()] || [28]; // Default to Action

      const data = await this.makeRequest('/discover/movie', {
        with_genres: genreIds.join(','),
        page: page,
        sort_by: 'popularity.desc'
      });

      return {
        results: data.results.map(movie => convertTMDBToAppFormat(movie)),
        total_results: data.total_results,
        total_pages: data.total_pages,
        page: data.page
      };
    } catch (error) {
      console.warn('🔄 TMDB mood movies failed, using fallback data:', error.message);
      return this.getFallbackMoviesByMood(mood);
    }
  }

  // Fallback functions using mock data
  getFallbackSearchResults(query, filters = {}) {
    console.warn('🔄 Using fallback search results (TMDB API unavailable)');
    let filteredMovies = [...mockMovies];
    
    // Filter by query if provided
    if (query && query.trim()) {
      filteredMovies = filteredMovies.filter(movie => 
        movie.Title.toLowerCase().includes(query.toLowerCase()) ||
        movie.Genre.toLowerCase().includes(query.toLowerCase()) ||
        (movie.Director && movie.Director.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.genre && filters.genre !== '') {
      filteredMovies = filteredMovies.filter(movie => 
        movie.Genre.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }

    if (filters.year && filters.year !== '') {
      filteredMovies = filteredMovies.filter(movie => 
        movie.Year === filters.year
      );
    }

    if (filters.minRating && filters.minRating !== '') {
      const minRating = parseFloat(filters.minRating);
      filteredMovies = filteredMovies.filter(movie => {
        const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? 
          parseFloat(movie.imdbRating) : 0;
        return rating >= minRating;
      });
    }

    // Sort results
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'title':
          filteredMovies.sort((a, b) => a.Title.localeCompare(b.Title));
          break;
        case 'year':
        case 'release_date':
          filteredMovies.sort((a, b) => (b.Year || '1900') - (a.Year || '1900'));
          break;
        case 'rating':
          filteredMovies.sort((a, b) => {
            const ratingA = a.imdbRating && a.imdbRating !== 'N/A' ? parseFloat(a.imdbRating) : 0;
            const ratingB = b.imdbRating && b.imdbRating !== 'N/A' ? parseFloat(b.imdbRating) : 0;
            return ratingB - ratingA;
          });
          break;
        default:
          // Keep original order for popularity
          break;
      }
    }
    
    return {
      results: filteredMovies.slice(0, 10).map(movie => convertTMDBToAppFormat(movie)),
      total_results: filteredMovies.length,
      total_pages: Math.ceil(filteredMovies.length / 10),
      page: 1
    };
  }

  getFallbackPopularMovies() {
    console.warn('🔄 Using fallback popular movies (TMDB API unavailable)');
    
    // Enhance mock movies with realistic statistics
    const enhancedMovies = mockMovies.slice(0, 20).map((movie, index) => ({
      ...movie,
      vote_count: Math.floor(Math.random() * 400000) + 100000, // 100k to 500k votes
      popularity: Math.floor(Math.random() * 60) + 40, // 40 to 100 popularity
      runtime: movie.Runtime && movie.Runtime !== 'N/A' 
        ? parseInt(movie.Runtime) 
        : Math.floor(Math.random() * 60) + 90,
      // Add some variety to ratings
      vote_average: movie.imdbRating ? parseFloat(movie.imdbRating) : (Math.random() * 3 + 7).toFixed(1)
    }));
    
    return {
      results: enhancedMovies.map(movie => convertTMDBToAppFormat(movie)),
      total_results: mockMovies.length,
      total_pages: 1,
      page: 1
    };
  }

  getFallbackTrendingMovies() {
    console.warn('🔄 Using fallback trending movies (TMDB API unavailable)');
    
    return {
      results: mockMovies.slice(2, 18).map(movie => convertTMDBToAppFormat(movie)),
      total_results: mockMovies.length,
      total_pages: 1,
      page: 1
    };
  }

  getFallbackTopRatedMovies() {
    console.warn('🔄 Using fallback top rated movies (TMDB API unavailable)');
    
    return {
      results: mockMovies.slice(0, 15).map(movie => convertTMDBToAppFormat(movie)),
      total_results: mockMovies.length,
      total_pages: 1,
      page: 1
    };
  }

  getFallbackMovieDetails(movieId) {
    console.warn('🔄 Using fallback movie details (TMDB API unavailable)');
    
    // Create realistic movie data for statistics
    const baseMovie = mockMovies.find(m => m.imdbID === movieId) || mockMovies[0];
    
    // Sample trailer data for popular movies
    const trailerSamples = {
      'tt0111161': 'P9mwtI82k6E', // The Shawshank Redemption
      'tt0068646': 'sJU2csySWDk', // The Godfather
      'tt0468569': 'EXeTwQWrcwY', // The Dark Knight
      'tt0109830': 'gFVfbPFAjZ0', // Forrest Gump
      'tt0137523': 'BdJKm16Co6M', // Fight Club
      'tt0110912': '6hB3S9bIaco', // Pulp Fiction
      'tt0167260': 'V75dMMIW2B4', // The Lord of the Rings: The Return of the King
      'tt0120737': 'V75dMMIW2B4', // The Lord of the Rings: The Fellowship of the Ring
      'tt0080684': 'JNwNXF9Y6kY', // Star Wars: The Empire Strikes Back
      'tt0073486': 'FRT6FPcOHE', // One Flew Over the Cuckoo's Nest
    };

    const trailerKey = trailerSamples[movieId] || 'dQw4w9WgXcQ'; // Default to Rick Roll if no specific trailer
    
    // Mock cast with realistic data
    const mockCastMembers = [
      { name: 'John Smith', character: 'Main Character', profile: 'https://via.placeholder.com/185x278/333/fff?text=Actor1' },
      { name: 'Jane Doe', character: 'Love Interest', profile: 'https://via.placeholder.com/185x278/444/fff?text=Actor2' },
      { name: 'Michael Johnson', character: 'Villain', profile: 'https://via.placeholder.com/185x278/555/fff?text=Actor3' },
      { name: 'Sarah Wilson', character: 'Supporting Role', profile: 'https://via.placeholder.com/185x278/666/fff?text=Actor4' },
      { name: 'David Brown', character: 'Friend', profile: 'https://via.placeholder.com/185x278/777/fff?text=Actor5' },
      { name: 'Emily Davis', character: 'Mentor', profile: 'https://via.placeholder.com/185x278/888/fff?text=Actor6' },
      { name: 'Robert Garcia', character: 'Antagonist', profile: 'https://via.placeholder.com/185x278/999/fff?text=Actor7' },
      { name: 'Lisa Martinez', character: 'Ally', profile: 'https://via.placeholder.com/185x278/aaa/fff?text=Actor8' }
    ];

    // Mock crew data
    const mockCrew = [
      { name: 'Christopher Nolan', job: 'Director', department: 'Directing' },
      { name: 'Emma Thomas', job: 'Producer', department: 'Production' },
      { name: 'Jonathan Nolan', job: 'Writer', department: 'Writing' },
      { name: 'Hans Zimmer', job: 'Original Music Composer', department: 'Sound' },
      { name: 'Wally Pfister', job: 'Director of Photography', department: 'Camera' }
    ];

    // Mock reviews
    const mockReviews = [
      {
        id: '1',
        author: 'CinemaLover',
        content: 'An absolutely stunning masterpiece that showcases incredible cinematography and storytelling. The performances are top-notch and the direction is flawless.',
        rating: 9,
        created_at: '2023-06-15T10:30:00.000Z'
      },
      {
        id: '2',
        author: 'MovieCritic2023',
        content: 'A well-crafted film with excellent pacing and character development. Some minor plot points could have been explored further, but overall a very enjoyable experience.',
        rating: 8,
        created_at: '2023-06-10T14:22:00.000Z'
      }
    ];

    // Enhanced mock data with realistic statistics
    const enhancedMovie = {
      ...baseMovie,
      // Add realistic TMDB-style statistics
      vote_count: Math.floor(Math.random() * 500000) + 50000, // 50k to 550k votes
      popularity: Math.floor(Math.random() * 80) + 20, // 20 to 100 popularity
      runtime: baseMovie.Runtime && baseMovie.Runtime !== 'N/A' 
        ? parseInt(baseMovie.Runtime) 
        : Math.floor(Math.random() * 60) + 90, // 90-150 minutes if not specified
      
      // Add comprehensive cast data
      cast: baseMovie.Actors && baseMovie.Actors !== 'N/A' 
        ? baseMovie.Actors.split(', ').map((actor, index) => ({
            id: index + 1,
            name: actor,
            character: mockCastMembers[index]?.character || `Character ${index + 1}`,
            profile_path: mockCastMembers[index]?.profile || null,
            order: index,
            known_for_department: 'Acting',
            gender: Math.random() > 0.5 ? 1 : 2, // 1: female, 2: male
            popularity: Math.floor(Math.random() * 50) + 10
          }))
        : mockCastMembers.slice(0, 6).map((member, index) => ({
            id: index + 1,
            name: member.name,
            character: member.character,
            profile_path: member.profile,
            order: index,
            known_for_department: 'Acting',
            gender: Math.random() > 0.5 ? 1 : 2,
            popularity: Math.floor(Math.random() * 50) + 10
          })),

      // Add crew data
      crew: mockCrew.map((member, index) => ({
        id: index + 100,
        name: member.name,
        job: member.job,
        department: member.department,
        profile_path: null,
        known_for_department: member.department
      })),

      // Extract key crew roles
      director: baseMovie.Director !== 'N/A' ? baseMovie.Director : 'Christopher Nolan',
      producer: 'Emma Thomas',
      writer: 'Jonathan Nolan',
      cinematographer: 'Wally Pfister',
      composer: 'Hans Zimmer',
      
      // Add trailer data
      videos: {
        results: [
          {
            key: trailerKey,
            site: 'YouTube',
            type: 'Trailer',
            name: `${baseMovie.Title} - Official Trailer`,
            published_at: '2023-01-01T00:00:00.000Z'
          },
          {
            key: trailerKey,
            site: 'YouTube',
            type: 'Teaser',
            name: `${baseMovie.Title} - Official Teaser`,
            published_at: '2022-12-01T00:00:00.000Z'
          }
        ]
      },

      // Add mock reviews
      reviews: {
        results: mockReviews
      },

      // Add mock images
      images: {
        backdrops: [
          { file_path: '/backdrop1.jpg' },
          { file_path: '/backdrop2.jpg' },
          { file_path: '/backdrop3.jpg' }
        ],
        posters: [
          { file_path: '/poster1.jpg' },
          { file_path: '/poster2.jpg' }
        ]
      },

      // Add mock similar movies
      similar: {
        results: mockMovies.slice(1, 7).map(movie => convertTMDBToAppFormat(movie))
      },

      // Add keywords
      keywords: [
        { id: 1, name: 'drama' },
        { id: 2, name: 'thriller' },
        { id: 3, name: 'mystery' },
        { id: 4, name: 'crime' }
      ],

      // Add mock watch providers
      watchProviders: {
        US: {
          flatrate: [
            {
              provider_id: 8,
              provider_name: 'Netflix',
              logo_path: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg'
            },
            {
              provider_id: 119,
              provider_name: 'Amazon Prime Video',
              logo_path: '/dQeAar5H991VYporEjUspolDarG.jpg'
            },
            {
              provider_id: 337,
              provider_name: 'Disney Plus',
              logo_path: '/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'
            }
          ],
          rent: [
            {
              provider_id: 2,
              provider_name: 'Apple TV',
              logo_path: '/peURlLlr8jggOwK53fJ5wdQl05y.jpg'
            },
            {
              provider_id: 3,
              provider_name: 'Google Play Movies',
              logo_path: '/3KF2LKurRJlCFYwrKBYzRgzF4Ze.jpg'
            }
          ],
          buy: [
            {
              provider_id: 2,
              provider_name: 'Apple TV',
              logo_path: '/peURlLlr8jggOwK53fJ5wdQl05y.jpg'
            },
            {
              provider_id: 3,
              provider_name: 'Google Play Movies',
              logo_path: '/3KF2LKurRJlCFYwrKBYzRgzF4Ze.jpg'
            },
            {
              provider_id: 68,
              provider_name: 'Microsoft Store',
              logo_path: '/shq88b09gTBYC4hA4BZR0xHlHM2.jpg'
            }
          ]
        },
        GB: {
          flatrate: [
            {
              provider_id: 8,
              provider_name: 'Netflix',
              logo_path: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg'
            },
            {
              provider_id: 119,
              provider_name: 'Amazon Prime Video',
              logo_path: '/dQeAar5H991VYporEjUspolDarG.jpg'
            }
          ]
        }
      },

      // Add additional details
      budget: Math.floor(Math.random() * 100000000) + 10000000, // 10M to 110M
      revenue: Math.floor(Math.random() * 500000000) + 50000000, // 50M to 550M
      status: 'Released',
      original_language: 'en',
      production_companies: [
        { id: 1, name: 'Warner Bros. Pictures' },
        { id: 2, name: 'Legendary Entertainment' }
      ],
      production_countries: [
        { iso_3166_1: 'US', name: 'United States of America' }
      ],
      spoken_languages: [
        { iso_639_1: 'en', english_name: 'English', name: 'English' }
      ]
    };
    
    return convertTMDBToAppFormat(enhancedMovie);
  }

  getFallbackMoviesByMood(mood) {
    console.warn('🔄 Using fallback mood movies (TMDB API unavailable)');
    const moodMovies = getMockMoviesByMood(mood);
    
    return {
      results: moodMovies.map(movie => convertTMDBToAppFormat(movie)),
      total_results: moodMovies.length,
      total_pages: 1,
      page: 1
    };
  }
}

// Create API instance
const movieAPI = new MovieAPI();

// Export API functions
export const searchMovies = (query, page = 1, filters = {}) => movieAPI.searchMovies(query, page, filters);
export const getPopularMovies = (page = 1) => movieAPI.getPopularMovies(page);
export const getTrendingMovies = (page = 1) => movieAPI.getTrendingMovies(page);
export const getTopRatedMovies = (page = 1) => movieAPI.getTopRatedMovies(page);
export const getMovieDetails = (movieId, includeExtras = true) => movieAPI.getMovieDetails(movieId, includeExtras);
export const getMoviesByMood = (mood, page = 1) => movieAPI.getMoviesByMood(mood, page);

// Export API instance for direct use
export default movieAPI;
