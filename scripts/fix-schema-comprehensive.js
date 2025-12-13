const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Migrating database at:', dbPath);

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
    // 1. POOJA BOOKINGS
    // Schema: poojaName, description, date, time, location, purpose, phone, email, occasion, status, adminNotes
    addColumnIfNotExists('pooja_bookings', 'purpose', 'TEXT');
    addColumnIfNotExists('pooja_bookings', 'phone', 'TEXT DEFAULT ""'); // phone is not null in schema, giving default
    addColumnIfNotExists('pooja_bookings', 'email', 'TEXT');
    addColumnIfNotExists('pooja_bookings', 'occasion', 'TEXT');
    addColumnIfNotExists('pooja_bookings', 'admin_notes', 'TEXT');
    addColumnIfNotExists('pooja_bookings', 'pooja_name', 'TEXT DEFAULT "Unknown"');

    // 2. SUBSCRIPTION REQUESTS
    // duration (integer in earlier, text in schema currently?), paymentMethod, payerName, phoneNumber, transactionId...
    // Schema says: planId, planName, amount, duration(text), paymentMethod, payerName, phoneNumber, transactionId, paymentScreenshot, status, ...
    addColumnIfNotExists('subscription_requests', 'payment_method', 'TEXT');
    addColumnIfNotExists('subscription_requests', 'payer_name', 'TEXT');
    addColumnIfNotExists('subscription_requests', 'phone_number', 'TEXT');
    addColumnIfNotExists('subscription_requests', 'transaction_id', 'TEXT');
    addColumnIfNotExists('subscription_requests', 'payment_screenshot', 'TEXT');
    addColumnIfNotExists('subscription_requests', 'admin_notes', 'TEXT');
    addColumnIfNotExists('subscription_requests', 'processed_at', 'TEXT');

    // 3. CONSULTATIONS
    // mode, paymentStatus, requestStatus, details
    addColumnIfNotExists('consultations', 'mode', 'TEXT DEFAULT "chat"');
    addColumnIfNotExists('consultations', 'payment_status', 'TEXT DEFAULT "pending"');
    addColumnIfNotExists('consultations', 'request_status', 'TEXT DEFAULT "waiting_admin"');

    // 4. PAYMENT VERIFICATIONS
    // paymentMethod, payerName, bankName...
    addColumnIfNotExists('payment_verifications', 'payment_method', 'TEXT');
    addColumnIfNotExists('payment_verifications', 'payer_name', 'TEXT');
    addColumnIfNotExists('payment_verifications', 'bank_name', 'TEXT');
    addColumnIfNotExists('payment_verifications', 'account_number', 'TEXT');
    addColumnIfNotExists('payment_verifications', 'transaction_id', 'TEXT');
    addColumnIfNotExists('payment_verifications', 'phone_number', 'TEXT');
    addColumnIfNotExists('payment_verifications', 'admin_notes', 'TEXT');

    console.log("Comprehensive schema fix completed.");

} catch (err) {
    console.error('Migration failed:', err);
} finally {
    db.close();
}
