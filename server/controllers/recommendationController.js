const User = require("../models/User");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const VALID_CONTENT_TYPES = new Set(["movie", "tv", "both"]);
const VALID_DISCOVERY_STYLES = new Set(["popular", "top_rated", "new"]);

const DEFAULT_PREFERENCES = {
  favoriteGenres: [],
  contentType: "both",
  discoveryStyle: "popular",
};

const MOVIE_GENRE_IDS = new Set([
  28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878,
  10770, 53, 10752, 37,
]);

const TV_GENRE_IDS = new Set([
  10759, 16, 35, 80, 99, 18, 10751, 9648, 10762, 10763, 10764, 10765, 10766,
  10767, 10768,
]);

const sanitizeFavoriteGenres = (favoriteGenres) => {
  const numericGenres = favoriteGenres
    .map((genreId) => Number(genreId))
    .filter((genreId) => Number.isInteger(genreId) && genreId > 0);

  return [...new Set(numericGenres)];
};

const normalizePreferences = (preferences) => {
  if (!preferences) {
    return DEFAULT_PREFERENCES;
  }

  return {
    favoriteGenres: Array.isArray(preferences.favoriteGenres)
      ? sanitizeFavoriteGenres(preferences.favoriteGenres)
      : [],
    contentType: VALID_CONTENT_TYPES.has(preferences.contentType)
      ? preferences.contentType
      : DEFAULT_PREFERENCES.contentType,
    discoveryStyle: VALID_DISCOVERY_STYLES.has(preferences.discoveryStyle)
      ? preferences.discoveryStyle
      : DEFAULT_PREFERENCES.discoveryStyle,
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

const fetchTmdb = async (endpoint, params) => {
  const requestConfig = getTmdbRequestConfig(params);
  const url = `${TMDB_BASE_URL}${endpoint}?${requestConfig.params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: requestConfig.headers,
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed for ${endpoint}`);
  }

  return response.json();
};

const normalizeMovie = (movie) => ({
  id: movie.id,
  mediaType: "movie",
  title: movie.title || "",
  name: "",
  posterPath: movie.poster_path || "",
  backdropPath: movie.backdrop_path || "",
  overview: movie.overview || "",
  releaseDate: movie.release_date || "",
  firstAirDate: "",
  voteAverage: Number(movie.vote_average) || 0,
  popularity: Number(movie.popularity) || 0,
  genreIds: Array.isArray(movie.genre_ids) ? movie.genre_ids : [],
});

const normalizeSeries = (series) => ({
  id: series.id,
  mediaType: "tv",
  title: "",
  name: series.name || "",
  posterPath: series.poster_path || "",
  backdropPath: series.backdrop_path || "",
  overview: series.overview || "",
  releaseDate: "",
  firstAirDate: series.first_air_date || "",
  voteAverage: Number(series.vote_average) || 0,
  popularity: Number(series.popularity) || 0,
  genreIds: Array.isArray(series.genre_ids) ? series.genre_ids : [],
});

const getLatestDateValue = (item) => {
  const rawDate = item.releaseDate || item.firstAirDate;

  if (!rawDate) return 0;

  const timestamp = new Date(rawDate).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getSortBy = (mediaType, discoveryStyle) => {
  if (discoveryStyle === "top_rated") {
    return "vote_average.desc";
  }

  if (discoveryStyle === "new") {
    return mediaType === "movie"
      ? "primary_release_date.desc"
      : "first_air_date.desc";
  }

  return "popularity.desc";
};

const buildDiscoverParams = (mediaType, genreId, discoveryStyle) => {
  const params = new URLSearchParams({
    language: "en-US",
    include_adult: "false",
    sort_by: getSortBy(mediaType, discoveryStyle),
    page: "1",
    with_genres: String(genreId),
  });

  if (discoveryStyle === "top_rated") {
    params.set("vote_count.gte", "200");
  }

  if (discoveryStyle === "new") {
    const today = new Date().toISOString().slice(0, 10);
    if (mediaType === "movie") {
      params.set("primary_release_date.lte", today);
    } else {
      params.set("first_air_date.lte", today);
    }
  }

  return params;
};

const scoreByDiscoveryStyle = (item, matchingGenreCount, discoveryStyle) => {
  const latestDateValue = getLatestDateValue(item);

  if (discoveryStyle === "top_rated") {
    return (
      matchingGenreCount * 1000 +
      item.voteAverage * 400 +
      item.popularity * 2 +
      latestDateValue / 10000000
    );
  }

  if (discoveryStyle === "new") {
    return (
      latestDateValue / 100000 +
      matchingGenreCount * 1000 +
      item.voteAverage * 150 +
      item.popularity
    );
  }

  return (
    matchingGenreCount * 1000 +
    item.popularity * 8 +
    item.voteAverage * 200 +
    latestDateValue / 10000000
  );
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
  const selectedGenres = preferences.favoriteGenres;

  if (selectedGenres.length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
      preferencesConfigured: false,
      preferences,
      message: "Favorite genres are not configured yet",
    });
  }

  const allowMovies = preferences.contentType === "movie" || preferences.contentType === "both";
  const allowTv = preferences.contentType === "tv" || preferences.contentType === "both";

  const movieGenres = allowMovies
    ? selectedGenres.filter((genreId) => MOVIE_GENRE_IDS.has(genreId))
    : [];
  const tvGenres = allowTv
    ? selectedGenres.filter((genreId) => TV_GENRE_IDS.has(genreId))
    : [];

  if (movieGenres.length === 0 && tvGenres.length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
      preferencesConfigured: false,
      preferences,
      message: "Selected genres are not compatible with your content preference",
    });
  }

  try {
    const movieRequests = movieGenres.map((genreId) =>
      fetchTmdb(
        "/discover/movie",
        buildDiscoverParams("movie", genreId, preferences.discoveryStyle),
      ),
    );

    const tvRequests = tvGenres.map((genreId) =>
      fetchTmdb(
        "/discover/tv",
        buildDiscoverParams("tv", genreId, preferences.discoveryStyle),
      ),
    );

    const [movieResponses, tvResponses] = await Promise.all([
      Promise.all(movieRequests),
      Promise.all(tvRequests),
    ]);

    const scoredMap = new Map();

    const upsertItem = (rawItem, mediaType) => {
      const normalized =
        mediaType === "movie"
          ? normalizeMovie(rawItem)
          : normalizeSeries(rawItem);

      const title = normalized.title || normalized.name;

      if (!normalized.id || !title) {
        return;
      }

      const key = `${normalized.mediaType}-${normalized.id}`;
      const matchingGenreCount = normalized.genreIds.filter((genreId) =>
        selectedGenres.includes(genreId),
      ).length;
      const score = scoreByDiscoveryStyle(
        normalized,
        matchingGenreCount,
        preferences.discoveryStyle,
      );

      if (!scoredMap.has(key)) {
        scoredMap.set(key, {
          ...normalized,
          score,
          matchingGenreCount,
        });
        return;
      }

      const existing = scoredMap.get(key);

      scoredMap.set(key, {
        ...existing,
        posterPath: existing.posterPath || normalized.posterPath,
        backdropPath: existing.backdropPath || normalized.backdropPath,
        overview: existing.overview || normalized.overview,
        releaseDate: existing.releaseDate || normalized.releaseDate,
        firstAirDate: existing.firstAirDate || normalized.firstAirDate,
        voteAverage: Math.max(existing.voteAverage, normalized.voteAverage),
        popularity: Math.max(existing.popularity, normalized.popularity),
        matchingGenreCount: Math.max(
          existing.matchingGenreCount,
          matchingGenreCount,
        ),
        score: Math.max(existing.score, score),
      });
    };

    for (const response of movieResponses) {
      const results = Array.isArray(response?.results) ? response.results : [];
      results.forEach((item) => upsertItem(item, "movie"));
    }

    for (const response of tvResponses) {
      const results = Array.isArray(response?.results) ? response.results : [];
      results.forEach((item) => upsertItem(item, "tv"));
    }

    const recommendations = Array.from(scoredMap.values())
      .sort((a, b) => b.score - a.score)
      .map(({ score, matchingGenreCount, popularity, genreIds, ...item }) => item);

    return res.status(200).json({
      success: true,
      data: recommendations.slice(0, 40),
      preferencesConfigured: true,
      preferences,
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
