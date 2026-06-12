import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  api,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await api.get("/users/me");
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  // On mount, try to restore a session from the refresh token.
  useEffect(() => {
    (async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await api.post("/auth/refresh", { refresh });
          setAccessToken(data.access);
          if (data.refresh) setRefreshToken(data.refresh);
          await loadMe();
        } catch {
          setRefreshToken(null);
        }
      }
      setLoading(false);
    })();

    const onLogout = () => {
      setUser(null);
      qc.clear();
    };
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [loadMe, qc]);

  const login = async (username, password) => {
    // Drop any previous user's cached data before loading this account.
    qc.clear();
    const { data } = await api.post("/auth/login", { username, password });
    setAccessToken(data.access);
    setRefreshToken(data.refresh);
    await loadMe();
    return data;
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
    return login(payload.username, payload.password);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    qc.clear();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser: loadMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
