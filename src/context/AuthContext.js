import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in and session is valid
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isSessionValid()) {
      setUser(currentUser);
    } else if (currentUser) {
      // Session expired, logout
      authService.logout();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Call the synchronous login function
      const userData = authService.login(email, password);
      setUser(userData);
      
      // Clear any previous errors
      setError(null);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const newUser = authService.register(userData);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      const updatedUser = authService.updateProfile(updates);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setError(null);
      authService.changePassword(oldPassword, newPassword);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      const tempPassword = authService.resetPassword(email);
      return { success: true, tempPassword };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      setError(null);
      const updatedUser = authService.updatePreferences(preferences);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = () => {
    return user !== null && authService.isSessionValid();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    updatePreferences,
    isAuthenticated,
    clearError,
    // Direct access to auth service methods
    authService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
