// Migration script to add is_deleted column to astrologers table
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'local.db');
const db = new Database(dbPath);

try {
    console.log('Starting migration: Adding is_deleted column to astrologers table...');

    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(astrologers)").all();
    const hasIsDeleted = tableInfo.some(col => col.name === 'is_deleted');

    if (hasIsDeleted) {
        console.log('✓ Column is_deleted already exists. Skipping migration.');
    } else {
        // Add the column
        db.prepare('ALTER TABLE astrologers ADD COLUMN is_deleted INTEGER DEFAULT 0').run();
        console.log('✓ Added is_deleted column');

        // Update existing records
        const result = db.prepare('UPDATE astrologers SET is_deleted = 0 WHERE is_deleted IS NULL').run();
        console.log(`✓ Updated ${result.changes} existing records`);
    }

    console.log('\n✅ Migration completed successfully!');
} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}
