import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

// Create fresh database
const sqlite = new Database('viprakarma.db');
const db = drizzle(sqlite, { schema });

// Create tables
sqlite.exec(`
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
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

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

  CREATE TABLE IF NOT EXISTS bookings (
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
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (astrologer_id) REFERENCES astrologers(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL,
    amount INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
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
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
  );

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
    created_at TEXT NOT NULL
  );
`);

// Create admin user
const adminPassword = await bcrypt.hash('admin123', 10);
const now = new Date().toISOString();

sqlite.prepare(`
  INSERT INTO users (email, password, name, is_admin, subscription_plan, can_chat_with_astrologer, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run('admin@viprakarma.com', adminPassword, 'Admin', 1, 'free', 0, now, now);

console.log('✅ Database reset complete!');
console.log('✅ Admin user created: admin@viprakarma.com / admin123');
console.log('✅ All tables created');
console.log('✅ Ready for fresh signups');

sqlite.close();
