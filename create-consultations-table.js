const Database = require('better-sqlite3');
const db = new Database('./local.db');

// Create consultations table
db.exec(`
  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    astrologer_id INTEGER,
    mode TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    request_status TEXT NOT NULL DEFAULT 'waiting_admin',
    details TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (astrologer_id) REFERENCES astrologers(id)
  );
`);

console.log('Consultations table created successfully');
db.close();
