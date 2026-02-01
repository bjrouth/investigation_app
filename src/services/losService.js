import api from './api';
import { API_ENDPOINTS, API_URL } from '../constants/config';
import RNFS from 'react-native-fs';
import { TokenStorage } from '../utils/storage';

export const submitLosDetails = async ({
  losno,
  bankName,
  productName,
  applicantName,
  latitude,
  longitude,
  caseType,
  note,
}) => {
  try {
    const payload = {
      losno: String(losno),
      bankName: String(bankName),
      productName: String(productName),
      applicantName: String(applicantName),
      latitude: String(latitude),
      longitude: String(longitude),
      case_type: caseType ? String(caseType) : undefined,
      note: note ? String(note) : undefined,
    };

    const response = await api.post(API_ENDPOINTS.LOS_ADD_DETAILS, payload);

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Failed to submit LOS details',
      status: error.status,
      data: error.data,
    };
  }
};

export const uploadLosFiles = async ({
  losno,
  losDetailId,
  files = [],
}) => {
  try {
    const token = await TokenStorage.getAccessToken();
    const uploadFiles = files
      .map((file, index) => {
        const rawPath = file?.uri || file?.path || '';
        const filePath = rawPath.replace('file://', '');
        const filename = file?.name || `los_${Date.now()}_${index}.jpg`;
        const filetype = file?.type || 'image/jpeg';

        if (!filePath || filePath.startsWith('http://') || filePath.startsWith('https://')) {
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

    const fields = {
      ...(losno ? { losno: String(losno) } : {}),
      ...(losDetailId ? { los_detail_id: String(losDetailId) } : {}),
    };

    const response = await RNFS.uploadFiles({
      toUrl: `${API_URL}${API_ENDPOINTS.LOS_UPLOAD_FILES}`,
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
    return {
      success: false,
      error: error?.message || 'Failed to upload files',
    };
  }
};

export const fetchLosDetails = async ({ losno, caseType } = {}) => {
  try {
    if (!losno) {
      throw new Error('LOS number is required');
    }

    const response = await api.get(API_ENDPOINTS.LOS_DETAILS, {
      params: {
        losno: String(losno),
        case_type: caseType,
      },
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Failed to fetch LOS details',
      status: error.status,
      data: error.data,
    };
  }
};
