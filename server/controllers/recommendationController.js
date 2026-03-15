const User = require("../models/User");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const DEFAULT_PREFERENCES = {
  favoriteGenres: [],
};

const normalizePreferences = (preferences) => {
  if (!preferences) {
    return DEFAULT_PREFERENCES;
  }

  return {
    favoriteGenres: Array.isArray(preferences.favoriteGenres)
      ? preferences.favoriteGenres
          .map((genreId) => Number(genreId))
          .filter((genreId) => Number.isInteger(genreId) && genreId > 0)
      : [],
  };
};

const normalizeMovie = (movie) => {
  const title = movie.title || "";

  return {
    id: movie.id,
    mediaType: "movie",
    title,
    posterPath: movie.poster_path || "",
    backdropPath: movie.backdrop_path || "",
    overview: movie.overview || "",
    releaseDate: movie.release_date || "",
    voteAverage: Number(movie.vote_average) || 0,
  };
};

const getTmdbRequestConfig = (params) => {
  const bearerToken = process.env.TMDB_BEARER_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (bearerToken) {
    return {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        accept: "application/json",
      },
      params,
    };
  }

  if (apiKey) {
    params.set("api_key", apiKey);
    return {
      headers: {
        accept: "application/json",
      },
      params,
    };
  }

  throw new Error("TMDB credentials are not configured");
};

const fetchMovieRecommendations = async (favoriteGenres) => {
  const params = new URLSearchParams({
    language: "en-US",
    include_adult: "false",
    sort_by: "popularity.desc",
    page: "1",
    with_genres: favoriteGenres.join(","),
  });

  const requestConfig = getTmdbRequestConfig(params);
  const endpoint = `${TMDB_BASE_URL}/discover/movie?${requestConfig.params.toString()}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: requestConfig.headers,
  });

  if (!response.ok) {
    throw new Error("TMDB discover movie request failed");
  }

  const data = await response.json();
  const rawResults = Array.isArray(data.results) ? data.results : [];

  const normalized = rawResults
    .map((movie) => normalizeMovie(movie))
    .filter((movie) => movie.id && movie.title);

  const withPoster = normalized.filter((movie) => movie.posterPath);
  const withoutPoster = normalized.filter((movie) => !movie.posterPath);

  return [...withPoster, ...withoutPoster];
};

const getForYouRecommendations = async (req, res) => {
  const user = await User.findById(req.user._id).select("preferences");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  const preferences = normalizePreferences(user.preferences);

  if (preferences.favoriteGenres.length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
      preferencesConfigured: false,
      message: "Favorite genres are not configured yet",
    });
  }

  try {
    const recommendations = await fetchMovieRecommendations(preferences.favoriteGenres);

    return res.status(200).json({
      success: true,
      data: recommendations,
      preferencesConfigured: true,
      message: "OK",
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "Failed to fetch personalized recommendations",
      code: "RECOMMENDATIONS_FETCH_FAILED",
    });
  }
};

module.exports = {
  getForYouRecommendations,
};
