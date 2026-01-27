/**
 * Case Storage Service
 * Combines database and file storage operations for complete case management
 */
import { getDatabase } from './database';
import * as FileStorage from './fileStorage';
import { submitCaseData, uploadCaseFiles } from './casesService';

const getRowsArray = (result) => {
  if (!result || !result.rows) return [];
  if (Array.isArray(result.rows)) return result.rows;
  if (Array.isArray(result.rows._array)) return result.rows._array;
  return [];
};

/**
 * Save case metadata
 */
export const saveCaseMetadata = async (caseData) => {
  try {
    const db = getDatabase();
    const { id, reference_number, case_id, current_step } = caseData;
    const now = new Date().toISOString();

    db.execute(
      `INSERT OR REPLACE INTO cases 
       (id, reference_number, case_id, current_step, last_saved, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id || case_id, reference_number, case_id, current_step, now, now]
    );

    console.log('Case metadata saved:', id || case_id);
    return true;
  } catch (error) {
    console.error('Error saving case metadata:', error);
    throw error;
  }
};

/**
 * Save form data for a case
 */
export const saveCaseForm = async (caseId, formData) => {
  try {
    const db = getDatabase();
    const formJson = JSON.stringify(formData);
    const now = new Date().toISOString();

    db.execute(
      `INSERT OR REPLACE INTO case_forms (case_id, form_json, updated_at) 
       VALUES (?, ?, ?)`,
      [caseId, formJson, now]
    );

    // Update last_saved in cases table
    db.execute(
      `UPDATE cases SET last_saved = ?, updated_at = ? WHERE id = ?`,
      [now, now, caseId]
    );

    console.log('Case form saved:', caseId);
    return true;
  } catch (error) {
    console.error('Error saving case form:', error);
    throw error;
  }
};

/**
 * Save image metadata and file
 */
export const saveCaseImage = async (caseId, imageData) => {
  try {
    const db = getDatabase();
    const {
      uri,
      latitude,
      longitude,
      accuracy,
      address,
      capturedAt,
      source,
    } = imageData;

    // Generate unique image ID
    const imageId = Date.now().toString();
    
    // Save image file to file system
    const filePath = await FileStorage.saveImageFile(uri, caseId, imageId);

    // Save image metadata to database
    db.execute(
      `INSERT INTO case_images 
       (case_id, file_path, latitude, longitude, address, accuracy, captured_at, source, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        caseId,
        filePath,
        latitude || null,
        longitude || null,
        address || null,
        accuracy || null,
        capturedAt || new Date().toISOString(),
        source || 'camera',
      ]
    );

    console.log('Case image saved:', caseId, filePath);
    return { filePath, imageId };
  } catch (error) {
    console.error('Error saving case image:', error);
    throw error;
  }
};

/**
 * Delete case image
 */
export const deleteCaseImage = async (caseId, imageId) => {
  try {
    const db = getDatabase();
    
    // Get image file path
    const result = db.execute(
      `SELECT file_path FROM case_images WHERE id = ? AND case_id = ?`,
      [imageId, caseId]
    );

    if (result.rows && result.rows.length > 0) {
      const filePath = result.rows[0].file_path;
      
      // Delete file from file system
      await FileStorage.deleteImageFile(filePath);
      
      // Delete metadata from database
      db.execute(
        `DELETE FROM case_images WHERE id = ? AND case_id = ?`,
        [imageId, caseId]
      );

      console.log('Case image deleted:', caseId, imageId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting case image:', error);
    throw error;
  }
};

/**
 * Load case data (metadata, form, images)
 */
export const loadCase = async (caseId) => {
  try {
    const db = getDatabase();
    
    // Load case metadata
    const caseResult = db.execute(
      `SELECT * FROM cases WHERE id = ? OR case_id = ?`,
      [caseId, caseId]
    );

    const caseRows = getRowsArray(caseResult);
    if (!caseRows || caseRows.length === 0) {
      return null;
    }

    const caseMetadata = caseRows[0];

    // Load form data
    const formResult = db.execute(
      `SELECT form_json FROM case_forms WHERE case_id = ?`,
      [caseMetadata.id]
    );

    let formData = null;
    const formRows = getRowsArray(formResult);
    if (formRows.length > 0) {
      formData = JSON.parse(formRows[0].form_json);
    }

    // Load images
    const imageResult = db.execute(
      `SELECT * FROM case_images WHERE case_id = ? ORDER BY created_at ASC`,
      [caseMetadata.id]
    );

    const images = [];
    const imageRows = getRowsArray(imageResult);
    if (imageRows.length > 0) {
      for (let i = 0; i < imageRows.length; i++) {
        const img = imageRows[i];
        images.push({
          id: img.id,
          uri: FileStorage.getImageUri(img.file_path),
          filePath: img.file_path,
          latitude: img.latitude,
          longitude: img.longitude,
          accuracy: img.accuracy,
          address: img.address,
          capturedAt: img.captured_at,
          source: img.source,
          synced: img.synced === 1,
          serverImageId: img.server_image_id,
        });
      }
    }

    return {
      metadata: caseMetadata,
      formData,
      images,
    };
  } catch (error) {
    console.error('Error loading case:', error);
    throw error;
  }
};

/**
 * Update case status
 */
export const updateCaseStatus = async (caseId, status) => {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.execute(
      `UPDATE cases SET status = ?, updated_at = ? WHERE id = ? OR case_id = ?`,
      [status, now, caseId, caseId]
    );

    console.log('Case status updated:', caseId, status);
    return true;
  } catch (error) {
    console.error('Error updating case status:', error);
    throw error;
  }
};

/**
 * Sync case to server
 */
export const syncCase = async (caseId) => {
  try {
    // Load case data
    const caseData = await loadCase(caseId);
    if (!caseData) {
      throw new Error('Case not found');
    }

    // Update status to SYNCING
    await updateCaseStatus(caseId, 'SYNCING');

    const formPayload = {
      ...caseData.formData,
    };
    if (!formPayload.case_id) {
      formPayload.case_id = caseData.metadata.case_id || caseId;
    }
    if (!formPayload.id && caseData.metadata?.id) {
      formPayload.id = caseData.metadata.id;
    }

    const submitResult = await submitCaseData(formPayload);
    if (!submitResult.success) {
      throw new Error(submitResult.error || 'Failed to submit case data');
    }

    if (caseData.images && caseData.images.length > 0) {
      const uploadPayload = caseData.images.map((image) => ({
        uri: image.uri,
        path: image.filePath,
        type: 'image/jpeg',
        name: `draft_${image.id}.jpg`,
        latitude: image.latitude,
        longitude: image.longitude,
        accuracy: image.accuracy,
        address: image.address,
      }));
      const uploadResult = await uploadCaseFiles(caseId, uploadPayload);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload files');
      }
    }

    // Update status to SYNCED
    await updateCaseStatus(caseId, 'SYNCED');

    // Clean up local draft after successful sync
    await deleteCase(caseId);

    console.log('Case synced successfully:', caseId);
    return submitResult.data;
  } catch (error) {
    console.error('Error syncing case:', error);
    
    // Update status to FAILED
    await updateCaseStatus(caseId, 'FAILED');
    
    throw error;
  }
};

/**
 * Delete case (metadata, form, images)
 */
export const deleteCase = async (caseId) => {
  try {
    const db = getDatabase();
    
    // Delete images from file system and database
    const imageResult = db.execute(
      `SELECT file_path FROM case_images WHERE case_id = ?`,
      [caseId]
    );

    const imageRows = getRowsArray(imageResult);
    if (imageRows.length > 0) {
      for (let i = 0; i < imageRows.length; i++) {
        const filePath = imageRows[i]?.file_path;
        if (!filePath) {
          continue;
        }
        await FileStorage.deleteImageFile(filePath);
      }
    }

    // Delete from database
    db.execute(`DELETE FROM case_images WHERE case_id = ?`, [caseId]);
    db.execute(`DELETE FROM case_forms WHERE case_id = ?`, [caseId]);
    db.execute(`DELETE FROM cases WHERE id = ? OR case_id = ?`, [caseId, caseId]);

    // Delete case directory
    await FileStorage.deleteCaseFiles(caseId);

    console.log('Case deleted:', caseId);
    return true;
  } catch (error) {
    console.error('Error deleting case:', error);
    throw error;
  }
};

/**
 * Get all draft cases
 */
export const getDraftCases = async () => {
  try {
    const db = getDatabase();
    const result = db.execute(
      `SELECT * FROM cases WHERE status = 'DRAFTED' ORDER BY updated_at DESC`
    );

    return getRowsArray(result).filter(Boolean);
  } catch (error) {
    console.error('Error getting draft cases:', error);
    throw error;
  }
};

export default {
  saveCaseMetadata,
  saveCaseForm,
  saveCaseImage,
  deleteCaseImage,
  loadCase,
  updateCaseStatus,
  syncCase,
  deleteCase,
  getDraftCases,
};
