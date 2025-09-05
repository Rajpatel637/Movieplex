import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { firebaseAuthService } from '../../services/firebaseAuthService';
import './Auth.css';

const EmailVerification = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendVerification = async () => {
    if (loading) return;
    
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await firebaseAuthService.resendEmailVerification();
      
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkEmailVerified = async () => {
    try {
      // Reload the current user to get fresh data from Firebase
      await firebaseAuthService.getCurrentUser()?.reload();
      
      // Check if email is now verified
      const currentUser = firebaseAuthService.getCurrentUser();
      if (currentUser?.emailVerified) {
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setError('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setError('Failed to check verification status. Please try again.');
    }
  };

  if (!user) {
    return null;
  }

  if (user.emailVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="email-verification verified"
      >
        <div className="verification-content">
          <CheckCircle className="icon verified-icon" />
          <h3>Email Verified!</h3>
          <p>Your email address has been successfully verified.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="email-verification pending"
    >
      <div className="verification-content">
        <Mail className="icon pending-icon" />
        <h3>Verify Your Email</h3>
        <p>
          We've sent a verification email to <strong>{user.email}</strong>. 
          Please check your inbox and click the verification link.
        </p>

        {message && (
          <div className="success-message">
            <CheckCircle className="icon" />
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle className="icon" />
            {error}
          </div>
        )}

        <div className="verification-actions">
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? (
              <RefreshCw className="icon spinning" />
            ) : (
              <Mail className="icon" />
            )}
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <button
            onClick={checkEmailVerified}
            className="btn-primary"
          >
            <CheckCircle className="icon" />
            I've Verified My Email
          </button>
        </div>

        <div className="verification-tips">
          <h4>Tips:</h4>
          <ul>
            <li>Check your spam/junk folder</li>
            <li>Make sure the email address is correct</li>
            <li>Wait a few minutes for the email to arrive</li>
            <li>Try resending if you don't receive it</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailVerification;
