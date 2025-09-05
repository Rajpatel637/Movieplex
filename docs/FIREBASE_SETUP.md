# Firebase Setup Instructions for Movieplex

Follow these steps to set up Firebase authentication and database for your Movieplex project.

## 🔥 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project"
   - Project name: `Movieplex` (or your preferred name)
   - Enable Google Analytics (optional)
   - Click "Create project"

## 🔥 Step 2: Setup Authentication

1. **Enable Authentication**
   - In Firebase console, go to "Authentication"
   - Click "Get started"

2. **Configure Sign-in Methods**
   - Go to "Sign-in method" tab
   - Enable these providers:
     - **Email/Password**: Enable this
     - **Google**: Enable this (optional)

3. **Add Authorized Domains**
   - In "Sign-in method" → "Authorized domains"
   - Add your domains:
     - `localhost` (for development)
     - Your production domain when you deploy

## 🔥 Step 3: Setup Firestore Database

1. **Create Firestore Database**
   - Go to "Firestore Database"
   - Click "Create database"
   - Start in "Test mode" (for now)
   - Choose location closest to your users

2. **Security Rules** (Update later for production)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Public read access for movie data (if you store any)
       match /movies/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## 🔥 Step 4: Get Configuration Keys

1. **Add Web App to Project**
   - In Project Overview, click the web icon `</>`
   - App nickname: `Movieplex Web`
   - Don't check "Firebase Hosting" (for now)
   - Click "Register app"

2. **Copy Configuration**
   - Copy the `firebaseConfig` object
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdefghijk",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

## 🔥 Step 5: Configure Environment Variables

1. **Create `.env` file** in your project root (copy from `.env.example`)

2. **Add Firebase Configuration**
   ```env
   # TMDb API Configuration
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
   REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3

   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## 🔥 Step 6: Test the Setup

1. **Start your development server**
   ```bash
   npm start
   ```

2. **Test Authentication**
   - Try registering a new account
   - Try logging in
   - Check Firebase console → Authentication → Users

3. **Test Database**
   - Add movies to favorites
   - Check Firebase console → Firestore Database

## 🔥 Step 7: Database Structure

Your Firestore will automatically create this structure:

```
users/
  {userId}/
    uid: string
    email: string
    displayName: string
    photoURL: string
    emailVerified: boolean
    createdAt: timestamp
    lastLogin: timestamp
    preferences: {
      favoriteGenres: array
      theme: string
      language: string
    }
    favorites: array of movie objects
    watchlist: array of movie objects
    ratings: map of {movieId: {rating, review, ratedAt}}
```

## 🔥 Production Deployment

When ready for production:

1. **Update Security Rules** (more restrictive)
2. **Enable Email Verification** requirement
3. **Set up Firebase Hosting** (optional)
4. **Configure Custom Domain** (optional)

## 🆘 Troubleshooting

**Common Issues:**

1. **Authentication not working**
   - Check if domain is in authorized domains
   - Verify environment variables are set correctly

2. **Firestore permission denied**
   - Update security rules
   - Ensure user is authenticated

3. **Network errors**
   - Check internet connection
   - Verify Firebase config keys

Need help? Check Firebase documentation or create an issue in the repository.
