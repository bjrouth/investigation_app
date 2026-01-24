/**
 * SQLite Database Service
 * Handles all database operations for cases, forms, and images metadata
 * Using react-native-quick-sqlite for better performance and modern API
 */
import { open } from 'react-native-quick-sqlite';

const DATABASE_NAME = 'InvestigationApp.db';

let db = null;

/**
 * Initialize and open the database
 */
export const initDatabase = async () => {
  try {
    db = open({
      name: DATABASE_NAME,
      location: 'default',
    });

    // Create tables if they don't exist
    createTables();
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Create all required tables
 */
const createTables = () => {
  try {
    // Create cases table
    db.execute(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        reference_number TEXT,
        case_id TEXT,
        status TEXT DEFAULT 'DRAFTED',
        current_step TEXT,
        last_saved TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create case_forms table
    db.execute(`
      CREATE TABLE IF NOT EXISTS case_forms (
        case_id TEXT PRIMARY KEY,
        form_json TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id)
      );
    `);

    // Create case_images table
    db.execute(`
      CREATE TABLE IF NOT EXISTS case_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT,
        file_path TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        accuracy REAL,
        captured_at TEXT,
        source TEXT,
        synced INTEGER DEFAULT 0,
        server_image_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id)
      );
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Close database connection
 */
export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log('Database closed');
  }
};

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
};
