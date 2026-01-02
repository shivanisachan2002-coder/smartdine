import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_API;
const REFRESH_URL = process.env.REACT_APP_REFRESH_TOKEN_URL;

// Token helpers for user tokens
const getAccess = () => localStorage.getItem("user_access_token");
const setAccess = (t) => localStorage.setItem("user_access_token", t);
const getRefresh = () => localStorage.getItem("user_refresh_token");

// Axios instance for user API
const UserApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Attach access token to each request
UserApi.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// Token refreshing logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

UserApi.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefresh();

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/smartdine-/#/user-login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return UserApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${REFRESH_URL}refresh/`,
          { refresh: refreshToken }
        );

        const newToken = res.data.access;
        setAccess(newToken);
        processQueue(null, newToken);
        isRefreshing = false;

        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return UserApi(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        localStorage.clear();
        window.location.href = "/smartdine-/#/user-login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default UserApi;
