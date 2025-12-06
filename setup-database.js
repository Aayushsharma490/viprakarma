import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbPath = path.resolve(process.cwd(), 'local.db');
const dbWalPath = path.resolve(process.cwd(), 'local.db-wal');
const dbShmPath = path.resolve(process.cwd(), 'local.db-shm');

const config = {
  url: process.env.TURSO_CONNECTION_URL || `file:${dbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN || '',
};

const client = createClient(config);

const schema = `
-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS payment_verifications;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS pandits;
DROP TABLE IF EXISTS astrologers;

-- Create tables

CREATE TABLE astrologers (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	password TEXT NOT NULL,
	phone TEXT NOT NULL,
	specializations TEXT NOT NULL,
	experience INTEGER NOT NULL,
	rating REAL,
	total_consultations INTEGER DEFAULT 0,
	hourly_rate INTEGER NOT NULL,
	is_approved INTEGER DEFAULT false,
	bio TEXT,
	photo TEXT,
	is_online INTEGER DEFAULT false,
	created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX astrologers_email_unique ON astrologers (email);

CREATE TABLE pandits (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	name TEXT NOT NULL,
	specialization TEXT NOT NULL,
	experience INTEGER NOT NULL,
	languages TEXT NOT NULL,
	rating REAL DEFAULT 4.5,
	price_per_hour INTEGER NOT NULL,
	location TEXT NOT NULL,
	description TEXT,
	image_url TEXT,
	available INTEGER DEFAULT true,
	is_approved INTEGER DEFAULT false,
	created_at TEXT NOT NULL
);

CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	email TEXT NOT NULL,
	password TEXT NOT NULL,
	name TEXT NOT NULL,
	phone TEXT,
	date_of_birth TEXT,
	time_of_birth TEXT,
	place_of_birth TEXT,
	subscription_plan TEXT DEFAULT 'free' NOT NULL,
	subscription_expiry TEXT,
	is_admin INTEGER DEFAULT false NOT NULL,
	can_chat_with_astrologer INTEGER DEFAULT false NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX users_email_unique ON users (email);

CREATE TABLE consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id INTEGER NOT NULL,
  astrologer_id INTEGER,
  mode TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' NOT NULL,
  request_status TEXT DEFAULT 'waiting_admin' NOT NULL,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (astrologer_id) REFERENCES astrologers (id)
);

CREATE TABLE bookings (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	user_id INTEGER NOT NULL,
	astrologer_id INTEGER,
	booking_type TEXT NOT NULL,
	service_type TEXT NOT NULL,
	scheduled_date TEXT NOT NULL,
	scheduled_time TEXT NOT NULL,
	duration INTEGER NOT NULL,
	amount INTEGER NOT NULL,
	status TEXT DEFAULT 'pending' NOT NULL,
	notes TEXT,
	created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (astrologer_id) REFERENCES astrologers (id)
);

CREATE TABLE subscriptions (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	user_id INTEGER NOT NULL,
	plan TEXT NOT NULL,
	amount INTEGER NOT NULL,
	start_date TEXT NOT NULL,
	end_date TEXT NOT NULL,
	razorpay_order_id TEXT NOT NULL,
	razorpay_payment_id TEXT,
	status TEXT DEFAULT 'pending' NOT NULL,
	created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE payments (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	user_id INTEGER NOT NULL,
	booking_id INTEGER,
	subscription_id INTEGER,
	amount INTEGER NOT NULL,
	currency TEXT DEFAULT 'INR' NOT NULL,
	razorpay_order_id TEXT NOT NULL,
	razorpay_payment_id TEXT,
	razorpay_signature TEXT,
	status TEXT DEFAULT 'pending' NOT NULL,
	created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (booking_id) REFERENCES bookings (id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
);

CREATE TABLE payment_verifications (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
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
	status TEXT DEFAULT 'pending' NOT NULL,
	admin_notes TEXT,
	verified_by INTEGER,
	verified_at TEXT,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (booking_id) REFERENCES bookings (id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions (id),
  FOREIGN KEY (consultation_id) REFERENCES consultations (id),
  FOREIGN KEY (verified_by) REFERENCES users (id)
);

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
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (astrologer_id) REFERENCES astrologers (id)
);

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
  FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
);
`;

async function setupDatabase() {
  try {
    console.log('--- Starting Database Setup ---');
    
    // This script connects directly to the file.
    // We will skip deleting the file to avoid EBUSY errors.
    // The SQL script already handles dropping tables.
    
    /*
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Deleted existing local.db file.');
    }
    if (fs.existsSync(dbWalPath)) {
      fs.unlinkSync(dbWalPath);
      console.log('Deleted existing local.db-wal file.');
    }
    if (fs.existsSync(dbShmPath)) {
      fs.unlinkSync(dbShmPath);
      console.log('Deleted existing local.db-shm file.');
    }
    */

    console.log(`Connecting to database at: ${config.url}`);
    
    console.log('Executing schema setup...');
    await client.batch(schema.split(';').filter(s => s.trim()));
    console.log('✅ Schema setup complete. All tables created.');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error);
  } finally {
    client.close();
    console.log('--- Database Setup Finished ---');
  }
}

setupDatabase();
