/**
 * Authentication Service
 * Handles login, logout, and token refresh operations
 */
import api from './api';
import { API_ENDPOINTS } from '../constants/config';
import { TokenStorage, UserStorage, clearAllStorage } from '../utils/storage';

// Interval ID for background token refresh
let refreshIntervalId = null;
const authListeners = new Set();

export const subscribeAuthChanges = (listener) => {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
};

const notifyAuthChange = (user) => {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (error) {
      console.warn('Auth listener error:', error);
    }
  });
};

/**
 * Login user
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User data and tokens
 */
export const login = async (username, password, imeiList = []) => {
  try {
    // Backend expects form-data body
    const formData = new FormData();
    // Most Laravel-style APIs expect "email" + "password"
    formData.append('email', username);
    formData.append('password', password);
    formData.append('from_mobile', 'true');
    if (Array.isArray(imeiList)) {
      imeiList.filter(Boolean).forEach((imei) => {
        formData.append('imei[]', imei);
      });
    }

    const response = await api.post(API_ENDPOINTS.LOGIN, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { access_token, refresh_token, user } = response.data || {};

    // If backend responded without a token, treat as failure (e.g. validation error)
    if (!access_token) {
      const backendMessage =
        response.data?.message ||
        response.data?.error ||
        'Login failed. Please check your credentials.';

      return {
        success: false,
        error: backendMessage,
        status: response.status,
        data: response.data,
      };
    }

    // Store tokens
    await TokenStorage.setAccessToken(access_token);
    if (refresh_token) {
      await TokenStorage.setRefreshToken(refresh_token);
      // Only start refresh loop if we have a refresh token
      startTokenRefreshLoop();
    }
    // If no refresh_token, we'll rely on the access_token until it expires
    // and handle 401 errors via the axios interceptor

    // Store user data
    if (user) {
      await UserStorage.setUserData(user);
    }

    notifyAuthChange(user || { user_type: null });
    return {
      success: true,
      user,
      access_token,
      refresh_token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error:
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Login failed. Please check your credentials.',
      status: error.status,
      data: error.data,
    };
  }
};

/**
 * Logout user
 * Clears all stored tokens and user data
 * @returns {Promise<boolean>} - Success status
 */
export const logout = async () => {
  try {
    // Optionally call logout endpoint to invalidate token on server
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Even if logout API fails, we still clear local storage
      console.warn('Logout API call failed, clearing local storage anyway:', error);
    }

    // Clear all local storage and stop refresh loop
    stopTokenRefreshLoop();
    await clearAllStorage();

    notifyAuthChange(null);
    return {
      success: true,
    };
  } catch (error) {
    console.error('Logout error:', error);
    // Still try to clear storage even if there's an error
    stopTokenRefreshLoop();
    await clearAllStorage();
    notifyAuthChange(null);
    return {
      success: false,
      error: error.message || 'Logout failed',
    };
  }
};

/**
 * Refresh access token using refresh token
 * @returns {Promise<Object>} - New tokens
 */
export const refreshToken = async () => {
  try {
    const refresh_token = await TokenStorage.getRefreshToken();

    // if (!refresh_token) {
    //   throw new Error('No refresh token available');
      
    // }

    if (!refresh_token) {
      console.warn('No refresh token found. Logging out...');

      stopTokenRefreshLoop();
      await clearAllStorage();
      notifyAuthChange(null);

      return {
        success: false,
        error: 'Please logout and login again',
      };
    }

    const response = await api.post(API_ENDPOINTS.REFRESH, {
      refresh_token,
    });

    const { access_token, refresh_token: newRefreshToken } = response.data;

    // Update stored tokens
    if (access_token) {
      await TokenStorage.setAccessToken(access_token);
    }
    if (newRefreshToken) {
      await TokenStorage.setRefreshToken(newRefreshToken);
    }

    return {
      success: true,
      access_token,
      refresh_token: newRefreshToken,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // If refresh fails, clear all storage and stop loop
    stopTokenRefreshLoop();
    await clearAllStorage();

    notifyAuthChange(null);
    return {
      success: false,
      error: error.message || 'Token refresh failed',
      status: error.status,
    };
  }
};

/**
 * Get current user data from storage
 * @returns {Promise<Object|null>} - User data or null
 */
export const getCurrentUser = async () => {
  try {
    const userData = await UserStorage.getUserData();
    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {Promise<boolean>} - Authentication status
 */
export const isAuthenticated = async () => {
  try {
    const token = await TokenStorage.getAccessToken();
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get stored access token
 * @returns {Promise<string|null>} - Access token or null
 */
export const getAccessToken = async () => {
  return await TokenStorage.getAccessToken();
};

/**
 * Start background token refresh (every 30 seconds)
 */
export const startTokenRefreshLoop = (intervalMs = 30000) => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }

  refreshIntervalId = setInterval(async () => {
    try {
      // Check if we have both access token and refresh token before attempting refresh
      const accessToken = await TokenStorage.getAccessToken();
      const storedRefreshToken = await TokenStorage.getRefreshToken();
      
      if (accessToken && storedRefreshToken) {
        await refreshToken();
      } else {
        // No refresh token available, stop the loop
        console.warn('Please logout and login again, stopping refresh loop');
        stopTokenRefreshLoop();
      }
    } catch (e) {
      console.error('Background token refresh failed:', e);
      // If refresh fails, stop the loop to prevent repeated errors
      stopTokenRefreshLoop();
    }
  }, intervalMs);
};

/**
 * Stop background token refresh
 */
export const stopTokenRefreshLoop = () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
};

export default {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  isAuthenticated,
  getAccessToken,
  startTokenRefreshLoop,
  stopTokenRefreshLoop,
};
