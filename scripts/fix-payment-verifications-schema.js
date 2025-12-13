const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Fixing payment_verifications table at:', dbPath);

const db = new Database(dbPath);

try {
    // Check current columns
    console.log('\n=== CURRENT COLUMNS ===');
    const currentColumns = db.prepare("PRAGMA table_info(payment_verifications)").all();
    console.log(currentColumns.map(c => c.name).join(', '));

    // Check if subscription_id exists
    const hasSubscriptionId = currentColumns.some(c => c.name === 'subscription_id');

    if (!hasSubscriptionId) {
        console.log('\n❌ Missing subscription_id column');
        console.log('Adding subscription_id column...');

        db.prepare(`
            ALTER TABLE payment_verifications 
            ADD COLUMN subscription_id INTEGER REFERENCES subscriptions(id)
        `).run();

        console.log('✅ Added subscription_id column');
    } else {
        console.log('\n✅ subscription_id column already exists');
    }

    // Verify the fix
    console.log('\n=== UPDATED COLUMNS ===');
    const updatedColumns = db.prepare("PRAGMA table_info(payment_verifications)").all();
    console.log(updatedColumns.map(c => c.name).join(', '));

    console.log('\n✅ Schema fix complete!');

} catch (err) {
    console.error('❌ Error:', err.message);
} finally {
    db.close();
}
