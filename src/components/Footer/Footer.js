import React from 'react';
import { motion } from 'framer-motion';
import { Film, Heart, Github, Twitter, Instagram, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-section">
            <div className="footer-logo">
              <Film className="footer-logo-icon" />
              <span className="footer-logo-text">Movieplex</span>
            </div>
            <p className="footer-description">
              Discover amazing movies based on your mood. Your perfect movie night starts here.
            </p>
            <div className="footer-social">
              <motion.a 
                href="#" 
                className="social-link"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="social-link"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="social-link"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="social-link"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mail size={20} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/mood/trending">Trending</a></li>
              <li><a href="/mood/popular">Popular</a></li>
              <li><a href="/mood/top-rated">Top Rated</a></li>
            </ul>
          </div>

          {/* Genres */}
          <div className="footer-section">
            <h4 className="footer-title">Genres</h4>
            <ul className="footer-links">
              <li><a href="/mood/action">Action</a></li>
              <li><a href="/mood/comedy">Comedy</a></li>
              <li><a href="/mood/drama">Drama</a></li>
              <li><a href="/mood/horror">Horror</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              © 2025 Movieplex. Made with <Heart size={16} className="heart-icon" /> for movie lovers.
            </p>
          </div>
          <div className="footer-credits">
            <p>Powered by The Movie Database API</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
