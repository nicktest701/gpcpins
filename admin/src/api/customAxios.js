import axios from "axios";

import {
  deleteToken,
  getToken,
  saveAccessToken,
} from "../config/sessionHandler";
import { isOnline } from "../config/detectOnlineStatus";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    if (!isOnline()) {
      return Promise.reject(new Error("Device offline"));
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Shared refresh lock so concurrent 401s only trigger one refresh call ---
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios({
      method: "GET",
      url: `${BASE_URL}/auth/token`,
      withCredentials: true,
    })
      .then((res) => {
        const accessToken = res.data?.accessToken;
        if (!accessToken) {
          throw new Error("No access token returned from refresh endpoint");
        }
        saveAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null; // reset regardless of outcome
      });
  }
  return refreshPromise;
}

// Response interceptor — handle expired token via refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Use 401 for "expired/invalid token" (see note below on backend status codes)
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Avoid loops if the failing call was the refresh call itself
      if (originalRequest.url.includes("/auth/token")) {
        deleteToken();
        window.location.href = "/auth/login?e=true";
        return Promise.reject(error);
      }

      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        deleteToken();
        // window.location.href = "/auth/login?e=true";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
