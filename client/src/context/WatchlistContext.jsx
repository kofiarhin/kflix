/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const WatchlistContext = createContext(null);

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
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const WatchlistProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWatchlist([]);
      setError("");
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError("");
      const response = await request("/api/watchlist", { method: "GET" });
      const items = Array.isArray(response.data) ? response.data : [];
      setWatchlist(items);
      return items;
    } catch (err) {
      if (err.status === 401) {
        setWatchlist([]);
        setError("");
        return [];
      }

      setError(err.message || "Failed to fetch watchlist");
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setWatchlist([]);
      setError("");
      setLoading(false);
      return;
    }

    fetchWatchlist();
  }, [authLoading, isAuthenticated, fetchWatchlist]);

  const isInWatchlist = useCallback(
    (tmdbId, mediaType) => {
      const normalizedTmdbId = Number(tmdbId);
      return watchlist.some(
        (item) => item.tmdbId === normalizedTmdbId && item.mediaType === mediaType,
      );
    },
    [watchlist],
  );

  const addToWatchlist = useCallback(async (payload) => {
    const normalizedPayload = {
      tmdbId: Number(payload.tmdbId),
      mediaType: payload.mediaType,
      title: payload.title,
      posterPath: payload.posterPath || "",
      backdropPath: payload.backdropPath || "",
      overview: payload.overview || "",
      releaseDate: payload.releaseDate || "",
      voteAverage: Number(payload.voteAverage) || 0,
    };

    if (
      watchlist.some(
        (item) =>
          item.tmdbId === normalizedPayload.tmdbId &&
          item.mediaType === normalizedPayload.mediaType,
      )
    ) {
      return { success: true, message: "Already in watchlist", data: watchlist };
    }

    const response = await request("/api/watchlist", {
      method: "POST",
      body: JSON.stringify(normalizedPayload),
    });

    const items = Array.isArray(response.data?.watchlist)
      ? response.data.watchlist
      : watchlist;

    setWatchlist(items);
    setError("");
    return response;
  }, [watchlist]);

  const removeFromWatchlist = useCallback(async (tmdbId, mediaType) => {
    const response = await request(
      `/api/watchlist/${mediaType}/${Number(tmdbId)}`,
      { method: "DELETE" },
    );

    const items = Array.isArray(response.data) ? response.data : [];
    setWatchlist(items);
    setError("");
    return response;
  }, []);

  const value = useMemo(
    () => ({
      watchlist,
      loading,
      error,
      fetchWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
    }),
    [
      watchlist,
      loading,
      error,
      fetchWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
    ],
  );

  return (
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }

  return context;
};
