/**
 * Storage Utility
 * Handles AsyncStorage operations for token and user data
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@InvestigationApp:access_token',
  REFRESH_TOKEN: '@InvestigationApp:refresh_token',
  USER_DATA: '@InvestigationApp:user_data',
  CASES_DATA: '@InvestigationApp:cases_data',
  TOTAL_CASES: '@InvestigationApp:total_cases',
};

/**
 * Token Storage
 */
export const TokenStorage = {
  /**
   * Save access token
   */
  setAccessToken: async (token) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      return true;
    } catch (error) {
      console.error('Error saving access token:', error);
      return false;
    }
  },

  /**
   * Get access token
   */
  getAccessToken: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Save refresh token
   */
  setRefreshToken: async (token) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
      return true;
    } catch (error) {
      console.error('Error saving refresh token:', error);
      return false;
    }
  },

  /**
   * Get refresh token
   */
  getRefreshToken: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      return token;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Remove all tokens
   */
  clearTokens: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing tokens:', error);
      return false;
    }
  },
};

/**
 * User Data Storage
 */
export const UserStorage = {
  /**
   * Save user data
   */
  setUserData: async (userData) => {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  },

  /**
   * Get user data
   */
  getUserData: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Remove user data
   */
  clearUserData: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  },
};

/**
 * Cases Data Storage
 */
export const CasesStorage = {
  /**
   * Save cases data
   */
  setCasesData: async (casesData, totalCases) => {
    try {
      const casesJson = JSON.stringify(casesData);
      await AsyncStorage.setItem(STORAGE_KEYS.CASES_DATA, casesJson);
      await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_CASES, String(totalCases));
      return true;
    } catch (error) {
      console.error('Error saving cases data:', error);
      return false;
    }
  },

  /**
   * Get cases data
   */
  getCasesData: async () => {
    try {
      const casesJson = await AsyncStorage.getItem(STORAGE_KEYS.CASES_DATA);
      const totalCasesStr = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_CASES);
      const cases = casesJson != null ? JSON.parse(casesJson) : null;
      const totalCases = totalCasesStr != null ? parseInt(totalCasesStr, 10) : 0;
      return { cases, totalCases };
    } catch (error) {
      console.error('Error getting cases data:', error);
      return { cases: null, totalCases: 0 };
    }
  },

  /**
   * Remove cases data
   */
  clearCasesData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CASES_DATA,
        STORAGE_KEYS.TOTAL_CASES,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing cases data:', error);
      return false;
    }
  },

  /**
   * Remove a single case by id/case_id from stored cases
   */
  removeCaseById: async (caseId) => {
    try {
      if (caseId === null || caseId === undefined || caseId === '') {
        return { success: false, removedCount: 0 };
      }

      const targetId = String(caseId);
      const { cases: storedCases } = await CasesStorage.getCasesData();

      if (!storedCases || !Array.isArray(storedCases)) {
        return { success: false, removedCount: 0 };
      }

      let removedCount = 0;
      const shouldKeepCase = (caseObj) => {
        const idValue = caseObj?.id ?? caseObj?.case_id;
        const caseIdValue = caseObj?.case_id ?? caseObj?.id;
        return String(idValue) !== targetId && String(caseIdValue) !== targetId;
      };

      const updatedCases = storedCases.reduce((acc, item) => {
        const itemCases = Array.isArray(item?.cases) ? item.cases : [];
        const filteredCases = itemCases.filter(shouldKeepCase);
        removedCount += itemCases.length - filteredCases.length;

        const rawCases = Array.isArray(item?.rawData?.cases) ? item.rawData.cases : null;
        const updatedRawData = item?.rawData
          ? {
              ...item.rawData,
              cases: rawCases ? rawCases.filter(shouldKeepCase) : item.rawData.cases,
            }
          : item.rawData;

        if (filteredCases.length > 0) {
          acc.push({
            ...item,
            cases: filteredCases,
            caseCount: filteredCases.length,
            rawData: updatedRawData,
          });
        }

        return acc;
      }, []);

      const totalCases = updatedCases.reduce(
        (sum, item) => sum + (item.caseCount || item.cases?.length || 0),
        0,
      );

      await CasesStorage.setCasesData(updatedCases, totalCases);

      return { success: true, removedCount, cases: updatedCases, totalCases };
    } catch (error) {
      console.error('Error removing case by id:', error);
      return { success: false, removedCount: 0 };
    }
  },
};

/**
 * Clear all storage (tokens + user data + cases data)
 */
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.CASES_DATA,
      STORAGE_KEYS.TOTAL_CASES,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing all storage:', error);
    return false;
  }
};

export default {
  TokenStorage,
  UserStorage,
  CasesStorage,
  clearAllStorage,
};
