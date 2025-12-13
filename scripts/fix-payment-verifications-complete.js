const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Fixing payment_verifications table completely at:', dbPath);

const db = new Database(dbPath);

try {
    // Backup existing data
    console.log('\n=== BACKING UP DATA ===');
    const existingData = db.prepare("SELECT * FROM payment_verifications").all();
    console.log(`Found ${existingData.length} existing records`);

    // Drop and recreate table with correct schema
    console.log('\n=== RECREATING TABLE ===');
    db.prepare("DROP TABLE IF EXISTS payment_verifications").run();

    db.prepare(`
        CREATE TABLE payment_verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            booking_id INTEGER,
            subscription_id INTEGER,
            consultation_id INTEGER,
            amount INTEGER NOT NULL,
            payment_method TEXT NOT NULL,
            payer_name TEXT NOT NULL,
            bank_name TEXT,
            account_number TEXT,
            transaction_id TEXT,
            phone_number TEXT NOT NULL,
            status TEXT DEFAULT 'pending' NOT NULL,
            admin_notes TEXT,
            verified_by INTEGER,
            verified_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (booking_id) REFERENCES bookings(id),
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
            FOREIGN KEY (consultation_id) REFERENCES consultations(id),
            FOREIGN KEY (verified_by) REFERENCES users(id)
        )
    `).run();

    console.log('✅ Table recreated with correct schema');

    // Restore data if any existed
    if (existingData.length > 0) {
        console.log('\n=== RESTORING DATA ===');
        const insert = db.prepare(`
            INSERT INTO payment_verifications (
                id, user_id, booking_id, subscription_id, consultation_id,
                amount, payment_method, payer_name, bank_name, account_number,
                transaction_id, phone_number, status, admin_notes,
                verified_by, verified_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const row of existingData) {
            try {
                insert.run(
                    row.id,
                    row.user_id,
                    row.booking_id || null,
                    row.subscription_id || null,
                    row.consultation_id || null,
                    row.amount,
                    row.payment_method || 'unknown',
                    row.payer_name || 'Unknown',
                    row.bank_name || null,
                    row.account_number || null,
                    row.transaction_id || null,
                    row.phone_number || '0000000000',
                    row.status || 'pending',
                    row.admin_notes || row.notes || null,
                    row.verified_by || null,
                    row.verified_at || null,
                    row.created_at || new Date().toISOString(),
                    row.updated_at || row.created_at || new Date().toISOString()
                );
            } catch (e) {
                console.log(`⚠️  Skipped row ${row.id}: ${e.message}`);
            }
        }
        console.log(`✅ Restored ${existingData.length} records`);
    }

    // Verify final schema
    console.log('\n=== FINAL SCHEMA ===');
    const finalColumns = db.prepare("PRAGMA table_info(payment_verifications)").all();
    console.log('Columns:', finalColumns.map(c => c.name).join(', '));

    console.log('\n✅ Schema fix complete!');

} catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
} finally {
    db.close();
}
