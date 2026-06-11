import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Access token lives in memory; refresh token in localStorage.
let accessToken = null;
export const setAccessToken = (t) => {
  accessToken = t;
};
export const getAccessToken = () => accessToken;

export const setRefreshToken = (t) => {
  if (t) localStorage.setItem("refresh", t);
  else localStorage.removeItem("refresh");
};
export const getRefreshToken = () => localStorage.getItem("refresh");

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Transparent refresh on 401.
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      getRefreshToken()
    ) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          axios.post(`${BASE_URL}/auth/refresh`, {
            refresh: getRefreshToken(),
          });
        const { data } = await refreshing;
        refreshing = null;
        setAccessToken(data.access);
        if (data.refresh) setRefreshToken(data.refresh);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        setAccessToken(null);
        setRefreshToken(null);
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);
