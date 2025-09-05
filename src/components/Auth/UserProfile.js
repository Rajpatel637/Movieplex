import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  BarChart3, 
  ChevronDown, 
  Heart,
  Bookmark,
  Star,
  Shield,
  CreditCard,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const UserProfile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getUserStats = () => {
    if (!user || !userProfile) return { favorites: 0, watchlist: 0, watched: 0 };
    
    const favorites = userProfile.favorites ? userProfile.favorites.length : 0;
    const watchlist = userProfile.watchlist ? userProfile.watchlist.length : 0;
    const watched = userProfile.stats?.moviesWatched || 0;
    
    return { favorites, watchlist, watched };
  };

  const stats = getUserStats();

  if (!user) return null;

  return (
    <div className="user-profile-container" ref={dropdownRef}>
      <motion.div
        className="user-profile"
        onClick={() => setShowDropdown(!showDropdown)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="user-avatar"
          style={{ 
            background: user.avatar?.color || 'var(--accent-primary)',
            color: 'white'
          }}
        >
          {user.avatar?.initials || getInitials(user.name)}
        </div>
        <div className="user-info">
          <p className="user-name">{user.name}</p>
          <p className="user-email">{user.email}</p>
        </div>
        <motion.div
          animate={{ rotate: showDropdown ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="profile-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* User Stats */}
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.favorites}</span>
                <span className="stat-label">Favorites</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.watchlist}</span>
                <span className="stat-label">Watchlist</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.watched}</span>
                <span className="stat-label">Watched</span>
              </div>
            </div>

            <div className="profile-menu-divider"></div>

            {/* Navigation Menu */}
            <button
              className="profile-menu-item"
              onClick={() => handleMenuClick('/profile')}
            >
              <User size={16} />
              My Profile
            </button>

            <button
              className="profile-menu-item"
              onClick={() => handleMenuClick('/favorites')}
            >
              <Heart size={16} />
              My Favorites
            </button>

            <button
              className="profile-menu-item"
              onClick={() => handleMenuClick('/watchlist')}
            >
              <Bookmark size={16} />
              My Watchlist
            </button>

            <button
              className="profile-menu-item"
              onClick={() => handleMenuClick('/analytics')}
            >
              <BarChart3 size={16} />
              My Analytics
            </button>

            <button
              className="profile-menu-item"
              onClick={() => handleMenuClick('/ratings')}
            >
              <Star size={16} />
              My Ratings
            </button>

            <div className="profile-menu-divider"></div>

            <button
              className="profile-menu-item"
              onClick={() => handleMenuClick('/settings')}
            >
              <Settings size={16} />
              Settings
            </button>

            <button
              className="profile-menu-item"
              onClick={() => handleMenuClick('/notifications')}
            >
              <Bell size={16} />
              Notifications
            </button>

            {user.subscription?.type === 'premium' && (
              <button
                className="profile-menu-item"
                onClick={() => handleMenuClick('/subscription')}
              >
                <CreditCard size={16} />
                Subscription
              </button>
            )}

            <button
              className="profile-menu-item"
              onClick={() => handleMenuClick('/security')}
            >
              <Shield size={16} />
              Security
            </button>

            <div className="profile-menu-divider"></div>

            <button
              className="profile-menu-item danger"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
