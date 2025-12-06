const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'local.db');
let db;

try {
  db = new Database(dbPath);
  console.log('Connected to the database.');

  // Check for chat_sessions table
  const sessionsTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_sessions';").get();
  if (!sessionsTableCheck) {
    console.log('Creating chat_sessions table...');
    db.exec(`
      CREATE TABLE chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER NOT NULL,
        astrologer_id INTEGER,
        session_type TEXT NOT NULL,
        messages TEXT NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (astrologer_id) REFERENCES astrologers(id)
      );
    `);
    console.log('chat_sessions table created successfully.');
  } else {
    console.log('chat_sessions table already exists.');
  }

  // Check for chat_messages table
  const messagesTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_messages';").get();
  if (!messagesTableCheck) {
    console.log('Creating chat_messages table...');
    db.exec(`
      CREATE TABLE chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        session_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        sender_type TEXT NOT NULL,
        message_type TEXT DEFAULT 'text' NOT NULL,
        content TEXT,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
      );
    `);
    console.log('chat_messages table created successfully.');
  } else {
    console.log('chat_messages table already exists.');
  }

} catch (err) {
  console.error('Database operation failed:', err.message);
} finally {
  if (db) {
    db.close();
    console.log('Database connection closed.');
  }
}
