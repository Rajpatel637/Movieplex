import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="theme-icon"
        initial={false}
        animate={{ 
          rotate: isDarkMode ? 0 : 180,
          scale: 1
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        {isDarkMode ? (
          <Moon size={20} className="icon-moon" />
        ) : (
          <Sun size={20} className="icon-sun" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
