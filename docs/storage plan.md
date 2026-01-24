# Offline-First Auto-Save & Sync Architecture (Production Grade)

This document defines a **robust, scalable, and field-tested** approach to auto-save large forms and images per case in a React Native CLI app. It is designed for **offline-first verification/KYC apps** with zero data loss, zero lag, and safe sync when internet is restored.

---

## 1. Core Principles (Non-Negotiable)

1. **Offline-first by design** – everything must work without internet
2. **Case-based isolation** – one case never affects another
3. **SQLite for structured data** – forms, cases, metadata
4. **File system for images** – never store images as base64 in storage
5. **Incremental auto-save** – no full rewrites on every keystroke
6. **Sync-safe architecture** – retries, resume, crash-safe

---

## 2. Storage Stack (Final Choice)

| Purpose          | Technology                  | Reason                             |
| ---------------- | --------------------------- | ---------------------------------- |
| Case & form data | SQLite                      | Fast, structured, crash-safe       |
| Images           | File System (Documents dir) | No size limits, zero memory spikes |
| Image metadata   | SQLite                      | Queryable, syncable                |
| Small flags      | AsyncStorage / MMKV         | Tokens, booleans only              |

> ❌ AsyncStorage is NOT used for forms or images

---

## 3. Folder Structure (Images)

```
/app_data/
 └── cases/
     └── {case_id}/
         ├── img_1.jpg
         ├── img_2.jpg
         └── img_3.jpg
```

* Images are copied here immediately after capture
* Original temp camera files are never trusted

---

## 4. Database Schema

### 4.1 cases

```sql
CREATE TABLE cases (
  id TEXT PRIMARY KEY,
  reference_number TEXT,
  status TEXT,           -- DRAFT | SYNCED | FAILED
  current_step TEXT,
  last_saved TEXT
);
```

---

### 4.2 case_forms

```sql
CREATE TABLE case_forms (
  case_id TEXT PRIMARY KEY,
  form_json TEXT
);
```

* `form_json` stores the entire form object as JSON string
* Form structure can evolve with versioning

---

### 4.3 case_images

```sql
CREATE TABLE case_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT,
  file_path TEXT,
  latitude REAL,
  longitude REAL,
  address TEXT,
  accuracy REAL,
  captured_at TEXT,
  synced INTEGER DEFAULT 0
);
```

---

## 5. Save Strategy (Auto-Save)

### 5.1 Auto-Save Triggers

* Field blur / change (debounced 2 seconds)
* Step navigation (immediate)
* Image add / delete (immediate)
* App background / screen unmount

---

### 5.2 Auto-Save Logic (Conceptual)

* Save **only the active case**
* Update only changed rows
* Never block UI thread

```
Form Change
   ↓ (debounce)
Update case_forms
Update cases.last_saved
```

---

## 6. Loading a Case (Zero Lag)

### On Screen Mount

1. Load case metadata from `cases`
2. Load `form_json` from `case_forms`
3. Load images from `case_images`
4. Hydrate UI state

All operations are local and instant.

---

## 7. Draft States

| Status | Meaning                   |
| ------ | ------------------------- |
| DRAFT  | Saved locally, not synced |
| SYNCED | Uploaded successfully     |
| FAILED | Sync attempted but failed |

Status is stored in `cases.status`.

---

## 8. Sync Engine (When Internet Returns)

### Sync Order (Important)

1. Upload images (unsynced only)
2. Receive server image IDs
3. Submit form JSON (with image IDs)
4. Mark case as SYNCED

---

### Retry-Safe Sync Rules

* One case at a time
* Image-level sync tracking
* Resume from last failure
* Never delete local data until confirmed

---

## 9. Error & Crash Safety

### Why This Is Safe

* SQLite uses transactions
* Partial writes rollback automatically
* Images are independent files
* App crash ≠ data loss

---

## 10. What Is Explicitly NOT Allowed

❌ Base64 images in storage
❌ AsyncStorage for form data
❌ One giant JSON for all cases
❌ Sync on UI thread
❌ Deleting drafts before server confirmation

---

## 11. Performance Characteristics

| Scenario            | Result        |
| ------------------- | ------------- |
| 1–5 cases           | Instant       |
| 20+ cases           | Still instant |
| Low-end Android     | Stable        |
| App killed mid-save | Safe          |

---

## 12. Migration & Future-Proofing

* Form versioning supported in `form_json`
* New fields won’t break old drafts
* Image storage already scalable

---

## 13. Summary (Final Verdict)

This architecture is:

✅ Offline-first
✅ Zero-lag
✅ Crash-safe
✅ Scalable to 100+ cases
✅ Used in real banking & verification apps

This should be considered the **baseline**, not an optimization.

---

**Status:** Production-ready
**Recommended:** Yes (No shortcuts)
