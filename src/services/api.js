/**
 * Axios API Instance with Interceptors
 * Handles authentication, error handling, and request/response transformation
 */
import axios from 'axios';
import { API_URL } from '../constants/config';
import { TokenStorage } from '../utils/storage';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    // Get access token from storage
    const token = await TokenStorage.getAccessToken();
    
    // Add token to request headers if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    // if (__DEV__) {
    //   console.log('API Request:', {
    //     method: config.method?.toUpperCase(),
    //     url: config.url,
    //     baseURL: config.baseURL,
    //     headers: config.headers,
    //   });
    // }

    return config;
  },
  (error) => {
    // Handle request error
    // console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    // if (__DEV__) {
    //   console.log('API Response:', {
    //     status: response.status,
    //     url: response.config.url,
    //     data: response.data,
    //   });
    // }

    // Return successful response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    // if (__DEV__) {
    //   console.error('API Error:', {
    //     status: error.response?.status,
    //     url: error.config?.url,
    //     message: error.message,
    //     data: error.response?.data,
    //   });
    // }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = await TokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint using base axios instance
        const response = await api.post('refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Save new tokens
        await TokenStorage.setAccessToken(access_token);
        if (newRefreshToken) {
          await TokenStorage.setRefreshToken(newRefreshToken);
        }

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        // console.error('Token refresh failed:', refreshError);
        await TokenStorage.clearTokens();
        
        // You can dispatch a logout action here or navigate to login
        // For now, we'll reject the promise
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'An error occurred';

    // Return formatted error
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default api;
