const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Migrating database (v3 - Chat Tables) at:', dbPath);

const db = new Database(dbPath);

try {
    // 1. CHAT SESSIONS
    db.prepare(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            astrologer_id INTEGER,
            session_type TEXT NOT NULL,
            messages TEXT NOT NULL, -- JSON string
            status TEXT DEFAULT 'active' NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT,
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
        )
    `).run();
    console.log("Verified/Created 'chat_sessions' table.");

    // 2. CHAT MESSAGES
    db.prepare(`
        CREATE TABLE IF NOT EXISTS chat_messages (
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
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
            FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
        )
    `).run();
    console.log("Verified/Created 'chat_messages' table.");

} catch (err) {
    console.error('Migration v3 failed:', err);
} finally {
    db.close();
}
