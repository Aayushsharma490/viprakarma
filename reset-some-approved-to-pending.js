const { createClient } = require('@libsql/client');

function nowISO() { return new Date().toISOString(); }

(async function run() {
  try {
    const count = parseInt(process.argv[2] || '5', 10);
    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    console.log('DB:', process.env.TURSO_CONNECTION_URL || 'file:./local.db', '— flipping', count, 'approved → pending');

    const now = nowISO();
    // Flip the most recent N approved rows to pending
    const res = await client.execute({
      sql: `UPDATE payment_verifications
            SET status = 'pending', verified_by = NULL, verified_at = NULL, updated_at = ?
            WHERE id IN (
              SELECT id FROM payment_verifications
              WHERE status = 'approved'
              ORDER BY COALESCE(updated_at, created_at) DESC
              LIMIT ?
            )`,
      args: [now, count],
    });
    console.log('Rows updated:', res.rowsAffected ?? 'unknown');

    const check = await client.execute({
      sql: `SELECT id, user_id, amount, payer_name, status, created_at, updated_at
            FROM payment_verifications
            WHERE status = 'pending'
            ORDER BY COALESCE(updated_at, created_at) DESC
            LIMIT 10`,
    });
    console.table(check.rows);
  } catch (e) {
    console.error('Failed to flip some approved → pending:', e);
    process.exitCode = 1;
  }
})();
