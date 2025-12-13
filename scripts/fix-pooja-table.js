const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Migrating database at:', dbPath);

const db = new Database(dbPath);

try {
    // Check if pooja_bookings has pooja_type -> rename to pooja_name
    const tableInfo = db.prepare("PRAGMA table_info(pooja_bookings)").all();
    const hasPoojaType = tableInfo.some(c => c.name === 'pooja_type');
    const hasPoojaName = tableInfo.some(c => c.name === 'pooja_name');

    if (hasPoojaType && !hasPoojaName) {
        console.log("Renaming 'pooja_type' to 'pooja_name' in 'pooja_bookings' table...");
        db.prepare("ALTER TABLE pooja_bookings RENAME COLUMN pooja_type TO pooja_name").run();
        console.log("Done.");
    } else if (hasPoojaName) {
        console.log("'pooja_bookings' table already has 'pooja_name' column.");
    } else {
        console.log("Neither 'pooja_type' nor 'pooja_name' found in 'pooja_bookings'. Adding 'pooja_name'.");
        db.prepare("ALTER TABLE pooja_bookings ADD COLUMN pooja_name TEXT DEFAULT ''").run();
    }

    // Double check consultations and subscription_requests
    const consultInfo = db.prepare("PRAGMA table_info(consultations)").all();
    if (!consultInfo.some(c => c.name === 'mode')) {
        console.log("Adding missing 'mode' to consultations");
        db.prepare("ALTER TABLE consultations ADD COLUMN mode TEXT").run();
    }

} catch (err) {
    console.error('Migration failed:', err);
} finally {
    db.close();
}
