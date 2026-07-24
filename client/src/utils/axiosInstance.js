import axios from 'axios';

let inMemoryToken = '';

export const setAccessToken = (token) => {
  inMemoryToken = token;
};

export const getAccessToken = () => {
  return inMemoryToken;
};

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial to send refresh token cookie
});

// Request Interceptor: Attach access token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Keep track of refresh state to prevent multiple refreshes for concurrent requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Catch 401 and try to refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const refreshUrl = `${apiBase}/api/auth/refresh-token`;

      // Avoid infinite loop if refresh token call fails
      if (originalRequest.url === refreshUrl) {
        setAccessToken('');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Direct call to avoid request interceptor matching
        const response = await axios.post(refreshUrl, {}, { withCredentials: true });
        const { token } = response.data;

        setAccessToken(token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        processQueue(null, token);
        isRefreshing = false;
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        setAccessToken('');
        
        // Custom event to notify AuthContext to log out user
        window.dispatchEvent(new Event('auth:unauthorized'));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
