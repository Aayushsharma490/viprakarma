const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'local.db');
let db;

try {
  db = new Database(dbPath);
  console.log('Connected to the database.');

  console.log('Checking if isApproved column exists...');
  const stmt = db.prepare("PRAGMA table_info(pandits);");
  const columns = stmt.all();
  const columnExists = columns.some(col => col.name === 'isApproved');

  if (!columnExists) {
    console.log('Column isApproved does not exist. Adding it now...');
    db.exec('ALTER TABLE pandits ADD COLUMN isApproved INTEGER DEFAULT 0');
    console.log('Successfully added isApproved column to pandits table.');
  } else {
    console.log('Column isApproved already exists.');
  }

} catch (err) {
  console.error('Database operation failed:', err.message);
} finally {
  if (db) {
    db.close();
    console.log('Database connection closed.');
  }
}
