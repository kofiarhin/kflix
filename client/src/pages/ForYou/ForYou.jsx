import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const getPosterUrl = (posterPath) => {
  return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : "";
};

const ForYou = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [preferencesConfigured, setPreferencesConfigured] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await request("/api/recommendations/for-you", {
          method: "GET",
        });

        setItems(Array.isArray(response.data) ? response.data : []);
        setPreferencesConfigured(Boolean(response.preferencesConfigured));
      } catch (err) {
        setError(err.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return <div className="p-6">Loading personalized movie picks...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-300">{error}</div>;
  }

  if (!preferencesConfigured) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold">Your For You feed is empty</h1>
          <p className="mb-6 text-slate-300">
            Select your favorite genres in Settings to personalize your For You page.
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
          We couldn&apos;t find movies with your current genre selection. Try updating your
          favorite genres in Settings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">For You</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/movies/${item.id}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 transition hover:scale-[1.01]"
          >
            {item.posterPath ? (
              <img
                src={getPosterUrl(item.posterPath)}
                alt={item.title}
                className="h-[360px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[360px] w-full items-center justify-center bg-slate-800 text-sm text-slate-300">
                Poster unavailable
              </div>
            )}

            <div className="space-y-3 p-4">
              <h2 className="line-clamp-1 text-lg font-semibold">{item.title}</h2>

              <p className="text-sm text-slate-300">
                {item.releaseDate || "Release date unavailable"}
              </p>

              {item.voteAverage > 0 && (
                <p className="text-sm text-slate-200">
                  Rating: {Number(item.voteAverage).toFixed(1)}
                </p>
              )}

              <p className="line-clamp-4 text-sm text-slate-300">
                {item.overview || "No overview available."}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ForYou;
