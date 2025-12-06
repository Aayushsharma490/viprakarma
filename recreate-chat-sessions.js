const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'local.db');
let db;

try {
  db = new Database(dbPath);
  console.log('Connected to the database.');

  // Drop the existing chat_sessions table
  try {
    db.exec('DROP TABLE chat_sessions');
    console.log('chat_sessions table dropped.');
  } catch (error) {
    if (error.message.includes('no such table')) {
      console.log('chat_sessions table did not exist, proceeding to create it.');
    } else {
      throw error;
    }
  }

  // Create the chat_sessions table without the 'messages' column
  const createChatSessionsTable = `
    CREATE TABLE chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        astrologer_id INTEGER,
        session_type TEXT NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (astrologer_id) REFERENCES astrologers (id)
    );
  `;
  db.exec(createChatSessionsTable);
  console.log('chat_sessions table created successfully without the messages column.');

} catch (error) {
  console.error('Error recreating chat_sessions table:', error.message);
} finally {
  if (db) {
    db.close();
    console.log('Database connection closed.');
  }
}
