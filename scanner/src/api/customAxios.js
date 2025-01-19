import axios from "axios";


import {
  deleteToken,
  getRefreshToken,
  getToken,
  saveAccessToken,

} from "../config/sessionHandler";
import { isOnline } from "../config/detectOnlineStatus";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.defaults.withCredentials = true;
api.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;


// Set a common authorization header for all requests
api.interceptors.request.use(
  (config) => {
    if (!isOnline()) {
      throw new Error("Device offline");
    }

    const token = getToken();
    config.headers.Authorization = token ? `Bearer ${token}` : '';
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
    const originalRequest = error.config;

    if (
      [403].includes(error?.response?.status) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        // Initiate token refresh
        const res = await axios({
          method: "GET",
          url: `${BASE_URL}/verifiers/auth/token`,
          withCredentials: true,
          headers: {
            Authorization: refreshToken ? `Bearer ${refreshToken}` : "",
          },
        });


        saveAccessToken(res.data?.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data?.accessToken}`;

        // Retry the original request with the new access token
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = "/auth/login?e=true";
        deleteToken();
        //  deleteToken();
        // Handle token refresh failure, possibly redirect to login page
        // console.log('Token refresh failed:', refreshError?.message);
        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);

export default api;
