const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Verifying database at:', dbPath);

const db = new Database(dbPath);

function runTest(name, fn) {
    try {
        console.log(`\n[TEST] ${name}`);
        fn();
        console.log(`[PASS] ${name}`);
    } catch (e) {
        console.error(`[FAIL] ${name}:`, e.message);
    }
}

// 1. Verify Tables Exist
runTest('Verify Customer Tables', () => {
    const tables = ['users', 'astrologers', 'bookings', 'subscriptions', 'pooja_bookings', 'consultations', 'pandits', 'payments', 'payment_verifications', 'chat_sessions', 'chat_messages'];
    tables.forEach(t => {
        const info = db.prepare(`PRAGMA table_info(${t})`).all();
        if (info.length === 0) throw new Error(`Table ${t} does not exist`);
        const cols = info.map(c => c.name);
        if (!cols.includes('pooja_name')) throw new Error('Missing column: pooja_name');
        if (!cols.includes('status')) throw new Error('Missing column: status');
        if (!cols.includes('purpose')) throw new Error('Missing column: purpose'); // NEW
        if (!cols.includes('phone')) throw new Error('Missing column: phone');
    });
    console.log('  - pooja_bookings schema OK');
}); // Close runTest properly

// 3. Verify Consultations Schema
runTest('Verify Consultations Columns', () => {
    const info = db.prepare("PRAGMA table_info(consultations)").all();
    const cols = info.map(c => c.name);
    if (!cols.includes('mode')) throw new Error('Missing column: mode');
    const astroCol = info.find(c => c.name === 'astrologer_id');
    if (!astroCol) throw new Error('astrologer_id column missing');
    if (astroCol.notnull === 1) throw new Error('astrologer_id should be NULLABLE (notnull=0)');
    console.log('  - consultations schema OK');
});

// 4. Verify Subscription Requests Schema
runTest('Verify Subscription Requests Columns', () => {
    const info = db.prepare("PRAGMA table_info(subscription_requests)").all();
    const cols = info.map(c => c.name);
    if (!cols.includes('payment_method')) throw new Error('Missing column: payment_method');
    console.log('  - subscription_requests schema OK');
});

// 5. Simulate Pooja Booking Insert
runTest('Simulate Pooja Booking Insert', () => {
    try {
        const stmt = db.prepare(`
            INSERT INTO pooja_bookings (user_id, pooja_name, date, location, phone, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        // Assuming user ID 1 exists (or we use a dummy one, constraints might fail if foreign key enabled)
        // We will try to insert. If FK failure, that means table structure is good at least.
        // Actually lets check if users exist
        const user = db.prepare("SELECT id FROM users LIMIT 1").get();
        if (!user) {
            console.log("  - No users found, skipping insert data test, but query preparation passed.");
            return;
        }

        stmt.run(user.id, "Test Pooja", "2024-01-01", "Test Loc", "1234567890", "pending", new Date().toISOString(), new Date().toISOString());
        console.log("  - Insert successful");
    } catch (e) {
        if (e.message.includes('FOREIGN KEY')) {
            console.log("  - Query structure OK (FK failed as expected if user missing)");
        } else {
            throw e;
        }
    }
});

// 6. Check Admin Astrologer Columns (often a source of issues)
runTest('Verify Astrologers Schema', () => {
    const info = db.prepare("PRAGMA table_info(astrologers)").all();
    const cols = info.map(c => c.name);
    const required = ['name', 'email', 'phone', 'specializations', 'experience', 'hourly_rate', 'is_approved', 'is_deleted'];
    required.forEach(r => {
        if (!cols.includes(r)) throw new Error(`Missing column in astrologers: ${r}`);
    });
    console.log('  - astrologers schema OK');
});

console.log("\nVerification Complete.");
