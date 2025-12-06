const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
});

(async function run() {
  try {
    const res = await client.execute('PRAGMA table_info(payment_verifications)');
    console.log(res.rows);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
})();
