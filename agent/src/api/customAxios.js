import axios from "axios";
// import { isMobileBrowser } from "../config/isMobileBrowser";
import {
  deleteToken,
  deleteUser,
  getRefreshToken,
  getToken,
  saveAccessToken,
} from "../config/sessionHandler";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  // headers: {
  //   Connection: 'keep-alive'
  // }
});

api.defaults.withCredentials = true;

// Set a common authorization header for all requests
api.interceptors.request.use(
  (config) => {
    // if (isMobPsiileBrowser()) {

    // }
    const token = getToken();
    // console.log(token);
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
    const originalRequest = error.config;

    if ([401, 403].includes(error.response.status) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        // Initiate token refresh
        const res = await axios({
          method: "GET",
          url: `${BASE_URL}/agents/auth/token`,
          withCredentials: true,
          headers: {
            Authorization: refreshToken ? `Bearer ${refreshToken}` : "",
          },
        });


        originalRequest.headers.Authorization = `Bearer ${res.data?.accessToken}`;
        saveAccessToken(res.data?.accessToken);



        return api(originalRequest);
      } catch (refreshError) {
        deleteUser();
        deleteToken();

        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
