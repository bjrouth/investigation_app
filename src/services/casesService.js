/**
 * Cases Service
 * Handles case-related API operations
 */
import api from './api';
import { API_ENDPOINTS, API_URL, buildApiUrl } from '../constants/config';
import RNFS from 'react-native-fs';
import { TokenStorage } from '../utils/storage';

/**
 * Get employee cases with optional filters
 * GET /api/cases/employee-case?user_id={id}&bank={bank}&type={type}
 *
 * @param {Object} params
 * @param {number|string} params.userId - Employee/user ID
 * @param {string} [params.bank] - Optional bank filter
 * @param {string} [params.type] - Optional type/FL type filter
 * @returns {Promise<Object>} - { success, cases, error, status }
 */
export const getEmployeeCases = async ({ userId, bank, type } = {}) => {
  try {
    if (!userId) {
      throw new Error('userId is required to fetch employee cases');
    }

    const searchParams = new URLSearchParams();
    searchParams.append('user_id', String(userId));

    if (bank) {
      searchParams.append('bank', bank);
    }
    if (type) {
      searchParams.append('type', type);
    }

    const url = `${API_ENDPOINTS.EMPLOYEE_CASES}?${searchParams.toString()}`;

    const response = await api.get(buildApiUrl(url));

    const data = response.data || {};
    // API returns array directly or wrapped in data/cases property
    let cases = [];
    if (Array.isArray(data)) {
      cases = data;
    } else if (Array.isArray(data.cases)) {
      cases = data.cases;
    } else if (Array.isArray(data.data)) {
      cases = data.data;
    }

    return {
      success: true,
      cases,
      raw: data,
    };
  } catch (error) {
    console.error('Get employee cases error:', error);
    return {
      success: false,
      error:
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Failed to fetch cases',
      status: error.status,
      data: error.data,
    };
  }
};

/**
 * Get employee completed cases with optional date filter
 * GET /api/cases/employee-completed-cases?user_id={id}&selectedDate={date}
 *
 * @param {Object} params
 * @param {number|string} params.userId - Employee/user ID
 * @param {string} [params.selectedDate] - Optional date filter (YYYY-MM-DD)
 * @returns {Promise<Object>} - { success, cases, error, status }
 */
export const getEmployeeCompletedCases = async ({ userId, selectedDate } = {}) => {
  try {
    if (!userId) {
      throw new Error('userId is required to fetch employee completed cases');
    }

    const searchParams = new URLSearchParams();
    searchParams.append('user_id', String(userId));

    if (selectedDate) {
      searchParams.append('selectedDate', selectedDate);
    }

    const url = `${API_ENDPOINTS.EMPLOYEE_COMPLETED_CASES}?${searchParams.toString()}`;
    const response = await api.get(buildApiUrl(url));

    const data = response.data || {};
    let cases = [];
    if (Array.isArray(data)) {
      cases = data;
    } else if (Array.isArray(data.cases)) {
      cases = data.cases;
    } else if (Array.isArray(data.data)) {
      cases = data.data;
    }

    return {
      success: true,
      cases,
      raw: data,
    };
  } catch (error) {
    console.error('Get employee completed cases error:', error);
    return {
      success: false,
      error:
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Failed to fetch completed cases',
      status: error.status,
      data: error.data,
    };
  }
};

/**
 * Submit case form data as FormData
 * POST /api/submit-case
 *
 * @param {Object} caseData - Case form data object (without files)
 * @returns {Promise<Object>} - { success, data, error, status }
 */
export const submitCaseData = async (caseData) => {
  try {
    console.log('Submitting case data as FormData (matching update profile pattern)...');
    console.log('Case data keys:', Object.keys(caseData));
    console.log('Case ID being sent:', caseData.case_id);

    // Create FormData - matching Ionic format exactly
    const formData = new FormData();

    // Explicitly add id first (matching Ionic: formData.append('case_id', this.case_id))
    // Backend might expect 'id' or 'case_id', so send both if available
    if (caseData.id !== null && caseData.id !== undefined && caseData.id !== '') {
      formData.append('id', String(caseData.id));
      console.log('Added id to FormData:', caseData.id);
    }
    formData.append('case_status', String('submited'));
    // Also add case_id if it exists (might be different from id)
    if (caseData.case_id !== null && caseData.case_id !== undefined && caseData.case_id !== '') {
      formData.append('case_id', String(caseData.case_id));

      console.log('Added case_id to FormData:', caseData.case_id);
    }

    // Append fields - stringify nested objects, direct values for others (like Ionic)
    for (const key in caseData) {
      // Skip id and case_id as we already added them explicitly above
      if (key === 'id' || key === 'case_id') {
        continue;
      }

      if (key === 'self_employed' || key === 'service' || key === 'residential_details') {
        // Stringify nested objects (matching Ionic format)
        formData.append(key, JSON.stringify(caseData[key]));
      } else {
        // Append direct values
        const value = caseData[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      }
    }

    console.log('FormData created with fields:', Object.keys(caseData));
    console.log('FormData _parts count:', formData._parts?.length || 0);

    // Use regular api instance with FormData - same pattern as updateUser
    const response = await api.post('submit-case', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Case data submitted successfully:', response.status, response.data);

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Submit case data error:', error);
    return {
      success: false,
      error:
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Failed to submit case data',
      status: error.status,
      data: error.data,
    };
  }
};

/**
 * Temporary placeholder for file upload
 * Logs file paths only (no API call)
 */
export const uploadCaseFiles = async (caseId, files = []) => {
  try {
    const token = await TokenStorage.getAccessToken();
    const uploadFiles = files
      .map((file, index) => {
        const rawPath = file?.uri || file?.path || '';
        const filePath = rawPath.replace('file://', '');
        const filename = file?.name || `case_${Date.now()}_${index}.jpg`;
        const filetype = file?.type || 'image/jpeg';

        if (!filePath || filePath.startsWith('http://') || filePath.startsWith('https://')) {
          console.warn('Skipping invalid file path:', { rawPath, filePath });
          return null;
        }

        return {
          name: 'files[]',
          filename,
          filepath: filePath,
          filetype,
        };
      })
      .filter(Boolean);

    if (uploadFiles.length === 0) {
      return {
        success: false,
        error: 'No valid files to upload',
      };
    }

    console.log('Uploading files with RNFS:', {
      caseId,
      count: uploadFiles.length,
      paths: uploadFiles.map((f) => f.filepath),
    });

    const geoSource = files.find(
      (file) => file?.latitude && file?.longitude
    );
    const fields = {
      case_id: String(caseId),
      type: 'response',
    };
    if (geoSource?.latitude && geoSource?.longitude) {
      fields.latitude = String(geoSource.latitude);
      fields.longitude = String(geoSource.longitude);
      if (geoSource.accuracy) {
        fields.accuracy = String(geoSource.accuracy);
      }
      if (geoSource.address) {
        fields.address = String(geoSource.address);
      }
    }

    const response = await RNFS.uploadFiles({
      toUrl: `${API_URL}cases/upload-files`,
      files: uploadFiles,
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      fields,
    }).promise;

    let responseBody = null;
    try {
      responseBody = response?.bodyString ? JSON.parse(response.bodyString) : null;
    } catch (parseError) {
      responseBody = response?.bodyString || null;
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      return {
        success: false,
        error: responseBody?.message || 'Failed to upload files',
        status: response.statusCode,
        data: responseBody,
      };
    }

    return {
      success: true,
      data: responseBody,
      status: response.statusCode,
    };
  } catch (error) {
    console.error('Upload files error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to upload files',
    };
  }
};

export default {
  getEmployeeCases,
  submitCaseData,
  uploadCaseFiles,
};

