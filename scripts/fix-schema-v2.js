const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Migrating database (v2) at:', dbPath);

const db = new Database(dbPath);

function addColumnIfNotExists(tableName, columnName, columnDef) {
    try {
        const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const hasColumn = tableInfo.some(c => c.name === columnName);
        if (!hasColumn) {
            console.log(`Adding '${columnName}' to '${tableName}'...`);
            db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`).run();
            console.log(`Added '${columnName}'.`);
        } else {
            console.log(`'${tableName}' already has '${columnName}'.`);
        }
    } catch (e) {
        console.error(`Error checking/adding column ${columnName} to ${tableName}:`, e.message);
    }
}

try {
    // 1. SUBSCRIPTION REQUESTS: approved_by
    addColumnIfNotExists('subscription_requests', 'approved_by', 'INTEGER');

    // 2. CONSULTATIONS: details
    addColumnIfNotExists('consultations', 'details', 'TEXT DEFAULT "{}"');

    // 3. BOOKINGS: service_type
    addColumnIfNotExists('bookings', 'service_type', 'TEXT DEFAULT "consultation"');

    // 4. PAYMENT VERIFICATIONS: booking_id
    addColumnIfNotExists('payment_verifications', 'booking_id', 'INTEGER');

    console.log("Schema fix v2 completed.");

} catch (err) {
    console.error('Migration v2 failed:', err);
} finally {
    db.close();
}
