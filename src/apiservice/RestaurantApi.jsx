// RestaurantApi.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_API;
const REFRESH_URL = process.env.REACT_APP_REFRESH_TOKEN_URL;

// Token helpers
const getAccess = () => localStorage.getItem("restaurant_access_token");
const setAccess = (t) => localStorage.setItem("restaurant_access_token", t);
const getRefresh = () => localStorage.getItem("restaurant_refresh_token");

// Axios instance
const RestaurantApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Attach access token to each request
RestaurantApi.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// Token refreshing logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

RestaurantApi.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefresh();

      // No refresh token → logout immediately
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/smartdine-/#/restaurant-login";
        return Promise.reject(error);
      }

      // Queue requests if refresh in progress
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return RestaurantApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Start refreshing token
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${REFRESH_URL}refresh/`, {
          refresh: refreshToken,
        });

        const newToken = res.data.access;
        setAccess(newToken);

        processQueue(null, newToken);
        isRefreshing = false;

        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return RestaurantApi(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        // Clear tokens and logout on refresh failure
        localStorage.clear();
        window.location.href = "/smartdine-/#/restaurant-login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default RestaurantApi;
