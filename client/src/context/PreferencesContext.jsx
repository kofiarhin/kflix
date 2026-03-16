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

const PreferencesContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VALID_CONTENT_TYPES = new Set(["movie", "tv", "both"]);
const VALID_DISCOVERY_STYLES = new Set(["popular", "top_rated", "new"]);

const DEFAULT_PREFERENCES = {
  favoriteGenres: [],
  contentType: "both",
  discoveryStyle: "popular",
};

const sanitizeFavoriteGenres = (favoriteGenres) => {
  const numericGenres = favoriteGenres
    .map((genreId) => Number(genreId))
    .filter((genreId) => Number.isInteger(genreId) && genreId > 0);

  return [...new Set(numericGenres)];
};

const normalizePreferences = (preferences) => {
  return {
    favoriteGenres: Array.isArray(preferences?.favoriteGenres)
      ? sanitizeFavoriteGenres(preferences.favoriteGenres)
      : [],
    contentType: VALID_CONTENT_TYPES.has(preferences?.contentType)
      ? preferences.contentType
      : DEFAULT_PREFERENCES.contentType,
    discoveryStyle: VALID_DISCOVERY_STYLES.has(preferences?.discoveryStyle)
      ? preferences.discoveryStyle
      : DEFAULT_PREFERENCES.discoveryStyle,
  };
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

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const PreferencesProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetPreferencesState = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    setLoading(false);
    setSaving(false);
    setError("");
  }, []);

  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      resetPreferencesState();
      return DEFAULT_PREFERENCES;
    }

    try {
      setLoading(true);
      setError("");
      const response = await request("/api/preferences", { method: "GET" });
      const nextPreferences = normalizePreferences(response.data);
      setPreferences(nextPreferences);
      return nextPreferences;
    } catch (err) {
      if (err.status === 401) {
        resetPreferencesState();
        return DEFAULT_PREFERENCES;
      }

      const message = err.message || "Failed to load preferences";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, resetPreferencesState]);

  const updatePreferences = useCallback(
    async (payload) => {
      if (!isAuthenticated) {
        throw new Error("You need to be logged in to update preferences");
      }

      try {
        setSaving(true);
        setError("");

        const nextPayload = normalizePreferences(payload);

        const response = await request("/api/preferences", {
          method: "PUT",
          body: JSON.stringify(nextPayload),
        });

        const nextPreferences = normalizePreferences(response.data);
        setPreferences(nextPreferences);
        return response;
      } catch (err) {
        const message = err.message || "Failed to save preferences";
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      resetPreferencesState();
      return;
    }

    fetchPreferences().catch(() => {});
  }, [authLoading, isAuthenticated, fetchPreferences, resetPreferencesState]);

  const value = useMemo(
    () => ({
      preferences,
      loading,
      saving,
      error,
      fetchPreferences,
      updatePreferences,
      defaultPreferences: DEFAULT_PREFERENCES,
    }),
    [preferences, loading, saving, error, fetchPreferences, updatePreferences],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }

  return context;
};
