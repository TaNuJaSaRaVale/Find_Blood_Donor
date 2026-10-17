import axios from 'axios';

export const TOKEN_KEY = 'raktsetu_token';

/**
 * One axios instance for the whole app.
 * VITE_API_URL lets the same code talk to a hosted API (needed for the mobile app later).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any failure into a friendly `error.message`
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      error.message = error.response.data?.message || `Request failed (${error.response.status})`;
      if (error.response.status === 401) window.dispatchEvent(new Event('raktsetu:unauthorized'));
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'The server took too long to respond';
    } else {
      error.message = 'Cannot reach the server. Is the backend running on port 5000?';
    }
    return Promise.reject(error);
  },
);

export default api;
