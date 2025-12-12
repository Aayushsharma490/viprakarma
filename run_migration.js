const { drizzle } = require('drizzle-orm/libsql');
const { migrate } = require('drizzle-orm/libsql/migrator');
const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Starting migration...');
    try {
        const client = createClient({
            url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
            authToken: process.env.TURSO_AUTH_TOKEN || '',
        });

        const db = drizzle(client);

        console.log('Running migrations from drizzle/migrations...');

        await migrate(db, { migrationsFolder: 'drizzle/migrations' });

        console.log('Migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

main();
