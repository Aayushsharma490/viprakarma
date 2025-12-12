const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function main() {
    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
        authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    try {
        console.log('Adding "is_mahurat_subscribed" column...');
        await client.execute('ALTER TABLE users ADD COLUMN is_mahurat_subscribed integer DEFAULT 0');
        console.log('Added "is_mahurat_subscribed" column.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('"is_mahurat_subscribed" column already exists.');
        } else {
            console.error('Error adding "is_mahurat_subscribed":', e);
        }
    }

    try {
        console.log('Adding "mahurat_subscription_expiry" column...');
        await client.execute('ALTER TABLE users ADD COLUMN mahurat_subscription_expiry text');
        console.log('Added "mahurat_subscription_expiry" column.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('"mahurat_subscription_expiry" column already exists.');
        } else {
            console.error('Error adding "mahurat_subscription_expiry":', e);
        }
    }

    // Verify they exist
    const result = await client.execute("PRAGMA table_info(users)");
    const columns = result.rows.map(r => r.name);
    console.log('Current columns:', columns);

    if (columns.includes('is_mahurat_subscribed') && columns.includes('mahurat_subscription_expiry')) {
        console.log('SUCCESS: Mahurat columns verified.');
    } else {
        console.log('FAILURE: Mahurat columns missing.');
    }
}

main();
