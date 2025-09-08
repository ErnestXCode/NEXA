// api/axios.js
import axios from "axios";
import { logOut, setCredentials } from "../redux/slices/authSlice";
import { store } from "../redux/store";
const apiBaseUrl = import.meta.env.VITE_BACKEND_URL

const api = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  withCredentials: true, // send cookies (refresh token)
});

// Interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: handle 401 errors (expired access token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        // Save new token in Redux
        store.dispatch(setCredentials({ 
          user: store.getState().auth.user, 
          accessToken: newAccessToken 
        }));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        store.dispatch(logOut());
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
