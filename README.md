# 🎬 Movieplex - Modern Movie Discovery Platform

A comprehensive React-based movie discovery platform with advanced search, filtering, and streaming provider integration. Discover movies, see where to watch them, and build your personal collection with this feature-rich application.

## 🚀 Key Features

### ✨ **Core Functionality**

- **Movie Discovery**: Browse trending, popular, and top-rated movies
- **Advanced Search**: Real-time search with comprehensive filters
- **Movie Details**: Rich movie information pages with cast, crew, and reviews
- **Streaming Providers**: See where to watch, rent, or buy movies (25+ platforms)
- **Favorites & Watchlist**: Personal movie collections with persistent storage
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### 🔍 **Advanced Search & Filtering**

- **19 Genre Filters**: Action, Drama, Comedy, Horror, Sci-Fi, and more
- **Year Range Filter**: Movies from 1900-2024
- **Rating Filter**: Filter by IMDb rating (1-10 scale)
- **Sort Options**: Popularity, Rating, Release Date, Alphabetical
- **URL Persistence**: Shareable filtered search results

### 📺 **Streaming Integration**

- **Global Coverage**: US, UK, Canada, Australia, Germany, France
- **25+ Platforms**: Netflix, Disney+, Prime Video, Hulu, HBO Max, Apple TV+
- **Direct Links**: Click to open movies on streaming platforms
- **Category Organization**: Stream, Rent, Buy options clearly separated

### 🎨 **Modern UI/UX**

- **Dark Theme**: Netflix-inspired design with red accents
- **Glass Morphism**: Modern visual effects and transparency
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Elements**: Hover effects and micro-interactions

## 🛠️ Technology Stack

### **Frontend**

- **React 18**: Modern React with Hooks and functional components
- **React Router**: Client-side routing and navigation
- **Framer Motion**: Advanced animations and transitions
- **Lucide React**: Modern icon library
- **CSS3**: Advanced styling with flexbox, grid, and modern features

### **API Integration**

- **TMDB API**: The Movie Database for comprehensive movie data
- **Firebase**: Authentication and user data storage
- **Firestore**: Real-time database for user preferences and favorites
- **Trailer Service**: YouTube and Vimeo integration for movie trailers
- **Watch Providers**: Real-time streaming platform availability

### **State Management**

- **React Context**: Global state management for user data
- **Custom Hooks**: Reusable logic patterns
- **Local Storage**: Persistent user preferences and favorites

## 📁 Project Structure

```
movieplex/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Auth/            # Authentication components
│   │   ├── EnhancedSearch/  # Advanced search functionality
│   │   ├── Favorites/       # Favorites management
│   │   ├── Header/          # Navigation header
│   │   ├── Hero/            # Landing page hero
│   │   ├── MovieCard/       # Movie display cards
│   │   ├── MovieDetails/    # Detailed movie pages
│   │   ├── MovieGrid/       # Movie grid layouts
│   │   ├── Search/          # Search components
│   │   └── ThemeToggle/     # Theme switching
│   ├── context/             # Global state management
│   │   ├── AuthContext.js
│   │   ├── FavoritesContext.js
│   │   ├── MovieContext.js
│   │   └── ThemeContext.js
│   ├── services/            # API and external services
│   │   ├── movieAPI.js      # TMDB API integration
│   │   ├── authService.js   # Authentication logic
│   │   └── trailerService.js # Video integration
│   ├── App.js              # Main application component
│   ├── index.js            # Application entry point
│   └── App.css             # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## 🚀 Getting Started

### **Prerequisites**

- Node.js (v16 or higher)
- npm or yarn package manager
- TMDB API key (free registration required)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/movieplex.git
   cd movieplex
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
   REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
   REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   ```

4. **Start the development server**

5. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Movieplex
   ```

6. **Install dependencies**

   ```bash
   npm install
   ```

7. **Start the development server**

   ```bash
   npm start
   ```

8. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

## 🔧 API Configuration

### TMDb API Setup

1. **Get your TMDb API key**:

   - Visit [TMDb API](https://www.themoviedb.org/settings/api)
   - Create an account and request an API key

2. **Configure your environment**:
   - Copy `.env.example` to `.env`
   - Add your TMDb API key:
   ```
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
   ```

### API Features

- **Search Movies**: Real movie search by title
- **Movie Details**: Complete movie information including plot, cast, ratings
- **Streaming Providers**: Watch, rent, and buy options by region
- **Mood-Based Filtering**: Intelligent genre-based mood recommendations
- **Similar Movies**: Recommendations based on genre matching
- **Trailers**: YouTube and Vimeo trailer integration

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Analytics/       # Analytics dashboard
│   ├── APIStatus/       # API status monitoring
│   ├── Auth/            # Authentication components
│   ├── EnhancedSearch/  # Advanced search functionality
│   ├── Favorites/       # User favorites management
│   ├── Footer/          # Footer component
│   ├── Header/          # Navigation header
│   ├── Hero/            # Hero section with featured movies
│   ├── MoodSelector/    # Mood selection interface
│   ├── MoodRecommendations/ # Mood-based results
│   ├── MovieCard/       # Individual movie card
│   ├── MovieDetails/    # Detailed movie view with streaming providers
│   ├── MovieGrid/       # Grid layout for movies
│   ├── MovieSections/   # Movie category sections
│   ├── Notification/    # Notification system
│   ├── Search/          # Search functionality
│   ├── ThemeToggle/     # Dark/light theme switcher
│   └── TrailerModal/    # Video trailer modal
├── context/             # React Context for state management
│   ├── AuthContext.js   # Authentication state
│   ├── FavoritesContext.js # Favorites management
│   ├── MovieContext.js  # Global movie state
│   └── ThemeContext.js  # Theme management
├── services/            # API services
│   ├── analyticsService.js # Analytics tracking
│   ├── authService.js   # Authentication service
│   ├── movieAPI.js      # Movie data fetching
│   ├── trailerService.js # Trailer fetching
│   └── vimeoService.js  # Vimeo integration
├── App.js               # Main application component
├── App.css              # Global styles
└── index.js             # Application entry point
```

## Design Features

### Visual Design

- **Dark Theme**: Modern dark color scheme with orange accents
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Gradient Backgrounds**: Beautiful gradient overlays and text effects
- **Responsive Grid**: Auto-adjusting layouts for all screen sizes
- **Clean Icons**: Lucide React icons instead of emojis for a professional look

### Ultra-Smooth Animations

- **Framer Motion**: Advanced spring physics and easing curves
- **Hover Effects**: Scale, rotate, and glow effects with smooth transitions
- **Loading States**: Skeleton loaders with shimmer effects
- **Staggered Animations**: Sequential element appearances with perfect timing
- **Micro-interactions**: Button hover effects with shine animations
- **Page Transitions**: Smooth route changes with fade effects

### Enhanced Animation Features

- **Spring Physics**: Natural feeling bounce and damping
- **Cubic Bezier Easing**: Custom timing functions for organic motion
- **Transform Combinations**: Scale, translate, and rotate in harmony
- **Color Transitions**: Smooth background and border color changes
- **Shadow Animations**: Dynamic box-shadow effects
- **Shimmer Effects**: Beautiful loading animations

### User Experience

- **Intuitive Navigation**: Clear menu structure and breadcrumbs
- **Search & Filter**: Quick access to search functionality
- **Movie Cards**: Rich movie information at a glance
- **Detailed Views**: Comprehensive movie pages with tabs

## 🛠️ Technologies Used

- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Firebase** - Authentication and database
- **Firestore** - Real-time NoSQL database
- **Framer Motion** - Animation library
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library
- **CSS3** - Modern styling with animations

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: 480px to 767px
- **Small Mobile**: Below 480px

## 🔧 Available Scripts

- `npm start` - Runs the development server
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## 🎯 Future Enhancements

- [ ] User authentication and profiles
- [ ] Personal watchlists and favorites
- [ ] Movie ratings and reviews
- [ ] Social sharing features
- [ ] Advanced filtering options
- [ ] Streaming service integration
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDb)](https://www.themoviedb.org/) for providing movie data
- [Unsplash](https://unsplash.com/) for beautiful placeholder images
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Enjoy discovering your next favorite movie! 🍿**
