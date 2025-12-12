const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function main() {
    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
        authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    try {
        console.log('Adding "languages" column...');
        await client.execute('ALTER TABLE astrologers ADD COLUMN languages text');
        console.log('Added "languages" column.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('"languages" column already exists.');
        } else {
            console.error('Error adding "languages":', e);
        }
    }

    try {
        console.log('Adding "location" column...');
        await client.execute('ALTER TABLE astrologers ADD COLUMN location text');
        console.log('Added "location" column.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('"location" column already exists.');
        } else {
            console.error('Error adding "location":', e);
        }
    }

    // Also verify they exist
    const result = await client.execute("PRAGMA table_info(astrologers)");
    const columns = result.rows.map(r => r.name);
    console.log('Current columns:', columns);

    if (columns.includes('languages') && columns.includes('location')) {
        console.log('SUCCESS: Columns verified.');
    } else {
        console.log('FAILURE: Columns missing.');
    }
}

main();
