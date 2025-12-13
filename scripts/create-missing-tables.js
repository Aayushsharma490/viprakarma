const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Checking for missing tables at:', dbPath);

const db = new Database(dbPath);

try {
    // 1. SUBSCRIPTIONS
    db.prepare(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            plan TEXT NOT NULL,
            amount INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            razorpay_order_id TEXT NOT NULL,
            razorpay_payment_id TEXT,
            status TEXT DEFAULT 'pending' NOT NULL,
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
        )
    `).run();
    console.log("Verified/Created 'subscriptions' table.");

    // 2. PANDITS
    db.prepare(`
        CREATE TABLE IF NOT EXISTS pandits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            specialization TEXT NOT NULL,
            experience INTEGER NOT NULL,
            languages TEXT NOT NULL,
            rating REAL DEFAULT 4.5,
            price_per_hour INTEGER NOT NULL,
            location TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            available INTEGER DEFAULT 1,
            is_approved INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
        )
    `).run();
    console.log("Verified/Created 'pandits' table.");

    // 3. PAYMENTS
    db.prepare(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            booking_id INTEGER,
            subscription_id INTEGER,
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'INR' NOT NULL,
            razorpay_order_id TEXT NOT NULL,
            razorpay_payment_id TEXT,
            razorpay_signature TEXT,
            status TEXT DEFAULT 'pending' NOT NULL,
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
        )
    `).run();
    console.log("Verified/Created 'payments' table.");

} catch (err) {
    console.error('Table creation failed:', err);
} finally {
    db.close();
}
