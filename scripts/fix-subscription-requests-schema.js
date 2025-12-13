const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Fixing subscription_requests table at:', dbPath);

const db = new Database(dbPath);

try {
    console.log('\n=== CHECKING SUBSCRIPTION_REQUESTS SCHEMA ===');
    const currentColumns = db.prepare("PRAGMA table_info(subscription_requests)").all();
    console.log('Current columns:', currentColumns.map(c => c.name).join(', '));

    const hasRequestedAt = currentColumns.some(c => c.name === 'requested_at');

    if (!hasRequestedAt) {
        console.log('\n❌ Missing requested_at column');
        console.log('Adding requested_at column...');

        db.prepare(`
            ALTER TABLE subscription_requests 
            ADD COLUMN requested_at TEXT NOT NULL DEFAULT (datetime('now'))
        `).run();

        console.log('✅ Added requested_at column');
    } else {
        console.log('\n✅ requested_at column already exists');
    }

    // Verify
    console.log('\n=== UPDATED SCHEMA ===');
    const updatedColumns = db.prepare("PRAGMA table_info(subscription_requests)").all();
    console.log('Columns:', updatedColumns.map(c => c.name).join(', '));

    console.log('\n✅ Schema fix complete!');

} catch (err) {
    console.error('❌ Error:', err.message);
} finally {
    db.close();
}
