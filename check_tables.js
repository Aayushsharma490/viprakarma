const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function main() {
    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
        authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', result.rows.map(r => r.name));
}

main();
