const Database = require('better-sqlite3');

function nowISO() {
  return new Date().toISOString();
}

try {
  const db = new Database('./local.db');
  console.log('Connecting to local.db...');

  // Ensure a user exists (pick first or create a demo one)
  let user = db.prepare('SELECT id, email FROM users ORDER BY id ASC LIMIT 1').get();
  if (!user) {
    console.log('No users found. Creating a demo user...');
    const stmt = db.prepare(`INSERT INTO users (
      email, password, name, phone, subscription_plan, is_admin, can_chat_with_astrologer, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const now = nowISO();
    stmt.run('demo_pending@viprakarma.local', 'password', 'Demo Pending User', '9999999999', 'free', 0, 0, now, now);
    user = db.prepare('SELECT id, email FROM users ORDER BY id ASC LIMIT 1').get();
  }

  console.log('Using user:', user);

  // Insert a demo pending payment verification
  const insertPV = db.prepare(`INSERT INTO payment_verifications (
    user_id, booking_id, subscription_id, consultation_id, amount, payment_method, payer_name,
    bank_name, account_number, transaction_id, phone_number, status, admin_notes, verified_by,
    verified_at, created_at, updated_at
  ) VALUES (?, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NULL, NULL, ?, ?)`);

  const createdAt = nowISO();
  const result = insertPV.run(
    user.id,
    299,
    'Bank Transfer',
    'Demo Pending',
    'Demo Bank',
    'DEMO-ACC-0001',
    'DEMO-TXN-0001',
    '9999999999',
    createdAt,
    createdAt
  );

  console.log('Inserted pending payment_verifications id =', result.lastInsertRowid);
  console.log('Open Admin → Payments to view the pending record.');
  db.close();
} catch (e) {
  console.error('Failed to create demo pending payment:', e);
  process.exitCode = 1;
}
