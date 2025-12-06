const { createClient } = require('@libsql/client');

function nowISO() {
  return new Date().toISOString();
}

(async function run() {
  try {
    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    console.log('Connecting via libsql to', process.env.TURSO_CONNECTION_URL || 'file:./local.db');

    // Ensure a user exists
    let userRes = await client.execute('SELECT id, email FROM users ORDER BY id ASC LIMIT 1');
    let user = userRes.rows && userRes.rows[0];
    if (!user) {
      console.log('No users found. Creating a demo user...');
      const now = nowISO();
      await client.execute({
        sql: `INSERT INTO users (email, password, name, phone, subscription_plan, is_admin, can_chat_with_astrologer, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['demo_pending_libsql@viprakarma.local', 'password', 'Demo Pending (libsql)', '9999999999', 'free', 0, 0, now, now],
      });
      userRes = await client.execute('SELECT id, email FROM users ORDER BY id ASC LIMIT 1');
      user = userRes.rows[0];
    }

    console.log('Using user:', user);

    const now = nowISO();
    const insertRes = await client.execute({
      sql: `INSERT INTO payment_verifications (
              user_id, booking_id, subscription_id, consultation_id, amount, payment_method, payer_name,
              bank_name, account_number, transaction_id, phone_number, status, admin_notes, verified_by,
              verified_at, created_at, updated_at
            ) VALUES (?, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NULL, NULL, ?, ?)`,
      args: [user.id, 299, 'Bank Transfer', 'Demo Pending', 'Demo Bank', 'DEMO-ACC-0001', 'DEMO-TXN-0001', '9999999999', now, now],
    });

    console.log('Inserted pending payment_verifications rowId =', insertRes.lastInsertRowid);
    console.log('Open Admin → Payments and switch filter to Pending.');
  } catch (e) {
    console.error('Failed to create pending via libsql:', e);
    process.exitCode = 1;
  }
})();
