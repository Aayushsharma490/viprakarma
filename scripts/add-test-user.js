const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('viprakarma.db');
const email = 'aayushsharms2005@gmail.com';

// Check if already exists just in case
const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (existing) {
    console.log('User already exists.');
} else {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const now = new Date().toISOString();

    db.prepare(`
        INSERT INTO users (
            email, password, name, is_admin, subscription_plan, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, 'Aayush', 0, 'free', now, now);

    console.log(`✅ Created user: ${email}`);
    console.log('You can now test Forgot Password with this email!');
}
