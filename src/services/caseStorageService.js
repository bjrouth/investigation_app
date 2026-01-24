/**
 * Case Storage Service
 * Combines database and file storage operations for complete case management
 */
import { getDatabase } from './database';
import * as FileStorage from './fileStorage';
import api from './api';
import { API_ENDPOINTS } from '../constants/config';

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

    if (!caseResult.rows || caseResult.rows.length === 0) {
      return null;
    }

    const caseMetadata = caseResult.rows[0];

    // Load form data
    const formResult = db.execute(
      `SELECT form_json FROM case_forms WHERE case_id = ?`,
      [caseMetadata.id]
    );

    let formData = null;
    if (formResult.rows && formResult.rows.length > 0) {
      formData = JSON.parse(formResult.rows[0].form_json);
    }

    // Load images
    const imageResult = db.execute(
      `SELECT * FROM case_images WHERE case_id = ? ORDER BY created_at ASC`,
      [caseMetadata.id]
    );

    const images = [];
    if (imageResult.rows && imageResult.rows.length > 0) {
      for (let i = 0; i < imageResult.rows.length; i++) {
        const img = imageResult.rows[i];
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
    const db = getDatabase();
    
    // Load case data
    const caseData = await loadCase(caseId);
    if (!caseData) {
      throw new Error('Case not found');
    }

    // Update status to SYNCING
    await updateCaseStatus(caseId, 'SYNCING');

    // Upload images first
    const imageIds = [];
    for (const image of caseData.images) {
      if (!image.synced && image.filePath) {
        try {
          // Create FormData for image upload
          const formData = new FormData();
          formData.append('image', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `image_${image.id}.jpg`,
          });
          formData.append('case_id', caseId);
          if (image.latitude && image.longitude) {
            formData.append('latitude', image.latitude.toString());
            formData.append('longitude', image.longitude.toString());
            formData.append('accuracy', image.accuracy?.toString() || '');
          }

          // Upload image (adjust endpoint as needed)
          const uploadResponse = await api.post('upload-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const serverImageId = uploadResponse.data.image_id;
          imageIds.push(serverImageId);

          // Update image as synced
          db.execute(
            `UPDATE case_images SET synced = 1, server_image_id = ? WHERE id = ?`,
            [serverImageId, image.id]
          );
        } catch (error) {
          console.error(`Error uploading image ${image.id}:`, error);
          // Continue with other images
        }
      } else if (image.serverImageId) {
        imageIds.push(image.serverImageId);
      }
    }

    // Prepare form data with image IDs
    const submitData = {
      ...caseData.formData,
      case_id: caseId,
      reference_number: caseData.metadata.reference_number,
      images: imageIds,
    };

    // Submit case
    const response = await api.post(API_ENDPOINTS.SUBMIT_CASE, submitData);

    // Update status to SYNCED
    await updateCaseStatus(caseId, 'SYNCED');

    // Optionally delete local data after successful sync
    // await deleteCase(caseId);

    console.log('Case synced successfully:', caseId);
    return response.data;
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

    if (imageResult.rows && imageResult.rows.length > 0) {
      for (let i = 0; i < imageResult.rows.length; i++) {
        const filePath = imageResult.rows[i].file_path;
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

    const cases = [];
    if (result.rows && result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        cases.push(result.rows[i]);
      }
    }

    return cases;
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
