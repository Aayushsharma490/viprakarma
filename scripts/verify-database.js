const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'viprakarma.db');
console.log('📁 Database path:', dbPath);

const db = new Database(dbPath, { readonly: true });

// Check tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\n📊 Tables in database:');
tables.forEach(table => console.log(`   - ${table.name}`));

// Check users
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`\n👥 Total users: ${userCount.count}`);

if (userCount.count > 0) {
    const users = db.prepare('SELECT id, email, name, is_admin FROM users').all();
    console.log('\n📋 Users:');
    users.forEach(user => {
        console.log(`   ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Admin: ${user.is_admin}`);
    });
}

// Check if reset_token columns exist
const userSchema = db.prepare("PRAGMA table_info(users)").all();
console.log('\n🔍 Users table schema:');
userSchema.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
});

db.close();
