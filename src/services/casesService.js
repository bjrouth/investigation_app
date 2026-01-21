/**
 * Cases Service
 * Handles case-related API operations
 */
import api from './api';
import { API_ENDPOINTS, buildApiUrl } from '../constants/config';

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

export default {
  getEmployeeCases,
};

