const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'viprakarma.db');
console.log('📁 Database path:', dbPath);

const db = new Database(dbPath);

console.log('🗄️  Creating database tables...');

// Create all tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
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
    reset_token TEXT,
    reset_token_expiry TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- Astrologers table
  CREATE TABLE IF NOT EXISTS astrologers (
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

  -- Notifications table
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    link TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Bookings table
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    astrologer_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    amount INTEGER NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (astrologer_id) REFERENCES astrologers(id)
  );

  -- Subscription requests table
  CREATE TABLE IF NOT EXISTS subscription_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_id TEXT,
    payment_screenshot TEXT,
    expiry_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Payment verifications table
  CREATE TABLE IF NOT EXISTS payment_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultation_id INTEGER,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    payment_id TEXT,
    payment_screenshot TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    verified_by INTEGER,
    verified_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Mahurat subscriptions table
  CREATE TABLE IF NOT EXISTS mahurat_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    phone_number TEXT NOT NULL,
    amount INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_id TEXT,
    payment_screenshot TEXT,
    expiry_date TEXT,
    is_active INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Kundali data table
  CREATE TABLE IF NOT EXISTS kundali_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    time_of_birth TEXT NOT NULL,
    place_of_birth TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    timezone TEXT,
    kundali_data TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Consultations table
  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    astrologer_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    duration INTEGER,
    amount INTEGER NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    start_time TEXT,
    end_time TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (astrologer_id) REFERENCES astrologers(id)
  );
`);

console.log('✅ All tables created successfully!');

// Insert admin user
console.log('👤 Creating admin user...');
const hashedPassword = bcrypt.hashSync('viprakarma', 10);
const now = new Date().toISOString();

try {
    db.prepare(`
    INSERT INTO users (
      email, password, name, is_admin, subscription_plan, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('viprakarma@gmail.com', hashedPassword, 'VipraKarma Admin', 1, 'free', now, now);

    console.log('✅ Admin user created successfully!');
} catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
        console.log('ℹ️  Admin user already exists');
    } else {
        throw error;
    }
}

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\n📊 Database tables:');
tables.forEach(table => console.log(`   - ${table.name}`));

// Verify admin user
const adminUser = db.prepare('SELECT email, name, is_admin FROM users WHERE is_admin = 1').get();
console.log('\n👤 Admin user:');
console.log(`   Email: ${adminUser.email}`);
console.log(`   Name: ${adminUser.name}`);
console.log(`   Password: viprakarma`);

db.close();

console.log('\n✅ Database initialization complete!');
console.log('\n🚀 You can now:');
console.log('   1. Login as admin: viprakarma@gmail.com / viprakarma');
console.log('   2. Test forgot password feature');
console.log('   3. Add/edit/delete pandits');
console.log('   4. All features should work!');
