const Database = require('better-sqlite3');

try {
    const db = new Database('viprakarma.db');

    console.log('Adding reset_token fields to users table...');

    // Add reset_token and reset_token_expiry columns if they don't exist
    try {
        db.exec(`
      ALTER TABLE users ADD COLUMN reset_token TEXT;
    `);
        console.log('✅ Added reset_token column');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('ℹ️  reset_token column already exists');
        } else {
            throw e;
        }
    }

    try {
        db.exec(`
      ALTER TABLE users ADD COLUMN reset_token_expiry TEXT;
    `);
        console.log('✅ Added reset_token_expiry column');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('ℹ️  reset_token_expiry column already exists');
        } else {
            throw e;
        }
    }

    console.log('');
    console.log('✅ Database migration complete!');
    console.log('✅ Forgot password feature is ready to use!');

    db.close();
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
}
