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
let isLoggingOut = false;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api({
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

function forceLogout(reason) {
  if (isLoggingOut) return; // avoid duplicate redirects from parallel failing requests
  isLoggingOut = true;
  deleteToken();
  // Optional: let the rest of the app know, e.g. to clear React state/context
  window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason } }));
  window.location.href = `/?e=true&reason=${reason}`;
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
        forceLogout("session_expired");
        return Promise.reject(error);
      }

      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        forceLogout("session_expired");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;




// import axios from "axios";
// // import { isMobileBrowser } from "../config/isMobileBrowser";
// import {
//   deleteToken,
//   getToken,
//   saveAccessToken,
// } from "../config/sessionHandler";
// import { isOnline } from "../config/detectOnlineStatus";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const api = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });

// api.defaults.withCredentials = true;

// // Set a common authorization header for all requests
// api.interceptors.request.use(
//   (config) => {
//     if (!isOnline()) {
//       throw new Error("Device offline");
//     }

//     const token = getToken();

//     if (token) {
//       // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     // Do something with request error
//     return Promise.reject(error);
//   },
// );

// // Response interceptor to handle token expiration and refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.isAxiosError && error.code === "ECONNABORTED") {
//       console.warn("Request aborted due to offline device");
//       // window.location.href = "/offline";
//     } else {
//       const originalRequest = error.config;

//       if ([401].includes(error?.response?.status) && !originalRequest._retry) {
//         originalRequest._retry = true;

//         try {
   

//           // Initiate token refresh
//           const res = await axios({
//             method: "GET",
//             url: `${BASE_URL}/auth/token`,
//             withCredentials: true,
//           });

//           // if (isMobileBrowser()) {
//           originalRequest.headers.Authorization = `Bearer ${res.data?.accessToken}`;
//           saveAccessToken(res.data?.accessToken);
//           // }
//           // Retry the original request with the new access token
//           return api(originalRequest);
//         } catch (refreshError) {
//           deleteToken();

//           window.location.href = "/";
//           return Promise.reject(refreshError);
//         }
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default api;
