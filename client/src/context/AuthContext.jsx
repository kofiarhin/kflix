/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const request = async (endpoint, options = {}) => {
  const isFormDataBody = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await request("/api/auth/me", { method: "GET" });
      setUser(response.data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = useCallback(async (payload) => {
    const response = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setUser(response.data || null);
    return response;
  }, []);

  const login = useCallback(async (payload) => {
    const response = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setUser(response.data || null);
    return response;
  }, []);

  const logout = useCallback(async () => {
    await request("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const response = await request("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    setUser(response.data || null);
    return response;
  }, []);

  const uploadProfileImage = useCallback(async (formData) => {
    const response = await request("/api/auth/profile-image", {
      method: "PATCH",
      body: formData,
    });

    setUser(response.data || null);
    return response;
  }, []);

  const removeProfileImage = useCallback(async () => {
    const response = await request("/api/auth/profile-image", {
      method: "DELETE",
    });

    setUser(response.data || null);
    return response;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      checkAuth,
      updateProfile,
      uploadProfileImage,
      removeProfileImage,
    }),
    [
      user,
      loading,
      register,
      login,
      logout,
      checkAuth,
      updateProfile,
      uploadProfileImage,
      removeProfileImage,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
