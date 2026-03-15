import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [preferencesConfigured, setPreferencesConfigured] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError("");
        }

        const response = await request("/api/recommendations/for-you", {
          method: "GET",
        });

        if (!isMounted) return;

        const nextItems = Array.isArray(response?.data) ? response.data : [];

        setItems(nextItems);
        setPreferencesConfigured(response?.preferencesConfigured !== false);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load recommendations");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Loading personalized picks...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-300">{error}</div>;
  }

  if (!preferencesConfigured) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold">
            Your For You feed is empty
          </h1>
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

  if (items.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-2 text-2xl font-bold">For You</h1>
        <p className="text-slate-300">
          We couldn&apos;t find results for your selected genres. Try updating
          your preferences in Settings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">For You</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const title = item.title || item.name || "Untitled";
          const releaseDate = item.releaseDate || item.firstAirDate || "";
          const isSeries = item.mediaType === "tv";
          const detailsPath = isSeries
            ? `/series/${item.id}`
            : `/movies/${item.id}`;

          return (
            <Link
              key={`${item.mediaType || "movie"}-${item.id}`}
              to={detailsPath}
              className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 transition hover:scale-[1.01]"
            >
              <MediaThumbnail item={item} title={title} />

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-1 text-lg font-semibold">
                    {title}
                  </h2>
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
    </div>
  );
};

export default ForYou;
