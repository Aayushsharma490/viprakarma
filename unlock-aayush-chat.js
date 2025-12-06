const Database = require('better-sqlite3');
const db = new Database('local.db');

const email = 'aayushsharms2005@gmail.com';

console.log(`Unlocking chat for ${email}...`);

const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (!user) {
  console.error('User not found!');
  process.exit(1);
}

const stmt = db.prepare('UPDATE users SET can_chat_with_astrologer = 1 WHERE id = ?');
const info = stmt.run(user.id);

if (info.changes > 0) {
  console.log(`Successfully unlocked chat for ${user.name} (ID: ${user.id})`);
} else {
  console.log('No changes made.');
}

db.close();
