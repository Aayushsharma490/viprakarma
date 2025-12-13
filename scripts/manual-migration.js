const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Migrating database at:', dbPath);

const db = new Database(dbPath);

try {
    // 1. Fix 'consultations' table: Add 'mode' column
    try {
        const tableInfo = db.prepare("PRAGMA table_info(consultations)").all();
        const hasMode = tableInfo.some(c => c.name === 'mode');
        if (!hasMode) {
            console.log("Adding 'mode' column to 'consultations' table...");
            db.prepare("ALTER TABLE consultations ADD COLUMN mode TEXT").run();
            console.log("Done.");
        } else {
            console.log("'consultations' table already has 'mode' column.");
        }
    } catch (e) {
        console.error("Error checking/updating consultations table:", e.message);
    }

    // 2. Fix 'subscription_requests' table: Add 'payment_method' column
    try {
        const tableInfo = db.prepare("PRAGMA table_info(subscription_requests)").all();
        const hasPaymentMethod = tableInfo.some(c => c.name === 'payment_method');
        if (!hasPaymentMethod) {
            console.log("Adding 'payment_method' column to 'subscription_requests' table...");
            db.prepare("ALTER TABLE subscription_requests ADD COLUMN payment_method TEXT").run();
            console.log("Done.");
        } else {
            console.log("'subscription_requests' table already has 'payment_method' column.");
        }
    } catch (e) {
        console.error("Error checking/updating subscription_requests table:", e.message);
    }

    // 3. Create 'pooja_bookings' table if not exists
    try {
        console.log("Checking 'pooja_bookings' table...");
        db.prepare(`
            CREATE TABLE IF NOT EXISTS pooja_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                pooja_type TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT,
                location TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending' NOT NULL,
                amount INTEGER,
                created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
                updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
            )
        `).run();
        console.log("'pooja_bookings' table ensure created.");
    } catch (e) {
        console.error("Error creating pooja_bookings table:", e.message);
    }

    // 4. Create 'chat_messages' table if not exists (since it was mentioned in the hanging migration)
    try {
        console.log("Checking 'chat_messages' table...");
        db.prepare(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                sender_id TEXT NOT NULL,
                sender_role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                is_read INTEGER DEFAULT 0
            )
         `).run();
        console.log("'chat_messages' table ensure created.");
    } catch (e) {
        console.error("Error creating chat_messages table:", e.message);
    }

    // 5. Check 'payment_verifications' table for 'user_id'
    try {
        const tableInfo = db.prepare("PRAGMA table_info(payment_verifications)").all();
        // Just listing columns to be sure
        console.log("payment_verifications columns:", tableInfo.map(c => c.name).join(', '));
    } catch (e) {
        console.error("Error checking payment_verifications table:", e.message);
    }

} catch (err) {
    console.error('Migration failed:', err);
} finally {
    db.close();
}
