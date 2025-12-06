const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'local.db');
let db;

try {
  db = new Database(dbPath, { fileMustExist: true });
  console.log('Connected to the database.');

  // Drop chat_messages first due to foreign key constraint
  try {
    db.exec('DROP TABLE IF EXISTS chat_messages');
    console.log('chat_messages table dropped.');
  } catch (error) {
    console.error('Could not drop chat_messages table:', error.message);
    throw error;
  }

  // Drop chat_sessions
  try {
    db.exec('DROP TABLE IF EXISTS chat_sessions');
    console.log('chat_sessions table dropped.');
  } catch (error) {
    console.error('Could not drop chat_sessions table:', error.message);
    throw error;
  }

  // Re-create chat_sessions table
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
  console.log('chat_sessions table created successfully.');

  // Re-create chat_messages table
  const createChatMessagesTable = `
    CREATE TABLE chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
    );
  `;
  db.exec(createChatMessagesTable);
  console.log('chat_messages table created successfully.');

  console.log('Chat tables have been successfully reset.');

} catch (error) {
  console.error('Error resetting chat tables:', error.message);
} finally {
  if (db) {
    db.close();
    console.log('Database connection closed.');
  }
}
