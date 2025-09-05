// Analytics Service for tracking user movie interactions
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

class AnalyticsService {
  constructor() {
    this.currentUserId = null;
    this.updateStorageKey();
    this.initializeStorage();
  }

  // Set current user ID for analytics
  setCurrentUser(userId) {
    this.currentUserId = userId;
    this.updateStorageKey();
    this.initializeStorage();
  }

  // Get user-specific storage key
  getStorageKey() {
    const userId = this.currentUserId || 'anonymous';
    return `movieplex_analytics_${userId}`;
  }

  // Update storage key when user changes
  updateStorageKey() {
    this.storageKey = this.getStorageKey();
  }

  initializeStorage() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      const initialData = {
        movieViews: [],
        genrePreferences: {},
        watchingPatterns: {},
        searchHistory: [],
        favoriteActors: {},
        ratingHistory: [],
        timeSpentWatching: 0,
        totalMoviesViewed: 0,
        accountCreated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Switch user context (call when user logs in/out)
  switchUser(userId = null) {
    this.currentUserId = userId;
    this.updateStorageKey();
    this.initializeStorage();
  }

  // Track movie view
  trackMovieView(movie) {
    const data = this.getData();
    const viewRecord = {
      movieId: movie.id,
      title: movie.title || movie.name,
      genres: movie.genres || [],
      timestamp: new Date().toISOString(),
      rating: movie.vote_average,
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null
    };

    data.movieViews.push(viewRecord);
    data.totalMoviesViewed++;

    // Update genre preferences
    if (movie.genres) {
      movie.genres.forEach(genre => {
        data.genrePreferences[genre] = (data.genrePreferences[genre] || 0) + 1;
      });
    }

    this.saveData(data);
  }

  // Track search query
  trackSearch(query) {
    const data = this.getData();
    data.searchHistory.push({
      query,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 searches
    if (data.searchHistory.length > 100) {
      data.searchHistory = data.searchHistory.slice(-100);
    }

    this.saveData(data);
  }

  // Track time spent on platform
  trackTimeSpent(minutes) {
    const data = this.getData();
    data.timeSpentWatching += minutes;
    this.saveData(data);
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const data = this.getData();
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    // Calculate viewing patterns
    const viewsByDay = this.getViewsByTimeframe(data.movieViews, 'day', 7);
    const viewsByWeek = this.getViewsByTimeframe(data.movieViews, 'week', 4);
    const viewsByMonth = this.getViewsByTimeframe(data.movieViews, 'month', 12);

    // Get top genres
    const topGenres = Object.entries(data.genrePreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // Get viewing streaks
    const currentStreak = this.calculateCurrentStreak(data.movieViews);
    const longestStreak = this.calculateLongestStreak(data.movieViews);

    // Get recent searches
    const recentSearches = data.searchHistory
      .slice(-10)
      .reverse()
      .map(search => search.query);

    // Calculate average rating preference
    const avgRatingPreference = data.movieViews.reduce((sum, view) => 
      sum + (view.rating || 0), 0) / data.movieViews.length || 0;

    // Get viewing times (hour of day)
    const viewingTimes = this.getViewingTimeDistribution(data.movieViews);

    return {
      totalMoviesViewed: data.totalMoviesViewed,
      timeSpentWatching: Math.round(data.timeSpentWatching),
      topGenres,
      viewsByDay,
      viewsByWeek,
      viewsByMonth,
      currentStreak,
      longestStreak,
      recentSearches,
      avgRatingPreference: Math.round(avgRatingPreference * 10) / 10,
      viewingTimes,
      accountAge: this.getAccountAge(data.accountCreated),
      favoriteGenre: topGenres[0]?.genre || 'Not determined yet',
      mostActiveDay: this.getMostActiveDay(data.movieViews),
      recommendationAccuracy: this.calculateRecommendationAccuracy(data.movieViews)
    };
  }

  getViewsByTimeframe(views, timeframe, count) {
    const now = new Date();
    const result = [];

    for (let i = count - 1; i >= 0; i--) {
      let date;
      let label;

      switch (timeframe) {
        case 'day':
          date = subDays(now, i);
          label = format(date, 'MMM dd');
          break;
        case 'week':
          date = subDays(now, i * 7);
          label = format(startOfWeek(date), 'MMM dd');
          break;
        case 'month':
          date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          label = format(date, 'MMM yyyy');
          break;
        default:
          continue;
      }

      const startDate = timeframe === 'day' ? date : 
                       timeframe === 'week' ? startOfWeek(date) : 
                       new Date(date.getFullYear(), date.getMonth(), 1);
      
      const endDate = timeframe === 'day' ? date :
                     timeframe === 'week' ? endOfWeek(date) :
                     new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const viewCount = views.filter(view => {
        const viewDate = new Date(view.timestamp);
        return viewDate >= startDate && viewDate <= endDate;
      }).length;

      result.push({ label, views: viewCount, date: startDate });
    }

    return result;
  }

  calculateCurrentStreak(views) {
    if (!views.length) return 0;

    const sortedViews = views
      .map(view => new Date(view.timestamp).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date().toDateString();
    let checkDate = new Date();

    for (let i = 0; i < sortedViews.length; i++) {
      const viewDate = sortedViews[i];
      const expectedDate = new Date(checkDate).toDateString();

      if (viewDate === expectedDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  calculateLongestStreak(views) {
    if (!views.length) return 0;

    const uniqueDates = [...new Set(views.map(view => 
      new Date(view.timestamp).toDateString()
    ))].sort((a, b) => new Date(a) - new Date(b));

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currentDate = new Date(uniqueDates[i]);
      const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return uniqueDates.length > 0 ? maxStreak : 0;
  }

  getViewingTimeDistribution(views) {
    const hourCounts = new Array(24).fill(0);
    
    views.forEach(view => {
      const hour = new Date(view.timestamp).getHours();
      hourCounts[hour]++;
    });

    return hourCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      views: count
    }));
  }

  getAccountAge(accountCreated) {
    const created = new Date(accountCreated);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  }

  getMostActiveDay(views) {
    const dayCounts = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    views.forEach(view => {
      const day = new Date(view.timestamp).getDay();
      const dayName = dayNames[day];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });

    const mostActive = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return mostActive ? mostActive[0] : 'No data yet';
  }

  calculateRecommendationAccuracy(views) {
    // Simulate recommendation accuracy based on viewing patterns
    // In a real app, this would track actual recommendation clicks vs views
    const totalViews = views.length;
    if (totalViews === 0) return 0;

    // Mock calculation based on genre consistency
    const genreVariety = Object.keys(this.getData().genrePreferences).length;
    const accuracy = Math.min(95, 60 + (genreVariety * 5) + Math.min(totalViews * 2, 20));
    
    return Math.round(accuracy);
  }

  // Track custom events
  trackEvent(eventName, eventData = {}) {
    try {
      const data = this.getData();
      if (!data.customEvents) {
        data.customEvents = [];
      }

      const event = {
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      };

      data.customEvents.push(event);

      // Keep only last 1000 events to prevent storage bloat
      if (data.customEvents.length > 1000) {
        data.customEvents = data.customEvents.slice(-1000);
      }

      this.saveData(data);

      // Log for debugging (remove in production)
      console.log(`Analytics Event: ${eventName}`, eventData);
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }

  // Get or create session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('movieplex_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('movieplex_session_id', sessionId);
    }
    return sessionId;
  }

  // Get events by name
  getEventsByName(eventName) {
    const data = this.getData();
    if (!data.customEvents) return [];
    return data.customEvents.filter(event => event.name === eventName);
  }

  // Get events within date range
  getEventsInRange(startDate, endDate) {
    const data = this.getData();
    if (!data.customEvents) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return data.customEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= start && eventDate <= end;
    });
  }

  // Clear all analytics data
  clearData() {
    localStorage.removeItem(this.storageKey);
    this.initializeStorage();
  }

  // Export analytics data
  exportData() {
    const data = this.getData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `movieplex-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
