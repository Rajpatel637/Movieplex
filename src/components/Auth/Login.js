import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const navigate = useNavigate();
  const { login, resetPassword, loginWithGoogle } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // For demo, create a test account or use existing demo credentials
      const result = await login('demo@movieplex.com', 'demo123456');
      
      if (result.success) {
        setSuccess('Demo login successful! Redirecting...');
        
        analyticsService.track('demo_login', {
          userId: result.user.uid
        });
        
        setTimeout(() => {
          const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
          navigate(redirectTo);
        }, 500);
      } else {
        setError(result.error || 'Demo login failed. Please try again.');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        setSuccess('Google login successful! Redirecting...');
        
        analyticsService.track('google_login', {
          userId: result.user.uid
        });
        
        setTimeout(() => {
          const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
          navigate(redirectTo);
        }, 500);
      } else {
        setError(result.error || 'Google login failed. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(formData.email);
      
      if (result.success) {
        setSuccess(`Temporary password sent! Use: ${result.tempPassword}`);
        setForgotPasswordMode(false);
        analyticsService.track('password_reset_requested', {
          email: formData.email
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Show success message briefly
        setSuccess('Login successful! Redirecting...');
        
        // Track successful login
        analyticsService.track('user_login', {
          method: 'email',
          userId: result.user.id
        });
        
        // Navigate after a brief delay to show success message
        setTimeout(() => {
          const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
          navigate(redirectTo);
        }, 500);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
        
        // Track failed login attempt
        analyticsService.track('login_failed', {
          email: formData.email,
          error: result.error
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <motion.div
            className="auth-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <LogIn size={32} />
          </motion.div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your personal movie analytics</p>
        </div>

        <motion.form
          className="auth-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="success-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle size={16} />
              {success}
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {!forgotPasswordMode && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div className="form-actions">
            {!forgotPasswordMode ? (
              <>
                <motion.button
                  type="submit"
                  className="auth-button primary"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Sign In
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  className="auth-button demo"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserCheck size={18} />
                  Try Demo Account
                </motion.button>

                <motion.button
                  type="button"
                  className="auth-button google"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </motion.button>
              </>
            ) : (
              <motion.button
                type="button"
                className="auth-button primary"
                onClick={handleForgotPassword}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Mail size={18} />
                    Send Reset Link
                  </>
                )}
              </motion.button>
            )}
          </div>

          <div className="auth-links">
            <button
              type="button"
              className="link-button"
              onClick={() => setForgotPasswordMode(!forgotPasswordMode)}
            >
              {forgotPasswordMode ? 'Back to Sign In' : 'Forgot Password?'}
            </button>
          </div>
            className="auth-button primary"
        </motion.form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
