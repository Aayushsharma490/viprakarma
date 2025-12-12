const Database = require('better-sqlite3');
const db = new Database('viprakarma.db');

const email = 'aayushsharms2005@gmail.com';

const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (user) {
    console.log('✅ User found:', user.email);
} else {
    console.log('❌ User NOT found:', email);
    console.log('💡 TIP: You must SIGN UP first or manually add this user to test forgot password.');
}

const allUsers = db.prepare('SELECT email FROM users').all();
console.log('All registered users:', allUsers.map(u => u.email));
