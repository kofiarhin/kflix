const User = require("../models/User");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TOP_RATED_VOTE_COUNT_MIN = 300;

const DEFAULT_PREFERENCES = {
  favoriteGenres: [],
  contentType: "both",
  discoveryStyle: "popular",
};

const buildSortBy = (discoveryStyle, mediaType) => {
  if (discoveryStyle === "top_rated") {
    return "vote_average.desc";
  }

  if (discoveryStyle === "new") {
    if (mediaType === "movie") {
      return "release_date.desc";
    }

    return "first_air_date.desc";
  }

  return "popularity.desc";
};

const buildDiscoverParams = (preferences, mediaType) => {
  const params = new URLSearchParams({
    language: "en-US",
    include_adult: "false",
    sort_by: buildSortBy(preferences.discoveryStyle, mediaType),
    page: "1",
  });

  if (preferences.favoriteGenres.length > 0) {
    params.set("with_genres", preferences.favoriteGenres.join(","));
  }

  if (preferences.discoveryStyle === "top_rated") {
    params.set("vote_count.gte", String(TOP_RATED_VOTE_COUNT_MIN));
  }

  return params;
};

const normalizeResult = (item, mediaType) => {
  const title = mediaType === "movie" ? item.title : item.name;
  const releaseDate = mediaType === "movie" ? item.release_date : item.first_air_date;

  return {
    id: item.id,
    mediaType,
    title: title || "Untitled",
    posterPath: item.poster_path || "",
    backdropPath: item.backdrop_path || "",
    overview: item.overview || "",
    releaseDate: releaseDate || "",
    voteAverage: Number(item.vote_average) || 0,
  };
};

const interleaveResults = (movies, series) => {
  const merged = [];
  const maxLength = Math.max(movies.length, series.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (movies[index]) {
      merged.push(movies[index]);
    }

    if (series[index]) {
      merged.push(series[index]);
    }
  }

  return merged;
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

const fetchDiscoverResults = async (mediaType, preferences) => {
  const params = buildDiscoverParams(preferences, mediaType);
  const requestConfig = getTmdbRequestConfig(params);

  const endpoint = `${TMDB_BASE_URL}/discover/${mediaType}?${requestConfig.params.toString()}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: requestConfig.headers,
  });

  if (!response.ok) {
    throw new Error(`TMDB discover ${mediaType} request failed`);
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map((item) => normalizeResult(item, mediaType));
};

const normalizePreferences = (preferences) => {
  if (!preferences) {
    return DEFAULT_PREFERENCES;
  }

  return {
    favoriteGenres: Array.isArray(preferences.favoriteGenres)
      ? preferences.favoriteGenres
      : [],
    contentType: ["movie", "tv", "both"].includes(preferences.contentType)
      ? preferences.contentType
      : "both",
    discoveryStyle: ["popular", "top_rated", "new"].includes(preferences.discoveryStyle)
      ? preferences.discoveryStyle
      : "popular",
  };
};

const hasMeaningfulPreferences = (preferences) => {
  return preferences.favoriteGenres.length > 0;
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

  if (!hasMeaningfulPreferences(preferences)) {
    return res.status(200).json({
      success: true,
      data: [],
      preferencesConfigured: false,
      message: "Preferences are not configured yet",
    });
  }

  try {
    const shouldFetchMovies = preferences.contentType === "movie" || preferences.contentType === "both";
    const shouldFetchSeries = preferences.contentType === "tv" || preferences.contentType === "both";

    let movieResults = [];
    let tvResults = [];

    if (shouldFetchMovies) {
      movieResults = await fetchDiscoverResults("movie", preferences);
    }

    if (shouldFetchSeries) {
      tvResults = await fetchDiscoverResults("tv", preferences);
    }

    let recommendations = [];

    if (preferences.contentType === "movie") {
      recommendations = movieResults;
    } else if (preferences.contentType === "tv") {
      recommendations = tvResults;
    } else {
      recommendations = interleaveResults(movieResults, tvResults);
    }

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
