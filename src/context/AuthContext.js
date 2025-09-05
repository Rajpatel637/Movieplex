import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { firebaseAuthService } from '../services/firebaseAuthService';

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
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'User signed out');
      
      if (firebaseUser) {
        // User is signed in
        console.log('✅ Setting user state:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          provider: firebaseUser.providerData[0]?.providerId
        });
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });

        // Get user profile from Firestore
        const profileResult = await firebaseAuthService.getUserDocument(firebaseUser.uid);
        if (profileResult.success) {
          console.log('📄 User profile loaded from Firestore');
          setUserProfile(profileResult.data);
        } else {
          console.log('⚠️ Failed to load user profile from Firestore');
        }
      } else {
        // User is signed out
        console.log('🚪 User signed out - clearing state');
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await firebaseAuthService.signIn(email, password);
      
      if (result.success) {
        setError(null);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
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
      
      const result = await firebaseAuthService.signUp(
        userData.email, 
        userData.password, 
        userData.name || userData.displayName
      );
      
      if (result.success) {
        setError(null);
        return { success: true, user: result.user, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const result = await firebaseAuthService.signOut();
      
      if (result.success) {
        setUser(null);
        setUserProfile(null);
        setError(null);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await firebaseAuthService.signInWithGoogle();
      
      if (result.success) {
        setError(null);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      
      const result = await firebaseAuthService.updateUserProfile(updates);
      
      if (result.success) {
        // Refresh user profile
        if (user) {
          const profileResult = await firebaseAuthService.getUserDocument(user.uid);
          if (profileResult.success) {
            setUserProfile(profileResult.data);
          }
        }
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      
      const result = await firebaseAuthService.resetPassword(email);
      
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const addToFavorites = async (movieId, movieData) => {
    try {
      setError(null);
      
      const result = await firebaseAuthService.addToFavorites(movieId, movieData);
      
      if (result.success && user) {
        // Refresh user profile to get updated favorites
        const profileResult = await firebaseAuthService.getUserDocument(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Add to favorites error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const removeFromFavorites = async (movieId) => {
    try {
      setError(null);
      
      const result = await firebaseAuthService.removeFromFavorites(movieId);
      
      if (result.success && user) {
        // Refresh user profile to get updated favorites
        const profileResult = await firebaseAuthService.getUserDocument(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Remove from favorites error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const rateMovie = async (movieId, rating, review = null) => {
    try {
      setError(null);
      
      const result = await firebaseAuthService.rateMovie(movieId, rating, review);
      
      if (result.success && user) {
        // Refresh user profile to get updated ratings
        const profileResult = await firebaseAuthService.getUserDocument(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Rate movie error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = () => {
    return user !== null && user.emailVerified;
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    updateProfile,
    resetPassword,
    addToFavorites,
    removeFromFavorites,
    rateMovie,
    isAuthenticated,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
