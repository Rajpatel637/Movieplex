// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyATplBWge_EN5ufhEaynp9rqYgvUvkpSf0",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "movieplex-b29e4.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "movieplex-b29e4",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "movieplex-b29e4.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "936538909111",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:936538909111:web:69e78e0a1db013defaa032",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-SETFDEN4PM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

console.log('🔥 Firebase initialized successfully!');
console.log('📊 Project ID:', firebaseConfig.projectId);

export default app;
