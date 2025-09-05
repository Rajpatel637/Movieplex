import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Clock, Award, Calendar, Eye, Search,
  Download, Trash2, Target, Star, Film, Activity
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import './Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    setIsLoading(true);
    setTimeout(() => {
      const data = analyticsService.getAnalyticsSummary();
      setAnalyticsData(data);
      setIsLoading(false);
    }, 1000); // Simulate loading time
  };

  const chartColors = {
    primary: '#ff6b35',
    secondary: '#ff8c69',
    tertiary: '#ffa500',
    gradient: ['#ff6b35', '#ff8c69', '#ffa500', '#ffb347', '#ffd700']
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = 'primary' }) => (
    <motion.div
      className={`stat-card stat-card-${color}`}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <motion.button
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={() => onClick(id)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="analytics-container">
        <div className="analytics-loading">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Activity size={48} />
          </motion.div>
          <p>Loading your movie analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-container">
        <div className="analytics-empty">
          <Film size={64} />
          <h2>No Analytics Data Yet</h2>
          <p>Start watching movies to see your personal analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="analytics-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="analytics-header">
        <div className="analytics-title">
          <h1>Your Movie Analytics</h1>
          <p>Discover your viewing patterns and preferences</p>
        </div>
        <div className="analytics-actions">
          <motion.button
            className="action-btn secondary"
            onClick={() => analyticsService.exportData()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={20} />
            Export Data
          </motion.button>
          <motion.button
            className="action-btn danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all analytics data?')) {
                analyticsService.clearData();
                loadAnalytics();
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={20} />
            Clear Data
          </motion.button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <StatCard
          icon={Eye}
          title="Movies Watched"
          value={analyticsData.totalMoviesViewed}
          subtitle="Total movies viewed"
          color="primary"
        />
        <StatCard
          icon={Clock}
          title="Time Spent"
          value={`${analyticsData.timeSpentWatching}h`}
          subtitle="Hours watching movies"
          color="secondary"
        />
        <StatCard
          icon={Award}
          title="Current Streak"
          value={`${analyticsData.currentStreak} days`}
          subtitle={`Longest: ${analyticsData.longestStreak} days`}
          color="tertiary"
        />
        <StatCard
          icon={Star}
          title="Avg Rating Preference"
          value={analyticsData.avgRatingPreference}
          subtitle="Preferred movie ratings"
          color="primary"
        />
        <StatCard
          icon={Film}
          title="Favorite Genre"
          value={analyticsData.favoriteGenre}
          subtitle="Most watched genre"
          color="secondary"
        />
        <StatCard
          icon={Target}
          title="Recommendation Accuracy"
          value={`${analyticsData.recommendationAccuracy}%`}
          subtitle="How well we know your taste"
          color="tertiary"
        />
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        <TabButton
          id="overview"
          label="Overview"
          isActive={activeTab === 'overview'}
          onClick={setActiveTab}
        />
        <TabButton
          id="viewing"
          label="Viewing Patterns"
          isActive={activeTab === 'viewing'}
          onClick={setActiveTab}
        />
        <TabButton
          id="preferences"
          label="Preferences"
          isActive={activeTab === 'preferences'}
          onClick={setActiveTab}
        />
        <TabButton
          id="insights"
          label="Insights"
          isActive={activeTab === 'insights'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        className="tab-content"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="chart-grid">
              <div className="chart-container">
                <h3>Daily Viewing Activity (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.viewsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke={chartColors.primary}
                      fill={chartColors.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Top Genres</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.topGenres}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="genre"
                    >
                      {analyticsData.topGenres.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors.gradient[index % chartColors.gradient.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'viewing' && (
          <div className="viewing-tab">
            <div className="chart-grid">
              <div className="chart-container full-width">
                <h3>Weekly Viewing Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.viewsByWeek}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke={chartColors.primary}
                      strokeWidth={3}
                      dot={{ fill: chartColors.primary, strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Viewing Times (Hour of Day)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.viewingTimes.filter(time => time.views > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" fill={chartColors.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-tab">
            <div className="preferences-grid">
              <div className="preference-section">
                <h3>Recent Searches</h3>
                <div className="search-history">
                  {analyticsData.recentSearches.length > 0 ? (
                    analyticsData.recentSearches.map((search, index) => (
                      <div key={index} className="search-item">
                        <Search size={16} />
                        <span>{search}</span>
                      </div>
                    ))
                  ) : (
                    <p>No recent searches</p>
                  )}
                </div>
              </div>

              <div className="preference-section">
                <h3>Viewing Insights</h3>
                <div className="insights-list">
                  <div className="insight-item">
                    <Calendar size={20} />
                    <div>
                      <strong>Most Active Day:</strong>
                      <span>{analyticsData.mostActiveDay}</span>
                    </div>
                  </div>
                  <div className="insight-item">
                    <Clock size={20} />
                    <div>
                      <strong>Account Age:</strong>
                      <span>{analyticsData.accountAge}</span>
                    </div>
                  </div>
                  <div className="insight-item">
                    <TrendingUp size={20} />
                    <div>
                      <strong>Longest Streak:</strong>
                      <span>{analyticsData.longestStreak} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-tab">
            <div className="insights-grid">
              <motion.div
                className="insight-card"
                whileHover={{ scale: 1.02 }}
              >
                <h3>🎬 Your Movie Personality</h3>
                <p>
                  Based on your viewing patterns, you're a <strong>{analyticsData.favoriteGenre}</strong> enthusiast
                  who prefers quality content with an average rating of <strong>{analyticsData.avgRatingPreference}</strong>.
                </p>
              </motion.div>

              <motion.div
                className="insight-card"
                whileHover={{ scale: 1.02 }}
              >
                <h3>📊 Viewing Habits</h3>
                <p>
                  You're most active on <strong>{analyticsData.mostActiveDay}</strong>s and have maintained
                  a <strong>{analyticsData.currentStreak}-day</strong> viewing streak. Our recommendations
                  match your taste <strong>{analyticsData.recommendationAccuracy}%</strong> of the time!
                </p>
              </motion.div>

              <motion.div
                className="insight-card"
                whileHover={{ scale: 1.02 }}
              >
                <h3>🏆 Achievements</h3>
                <div className="achievements">
                  {analyticsData.totalMoviesViewed >= 10 && (
                    <div className="achievement">🎯 Movie Explorer - Watched 10+ movies</div>
                  )}
                  {analyticsData.longestStreak >= 7 && (
                    <div className="achievement">🔥 Week Warrior - 7-day viewing streak</div>
                  )}
                  {analyticsData.topGenres.length >= 5 && (
                    <div className="achievement">🌟 Genre Hopper - Explored 5+ genres</div>
                  )}
                  {analyticsData.recommendationAccuracy >= 80 && (
                    <div className="achievement">🎭 Taste Master - 80%+ recommendation accuracy</div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="insight-card"
                whileHover={{ scale: 1.02 }}
              >
                <h3>📈 Monthly Progress</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analyticsData.viewsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke={chartColors.primary}
                      fill={chartColors.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
