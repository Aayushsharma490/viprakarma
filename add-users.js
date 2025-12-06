const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('local.db');

async function addUsers() {
  const usersToAdd = [
    {
      email: 'viprakarma@gmail.com',
      password: 'viprakarma',
      name: 'Viprakarma Admin',
      isAdmin: 1
    },
    {
      email: 'aayushsharms2005@gmail.com',
      password: '123456',
      name: 'Aayush Sharma',
      isAdmin: 0
    }
  ];

  console.log('Adding users...');

  for (const user of usersToAdd) {
    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(user.email);
    
    if (existing) {
      console.log(`User ${user.email} already exists. Skipping.`);
      continue;
    }

    console.log(`Hashing password for ${user.email}...`);
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const now = new Date().toISOString();

    try {
      const stmt = db.prepare(`
        INSERT INTO users (
          email, password, name, is_admin, created_at, updated_at, subscription_plan, can_chat_with_astrologer
        ) VALUES (?, ?, ?, ?, ?, ?, 'free', 0)
      `);
      
      const info = stmt.run(
        user.email,
        hashedPassword,
        user.name,
        user.isAdmin,
        now,
        now
      );
      
      console.log(`Added user: ${user.name} (${user.email}) with ID: ${info.lastInsertRowid}`);
    } catch (err) {
      console.error(`Failed to add user ${user.email}:`, err.message);
    }
  }
  
  console.log('Done.');
}

addUsers().catch(console.error);
