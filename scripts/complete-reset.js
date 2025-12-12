const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Delete ALL database files
const dbFiles = ['viprakarma.db', 'viprakarma.db-shm', 'viprakarma.db-wal', 'local.db'];
dbFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Deleted: ${file}`);
    }
});

console.log('🗑️  All old databases deleted');

// Create completely fresh database
const db = new Database('viprakarma.db');

// Create all tables
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    date_of_birth TEXT,
    time_of_birth TEXT,
    place_of_birth TEXT,
    subscription_plan TEXT NOT NULL DEFAULT 'free',
    subscription_expiry TEXT,
    is_mahurat_subscribed INTEGER DEFAULT 0,
    mahurat_subscription_expiry TEXT,
    is_admin INTEGER NOT NULL DEFAULT 0,
    can_chat_with_astrologer INTEGER NOT NULL DEFAULT 0,
    active_consultation_astrologer_id INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE astrologers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT NOT NULL,
    specializations TEXT NOT NULL,
    experience INTEGER NOT NULL,
    rating REAL DEFAULT 0.0,
    total_consultations INTEGER DEFAULT 0,
    hourly_rate INTEGER NOT NULL,
    is_approved INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    bio TEXT,
    photo TEXT,
    languages TEXT,
    location TEXT,
    is_online INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    link TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    astrologer_id INTEGER,
    booking_type TEXT NOT NULL,
    service_type TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL,
    amount INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );

  CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    booking_id INTEGER,
    subscription_id INTEGER,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );

  CREATE TABLE pandits (
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
    created_at TEXT NOT NULL
  );

  CREATE TABLE chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    astrologer_id INTEGER,
    session_type TEXT NOT NULL,
    messages TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    start_time TEXT NOT NULL,
    end_time TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE consultations (
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

  CREATE TABLE payment_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    booking_id INTEGER,
    subscription_id INTEGER,
    consultation_id INTEGER,
    amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    payer_name TEXT NOT NULL,
    bank_name TEXT,
    account_number TEXT,
    transaction_id TEXT,
    phone_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    verified_by INTEGER,
    verified_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE subscription_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    duration TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    transaction_id TEXT,
    payment_screenshot TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    approved_by INTEGER,
    requested_at TEXT NOT NULL,
    processed_at TEXT,
    expiry_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Create ONLY admin user
const adminPassword = bcrypt.hashSync('viprakarma', 10);
const now = new Date().toISOString();

db.prepare(`
  INSERT INTO users (email, password, name, is_admin, subscription_plan, can_chat_with_astrologer, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run('viprakarma@gmail.com', adminPassword, 'VipraKarma Admin', 1, 'free', 0, now, now);

console.log('');
console.log('✅ ========================================');
console.log('✅ FRESH DATABASE CREATED!');
console.log('✅ ========================================');
console.log('');
console.log('📊 Database Status:');
console.log('   - Users: 1 (admin only)');
console.log('   - Astrologers: 0');
console.log('   - Subscriptions: 0');
console.log('   - Payments: 0');
console.log('   - All other tables: EMPTY');
console.log('');
console.log('🔐 Admin Credentials:');
console.log('   Email: viprakarma@gmail.com');
console.log('   Password: viprakarma');
console.log('');
console.log('✅ Ready for FRESH signups!');
console.log('✅ No old users, no old data!');
console.log('');

db.close();
