// Trailer service to fetch movie trailers from multiple sources

class TrailerService {
  // YouTube API configuration
  YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || '';
  YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

  // TMDb API configuration
  TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || '';
  TMDB_BASE_URL = process.env.REACT_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    
    // Debug logging for API configuration
    console.log('🎬 Trailer Service Configuration:');
    console.log('  YouTube API Key:', this.YOUTUBE_API_KEY ? `${this.YOUTUBE_API_KEY.substring(0, 8)}...` : 'NOT SET');
    console.log('  TMDB API Key:', this.TMDB_API_KEY ? `${this.TMDB_API_KEY.substring(0, 8)}...` : 'NOT SET');
    console.log('  TMDB Base URL:', this.TMDB_BASE_URL);
  }

  // Cache helper
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fetch trailer from YouTube API
  async fetchFromYouTube(movieTitle, releaseYear) {
    if (!this.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return null;
    }

    try {
      const query = `${movieTitle} ${releaseYear} official trailer`;
      const url = `${this.YOUTUBE_BASE_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDefinition=high&videoDuration=medium&key=${this.YOUTUBE_API_KEY}&maxResults=5`;
      
      console.log(`🔍 Searching YouTube for: "${query}"`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error:', response.status, errorText);
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.warn('No YouTube results found for:', query);
        return null;
      }
      
      // Find the most relevant trailer
      const trailer = data.items?.find(item => 
        item.snippet.title.toLowerCase().includes('trailer') ||
        item.snippet.title.toLowerCase().includes('official')
      ) || data.items?.[0];

      if (trailer) {
        console.log(`✅ Found YouTube trailer: "${trailer.snippet.title}"`);
        return {
          url: `https://www.youtube.com/watch?v=${trailer.id.videoId}`,
          title: trailer.snippet.title,
          thumbnail: trailer.snippet.thumbnails.high?.url,
          source: 'youtube',
          videoId: trailer.id.videoId
        };
      }
    } catch (error) {
      console.warn('YouTube trailer fetch failed:', error.message);
    }
    return null;
  }

  // Fetch trailer from TMDb API
  async fetchFromTMDb(movieId) {
    if (!this.TMDB_API_KEY) {
      console.warn('TMDB API key not configured');
      return null;
    }

    try {
      const url = `${this.TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${this.TMDB_API_KEY}&language=en-US`;
      
      console.log(`🎭 Fetching trailers from TMDB for movie ID: ${movieId}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚫 TMDb API error:', response.status, errorText);
        if (response.status === 401) {
          console.error('🔑 Invalid TMDB API key - check your .env file');
        }
        throw new Error(`TMDb API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.warn('No TMDB trailers found for movie ID:', movieId);
        console.log('🎭 TMDB response data:', data);
        return null;
      }

      console.log('🎭 TMDB trailers found:', data.results.length);
      console.log('🎭 Available videos:', data.results.map(v => ({ 
        type: v.type, 
        site: v.site, 
        name: v.name, 
        key: v.key,
        official: v.official 
      })));
      
      // Find trailer (prefer official trailers)
      const trailer = data.results?.find(video => 
        video.type === 'Trailer' && 
        video.site === 'YouTube' &&
        video.official
      ) || data.results?.find(video => 
        video.type === 'Trailer' && 
        video.site === 'YouTube'
      );

      if (trailer) {
        console.log(`✅ Found TMDB trailer: "${trailer.name}"`);
        return {
          url: `https://www.youtube.com/watch?v=${trailer.key}`,
          title: trailer.name,
          thumbnail: `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`,
          source: 'tmdb',
          videoId: trailer.key
        };
      }
    } catch (error) {
      console.warn('TMDb trailer fetch failed:', error.message);
    }
    return null;
  }

  // Fallback: Search using movie title patterns
  async fetchTrailerFallback(movieTitle, releaseYear) {
    const searchQueries = [
      `${movieTitle} ${releaseYear} trailer`,
      `${movieTitle} official trailer`,
      `${movieTitle} movie trailer ${releaseYear}`,
      `${movieTitle} ${releaseYear} preview`
    ];

    // Mock trailer URLs for popular movies (fallback data)
    const fallbackTrailers = {
      // Marvel/DC Movies
      'the dark knight': 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      'batman': 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
      'batman begins': 'https://www.youtube.com/watch?v=QhPqez3CuNE',
      'the batman': 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
      'joker': 'https://www.youtube.com/watch?v=zAGVQLHvwOY',
      'iron man': 'https://www.youtube.com/watch?v=8ugaeA-nMTc',
      'avengers': 'https://www.youtube.com/watch?v=eOrNdBpGMv8',
      'avengers endgame': 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      'avengers infinity war': 'https://www.youtube.com/watch?v=6ZfuNTqbHE8',
      'spider-man': 'https://www.youtube.com/watch?v=t06RUxPbp_c',
      'spiderman': 'https://www.youtube.com/watch?v=t06RUxPbp_c',
      'spider man': 'https://www.youtube.com/watch?v=t06RUxPbp_c',
      'black panther': 'https://www.youtube.com/watch?v=xjDjIWPwcPU',
      'wonder woman': 'https://www.youtube.com/watch?v=1Q8fG0TtVAY',
      'aquaman': 'https://www.youtube.com/watch?v=WDkg3h8PCVU',
      'thor': 'https://www.youtube.com/watch?v=ue80QwXMRHg',
      'captain america': 'https://www.youtube.com/watch?v=eH4K4L7704g',
      'doctor strange': 'https://www.youtube.com/watch?v=HSzx-zryEgM',
      'ant-man': 'https://www.youtube.com/watch?v=pWdKf3MneyI',
      'black widow': 'https://www.youtube.com/watch?v=RxAtuMu_ph4',
      'eternals': 'https://www.youtube.com/watch?v=x_me3xsvDgk',
      'shang-chi': 'https://www.youtube.com/watch?v=8YjFbMbfXaQ',
      'guardians of the galaxy': 'https://www.youtube.com/watch?v=d96cjJhvlMA',
      'deadpool': 'https://www.youtube.com/watch?v=9CiW_DgxCnQ',
      'x-men': 'https://www.youtube.com/watch?v=YuOjdLCKNJ8',
      'wolverine': 'https://www.youtube.com/watch?v=Wd6dKjVp9l0',

      // Action Movies
      'fast and furious': 'https://www.youtube.com/watch?v=aSiDu3Ywi8E',
      'fast furious': 'https://www.youtube.com/watch?v=aSiDu3Ywi8E',
      'mission impossible': 'https://www.youtube.com/watch?v=wb49-oV0F78',
      'john wick': 'https://www.youtube.com/watch?v=C0BMx-qxsP4',
      'mad max': 'https://www.youtube.com/watch?v=hEJnMQG9ev8',
      'die hard': 'https://www.youtube.com/watch?v=QIOX44m8ktc',
      'terminator': 'https://www.youtube.com/watch?v=c4Jo8QoOTQo',
      'rambo': 'https://www.youtube.com/watch?v=4mTCgIHpQjE',
      'taken': 'https://www.youtube.com/watch?v=uPJVJBm9TPA',
      'the expendables': 'https://www.youtube.com/watch?v=8KtYRALe-30',
      
      // Classic Movies
      'the shawshank redemption': 'https://www.youtube.com/watch?v=6hB3S9bIaco',
      'pulp fiction': 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
      'forrest gump': 'https://www.youtube.com/watch?v=bLvqoHBptjg',
      'the godfather': 'https://www.youtube.com/watch?v=sY1S34973zA',
      'goodfellas': 'https://www.youtube.com/watch?v=qo5jJpHtI1Y',
      'scarface': 'https://www.youtube.com/watch?v=7pQQHnqBa2E',
      'casino': 'https://www.youtube.com/watch?v=EJXDMwGWhoA',
      'taxi driver': 'https://www.youtube.com/watch?v=UmyzaXU2SG0',
      'fight club': 'https://www.youtube.com/watch?v=qtRKdVHc-cE',
      'the departed': 'https://www.youtube.com/watch?v=SGWvwjZ0eDc',

      // Sci-Fi Movies
      'inception': 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      'the matrix': 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
      'interstellar': 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      'blade runner': 'https://www.youtube.com/watch?v=gCcx85zbxz4',
      'alien': 'https://www.youtube.com/watch?v=LjLamj-b0I8',
      'star wars': 'https://www.youtube.com/watch?v=vZ734NWnAHA',
      'star trek': 'https://www.youtube.com/watch?v=pKOVdakdpWs',
      'back to the future': 'https://www.youtube.com/watch?v=qvsgGtivCgs',
      'e.t.': 'https://www.youtube.com/watch?v=qYAETtIIClk',
      'et': 'https://www.youtube.com/watch?v=qYAETtIIClk',
      'jurassic park': 'https://www.youtube.com/watch?v=lc0UehYemOA',
      'avatar': 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      'dune': 'https://www.youtube.com/watch?v=n9xhJrPXop4',
      'tenet': 'https://www.youtube.com/watch?v=LdOM0x0XDMo',

      // Christopher Nolan Films
      'dunkirk': 'https://www.youtube.com/watch?v=F-eMt3SrfFU',
      'oppenheimer': 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      'memento': 'https://www.youtube.com/watch?v=4CV41hoyS8A',
      'the prestige': 'https://www.youtube.com/watch?v=o4gHCmTQDVI',

      // Horror Movies
      'the exorcist': 'https://www.youtube.com/watch?v=YDGw1MTEe5k',
      'halloween': 'https://www.youtube.com/watch?v=xHuOtLbs0QE',
      'friday the 13th': 'https://www.youtube.com/watch?v=xOe0LIkqT-4',
      'nightmare on elm street': 'https://www.youtube.com/watch?v=dCVh4lBfW-c',
      'the shining': 'https://www.youtube.com/watch?v=5Cb3ik6zP2I',
      'it': 'https://www.youtube.com/watch?v=FnCdOQsX5kc',
      'get out': 'https://www.youtube.com/watch?v=DzfPjrBC_wQ',
      'hereditary': 'https://www.youtube.com/watch?v=V6wWKNij_1M',
      'the conjuring': 'https://www.youtube.com/watch?v=k10ETZ41q5o',
      'insidious': 'https://www.youtube.com/watch?v=zuZnRUcoWos',

      // Drama Movies
      'titanic': 'https://www.youtube.com/watch?v=2e-eXJ6HgkQ',
      'the green mile': 'https://www.youtube.com/watch?v=Ki4haFrqSrw',
      'schindlers list': 'https://www.youtube.com/watch?v=gG22XNhtnoY',
      'saving private ryan': 'https://www.youtube.com/watch?v=zwhP5b4tD6g',
      'gladiator': 'https://www.youtube.com/watch?v=owK1qxDselE',
      'braveheart': 'https://www.youtube.com/watch?v=1cnoM4yx3OY',
      'the pianist': 'https://www.youtube.com/watch?v=BFwGqLa_oAo',
      'beautiful mind': 'https://www.youtube.com/watch?v=QdHvS0oSA5Q',
      'rain man': 'https://www.youtube.com/watch?v=LCC2giz6kZA',

      // Comedy Movies
      'the hangover': 'https://www.youtube.com/watch?v=tcdUhdOlz9M',
      'dumb and dumber': 'https://www.youtube.com/watch?v=Nfqb1zKUMcw',
      'superbad': 'https://www.youtube.com/watch?v=4eaZ_48ZYog',
      'anchorman': 'https://www.youtube.com/watch?v=NJQ4qEWm9lU',
      'step brothers': 'https://www.youtube.com/watch?v=MjAmXbaD9gY',
      'zoolander': 'https://www.youtube.com/watch?v=gx9O6q0pDAU',
      'wedding crashers': 'https://www.youtube.com/watch?v=57Y1jInOBTQ',
      'bridesmaids': 'https://www.youtube.com/watch?v=FjHgZj9DqzQ',
      'tropic thunder': 'https://www.youtube.com/watch?v=QnPn_w4bWI8',

      // Animated Movies - Disney/Pixar
      'the lion king': 'https://www.youtube.com/watch?v=7TavVZMewpY',
      'frozen': 'https://www.youtube.com/watch?v=TbQm5doF_Uc',
      'toy story': 'https://www.youtube.com/watch?v=KYz2wyBy3kc',
      'finding nemo': 'https://www.youtube.com/watch?v=wZdpNglLbt8',
      'the incredibles': 'https://www.youtube.com/watch?v=eZbzbC9285I',
      'monsters inc': 'https://www.youtube.com/watch?v=cvVcbk80OsU',
      'cars': 'https://www.youtube.com/watch?v=SbXIj2T-_uk',
      'wall-e': 'https://www.youtube.com/watch?v=CZ1CATNbXg0',
      'up': 'https://www.youtube.com/watch?v=pkqzFUhGPJg',
      'coco': 'https://www.youtube.com/watch?v=Ga6RYejo6Hk',
      'moana': 'https://www.youtube.com/watch?v=LKFuXETZUsI',
      'encanto': 'https://www.youtube.com/watch?v=CaimKeDcudo',
      'turning red': 'https://www.youtube.com/watch?v=XdKzUbAiswE',
      'luca': 'https://www.youtube.com/watch?v=mYfJxlgR2jw',
      'soul': 'https://www.youtube.com/watch?v=xOsLIiBStEs',
      'onward': 'https://www.youtube.com/watch?v=gn5QmllRCn4',
      'raya': 'https://www.youtube.com/watch?v=1VIZ89FEjYI',
      'beauty and the beast': 'https://www.youtube.com/watch?v=HSZIej-ZraE',
      'aladdin': 'https://www.youtube.com/watch?v=7hHECMVOq7g',
      'little mermaid': 'https://www.youtube.com/watch?v=9QnCu4YraDg',

      // Recent Blockbusters
      'top gun maverick': 'https://www.youtube.com/watch?v=giXco2jaZ_4',
      'no time to die': 'https://www.youtube.com/watch?v=BIhNsAtPbPI',
      'the batman': 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
      'spiderman no way home': 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
      'doctor strange multiverse': 'https://www.youtube.com/watch?v=aWzlQ2N6qqg',
      'thor love and thunder': 'https://www.youtube.com/watch?v=tgB1wUcmbbw',
      'minions': 'https://www.youtube.com/watch?v=6DxjJzmYsXo',
      'sonic': 'https://www.youtube.com/watch?v=FvvZaBf9QQI',
      'fantastic beasts': 'https://www.youtube.com/watch?v=Vso5o11LuGE',

      // Franchise Movies
      'harry potter': 'https://www.youtube.com/watch?v=VyHV0BRtdxo',
      'lord of the rings': 'https://www.youtube.com/watch?v=V75dMMIW2B4',
      'hobbit': 'https://www.youtube.com/watch?v=SDnYMbYB-nU',
      'pirates of the caribbean': 'https://www.youtube.com/watch?v=naQr0uTrH_s',
      'transformers': 'https://www.youtube.com/watch?v=dxQxsHTb3pc',
      'indiana jones': 'https://www.youtube.com/watch?v=eQfMbSe7F2w',
      'james bond': 'https://www.youtube.com/watch?v=BIhNsAtPbPI',
      'rocky': 'https://www.youtube.com/watch?v=3VdOdmRbaDc',
      'creed': 'https://www.youtube.com/watch?v=Uv554B7YHk4',

      // Thriller/Mystery
      'gone girl': 'https://www.youtube.com/watch?v=2-_-1nJf8Vg',
      'zodiac': 'https://www.youtube.com/watch?v=yNdgOOQc6RY',
      'seven': 'https://www.youtube.com/watch?v=SpaPz-nWaTc',
      'silence of the lambs': 'https://www.youtube.com/watch?v=W6Mm8Sbe__o',
      'shutter island': 'https://www.youtube.com/watch?v=5iaYLCiq5RM',
      'the sixth sense': 'https://www.youtube.com/watch?v=VG9AGf66tXM',
      'knives out': 'https://www.youtube.com/watch?v=qGqiHJTsRkQ',

      // Romance
      'the notebook': 'https://www.youtube.com/watch?v=BjJcYdEOI0k',
      'dirty dancing': 'https://www.youtube.com/watch?v=8plwv25NYRo',
      'ghost': 'https://www.youtube.com/watch?v=R6TfPaVkKuI',
      'pretty woman': 'https://www.youtube.com/watch?v=veaAJnZktHE',
      'when harry met sally': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'sleepless in seattle': 'https://www.youtube.com/watch?v=9-2RPNV3tWQ',
      'youve got mail': 'https://www.youtube.com/watch?v=3VqmwsKlmhY',
      'la la land': 'https://www.youtube.com/watch?v=0pdqf4P9MB8',

      // War Movies
      'apocalypse now': 'https://www.youtube.com/watch?v=FTjG-Aux_yM',
      'platoon': 'https://www.youtube.com/watch?v=cNZKUO7sHB8',
      'full metal jacket': 'https://www.youtube.com/watch?v=_j4Z2SrkR7o',
      '1917': 'https://www.youtube.com/watch?v=YqNYrYUiMfg',
      'hacksaw ridge': 'https://www.youtube.com/watch?v=s2-1hz1juBI',
      'fury': 'https://www.youtube.com/watch?v=q94n3eWOWXM',

      // Sports Movies
      'rocky': 'https://www.youtube.com/watch?v=3VdOdmRbaDc',
      'the karate kid': 'https://www.youtube.com/watch?v=QSbDC3yFKGE',
      'remember the titans': 'https://www.youtube.com/watch?v=wNTO1ceBrbo',
      'rudy': 'https://www.youtube.com/watch?v=6pS9KcoZbr8',
      'the blind side': 'https://www.youtube.com/watch?v=YB3QC_FL-S4',
      'moneyball': 'https://www.youtube.com/watch?v=pWgyy_rlmag',

      // General terms that might match many movies
      'movie': 'https://www.youtube.com/watch?v=TcMBFSGVi1c', // Default to Avengers Endgame
      'film': 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      'cinema': 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      'trailer': 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      'action': 'https://www.youtube.com/watch?v=eOrNdBpGMv8',
      'comedy': 'https://www.youtube.com/watch?v=tcdUhdOlz9M',
      'drama': 'https://www.youtube.com/watch?v=2e-eXJ6HgkQ',
      'horror': 'https://www.youtube.com/watch?v=k10ETZ41q5o',
      'adventure': 'https://www.youtube.com/watch?v=V75dMMIW2B4',
      'romance': 'https://www.youtube.com/watch?v=BjJcYdEOI0k',
      'thriller': 'https://www.youtube.com/watch?v=2-_-1nJf8Vg',
      'fantasy': 'https://www.youtube.com/watch?v=V75dMMIW2B4',
      'animation': 'https://www.youtube.com/watch?v=7TavVZMewpY',
      'family': 'https://www.youtube.com/watch?v=wZdpNglLbt8'
    };

    const movieKey = movieTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const movieWords = movieKey.split(' ').filter(word => word.length > 2); // Filter out short words
    
    // Check if we have a fallback trailer
    for (const [key, url] of Object.entries(fallbackTrailers)) {
      const keyWords = key.split(' ').filter(word => word.length > 2);
      
      // Exact match
      if (movieKey === key) {
        return {
          url,
          title: `${movieTitle} - Official Trailer`,
          thumbnail: `https://img.youtube.com/vi/${url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`,
          source: 'fallback'
        };
      }
      
      // Check if movie title contains the key
      if (movieKey.includes(key)) {
        return {
          url,
          title: `${movieTitle} - Official Trailer`,
          thumbnail: `https://img.youtube.com/vi/${url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`,
          source: 'fallback'
        };
      }

      // Check if key contains the movie title
      if (key.includes(movieKey)) {
        return {
          url,
          title: `${movieTitle} - Official Trailer`,
          thumbnail: `https://img.youtube.com/vi/${url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`,
          source: 'fallback'
        };
      }
      
      // Partial match - check if movie contains key words or vice versa
      const hasMatch = keyWords.some(keyWord => 
        movieWords.some(movieWord => 
          movieWord.includes(keyWord) || keyWord.includes(movieWord)
        )
      );
      
      if (hasMatch && movieWords.length > 0 && keyWords.length > 0) {
        return {
          url,
          title: `${movieTitle} - Official Trailer`,
          thumbnail: `https://img.youtube.com/vi/${url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`,
          source: 'fallback'
        };
      }
    }

    // If no specific match found, try to match by genre/category
    const genreWords = ['action', 'comedy', 'drama', 'horror', 'romance', 'thriller', 'adventure', 'animation', 'fantasy', 'family'];
    for (const genre of genreWords) {
      if (movieKey.includes(genre) && fallbackTrailers[genre]) {
        return {
          url: fallbackTrailers[genre],
          title: `${movieTitle} - Trailer`,
          thumbnail: `https://img.youtube.com/vi/${fallbackTrailers[genre].split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`,
          source: 'fallback-genre'
        };
      }
    }

    return null;
  }

  // Main method to get trailer
  async getMovieTrailer(movie) {
    if (!movie) {
      console.warn('No movie data provided to getMovieTrailer');
      return null;
    }

    const cacheKey = `trailer_${movie.id}_${movie.title}`;
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('🔧 Using cached trailer for:', movie.title);
      return cached;
    }

    const movieTitle = movie.title || movie.original_title || '';
    if (!movieTitle) {
      console.warn('No movie title found');
      return null;
    }

    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    console.log(`🎬 Fetching trailer for: ${movieTitle} (${releaseYear})`);

    let trailer = null;

    try {
      // Priority 1: Try TMDb API first (most reliable for movie data)
      if (movie.tmdb_id || (movie.id && movie.id > 1000)) {
        const movieId = movie.tmdb_id || movie.id;
        console.log('🎭 Trying TMDB API with movie ID:', movieId);
        console.log('🎭 Movie object:', { id: movie.id, tmdb_id: movie.tmdb_id, title: movie.title });
        trailer = await this.fetchFromTMDb(movieId);
      }

      // Priority 2: Try YouTube API if TMDb failed
      if (!trailer && this.YOUTUBE_API_KEY) {
        console.log('🔍 Trying YouTube API...');
        trailer = await this.fetchFromYouTube(movieTitle, releaseYear);
      }

      // Priority 3: Use fallback data if both APIs failed
      if (!trailer) {
        console.log('📋 Using fallback data...');
        trailer = await this.fetchTrailerFallback(movieTitle, releaseYear);
      }

      // Cache the result
      if (trailer) {
        console.log(`✅ Trailer found from ${trailer.source}:`, trailer.title);
        this.setCachedData(cacheKey, trailer);
      } else {
        console.log('❌ No trailer found for:', movieTitle);
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
    }

    return trailer;
  }

  // Get multiple trailers (trailer, behind the scenes, etc.)
  async getMovieVideos(movie) {
    const cacheKey = `videos_${movie.id}_${movie.title}`;
    
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let videos = [];

      // Get main trailer
      const trailer = await this.getMovieTrailer(movie);
      if (trailer) {
        videos.push({ ...trailer, type: 'Trailer' });
      }

      // If using TMDb, get additional videos
      if (movie.tmdb_id || (movie.id && movie.id > 1000)) {
        try {
          const response = await fetch(
            `${this.TMDB_BASE_URL}/movie/${movie.tmdb_id || movie.id}/videos?api_key=${this.TMDB_API_KEY}&language=en-US`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // Add other video types
            const otherVideos = data.results
              ?.filter(video => video.site === 'YouTube' && video.type !== 'Trailer')
              .slice(0, 3)
              .map(video => ({
                url: `https://www.youtube.com/watch?v=${video.key}`,
                title: video.name,
                thumbnail: `https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`,
                source: 'tmdb',
                type: video.type
              }));

            videos = [...videos, ...otherVideos];
          }
        } catch (error) {
          console.warn('Failed to fetch additional videos:', error);
        }
      }

      this.setCachedData(cacheKey, videos);
      return videos;
    } catch (error) {
      console.error('Error fetching movie videos:', error);
      return [];
    }
  }

  // Check if trailer is available
  async hasTrailer(movie) {
    const trailer = await this.getMovieTrailer(movie);
    return !!trailer;
  }

  // Clear cache (useful for debugging)
  clearCache() {
    this.cache.clear();
  }
}

// Create and export instance
export const trailerService = new TrailerService();
export default trailerService;
