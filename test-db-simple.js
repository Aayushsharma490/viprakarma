const Database = require('better-sqlite3');

const sqlite = new Database('./local.db');

try {
  console.log('Testing database connection...');

  // Check if table exists
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='consultations'").all();
  console.log('Tables found:', tables);

  if (tables.length === 0) {
    console.log('Creating consultations table...');
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        astrologer_id INTEGER,
        mode TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        request_status TEXT NOT NULL DEFAULT 'waiting_admin',
        details TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    console.log('Table created successfully');
  }

  // Try to insert a test record
  const insertStmt = sqlite.prepare(`
    INSERT INTO consultations (user_id, astrologer_id, mode, payment_status, request_status, details, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertStmt.run(
    1,
    null,
    'chat',
    'pending',
    'waiting_admin',
    JSON.stringify({ test: 'data' }),
    new Date().toISOString(),
    new Date().toISOString()
  );

  console.log('Insert successful:', result);

  // Try to select
  const selectStmt = sqlite.prepare('SELECT * FROM consultations');
  const records = selectStmt.all();
  console.log('Select successful, records:', records.length);

} catch (error) {
  console.error('Database test failed:', error);
} finally {
  sqlite.close();
}
