const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Comparing schema at:', dbPath);

const db = new Database(dbPath);

try {
    console.log('\n=== PAYMENT_VERIFICATIONS SCHEMA COMPARISON ===');

    // Expected columns from schema.ts
    const expectedColumns = [
        'id', 'user_id', 'booking_id', 'subscription_id', 'consultation_id',
        'amount', 'payment_method', 'payer_name', 'bank_name', 'account_number',
        'transaction_id', 'phone_number', 'status', 'admin_notes',
        'verified_by', 'verified_at', 'created_at', 'updated_at'
    ];

    // Actual columns in database
    const actualColumns = db.prepare("PRAGMA table_info(payment_verifications)").all();
    const actualColumnNames = actualColumns.map(c => c.name);

    console.log('\nExpected columns:', expectedColumns.join(', '));
    console.log('\nActual columns:', actualColumnNames.join(', '));

    // Find missing columns
    const missingColumns = expectedColumns.filter(col => !actualColumnNames.includes(col));
    const extraColumns = actualColumnNames.filter(col => !expectedColumns.includes(col));

    if (missingColumns.length > 0) {
        console.log('\n❌ MISSING COLUMNS:', missingColumns.join(', '));
    } else {
        console.log('\n✅ All expected columns present');
    }

    if (extraColumns.length > 0) {
        console.log('\n⚠️  EXTRA COLUMNS:', extraColumns.join(', '));
    }

    // Now check consultations table
    console.log('\n\n=== CONSULTATIONS SCHEMA COMPARISON ===');

    const expectedConsultationColumns = [
        'id', 'user_id', 'astrologer_id', 'mode', 'payment_status',
        'request_status', 'details', 'created_at', 'updated_at'
    ];

    const actualConsultationColumns = db.prepare("PRAGMA table_info(consultations)").all();
    const actualConsultationColumnNames = actualConsultationColumns.map(c => c.name);

    console.log('\nExpected columns:', expectedConsultationColumns.join(', '));
    console.log('\nActual columns:', actualConsultationColumnNames.join(', '));

    const missingConsultationColumns = expectedConsultationColumns.filter(col => !actualConsultationColumnNames.includes(col));

    if (missingConsultationColumns.length > 0) {
        console.log('\n❌ MISSING COLUMNS:', missingConsultationColumns.join(', '));
    } else {
        console.log('\n✅ All expected columns present');
    }

} catch (err) {
    console.error('❌ Error:', err.message);
} finally {
    db.close();
}
