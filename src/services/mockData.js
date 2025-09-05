// Mock data for when API limits are reached
export const mockMovies = [
  {
    Title: "The Shawshank Redemption",
    Year: "1994",
    imdbID: "tt0111161",
    Type: "movie",
    Poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
    Plot: "Two imprisoned outcasts bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    Director: "Frank Darabont",
    Genre: "Drama",
    imdbRating: "9.3",
    Released: "14 Oct 1994",
    Runtime: "142 min"
  },
  {
    Title: "The Godfather",
    Year: "1972",
    imdbID: "tt0068646",
    Type: "movie",
    Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzAwNTU2OTM@._V1_SX300.jpg",
    Plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    Director: "Francis Ford Coppola",
    Genre: "Crime, Drama",
    imdbRating: "9.2",
    Released: "24 Mar 1972",
    Runtime: "175 min"
  },
  {
    Title: "The Dark Knight",
    Year: "2008",
    imdbID: "tt0468569",
    Type: "movie",
    Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    Plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    Director: "Christopher Nolan",
    Genre: "Action, Crime, Drama",
    imdbRating: "9.0",
    Released: "18 Jul 2008",
    Runtime: "152 min"
  },
  {
    Title: "Pulp Fiction",
    Year: "1994",
    imdbID: "tt0110912",
    Type: "movie",
    Poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    Plot: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    Director: "Quentin Tarantino",
    Genre: "Crime, Drama",
    imdbRating: "8.9",
    Released: "14 Oct 1994",
    Runtime: "154 min"
  },
  {
    Title: "Forrest Gump",
    Year: "1994",
    imdbID: "tt0109830",
    Type: "movie",
    Poster: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    Plot: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    Director: "Robert Zemeckis",
    Genre: "Drama, Romance",
    imdbRating: "8.8",
    Released: "06 Jul 1994",
    Runtime: "142 min"
  },
  {
    Title: "Inception",
    Year: "2010",
    imdbID: "tt1375666",
    Type: "movie",
    Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    Plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    Director: "Christopher Nolan",
    Genre: "Action, Sci-Fi, Thriller",
    imdbRating: "8.8",
    Released: "16 Jul 2010",
    Runtime: "148 min"
  },
  {
    Title: "The Matrix",
    Year: "1999",
    imdbID: "tt0133093",
    Type: "movie",
    Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    Plot: "A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.",
    Director: "Lana Wachowski, Lilly Wachowski",
    Genre: "Action, Sci-Fi",
    imdbRating: "8.7",
    Released: "31 Mar 1999",
    Runtime: "136 min"
  },
  {
    Title: "Goodfellas",
    Year: "1990",
    imdbID: "tt0099685",
    Type: "movie",
    Poster: "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjA4YTQyYzY2YmI5XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    Plot: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.",
    Director: "Martin Scorsese",
    Genre: "Biography, Crime, Drama",
    imdbRating: "8.7",
    Released: "21 Sep 1990",
    Runtime: "146 min"
  }
];

export const mockMovieDetails = {
  "tt0111161": {
    Title: "The Shawshank Redemption",
    Year: "1994",
    Rated: "R",
    Released: "14 Oct 1994",
    Runtime: "142 min",
    Genre: "Drama",
    Director: "Frank Darabont",
    Writer: "Stephen King, Frank Darabont",
    Actors: "Tim Robbins, Morgan Freeman, Bob Gunton",
    Plot: "Two imprisoned outcasts bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    Language: "English",
    Country: "United States",
    Awards: "Nominated for 7 Oscars",
    Poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
    Ratings: [
      { Source: "Internet Movie Database", Value: "9.3/10" },
      { Source: "Rotten Tomatoes", Value: "91%" },
      { Source: "Metacritic", Value: "80/100" }
    ],
    Metascore: "80",
    imdbRating: "9.3",
    imdbVotes: "2,500,000",
    imdbID: "tt0111161",
    Type: "movie",
    DVD: "N/A",
    BoxOffice: "$16,270,000",
    Production: "N/A",
    Website: "N/A",
    Response: "True"
  }
};

export const getMockMoviesByMood = (mood) => {
  const moodMap = {
    happy: mockMovies.filter(m => ["Forrest Gump", "The Shawshank Redemption"].includes(m.Title)),
    sad: mockMovies.filter(m => ["The Shawshank Redemption", "Forrest Gump"].includes(m.Title)),
    excited: mockMovies.filter(m => ["The Dark Knight", "Inception", "The Matrix"].includes(m.Title)),
    romantic: mockMovies.filter(m => ["Forrest Gump"].includes(m.Title)),
    adventurous: mockMovies.filter(m => ["Inception", "The Matrix"].includes(m.Title)),
    nostalgic: mockMovies.filter(m => ["The Godfather", "Goodfellas", "Pulp Fiction"].includes(m.Title))
  };
  
  return moodMap[mood] || mockMovies.slice(0, 4);
};
