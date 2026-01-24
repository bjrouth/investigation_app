/**
 * Independent Axios Instance for Case Submission
 * Handles FormData/multipart file uploads separately from main API
 */
import axios from 'axios';
import { API_URL } from '../constants/config';
import { TokenStorage } from '../utils/storage';

// Create independent axios instance for file uploads
const submitCaseApi = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for file uploads
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  headers: {
    'Accept': 'application/json',
  },
});

// Request Interceptor for submit-case API
submitCaseApi.interceptors.request.use(
  async (config) => {
    // Get access token from storage
    const token = await TokenStorage.getAccessToken();
    
    // Add token to request headers if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData - remove Content-Type header to let React Native set it with boundary
    // Check if data is FormData (React Native FormData has _parts property)
    const isFormData = config.data && (
      (typeof FormData !== 'undefined' && config.data instanceof FormData) ||
      (config.data._parts !== undefined) || // React Native FormData has _parts
      (config.data.constructor && config.data.constructor.name === 'FormData')
    );
    
    if (isFormData) {
      console.log('FormData detected, removing Content-Type header');
      console.log('FormData details:', {
        hasParts: config.data._parts !== undefined,
        partsCount: config.data._parts?.length || 0,
        constructorName: config.data.constructor?.name,
      });
      // Remove Content-Type header completely - React Native/Axios will set it with boundary
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }

    return config;
  },
  (error) => {
    console.error('Submit Case API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor for submit-case API
submitCaseApi.interceptors.response.use(
  (response) => {
    console.log('Submit Case API Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    console.error('Submit Case API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = await TokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint using main api instance
        const { default: api } = await import('./api');
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
        error.config.headers.Authorization = `Bearer ${access_token}`;

        // Retry original request
        return submitCaseApi(error.config);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await TokenStorage.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    // Return formatted error
    return Promise.reject({
      message: error.response?.data?.message || 
               error.response?.data?.error || 
               error.message || 
               'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default submitCaseApi;
