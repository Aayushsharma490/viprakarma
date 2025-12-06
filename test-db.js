const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { consultations } = require('./src/db/schema');

const sqlite = new Database('./local.db');
const db = drizzle(sqlite, { schema: { consultations } });

async function testDB() {
  try {
    console.log('Testing database connection...');

    // Try to insert a test record
    const result = await db
      .insert(consultations)
      .values({
        userId: 1,
        mode: 'chat',
        paymentStatus: 'pending',
        requestStatus: 'waiting_admin',
        details: JSON.stringify({ test: 'data' }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    console.log('Insert successful:', result);

    // Try to select
    const records = await db.select().from(consultations);
    console.log('Select successful, records:', records.length);

  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    sqlite.close();
  }
}

testDB();
