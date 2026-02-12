/**
 * Application Configuration Constants
 * Store environment variables and API endpoints here
 */
import { Platform } from 'react-native';

// API host must be different for Android emulator
// - Android emulator cannot reach "localhost" of your machine
// - Use 10.0.2.2 to access host machine from Android emulator
// http://localhost:8000
const API_HOST =
  Platform.OS === 'android' ? 'https://mahajaninvestigations.com' : 'https://mahajaninvestigations.com';

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
  EMPLOYEE_COMPLETED_CASES: 'cases/employee-completed-cases',

  // LOS endpoints
  LOS_ADD_DETAILS: 'los/add-details',
  LOS_UPLOAD_FILES: 'los/upload-files',
  LOS_DETAILS: 'los/details',
  
  // User endpoints
  PROFILE: 'user/profile',
  UPDATE_PROFILE: 'user/profile',
  UPDATE_USER: (id) => `users/${id}/update`,
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
};

// Google Maps API Configuration (for geocoding)
export const API_CONFIG = {
  GOOGLE_MAPS_API_KEY: 'AIzaSyB6v427807anseD365HCUEhveDSULheuCg', // Add your Google Maps API key here
};

// Export default config object
const config = {
  API_URL,
  ENV,
  API_ENDPOINTS,
  buildApiUrl,
  API_CONFIG,
};

export default config;
