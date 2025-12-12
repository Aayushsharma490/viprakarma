const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function main() {
    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
        authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    try {
        console.log('Adding "active_consultation_astrologer_id" column...');
        await client.execute('ALTER TABLE users ADD COLUMN active_consultation_astrologer_id integer');
        console.log('Added "active_consultation_astrologer_id" column.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('"active_consultation_astrologer_id" column already exists.');
        } else {
            console.error('Error adding "active_consultation_astrologer_id":', e);
        }
    }

    // Verify it exists
    const result = await client.execute("PRAGMA table_info(users)");
    const columns = result.rows.map(r => r.name);
    console.log('Current columns:', columns);

    if (columns.includes('active_consultation_astrologer_id')) {
        console.log('SUCCESS: active_consultation_astrologer_id column verified.');
    } else {
        console.log('FAILURE: active_consultation_astrologer_id column missing.');
    }
}

main();
