const Database = require('better-sqlite3');
const db = new Database('./local.db');

try {
  console.log('Recreating payment_verifications table...');
  db.exec('DROP TABLE IF EXISTS payment_verifications;');
  db.exec(`
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
  `);
  console.log('Done.');
} catch (e) {
  console.error('Failed:', e);
  process.exitCode = 1;
} finally {
  db.close();
}
