// Firebase Authentication Service
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.googleProvider = new GoogleAuthProvider();
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: displayName
      });

      // Send email verification
      await sendEmailVerification(user);

      // Create user document in Firestore
      await this.createUserDocument(user, { displayName });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        message: 'Account created successfully! Please check your email for verification.'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login time
      await this.updateUserDocument(user.uid, {
        lastLogin: serverTimestamp()
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;

      // Create or update user document
      await this.createUserDocument(user, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'google'
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent successfully!'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');

      // Update Firebase Auth profile
      if (updates.displayName || updates.photoURL) {
        await updateProfile(user, {
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL
        });
      }

      // Update Firestore document
      await this.updateUserDocument(user.uid, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Create user document in Firestore
  async createUserDocument(user, additionalData = {}) {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.displayName,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        preferences: {
          favoriteGenres: [],
          theme: 'dark',
          language: 'en'
        },
        favorites: [],
        watchlist: [],
        ratings: {},
        ...additionalData
      };

      await setDoc(userRef, userData);
    }
  }

  // Update user document
  async updateUserDocument(uid, updates) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  }

  // Get user document
  async getUserDocument(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: 'User document not found' };
      }
    } catch (error) {
      console.error('Get user document error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add movie to favorites
  async addToFavorites(movieId, movieData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        favorites: arrayUnion({
          id: movieId,
          addedAt: new Date().toISOString(),
          ...movieData
        })
      });

      return { success: true };
    } catch (error) {
      console.error('Add to favorites error:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove from favorites
  async removeFromFavorites(movieId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');

      // First get current favorites to find the exact object to remove
      const userDoc = await this.getUserDocument(user.uid);
      if (userDoc.success && userDoc.data.favorites) {
        const movieToRemove = userDoc.data.favorites.find(fav => fav.id === movieId);
        
        if (movieToRemove) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            favorites: arrayRemove(movieToRemove)
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return { success: false, error: error.message };
    }
  }

  // Rate a movie
  async rateMovie(movieId, rating, review = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`ratings.${movieId}`]: {
          rating,
          review,
          ratedAt: new Date().toISOString()
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Rate movie error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get error message
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      'auth/popup-blocked': 'Sign-in popup was blocked by your browser.'
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
