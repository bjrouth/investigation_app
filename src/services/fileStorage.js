/**
 * File Storage Service
 * Handles image file operations on the file system
 */
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

// Base directory for app data
const BASE_DIR = Platform.OS === 'ios' 
  ? RNFS.DocumentDirectoryPath 
  : RNFS.ExternalDirectoryPath;

const CASES_DIR = `${BASE_DIR}/cases`;

/**
 * Initialize file storage directories
 */
export const initFileStorage = async () => {
  try {
    // Create cases directory if it doesn't exist
    const casesDirExists = await RNFS.exists(CASES_DIR);
    if (!casesDirExists) {
      await RNFS.mkdir(CASES_DIR);
      console.log('Cases directory created');
    }
    return true;
  } catch (error) {
    console.error('Error initializing file storage:', error);
    throw error;
  }
};

/**
 * Get case directory path
 */
export const getCaseDirectory = (caseId) => {
  return `${CASES_DIR}/${caseId}`;
};

/**
 * Create case directory if it doesn't exist
 */
export const ensureCaseDirectory = async (caseId) => {
  try {
    const caseDir = getCaseDirectory(caseId);
    const exists = await RNFS.exists(caseDir);
    if (!exists) {
      await RNFS.mkdir(caseDir);
      console.log(`Case directory created: ${caseDir}`);
    }
    return caseDir;
  } catch (error) {
    console.error(`Error creating case directory for ${caseId}:`, error);
    throw error;
  }
};

/**
 * Save image file to case directory
 * @param {string} sourceUri - Source image URI (from camera/gallery)
 * @param {string} caseId - Case ID
 * @param {string} imageId - Unique image ID (timestamp or UUID)
 * @returns {Promise<string>} - File path of saved image
 */
export const saveImageFile = async (sourceUri, caseId, imageId) => {
  try {
    // Ensure case directory exists
    await ensureCaseDirectory(caseId);
    
    const normalizedSource = sourceUri?.startsWith('file://')
      ? sourceUri.replace('file://', '')
      : sourceUri;

    // Generate filename
    const extension = normalizedSource?.split('.').pop() || 'jpg';
    const filename = `img_${imageId}.${extension}`;
    const destPath = `${getCaseDirectory(caseId)}/${filename}`;
    
    // Copy file from source to destination
    await RNFS.copyFile(normalizedSource, destPath);
    
    console.log(`Image saved: ${destPath}`);
    return destPath;
  } catch (error) {
    console.error('Error saving image file:', error);
    throw error;
  }
};

/**
 * Delete image file
 * @param {string} filePath - Path to image file
 */
export const deleteImageFile = async (filePath) => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
      console.log(`Image deleted: ${filePath}`);
    }
  } catch (error) {
    console.error('Error deleting image file:', error);
    throw error;
  }
};

/**
 * Get image file URI for display
 * @param {string} filePath - Path to image file
 * @returns {string} - File URI (file:// prefix for React Native)
 */
export const getImageUri = (filePath) => {
  if (!filePath) return null;
  // Add file:// prefix if not already present
  return filePath.startsWith('file://') ? filePath : `file://${filePath}`;
};

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>}
 */
export const fileExists = async (filePath) => {
  try {
    return await RNFS.exists(filePath);
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

/**
 * Delete all files for a case
 * @param {string} caseId - Case ID
 */
export const deleteCaseFiles = async (caseId) => {
  try {
    const caseDir = getCaseDirectory(caseId);
    const exists = await RNFS.exists(caseDir);
    if (exists) {
      await RNFS.unlink(caseDir);
      console.log(`Case directory deleted: ${caseDir}`);
    }
  } catch (error) {
    console.error(`Error deleting case files for ${caseId}:`, error);
    throw error;
  }
};

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {Promise<number>}
 */
export const getFileSize = async (filePath) => {
  try {
    const stat = await RNFS.stat(filePath);
    return stat.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

export default {
  initFileStorage,
  getCaseDirectory,
  ensureCaseDirectory,
  saveImageFile,
  deleteImageFile,
  getImageUri,
  fileExists,
  deleteCaseFiles,
  getFileSize,
};
