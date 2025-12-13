const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Checking database at:', dbPath);

const db = new Database(dbPath);

try {
    // Check consultations table structure
    console.log('\n=== CONSULTATIONS TABLE ===');
    const consultationsInfo = db.prepare("PRAGMA table_info(consultations)").all();
    console.log('Columns:', consultationsInfo.map(c => `${c.name} (${c.type}, ${c.notnull ? 'NOT NULL' : 'NULL'})`).join(', '));

    // Check payment_verifications table structure
    console.log('\n=== PAYMENT_VERIFICATIONS TABLE ===');
    const paymentVerificationsInfo = db.prepare("PRAGMA table_info(payment_verifications)").all();
    console.log('Columns:', paymentVerificationsInfo.map(c => `${c.name} (${c.type}, ${c.notnull ? 'NOT NULL' : 'NULL'})`).join(', '));

    // Try to insert a test consultation
    console.log('\n=== TESTING CONSULTATION INSERT ===');
    try {
        const result = db.prepare(`
            INSERT INTO consultations (user_id, astrologer_id, mode, payment_status, request_status, details, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(1, null, 'chat', 'pending', 'waiting_admin', '{}', new Date().toISOString(), new Date().toISOString());
        console.log('✅ Consultation insert successful, ID:', result.lastInsertRowid);

        // Try to insert payment verification
        console.log('\n=== TESTING PAYMENT_VERIFICATION INSERT ===');
        const pvResult = db.prepare(`
            INSERT INTO payment_verifications (user_id, booking_id, subscription_id, consultation_id, amount, payment_method, payer_name, phone_number, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(1, null, null, result.lastInsertRowid, 500, 'consultation_fee', 'Test User', '0000000000', 'pending', new Date().toISOString(), new Date().toISOString());
        console.log('✅ Payment verification insert successful, ID:', pvResult.lastInsertRowid);

        // Clean up test data
        db.prepare('DELETE FROM payment_verifications WHERE id = ?').run(pvResult.lastInsertRowid);
        db.prepare('DELETE FROM consultations WHERE id = ?').run(result.lastInsertRowid);
        console.log('✅ Test data cleaned up');

    } catch (e) {
        console.log('❌ Insert failed:', e.message);
    }

} catch (err) {
    console.error('Error:', err);
} finally {
    db.close();
}
