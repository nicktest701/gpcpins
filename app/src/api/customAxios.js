import axios from "axios";
// import { isMobileBrowser } from "../config/isMobileBrowser";
import {
  deleteToken,
  deleteUser,
  getRefreshToken,
  getToken,
  saveAccessToken,
  saveToken,
} from "../config/sessionHandler";
import { isOnline } from "../config/detectOnlineStatus";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.defaults.withCredentials = true;

// Set a common authorization header for all requests
api.interceptors.request.use(
  (config) => {
    if (!isOnline()) {
      throw new Error("Device offline");
    }

    const token = getToken();
    if (token) {
      // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.isAxiosError && error.code === "ECONNABORTED") {
      console.warn("Request aborted due to offline device");
      // window.location.href = "/offline";
    } else {
      const originalRequest = error.config;

      if (
        [401, 403].includes(error?.response?.status) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();

          // Initiate token refresh
          const res = await axios({
            method: "GET",
            url: `${BASE_URL}/users/auth/token`,
            withCredentials: true,
            headers: {
              Authorization: refreshToken ? `Bearer ${refreshToken}` : "",
            },
          });

          // if (isMobileBrowser()) {
          originalRequest.headers.Authorization = `Bearer ${res.data?.accessToken}`;
          saveAccessToken(res.data?.accessToken);
          // }
          // Retry the original request with the new access token
          return api(originalRequest);
        } catch (refreshError) {
          deleteUser();
          deleteToken();

          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
