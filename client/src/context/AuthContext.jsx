import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

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

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      checkAuth,
    }),
    [user, loading, register, login, logout, checkAuth],
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
