import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Zap, 
  Smile, 
  Brain, 
  Compass, 
  Star, 
  Moon, 
  Sun,
  Coffee,
  Mountain,
  Wind,
  Flame
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { analyticsService } from '../../services/analyticsService';
import './MoodSelector.css';

const MOODS = [
  { id: 'romantic', label: 'Romantic', icon: Heart, color: '#ff6b9d', keywords: ['romance', 'love'] },
  { id: 'thrilling', label: 'Thrilling', icon: Zap, color: '#ffc107', keywords: ['thriller', 'suspense'] },
  { id: 'funny', label: 'Funny', icon: Smile, color: '#4ecdc4', keywords: ['comedy', 'humor'] },
  { id: 'mysterious', label: 'Mysterious', icon: Brain, color: '#9b59b6', keywords: ['mystery', 'puzzle'] },
  { id: 'adventurous', label: 'Adventurous', icon: Compass, color: '#e67e22', keywords: ['adventure', 'action'] },
  { id: 'inspiring', label: 'Inspiring', icon: Star, color: '#f39c12', keywords: ['inspiring', 'uplifting'] },
  { id: 'relaxing', label: 'Relaxing', icon: Moon, color: '#3498db', keywords: ['calm', 'peaceful'] },
  { id: 'energetic', label: 'Energetic', icon: Sun, color: '#ff6b35', keywords: ['action', 'dynamic'] },
  { id: 'nostalgic', label: 'Nostalgic', icon: Coffee, color: '#8d6e63', keywords: ['retro', 'vintage'] },
  { id: 'dramatic', label: 'Dramatic', icon: Mountain, color: '#607d8b', keywords: ['drama', 'intense'] },
  { id: 'futuristic', label: 'Futuristic', icon: Wind, color: '#00bcd4', keywords: ['sci-fi', 'future'] },
  { id: 'scary', label: 'Scary', icon: Flame, color: '#f44336', keywords: ['horror', 'fear'] }
];

const MoodSelector = () => {
  const navigate = useNavigate();
  const { getMoviesByMood } = useMovies();

  const handleMoodSelect = async (mood) => {
    // Track mood selection
    analyticsService.trackMoodSelection(mood.id);
    await getMoviesByMood(mood.id);
    navigate(`/mood/${mood.id}`);
  };

  return (
    <div className="mood-selector">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mood-header"
      >
        <h2 className="mood-title">What's your mood today?</h2>
        <p className="mood-subtitle">Discover movies that match your current vibe</p>
      </motion.div>

      <motion.div
        className="mood-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {MOODS.map((mood, index) => {
          const IconComponent = mood.icon;
          return (
            <motion.button
              key={mood.id}
              className="mood-card"
              onClick={() => handleMoodSelect(mood)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                boxShadow: `0 20px 40px ${mood.color}20`
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                '--mood-color': mood.color,
                '--mood-color-light': `${mood.color}20`,
                '--mood-color-dark': `${mood.color}40`
              }}
            >
              <div className="mood-icon">
                <IconComponent size={24} />
              </div>
              <span className="mood-label">{mood.label}</span>
              <div className="mood-glow"></div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default MoodSelector;
