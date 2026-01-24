# Auto-Save Form Data & Images - Production-Grade Implementation Plan

## Overview
This document outlines the **production-grade, offline-first** implementation plan for auto-save functionality for form data and images in the ProcessApplicationScreen. The architecture is designed for **zero data loss, zero lag, and crash-safe** operation, following industry best practices for verification/KYC apps.

---

## 1. Core Principles (Non-Negotiable)

1. **Offline-first by design** – everything must work without internet
2. **Case-based isolation** – one case never affects another
3. **SQLite for structured data** – forms, cases, metadata (NOT AsyncStorage)
4. **File system for images** – never store images as base64 in storage
5. **Incremental auto-save** – no full rewrites on every keystroke
6. **Sync-safe architecture** – retries, resume, crash-safe

> ❌ **AsyncStorage is NOT used for forms or images** (only for small flags/tokens)

---

## 2. Storage Stack (Final Choice)

| Purpose          | Technology                  | Reason                             |
| ---------------- | --------------------------- | ---------------------------------- |
| Case & form data | SQLite                      | Fast, structured, crash-safe       |
| Images           | File System (Documents dir) | No size limits, zero memory spikes |
| Image metadata   | SQLite                      | Queryable, syncable                |
| Small flags      | AsyncStorage / MMKV         | Tokens, booleans only              |

---

## 3. Database Schema

### 3.1 cases Table
```sql
CREATE TABLE cases (
  id TEXT PRIMARY KEY,              -- case_id or reference_number
  reference_number TEXT,            -- Alternative identifier
  status TEXT,                      -- DRAFT | SYNCED | FAILED
  current_step TEXT,                -- Current step user is on
  last_saved TEXT                   -- ISO timestamp
);
```

### 3.2 case_forms Table
```sql
CREATE TABLE case_forms (
  case_id TEXT PRIMARY KEY,
  form_json TEXT                    -- Entire form object as JSON string
);
```

**Notes:**
- `form_json` stores the complete form object as JSON string
- Form structure can evolve with versioning
- Easy to query and update

### 3.3 case_images Table
```sql
CREATE TABLE case_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT,
  file_path TEXT,                   -- Path to image file
  latitude REAL,
  longitude REAL,
  address TEXT,                      -- Geocoded address
  accuracy REAL,
  captured_at TEXT,                  -- ISO timestamp
  source TEXT,                       -- 'camera' or 'gallery'
  size INTEGER,                      -- File size in bytes
  width INTEGER,
  height INTEGER,
  synced INTEGER DEFAULT 0           -- 0 = not synced, 1 = synced
);
```

---

## 4. File System Structure (Images)

```
/app_data/
 └── cases/
     └── {case_id}/
         ├── img_1.jpg
         ├── img_2.jpg
         └── img_3.jpg
```

**Rules:**
- Images are copied to permanent location immediately after capture
- Original temp camera files are never trusted
- Each case has its own folder
- File names: `img_{timestamp}_{index}.jpg`

**Platform-Specific Paths:**
- **Android:** `/data/data/com.investigationapp/files/app_data/cases/{case_id}/`
- **iOS:** `Documents/app_data/cases/{case_id}/`

---

## 5. Storage Strategy

### 5.1 Image Storage (File System)

**Process:**
1. User captures/selects image
2. Image is compressed (< 100KB)
3. **Immediately copy to permanent location** (`/app_data/cases/{case_id}/`)
4. Store file path in `case_images` table
5. Store metadata (lat, lng, accuracy, etc.) in database

**Why File System:**
- ✅ No size limits (AsyncStorage has ~6-10MB limit)
- ✅ Zero memory spikes (base64 causes memory issues)
- ✅ Fast operations
- ✅ Images persist independently
- ✅ Easy to sync later (upload files directly)

**Why NOT Base64:**
- ❌ ~33% storage overhead
- ❌ AsyncStorage size limits
- ❌ Memory spikes during conversion
- ❌ Slower save/load operations
- ❌ Not scalable for many images

### 5.2 Form Data Storage (SQLite)

**Process:**
1. Form data changes
2. Convert form object to JSON string
3. Update `case_forms.form_json` in SQLite
4. Update `cases.last_saved` timestamp
5. All in a single transaction (atomic)

**Why SQLite:**
- ✅ Fast queries and updates
- ✅ Transaction-safe (crash-safe)
- ✅ Structured queries
- ✅ Scales to 100+ cases
- ✅ No size limits
- ✅ Industry standard for mobile apps

**Why NOT AsyncStorage:**
- ❌ Size limits (~6-10MB)
- ❌ No transactions (not crash-safe)
- ❌ Slow for large data
- ❌ Not queryable
- ❌ One giant JSON per case

---

## 6. Save Triggers

### A. Auto-Save (Debounced)
- **Trigger:** Form field changes
- **Delay:** 2 seconds after last change
- **Implementation:** `useEffect` with debounce timer
- **Action:** Update `case_forms.form_json` and `cases.last_saved`

### B. Step Navigation
- **Trigger:** When user clicks Next/Previous button
- **Action:** Save immediately before step change
- **Action:** Update `cases.current_step`
- **Important:** Current step data MUST be saved to SQLite before navigating to next step
- **Why:** Ensures data is persisted at each step, so user can return and continue from where they left off

### C. Image Operations
- **Trigger:** When image is added or deleted
- **Action:** 
  - Copy image to file system (if adding)
  - Insert/delete row in `case_images` table
  - Update `cases.last_saved`
- **Why:** Images are critical data, shouldn't be lost

### D. Component Lifecycle
- **Trigger:** Component unmount (user navigates away)
- **Action:** Save in cleanup function
- **Why:** Last chance to save before leaving

### E. App State Changes
- **Trigger:** App goes to background
- **Action:** Save immediately
- **Why:** App might be killed by system

---

## 7. Load Strategy

### A. On Component Mount
1. Get case identifier from `route.params.caseData`
   - Try `case_id` first
   - Fallback to `reference_number`
2. Query SQLite database:
   - Load case metadata from `cases` table
   - Load `form_json` from `case_forms` table
   - Load image records from `case_images` table
3. **If draft exists:**
   - Parse `form_json` to restore form data
   - Load image file paths from database
   - Restore current step from `cases.current_step`
   - Show indicator: "Draft restored from [timestamp]"
4. **If not exists:**
   - Start with fresh form (default state)
   - Create new case record in database

### B. Data Validation
- Check if saved `case_id` matches current case
- If case changed, clear old data and start fresh
- Handle corrupted JSON data gracefully
- Handle missing image files (if file deleted)

### C. User Confirmation (Optional)
- If draft exists, show dialog:
  - "Restore draft from [timestamp]?" 
  - Options: "Restore" or "Start Fresh"
- Default: Restore automatically

---

## 8. Implementation Steps

### Step 1: Install Dependencies
```bash
npm install react-native-sqlite-storage
npm install react-native-fs
# or
npm install @react-native-async-storage/async-storage  # Already installed (for tokens only)
```

**Required Packages:**
- `react-native-sqlite-storage` - SQLite database
- `react-native-fs` - File system operations

### Step 2: Create Database Utility
**File:** `src/utils/database.js` (new file)

```javascript
import SQLite from 'react-native-sqlite-storage';

// Initialize database
const db = SQLite.openDatabase({
  name: 'InvestigationApp.db',
  location: 'default',
});

// Initialize tables
export const initDatabase = async () => {
  // Create tables if not exist
  // Run migrations if needed
};

// Case operations
export const CaseDatabase = {
  // Save case metadata
  saveCase: async (caseId, referenceNumber, currentStep, status = 'DRAFT') => {
    // INSERT OR REPLACE into cases table
  },
  
  // Load case metadata
  loadCase: async (caseId, referenceNumber) => {
    // SELECT from cases table
  },
  
  // Save form data
  saveFormData: async (caseId, formData) => {
    // INSERT OR REPLACE into case_forms table
    // formData converted to JSON string
  },
  
  // Load form data
  loadFormData: async (caseId) => {
    // SELECT from case_forms table
    // Parse JSON string back to object
  },
  
  // Save image metadata
  saveImage: async (caseId, imageData) => {
    // INSERT into case_images table
  },
  
  // Load images for case
  loadImages: async (caseId) => {
    // SELECT from case_images table
    // Return array of image records
  },
  
  // Delete image
  deleteImage: async (imageId) => {
    // DELETE from case_images table
    // Also delete file from file system
  },
  
  // Delete case (and all related data)
  deleteCase: async (caseId) => {
    // DELETE from cases, case_forms, case_images
    // Delete image files from file system
  }
};
```

### Step 3: Create File System Utility
**File:** `src/utils/fileStorage.js` (new file)

```javascript
import RNFS from 'react-native-fs';

// Get case images directory path
const getCaseImagesPath = (caseId) => {
  const basePath = `${RNFS.DocumentDirectoryPath}/app_data/cases/${caseId}`;
  return basePath;
};

// Ensure directory exists
const ensureDirectoryExists = async (path) => {
  const exists = await RNFS.exists(path);
  if (!exists) {
    await RNFS.mkdir(path);
  }
};

// Copy image to permanent location
export const saveImageToFileSystem = async (caseId, sourceUri, imageData) => {
  // 1. Ensure case directory exists
  // 2. Generate unique filename (img_{timestamp}_{index}.jpg)
  // 3. Copy file from sourceUri to permanent location
  // 4. Return file path
};

// Get image URI from file path
export const getImageUri = (filePath) => {
  // Return file:// URI for Image component
  return `file://${filePath}`;
};

// Delete image file
export const deleteImageFile = async (filePath) => {
  // Delete file from file system
};

// Get all images for a case
export const getCaseImages = async (caseId) => {
  // List all files in case directory
  // Return array of file paths
};
```

### Step 4: Create Storage Service (High-Level API)
**File:** `src/services/caseStorageService.js` (new file)

```javascript
import { CaseDatabase } from '../utils/database';
import { saveImageToFileSystem, deleteImageFile, getImageUri } from '../utils/fileStorage';

export const CaseStorageService = {
  // Save complete case (form + images)
  saveCase: async (caseId, referenceNumber, formData, currentStep, locationPictures) => {
    // 1. Start transaction
    // 2. Save case metadata
    // 3. Save form data
    // 4. Save images (copy files + insert records)
    // 5. Commit transaction
  },
  
  // Load complete case
  loadCase: async (caseId, referenceNumber) => {
    // 1. Load case metadata
    // 2. Load form data
    // 3. Load image records
    // 4. Convert file paths to URIs
    // 5. Return { formData, currentStep, locationPictures, lastSaved }
  },
  
  // Add image
  addImage: async (caseId, imageUri, imageMetadata) => {
    // 1. Copy image to file system
    // 2. Insert record in case_images table
    // 3. Update cases.last_saved
  },
  
  // Delete image
  deleteImage: async (caseId, imageId) => {
    // 1. Get file path from database
    // 2. Delete file from file system
    // 3. Delete record from case_images table
    // 4. Update cases.last_saved
  },
  
  // Delete case
  deleteCase: async (caseId) => {
    // 1. Delete all image files
    // 2. Delete case directory
    // 3. Delete all database records
  }
};
```

### Step 5: Create Network & Sync Service
**File:** `src/services/syncService.js` (new file)

```javascript
import NetInfo from '@react-native-community/netinfo';

export const SyncService = {
  // Check internet connection
  checkConnection: async () => {
    // Use NetInfo to check connectivity
    // Return { isConnected: boolean, isFast: boolean }
  },
  
  // Submit case to server
  submitCase: async (caseId, formData, images) => {
    // 1. Upload images first
    // 2. Get image IDs from server
    // 3. Submit form with image IDs
    // 4. Return success/error
  },
  
  // Sync a single case
  syncCase: async (caseId) => {
    // 1. Load case from database
    // 2. Check connection
    // 3. Submit to server
    // 4. Update status based on result
  },
  
  // Sync all pending cases
  syncAllPending: async () => {
    // Find all DRAFTED and FAILED cases
    // Sync each one
  }
};
```

### Step 6: Integration in ProcessApplicationScreen
**File:** `src/screens/ProcessApplicationScreen.js`

#### A. Load on Mount
```javascript
useEffect(() => {
  const loadDraft = async () => {
    const draft = await CaseStorageService.loadCase(
      caseData?.case_id,
      caseData?.reference_number
    );
    if (draft) {
      setFormData(draft.formData);
      setStep(draft.currentStep);
      // Update locationPictures with file URIs
      setFormData(prev => ({
        ...prev,
        locationPictures: draft.locationPictures.map(img => ({
          ...img,
          uri: getImageUri(img.file_path)
        }))
      }));
      // Show "Draft restored" message
    }
  };
  loadDraft();
}, []);
```

#### B. Auto-Save on Form Changes
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    CaseStorageService.saveCase(
      caseData?.case_id,
      caseData?.reference_number,
      formData,
      step,
      formData.locationPictures
    );
  }, 2000); // 2 second debounce
  
  return () => clearTimeout(timer);
}, [formData, step]);
```

#### C. Save on Step Navigation (CRITICAL)
```javascript
const changePage = (direction) => {
  // CRITICAL: Save current step data BEFORE navigating
  // This ensures data is persisted at each step
  const saveCurrentStep = async () => {
    await CaseStorageService.saveCase(
      caseData?.case_id,
      caseData?.reference_number,
      formData,  // Current form data
      step,       // Current step
      formData.locationPictures
    );
    // Update cases.current_step in database
    await CaseDatabase.updateCurrentStep(
      caseData?.case_id || caseData?.reference_number,
      step
    );
  };
  
  saveCurrentStep().then(() => {
    // Only navigate after save is complete
    if (direction === 'next') {
      // Navigate to next step
    } else {
      // Navigate to previous step
    }
  });
};
```

**Why This Is Critical:**
- User can close app at any step
- When they return, they should see their data from the last step they were on
- Each step navigation is a checkpoint
- Data must be saved before step change completes

#### D. Save on Image Operations
```javascript
const handleAddLocationPicture = async (imageUri, imageMetadata) => {
  // Add image to formData
  // Immediately save to file system and database
  await CaseStorageService.addImage(
    caseData?.case_id,
    imageUri,
    imageMetadata
  );
};
```

#### E. Save on Unmount
```javascript
useEffect(() => {
  return () => {
    // Cleanup: save before unmount
    CaseStorageService.saveCase(...);
  };
}, []);
```

#### F. Final Submission Handler
```javascript
const handleSubmit = async () => {
  try {
    // Step 1: Save as DRAFTED in SQLite (immediate, no internet needed)
    await CaseStorageService.saveCase(
      caseData?.case_id,
      caseData?.reference_number,
      formData,
      step,
      formData.locationPictures
    );
    await CaseDatabase.updateCaseStatus(
      caseData?.case_id || caseData?.reference_number,
      'DRAFTED'
    );
    
    // Step 2: Check internet connection
    const connection = await SyncService.checkConnection();
    
    if (connection.isConnected && connection.isFast) {
      // Step 3A: Internet available and fast
      await CaseDatabase.updateCaseStatus(
        caseData?.case_id || caseData?.reference_number,
        'SYNCING'
      );
      
      // Show "Submitting..." indicator
      setSubmitting(true);
      
      try {
        // Upload to server
        const result = await SyncService.submitCase(
          caseData?.case_id || caseData?.reference_number,
          formData,
          formData.locationPictures
        );
        
        if (result.success) {
          // Success: Delete from SQLite and file system
          await CaseStorageService.deleteCase(
            caseData?.case_id || caseData?.reference_number
          );
          // Show success message
          navigation.goBack();
        } else {
          // Error: Mark as FAILED, keep data
          await CaseDatabase.updateCaseStatus(
            caseData?.case_id || caseData?.reference_number,
            'FAILED'
          );
          Alert.alert('Submission Failed', 'Please try again later.');
        }
      } catch (error) {
        // Network error or timeout
        await CaseDatabase.updateCaseStatus(
          caseData?.case_id || caseData?.reference_number,
          'FAILED'
        );
        Alert.alert('Submission Failed', 'Please check your connection and try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Step 3B: No internet or slow connection
      Alert.alert(
        'Saved as Draft',
        connection.isConnected 
          ? 'Connection is slow. Your case has been saved as draft and will be synced automatically when connection improves.'
          : 'No internet connection. Your case has been saved as draft and will be synced automatically when connection is restored.',
        [{ text: 'OK' }]
      );
      // Status remains DRAFTED
      // User can sync later manually
    }
  } catch (error) {
    console.error('Error in handleSubmit:', error);
    Alert.alert('Error', 'Failed to save case. Please try again.');
  }
};
```

---

## 9. Draft States

| Status   | Meaning                              |
| -------- | ------------------------------------ |
| DRAFT    | Saved locally, not synced            |
| DRAFTED  | Submitted locally, pending sync      |
| SYNCED   | Uploaded successfully                |
| FAILED   | Sync attempted but failed            |
| SYNCING  | Currently syncing to server          |

Status is stored in `cases.status` column.

**Status Flow:**
- `DRAFT` → User is filling form, data saved locally
- `DRAFTED` → User clicked submit, saved locally, waiting to sync
- `SYNCING` → Currently uploading to server
- `SYNCED` → Successfully uploaded, can be removed from local storage
- `FAILED` → Sync failed, user can retry later

---

## 10. Final Submission & Sync Engine

### 10.1 Final Submission Flow

When user clicks "Submit" on final step:

#### Step 1: Save as DRAFTED in SQLite
1. Update `cases.status` to `'DRAFTED'`
2. Save complete form data to `case_forms`
3. Save all images metadata to `case_images`
4. Update `cases.last_saved` timestamp
5. **This happens immediately, regardless of internet connection**

#### Step 2: Check Internet Connection
1. Check if device has internet connectivity
2. Check connection quality (fast/slow)

#### Step 3A: Internet Available & Fast (< 30 seconds)
1. Update `cases.status` to `'SYNCING'`
2. Show "Submitting..." indicator to user
3. Upload images first (unsynced only)
   - Get image file paths from `case_images` table
   - Upload each image to server
   - Receive server image IDs
4. Submit form JSON with image IDs
5. On successful API response:
   - Update `cases.status` to `'SYNCED'`
   - **Delete case from SQLite** (remove from `cases`, `case_forms`, `case_images`)
   - **Delete image files from file system**
   - Show "Submitted successfully" message
6. On API error:
   - Update `cases.status` to `'FAILED'`
   - Keep data in SQLite
   - Show error message with retry option

#### Step 3B: No Internet OR Slow Connection (> 30 seconds)
1. Show dialog to user:
   ```
   "No internet connection detected / Connection is slow.
   
   Your case has been saved as draft and will be synced automatically when connection is restored.
   
   You can also manually sync later from the drafts list.
   
   [OK]"
   ```
2. Keep `cases.status` as `'DRAFTED'`
3. Keep all data in SQLite
4. Add case to sync queue (for automatic retry when internet returns)

### 10.2 Sync Queue & Automatic Retry

#### Background Sync Service
- Monitor internet connectivity
- When connection restored:
  - Check for cases with status `'DRAFTED'` or `'FAILED'`
  - Attempt to sync each case
  - Update status based on result

#### Manual Sync
- User can view list of drafts (`DRAFTED` and `FAILED` status)
- User can manually trigger sync for specific case
- Show sync progress and status

### 10.3 Sync Order (Important)
1. Upload images (unsynced only)
2. Receive server image IDs
3. Submit form JSON (with image IDs)
4. Mark case as SYNCED
5. Delete local data only after server confirms success

### 10.4 Retry-Safe Sync Rules
- One case at a time
- Image-level sync tracking
- Resume from last failure
- Never delete local data until server confirms success
- Timeout after 30 seconds, mark as FAILED
- Allow user to retry manually

---

## 11. Error & Crash Safety

### Why This Is Safe
- ✅ SQLite uses transactions (atomic operations)
- ✅ Partial writes rollback automatically
- ✅ Images are independent files
- ✅ App crash ≠ data loss
- ✅ File system is persistent

### Error Handling
1. **Database Errors:**
   - Catch SQL errors
   - Rollback transaction
   - Log error for debugging
   - Don't break user flow

2. **File System Errors:**
   - Handle permission errors
   - Handle disk full errors
   - Handle file not found errors
   - Show user-friendly messages

3. **Data Corruption:**
   - Validate JSON before parsing
   - Handle missing fields gracefully
   - Use default values for missing data

---

## 12. Performance Characteristics

| Scenario            | Result        |
| ------------------- | ------------- |
| 1–5 cases           | Instant       |
| 20+ cases           | Still instant |
| Low-end Android     | Stable        |
| App killed mid-save | Safe          |
| 10+ images per case | Fast          |

---

## 13. What Is Explicitly NOT Allowed

❌ Base64 images in storage  
❌ AsyncStorage for form data  
❌ One giant JSON for all cases  
❌ Sync on UI thread  
❌ Deleting drafts before server confirmation  
❌ Trusting temporary camera files  

---

## 14. File Structure

```
src/
├── utils/
│   ├── database.js              # NEW: SQLite database operations
│   ├── fileStorage.js           # NEW: File system operations
│   └── storage.js               # Existing (for tokens only)
├── services/
│   └── caseStorageService.js    # NEW: High-level storage API
└── screens/
    └── ProcessApplicationScreen.js  # Main implementation
```

---

## 15. Dependencies

### Required (To Install)
- `react-native-sqlite-storage` - SQLite database
- `react-native-fs` - File system operations

### Already Installed
- `@react-native-async-storage/async-storage` ✅ (for tokens only)

### Installation Commands
```bash
npm install react-native-sqlite-storage
npm install react-native-fs

# iOS
cd ios && pod install && cd ..

# Android - no additional setup needed (auto-linked)
```

---

## 16. Implementation Priority

### Phase 1 (Current - High Priority)
1. ✅ Install dependencies (SQLite, react-native-fs, NetInfo)
2. ✅ Create database utility (`database.js`)
3. ✅ Create file system utility (`fileStorage.js`)
4. ✅ Create storage service (`caseStorageService.js`)
5. ✅ Create sync service (`syncService.js`)
6. ✅ Initialize database on app start
7. ✅ Add load on mount
8. ✅ Add auto-save on form changes
9. ✅ **Add save on step navigation (CRITICAL - must save before step change)**
10. ✅ Add save on image operations
11. ✅ Add save on unmount
12. ✅ **Implement final submission flow:**
    - Save as DRAFTED in SQLite
    - Check internet connection
    - Submit to server if connected and fast
    - Handle no internet / slow connection
    - Delete from SQLite only on successful submission
13. ✅ Add visual feedback
14. ✅ Add network connectivity detection
15. ✅ Add timeout handling (30 seconds)

### Phase 2 (Future - Medium Priority)
1. Background sync service (automatic retry when internet returns)
2. Draft management UI (list of DRAFTED/FAILED cases)
3. Manual sync option for specific cases
4. Conflict resolution
5. Sync progress indicators
6. Retry failed submissions

---

## 17. Testing Checklist

### A. Save Functionality
- [ ] Form data saves correctly to SQLite
- [ ] Images copy to file system correctly
- [ ] Image metadata saves to database
- [ ] Current step is saved
- [ ] Timestamp is saved correctly
- [ ] Save works with both caseId and referenceNumber
- [ ] Transaction rollback on error

### B. Load Functionality
- [ ] Draft loads on mount
- [ ] Form data restores correctly
- [ ] Images display correctly (file paths → URIs)
- [ ] Current step restores correctly
- [ ] Works with both caseId and referenceNumber
- [ ] Handles missing files gracefully

### C. Edge Cases
- [ ] No draft exists (fresh start)
- [ ] Corrupted database (graceful handling)
- [ ] Missing image files
- [ ] Case ID mismatch (different case)
- [ ] Multiple images (20+)
- [ ] Large images (near 100KB limit)
- [ ] App killed mid-save (data persists)
- [ ] Disk full error
- [ ] **No internet on final submission (saves as DRAFTED)**
- [ ] **Slow internet on final submission (> 30 sec timeout)**
- [ ] **API timeout (30 seconds)**
- [ ] **API error (keeps as DRAFTED/FAILED)**
- [ ] **Successful submission (deletes from SQLite)**
- [ ] **Step navigation saves data before change**
- [ ] **Returning to case loads correct step and data**

### D. User Experience
- [ ] Auto-save doesn't interrupt typing
- [ ] Save indicator shows correctly
- [ ] Load indicator shows correctly
- [ ] Draft restored message appears
- [ ] No performance lag with many images
- [ ] Fast load times (< 100ms)
- [ ] **Step navigation saves before changing step**
- [ ] **Returning to case shows correct step and all data**
- [ ] **Final submission shows "Submitting..." indicator**
- [ ] **No internet message is user-friendly**
- [ ] **Slow connection message is clear**
- [ ] **Success message after submission**
- [ ] **Error message with retry option**

---

## 18. Migration & Future-Proofing

- Form versioning supported in `form_json`
- New fields won't break old drafts
- Image storage already scalable
- Database schema can evolve with migrations
- Easy to add sync functionality later

---

## 19. Summary

**Storage:** SQLite for form data, File System for images  
**Images:** Stored as files (NOT base64)  
**Auto-Save:** Debounced (2 seconds after last change)  
**Load:** On mount, restore form data and current step  
**Triggers:** Form changes, step navigation, image operations, unmount  
**Error Handling:** Transaction-safe, graceful degradation  
**Performance:** Fast, scalable, crash-safe  
**Architecture:** Production-grade, offline-first, zero data loss

---

## 20. Success Criteria

### Must Have
- ✅ Form data persists across app sessions
- ✅ Images persist across app sessions
- ✅ Current step is restored
- ✅ No data loss when app is closed
- ✅ Works reliably for 20+ images per case
- ✅ Fast load times (< 100ms)
- ✅ Crash-safe (transactions)

### Nice to Have
- ✅ Visual feedback for save/load
- ✅ Draft conflict resolution
- ✅ Sync functionality
- ✅ Draft management UI

---

**Status:** Ready for Implementation  
**Architecture:** Production-Grade (SQLite + File System)  
**Last Updated:** 2026-01-23  
**Next Steps:** Begin implementation following this plan
