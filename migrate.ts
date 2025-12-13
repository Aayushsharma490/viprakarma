import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function main() {
  const db = drizzle(createClient({
    url: process.env.DATABASE_URL || process.env.TURSO_CONNECTION_URL || 'file:./viprakarma.db',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  }));

  console.log('Running migrations...');

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error: any) {
    // If tables already exist, that's fine - skip migration
    if (error?.code === 'SQLITE_ERROR' && error?.message?.includes('already exists')) {
      console.log('Tables already exist, skipping migration.');
      process.exit(0); // Exit successfully as existing tables are not an error for this script
    } else {
      console.error('Error running migrations:', error);
      process.exit(1);
    }
  }
}

main();
