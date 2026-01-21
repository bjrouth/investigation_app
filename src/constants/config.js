/**
 * Application Configuration Constants
 * Store environment variables and API endpoints here
 */
import { Platform } from 'react-native';

// API host must be different for Android emulator
// - Android emulator cannot reach "localhost" of your machine
// - Use 10.0.2.2 to access host machine from Android emulator
const API_HOST =
  Platform.OS === 'android' ? 'http://127.0.0.1:8000' : 'http://localhost:8000';

// API Configuration
export const API_URL = `${API_HOST}/api/`;

// Environment
export const ENV = __DEV__ ? 'development' : 'production';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: 'login',
  LOGOUT: 'logout',
  REFRESH: 'refresh',
  
  // Case endpoints
  CASES: 'cases',
  CASE_DETAIL: (id) => `cases/${id}`,
  SUBMIT_CASE: (id) => `cases/${id}/submit`,
  EMPLOYEE_CASES: 'cases/employee-case',
  
  // User endpoints
  PROFILE: 'user/profile',
  UPDATE_PROFILE: 'user/profile',
  UPDATE_USER: (id) => `users/${id}/update`,
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
};

// Export default config object
const config = {
  API_URL,
  ENV,
  API_ENDPOINTS,
  buildApiUrl,
};

export default config;
