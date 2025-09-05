import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EmailVerifiedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but email not verified, redirect to verification page
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // If email is verified, show the protected content
  return children;
};

export default EmailVerifiedRoute;
