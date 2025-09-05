import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import MovieGrid from './components/MovieGrid/MovieGrid';
import MovieDetails from './components/MovieDetails/MovieDetails';
import SearchResults from './components/Search/SearchResults';
import FavoritesPage from './components/Favorites/FavoritesPage';
import Analytics from './components/Analytics/Analytics';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ApiStatusNotification from './components/Notification/ApiStatusNotification';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { MovieProvider } from './context/MovieContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { envCheck } from './services/envCheck';
import './App.css';

// Animated Routes component
const AnimatedRoutes = () => {
  const location = useLocation();
  
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.98
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 1.02
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.6
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Hero />
            <MovieGrid />
          </motion.div>
        } />
        <Route path="/popular" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <MovieGrid />
          </motion.div>
        } />
        <Route path="/trending" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <MovieGrid />
          </motion.div>
        } />
        <Route path="/top-rated" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <MovieGrid />
          </motion.div>
        } />
        <Route path="/movie/:id" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <MovieDetails />
          </motion.div>
        } />
        <Route path="/search" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <SearchResults />
          </motion.div>
        } />
        <Route path="/favorites" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <FavoritesPage />
          </motion.div>
        } />
        <Route path="/watchlist" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <FavoritesPage />
          </motion.div>
        } />
        <Route path="/analytics" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Analytics />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Login />
          </motion.div>
        } />
        <Route path="/register" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Register />
          </motion.div>
        } />
        {/* Catch all routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  // Test environment variables on app start
  useEffect(() => {
    console.log('🚀 App starting...');
    const env = envCheck();
    console.log('Environment check:', env);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <MovieProvider>
          <FavoritesProvider>
            <Router>
              <ScrollToTop />
              <div className="App">
                <ApiStatusNotification />
                <Header />
                <AnimatedRoutes />
                <Footer />
              </div>
            </Router>
          </FavoritesProvider>
        </MovieProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
