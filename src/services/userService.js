/**
 * User Service
 * Handles user-related API operations
 */
import api from './api';
import { API_ENDPOINTS, buildApiUrl } from '../constants/config';
import { UserStorage } from '../utils/storage';

/**
 * Update user details
 * @param {number} userId - User ID
 * @param {Object} userData - User data to update (first_name, last_name, mobile_number, etc.)
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    // Create FormData for the update request
    const formData = new FormData();
    
    if (userData.first_name !== undefined) {
      formData.append('first_name', userData.first_name);
    }
    if (userData.last_name !== undefined) {
      formData.append('last_name', userData.last_name);
    }
    if (userData.mobile_number !== undefined) {
      formData.append('mobile_number', userData.mobile_number);
    }
    // Add other fields as needed

    const response = await api.post(
      buildApiUrl(API_ENDPOINTS.UPDATE_USER(userId)),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const { user } = response.data || {};

    // Update stored user data if response includes user object
    if (user) {
      await UserStorage.setUserData(user);
    }

    return {
      success: true,
      user: user || response.data,
      message: response.data?.message || 'User details updated successfully',
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update user details',
      status: error.status,
      data: error.data,
    };
  }
};

/**
 * Get user profile
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get(buildApiUrl(API_ENDPOINTS.PROFILE));

    const { user } = response.data || {};

    // Update stored user data
    if (user) {
      await UserStorage.setUserData(user);
    }

    return {
      success: true,
      user: user || response.data,
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch user profile',
      status: error.status,
    };
  }
};

export default {
  updateUser,
  getUserProfile,
};
