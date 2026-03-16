import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GENRE_LOOKUP } from "../../constants/genres";
import { usePreferences } from "../../context/PreferencesContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const CONTENT_TYPE_LABELS = {
  movie: "Movies",
  tv: "Series",
  both: "Movies & Series",
};

const DISCOVERY_STYLE_LABELS = {
  popular: "Popular right now",
  top_rated: "Top rated",
  new: "New releases",
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

const getPosterUrl = (posterPath) => {
  return posterPath ? `${TMDB_IMAGE_BASE_URL}/w500${posterPath}` : "";
};

const getBackdropUrl = (backdropPath) => {
  return backdropPath ? `${TMDB_IMAGE_BASE_URL}/w780${backdropPath}` : "";
};

const MediaThumbnail = ({ item, title }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const posterUrl = getPosterUrl(item.posterPath);
  const backdropUrl = getBackdropUrl(item.backdropPath);
  const imageUrl = !imageFailed ? posterUrl || backdropUrl : "";

  if (!imageUrl) {
    return (
      <div className="flex h-[360px] w-full flex-col items-center justify-center bg-slate-800 px-4 text-center">
        <span className="mb-2 text-sm font-medium text-slate-200">{title}</span>
        <span className="text-sm text-slate-400">Thumbnail unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={title}
      className="h-[360px] w-full object-cover"
      onError={() => setImageFailed(true)}
      loading="lazy"
    />
  );
};

const ForYou = () => {
  const { preferences } = usePreferences();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [preferencesConfigured, setPreferencesConfigured] = useState(true);

  const selectedGenreNames = useMemo(() => {
    return (preferences?.favoriteGenres || [])
      .map((genreId) => GENRE_LOOKUP.get(genreId)?.name)
      .filter(Boolean);
  }, [preferences]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await request("/api/recommendations/for-you", {
        method: "GET",
      });

      const nextItems = Array.isArray(response?.data) ? response.data : [];

      setItems(nextItems);
      setPreferencesConfigured(response?.preferencesConfigured !== false);
    } catch (err) {
      setError(err.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 h-8 w-44 animate-pulse rounded bg-slate-700/60" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[520px] animate-pulse rounded-xl border border-white/10 bg-slate-900/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h1 className="text-2xl font-bold">Couldn&apos;t load For You picks</h1>
          <p className="mt-2 text-sm text-red-200">{error}</p>
          <button
            type="button"
            onClick={loadRecommendations}
            className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!preferencesConfigured) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold">Your For You feed is empty</h1>
          <p className="mb-6 text-slate-300">
            Select your favorite genres in Settings to personalize your For You
            page.
          </p>
          <Link
            to="/settings"
            className="inline-flex rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">For You</h1>
          <p className="mt-1 text-sm text-slate-300">
            Personalized picks based on your profile.
          </p>
        </div>
        <Link
          to="/settings"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40"
        >
          Edit preferences
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Genres</p>
            {selectedGenreNames.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedGenreNames.slice(0, 6).map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-300">No genres selected</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Content type</p>
            <p className="mt-2 text-sm text-slate-100">
              {CONTENT_TYPE_LABELS[preferences?.contentType] || CONTENT_TYPE_LABELS.both}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Discovery style</p>
            <p className="mt-2 text-sm text-slate-100">
              {DISCOVERY_STYLE_LABELS[preferences?.discoveryStyle] ||
                DISCOVERY_STYLE_LABELS.popular}
            </p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-slate-300">
            We couldn&apos;t find enough results for your selected profile right
            now. Try broadening your genres or switching discovery style.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const title = item.title || item.name || "Untitled";
            const releaseDate = item.releaseDate || item.firstAirDate || "";
            const isSeries = item.mediaType === "tv";
            const detailsPath = isSeries ? `/series/${item.id}` : `/movies/${item.id}`;

            return (
              <Link
                key={`${item.mediaType || "movie"}-${item.id}`}
                to={detailsPath}
                className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 transition hover:scale-[1.01]"
              >
                <MediaThumbnail item={item} title={title} />

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-1 text-lg font-semibold">{title}</h2>
                    <span className="shrink-0 rounded bg-white/10 px-2 py-1 text-xs text-slate-300">
                      {isSeries ? "Series" : "Movie"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300">
                    {releaseDate || "Release date unavailable"}
                  </p>

                  {Number(item.voteAverage) > 0 && (
                    <p className="text-sm text-slate-200">
                      Rating: {Number(item.voteAverage).toFixed(1)}
                    </p>
                  )}

                  <p className="line-clamp-4 text-sm text-slate-300">
                    {item.overview || "No overview available."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ForYou;
