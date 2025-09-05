// Authentication service for managing user login/signup and session management
class AuthService {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.initializeDemoUser();
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Initialize demo user if not exists
  initializeDemoUser() {
    const users = this.getAllUsers();
    const demoUser = users.find(u => u.email === 'demo@movieplex.com');
    
    if (!demoUser) {
      const demo = {
        id: 'demo_user_123',
        email: 'demo@movieplex.com',
        password: this.hashPassword('demo123'),
        name: 'Demo User',
        avatar: this.generateAvatar('Demo User'),
        preferences: {
          favoriteGenres: ['Action', 'Sci-Fi'],
          watchedMovies: [],
          ratings: {}
        },
        subscription: {
          type: 'premium',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      users.push(demo);
      this.saveUsers(users);
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('movieplex_current_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get all registered users
  getAllUsers() {
    try {
      const users = localStorage.getItem('movieplex_users');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Save users to localStorage
  saveUsers(users) {
    try {
      localStorage.setItem('movieplex_users', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Register a new user
  register(userData) {
    const { email, password, name } = userData;
    
    // Validate input
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    const users = this.getAllUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: this.generateUserId(),
      email: email.toLowerCase(),
      password: this.hashPassword(password),
      name: name.trim(),
      avatar: this.generateAvatar(name),
      preferences: {
        favoriteGenres: [],
        watchedMovies: [],
        ratings: {},
        notifications: true,
        language: 'en',
        theme: 'dark'
      },
      subscription: {
        type: 'free',
        expiresAt: null
      },
      stats: {
        moviesWatched: 0,
        timeSpent: 0,
        favoriteGenre: null
      },
      security: {
        lastPasswordChange: new Date().toISOString(),
        loginHistory: []
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    // Set as current user (auto-login after registration)
    this.setCurrentUser(newUser);
    
    return this.sanitizeUser(newUser);
  }

  // Login user
  login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const users = this.getAllUsers();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      throw new Error('User not found');
    }

    if (!this.verifyPassword(password, user.password)) {
      throw new Error('Invalid password');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers(users);

    // Set as current user
    this.setCurrentUser(user);
    
    return this.sanitizeUser(user);
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem('movieplex_current_user');
  }

  // Set current user
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('movieplex_current_user', JSON.stringify(user));
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get user-specific analytics key
  getUserAnalyticsKey() {
    if (!this.currentUser) return 'movieplex_analytics_guest';
    return `movieplex_analytics_${this.currentUser.id}`;
  }

  // Update user profile
  updateProfile(updates) {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user data
    const updatedUser = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);
    this.setCurrentUser(updatedUser);

    return this.sanitizeUser(updatedUser);
  }

  // Change password
  changePassword(oldPassword, newPassword) {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    if (!this.verifyPassword(oldPassword, this.currentUser.password)) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex].password = this.hashPassword(newPassword);
      users[userIndex].updatedAt = new Date().toISOString();
      this.saveUsers(users);
      this.setCurrentUser(users[userIndex]);
    }

    return true;
  }

  // Delete user account
  deleteAccount() {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== this.currentUser.id);
    this.saveUsers(filteredUsers);

    // Clear user analytics data
    localStorage.removeItem(this.getUserAnalyticsKey());
    
    // Logout
    this.logout();

    return true;
  }

  // Utility methods
  generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Simple password hashing (in production, use bcrypt or similar)
  hashPassword(password) {
    // This is a simple hash for demo purposes
    // In production, use proper password hashing like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  verifyPassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword;
  }

  // Generate user avatar based on name
  generateAvatar(name) {
    const colors = ['#FF6B35', '#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03DAC6'];
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colorIndex = name.length % colors.length;
    
    return {
      initials,
      color: colors[colorIndex],
      type: 'initials'
    };
  }

  // Session management
  isSessionValid() {
    if (!this.currentUser) return false;
    
    const sessionData = localStorage.getItem('movieplex_session');
    if (!sessionData) return false;
    
    try {
      const { timestamp, userId } = JSON.parse(sessionData);
      const now = Date.now();
      
      return (now - timestamp) < this.sessionTimeout && userId === this.currentUser.id;
    } catch (error) {
      return false;
    }
  }

  // Create session
  createSession(userId) {
    const sessionData = {
      userId,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.sessionTimeout
    };
    
    localStorage.setItem('movieplex_session', JSON.stringify(sessionData));
  }

  // Destroy session
  destroySession() {
    localStorage.removeItem('movieplex_session');
  }

  // Password reset (demo implementation)
  resetPassword(email) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email.toLowerCase());
    
    if (!user) {
      throw new Error('No user found with this email address');
    }

    // In a real app, this would send an email
    // For demo, we'll generate a temporary password
    const tempPassword = this.generateTempPassword();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    users[userIndex] = {
      ...user,
      password: this.hashPassword(tempPassword),
      tempPassword: true,
      passwordResetAt: new Date().toISOString()
    };
    
    this.saveUsers(users);
    
    // Return temp password for demo (in real app, this would be emailed)
    return tempPassword;
  }

  // Generate temporary password
  generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Update user preferences
  updatePreferences(preferences) {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const updatedUser = {
      ...this.currentUser,
      preferences: {
        ...this.currentUser.preferences,
        ...preferences
      },
      updatedAt: new Date().toISOString()
    };

    return this.updateProfile({ preferences: updatedUser.preferences });
  }

  // Add to watchlist/favorites with user context
  addToWatchlist(movieId) {
    if (!this.currentUser) {
      throw new Error('Please log in to add movies to your watchlist');
    }

    const watchlist = this.getWatchlist();
    if (!watchlist.includes(movieId)) {
      watchlist.push(movieId);
      localStorage.setItem(`movieplex_watchlist_${this.currentUser.id}`, JSON.stringify(watchlist));
    }
  }

  removeFromWatchlist(movieId) {
    if (!this.currentUser) return;

    const watchlist = this.getWatchlist();
    const updated = watchlist.filter(id => id !== movieId);
    localStorage.setItem(`movieplex_watchlist_${this.currentUser.id}`, JSON.stringify(updated));
  }

  getWatchlist() {
    if (!this.currentUser) return [];
    
    try {
      const watchlist = localStorage.getItem(`movieplex_watchlist_${this.currentUser.id}`);
      return watchlist ? JSON.parse(watchlist) : [];
    } catch (error) {
      return [];
    }
  }

  // Similar methods for favorites
  addToFavorites(movieId) {
    if (!this.currentUser) {
      throw new Error('Please log in to add movies to your favorites');
    }

    const favorites = this.getFavorites();
    if (!favorites.includes(movieId)) {
      favorites.push(movieId);
      localStorage.setItem(`movieplex_favorites_${this.currentUser.id}`, JSON.stringify(favorites));
    }
  }

  removeFromFavorites(movieId) {
    if (!this.currentUser) return;

    const favorites = this.getFavorites();
    const updated = favorites.filter(id => id !== movieId);
    localStorage.setItem(`movieplex_favorites_${this.currentUser.id}`, JSON.stringify(updated));
  }

  getFavorites() {
    if (!this.currentUser) return [];
    
    try {
      const favorites = localStorage.getItem(`movieplex_favorites_${this.currentUser.id}`);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      return [];
    }
  }

  // Track user activity
  trackActivity(activity) {
    if (!this.currentUser) return;

    const activities = this.getUserActivities();
    activities.unshift({
      ...activity,
      timestamp: new Date().toISOString(),
      userId: this.currentUser.id
    });

    // Keep only last 50 activities
    const limited = activities.slice(0, 50);
    localStorage.setItem(`movieplex_activities_${this.currentUser.id}`, JSON.stringify(limited));
  }

  getUserActivities() {
    if (!this.currentUser) return [];
    
    try {
      const activities = localStorage.getItem(`movieplex_activities_${this.currentUser.id}`);
      return activities ? JSON.parse(activities) : [];
    } catch (error) {
      return [];
    }
  }

  // Remove sensitive data from user object
  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Get user statistics
  getUserStats() {
    const users = this.getAllUsers();
    return {
      totalUsers: users.length,
      currentUser: this.currentUser ? this.sanitizeUser(this.currentUser) : null,
      isAuthenticated: this.isAuthenticated()
    };
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;
