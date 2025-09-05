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
          <h4>📧 Finding Your Verification Email:</h4>
          <ul>
            <li><strong>Gmail Primary Inbox:</strong> Check your main inbox first</li>
            <li><strong>Promotions Tab:</strong> Click the "Promotions" tab in Gmail</li>
            <li><strong>Spam Folder:</strong> Most likely location - check "Spam" folder</li>
            <li><strong>Search Gmail:</strong> Search for "movieplex", "verification", or "firebase"</li>
          </ul>
          
          <h4>🎯 If Found in Spam - Important!</h4>
          <div className="spam-instructions">
            <p><strong>To ensure future emails reach your inbox:</strong></p>
            <ol>
              <li>Open the email in your Spam folder</li>
              <li>Click "Not Spam" or "Report Not Spam"</li>
              <li>Move the email to your Primary inbox</li>
              <li>Add <code>noreply@movieplex-b29e4.firebaseapp.com</code> to your contacts</li>
            </ol>
          </div>
          
          <h4>💡 General Tips:</h4>
          <ul>
            <li>Wait 2-5 minutes for email delivery</li>
            <li>Check your internet connection</li>
            <li>Try with a different email provider if issues persist</li>
            <li>Use the "Resend" button if email doesn't arrive</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailVerification;
