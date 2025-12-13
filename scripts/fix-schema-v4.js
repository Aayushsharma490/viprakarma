const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Migrating database (v4 - Critical Fixes) at:', dbPath);

const db = new Database(dbPath);

try {
    // 1. Fix CONSULTATIONS: Make astrologer_id nullable
    // SQLite doesn't support ALTER COLUMN to remove NOT NULL. We must recreate.
    console.log("Fixing 'consultations' table...");

    // Backup existing data
    const consultationsData = db.prepare("SELECT * FROM consultations").all();

    db.prepare("DROP TABLE IF EXISTS consultations").run();

    db.prepare(`
        CREATE TABLE consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            astrologer_id INTEGER, -- Nullable
            mode TEXT NOT NULL,
            payment_status TEXT DEFAULT 'pending' NOT NULL,
            request_status TEXT DEFAULT 'waiting_admin' NOT NULL,
            details TEXT DEFAULT '{}' NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (astrologer_id) REFERENCES astrologers(id)
        )
    `).run();

    // Restore data
    if (consultationsData.length > 0) {
        const insert = db.prepare(`
            INSERT INTO consultations (id, user_id, astrologer_id, mode, payment_status, request_status, details, created_at, updated_at)
            VALUES (@id, @user_id, @astrologer_id, @mode, @payment_status, @request_status, @details, @created_at, @updated_at)
        `);
        for (const row of consultationsData) {
            insert.run(row);
        }
        console.log(`Restored ${consultationsData.length} consultations.`);
    }
    console.log("'consultations' table fixed.");

    // 2. Fix CHAT SESSIONS & MESSAGES (Recreate to be sure)
    console.log("Fixing 'chat_sessions' and 'chat_messages'...");

    // We won't backup chat headers effectively here as the table might be missing or broken, 
    // but try to preserve if exists
    let chatData = [];
    try {
        chatData = db.prepare("SELECT * FROM chat_sessions").all();
    } catch (e) { console.log("No existing chat_sessions or table missing."); }

    db.prepare("DROP TABLE IF EXISTS chat_messages").run();
    db.prepare("DROP TABLE IF EXISTS chat_sessions").run();

    db.prepare(`
        CREATE TABLE chat_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            astrologer_id INTEGER,
            session_type TEXT NOT NULL,
            messages TEXT NOT NULL,
            status TEXT DEFAULT 'active' NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT,
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (astrologer_id) REFERENCES astrologers(id)
        )
    `).run();

    db.prepare(`
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
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
            FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
        )
    `).run();

    console.log("'chat_sessions' and 'chat_messages' recreated.");

} catch (err) {
    console.error('Migration v4 failed:', err);
} finally {
    db.close();
}
