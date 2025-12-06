const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

function nowISO() { return new Date().toISOString(); }

(async function run(){
  try {
    const emailArg = process.argv[2];
    const newPassword = process.argv[3];
    if (!emailArg || !newPassword) {
      console.error('Usage: node set-admin-password.js <email> <newPassword>');
      process.exit(1);
    }
    const email = String(emailArg).trim().toLowerCase();

    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || ''
    });

    const hash = await bcrypt.hash(newPassword, 10);
    const now = nowISO();

    const sel = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
    if (sel.rows.length > 0) {
      const id = sel.rows[0].id;
      await client.execute({ sql: 'UPDATE users SET password = ?, updated_at = ? WHERE id = ?', args: [hash, now, id] });
      console.log('Updated password for existing user id=', id, 'email=', email);
    } else {
      const ins = await client.execute({
        sql: `INSERT INTO users (email, password, name, phone, subscription_plan, is_admin, can_chat_with_astrologer, created_at, updated_at)
              VALUES (?, ?, ?, ?, 'free', 1, 1, ?, ?)`,
        args: [email, hash, 'Admin User', '9999999999', now, now]
      });
      console.log('Created new admin user id=', ins.lastInsertRowid, 'email=', email);
    }

    console.log('Password updated successfully.');
  } catch (e) {
    console.error('set-admin-password failed:', e);
    process.exitCode = 1;
  }
})();
