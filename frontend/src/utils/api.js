import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// In-memory token — cleared on every page refresh/restart
let _token = null;
export const setAuthToken = (token) => { _token = token; };

// Attach JWT on every request from memory (not localStorage)
api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

// Handle 401 — redirect to login (but not for the login endpoint itself)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      _token = null;
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(error);
  }
);

export default api;
