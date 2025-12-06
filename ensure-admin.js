const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

function nowISO() { return new Date().toISOString(); }

async function upsertAdmin(client, email, password, name) {
  const now = nowISO();
  const hash = await bcrypt.hash(password, 10);
  const select = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email.toLowerCase()] });
  if (select.rows.length > 0) {
    const id = select.rows[0].id;
    await client.execute({
      sql: `UPDATE users SET password=?, name=?, is_admin=1, updated_at=? WHERE id=?`,
      args: [hash, name, now, id]
    });
    return { action: 'updated', id };
  } else {
    const res = await client.execute({
      sql: `INSERT INTO users (email, password, name, phone, subscription_plan, is_admin, can_chat_with_astrologer, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'free', 1, 1, ?, ?)`,
      args: [email.toLowerCase(), hash, name, '9999999999', now, now]
    });
    return { action: 'inserted', id: res.lastInsertRowid };
  }
}

(async function run(){
  try {
    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || ''
    });
    console.log('DB:', process.env.TURSO_CONNECTION_URL || 'file:./local.db');

    const targets = [
      { email: 'admin@kundali.com', pass: 'Admin@123', name: 'Admin User' },
      { email: 'viprakarma@gmail.com', pass: 'Admin@123', name: 'Viprakarma Admin' },
      { email: 'admin@viprakarma.com', pass: 'Admin@123', name: 'Viprakarma Admin' },
    ];

    for (const t of targets) {
      const res = await upsertAdmin(client, t.email, t.pass, t.name);
      console.log(`${res.action} admin`, t.email, 'id=', res.id);
    }

    console.log('\nUse one of these credentials on /admin/login:');
    console.log('- admin@kundali.com / Admin@123');
    console.log('- viprakarma@gmail.com / Admin@123');
    console.log('- admin@viprakarma.com / Admin@123');
  } catch (e) {
    console.error('ensure-admin failed:', e);
    process.exitCode = 1;
  }
})();
