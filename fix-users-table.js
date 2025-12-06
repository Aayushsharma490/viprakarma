const Database = require('better-sqlite3');
const db = new Database('./local.db');

console.log('Dropping and recreating users table with correct schema...');

db.exec('DROP TABLE IF EXISTS users;');

db.exec(`CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  date_of_birth TEXT,
  time_of_birth TEXT,
  place_of_birth TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  subscription_expiry TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  can_chat_with_astrologer INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`);

console.log('Users table recreated.');

const now = new Date().toISOString();
const insert = db.prepare('INSERT INTO users (email, password, name, phone, subscription_plan, is_admin, can_chat_with_astrologer, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

insert.run('test@example.com', 'password', 'Test User', '1234567890', 'free', 0, 0, now, now);
insert.run('user1@example.com', 'password', 'User One', '1234567890', 'free', 0, 0, now, now);
insert.run('user2@example.com', 'password', 'User Two', '1234567890', 'premium', 0, 1, now, now);
insert.run('admin@example.com', 'password', 'Admin User', '1234567890', 'vip', 1, 1, now, now);

console.log('Test users inserted.');
db.close();
