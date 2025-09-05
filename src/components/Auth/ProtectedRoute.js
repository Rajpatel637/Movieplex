import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ProtectedRoute = ({ children, requireAuth = true, fallback = null }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '40px' }}
        >
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
              Checking authentication...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    // Provide custom fallback or redirect to login
    if (fallback) {
      return fallback;
    }

    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} 
        replace 
      />
    );
  }

  // If user should not be authenticated (like login page) but is authenticated
  if (!requireAuth && isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Login prompt component for partial protection
export const LoginPrompt = ({ 
  message = "Please log in to access this feature",
  showActions = true 
}) => {
  const location = useLocation();
  
  return (
    <motion.div
      className="login-prompt"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Lock size={32} style={{ marginBottom: '16px', color: 'var(--accent-primary)' }} />
      <h3>Authentication Required</h3>
      <p>{message}</p>
      
      {showActions && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <motion.a
            href={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
            className="auth-button primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={16} />
            Sign In
          </motion.a>
          
          <motion.a
            href="/register"
            className="auth-button secondary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.a>
        </div>
      )}
    </motion.div>
  );
};

// Higher-order component for protecting components
export const withAuth = (WrappedComponent, options = {}) => {
  const { requireAuth = true, fallback = null } = options;
  
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute requireAuth={requireAuth} fallback={fallback}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

export default ProtectedRoute;
