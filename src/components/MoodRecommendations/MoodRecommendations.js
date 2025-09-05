import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import MovieGrid from '../MovieGrid/MovieGrid';
import './MoodRecommendations.css';

const MOOD_DESCRIPTIONS = {
  romantic: "Love is in the air! Discover heartwarming romantic films",
  thrilling: "Get your adrenaline pumping with these edge-of-your-seat thrillers",
  funny: "Laugh out loud with these hilarious comedies",
  mysterious: "Unravel secrets and solve puzzles with these mysterious tales",
  adventurous: "Embark on epic journeys and thrilling adventures",
  inspiring: "Uplift your spirits with these motivational stories",
  relaxing: "Unwind with these calm and peaceful films",
  energetic: "High-energy action films to get your blood pumping",
  nostalgic: "Take a trip down memory lane with these classic films",
  dramatic: "Powerful performances and emotional storytelling",
  futuristic: "Explore the possibilities of tomorrow with sci-fi films",
  scary: "Spine-chilling horror films for the brave-hearted"
};

const MoodRecommendations = () => {
  const { mood } = useParams();
  const { getMoviesByMood, movies, loading } = useMovies();

  useEffect(() => {
    if (mood) {
      getMoviesByMood(mood);
    }
  }, [mood, getMoviesByMood]);

  const moodTitle = mood?.charAt(0).toUpperCase() + mood?.slice(1) || 'Mood';
  const description = MOOD_DESCRIPTIONS[mood] || "Discover movies that match your mood";

  return (
    <motion.div
      className="mood-recommendations"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="mood-header">
          <motion.h1 
            className="mood-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {moodTitle} Movies
          </motion.h1>
          <motion.p 
            className="mood-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {description}
          </motion.p>
          {!loading && (
            <motion.p 
              className="mood-count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {movies.length} {movies.length === 1 ? 'movie' : 'movies'} found
            </motion.p>
          )}
        </div>
      </div>
      <MovieGrid />
    </motion.div>
  );
};

export default MoodRecommendations;
