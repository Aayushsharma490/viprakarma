const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'viprakarma.db');
console.log('Checking database at:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('Database file not found at:', dbPath);
    process.exit(1);
}

const db = new Database(dbPath, { readonly: true });

try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables found:', tables.map(t => t.name).join(', '));

    const checkTable = (tableName) => {
        try {
            const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
            console.log(`\nColumns in ${tableName}:`);
            columns.forEach(c => console.log(` - ${c.name} (${c.type})`));
        } catch (e) {
            console.log(`\nTable ${tableName} does not exist or error reading it.`);
        }
    };

    checkTable('consultations');
    checkTable('subscription_requests');
    checkTable('pooja_bookings');

} catch (err) {
    console.error('Error querying database:', err);
} finally {
    db.close();
}
