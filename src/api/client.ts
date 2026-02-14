import axios from "axios";

/**
 * API Client for Storefront Public Endpoints
 *
 * Unlike the main dashboard app, the storefront doesn't require authentication.
 * All endpoints used here are public and accessible without tokens.
 */

// Get API base URL from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - just for logging in development
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors gracefully
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error("[API Error]", error.response?.data || error.message);
    }

    // For storefront, we don't redirect on auth errors since it's public
    // Just reject the promise and let components handle it
    return Promise.reject(error);
  },
);

export default apiClient;
