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

const RecentlyViewedContext = createContext(null);

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

export const RecentlyViewedProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecentlyViewed = useCallback(async () => {
    if (!isAuthenticated) {
      setRecentlyViewed([]);
      setError("");
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError("");
      const response = await request("/api/recently-viewed", { method: "GET" });
      const items = Array.isArray(response.data) ? response.data : [];
      setRecentlyViewed(items);
      return items;
    } catch (err) {
      if (err.status === 401) {
        setRecentlyViewed([]);
        setError("");
        return [];
      }

      setError(err.message || "Failed to fetch recently viewed");
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
      setRecentlyViewed([]);
      setError("");
      setLoading(false);
      return;
    }

    fetchRecentlyViewed();
  }, [authLoading, isAuthenticated, fetchRecentlyViewed]);

  const addRecentlyViewed = useCallback(async (payload) => {
    if (!isAuthenticated) {
      return { success: false, message: "Not authenticated", data: [] };
    }

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

    const response = await request("/api/recently-viewed", {
      method: "POST",
      body: JSON.stringify(normalizedPayload),
    });

    const items = Array.isArray(response.data) ? response.data : recentlyViewed;
    setRecentlyViewed(items);
    setError("");
    return response;
  }, [isAuthenticated, recentlyViewed]);

  const value = useMemo(
    () => ({
      recentlyViewed,
      loading,
      error,
      fetchRecentlyViewed,
      addRecentlyViewed,
    }),
    [recentlyViewed, loading, error, fetchRecentlyViewed, addRecentlyViewed],
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);

  if (!context) {
    throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  }

  return context;
};
