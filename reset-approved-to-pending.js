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

    console.log('Connecting to DB:', process.env.TURSO_CONNECTION_URL || 'file:./local.db');

    const now = nowISO();
    const res = await client.execute({
      sql: `UPDATE payment_verifications
            SET status = 'pending', verified_by = NULL, verified_at = NULL, updated_at = ?
            WHERE status = 'approved'`,
      args: [now],
    });

    console.log('Rows updated (approved → pending):', res.rowsAffected ?? 'unknown');

    const check = await client.execute({
      sql: `SELECT id, user_id, amount, payment_method, payer_name, status, created_at, updated_at
            FROM payment_verifications
            WHERE status = 'pending'
            ORDER BY updated_at DESC
            LIMIT 10`,
    });
    console.log('Sample pending rows (max 10):');
    console.table(check.rows);
  } catch (e) {
    console.error('Failed to reset statuses:', e);
    process.exitCode = 1;
  }
})();
