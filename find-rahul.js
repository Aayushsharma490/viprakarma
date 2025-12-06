const Database = require('better-sqlite3');
const db = new Database('local.db');

console.log('Searching for user "rahul"...');

const users = db.prepare('SELECT id, name, email, can_chat_with_astrologer FROM users WHERE name LIKE ? OR email LIKE ?').all('%rahul%', '%rahul%');

console.table(users);

db.close();
