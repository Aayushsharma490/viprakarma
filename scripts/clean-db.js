const Database = require('better-sqlite3');

const db = new Database('viprakarma.db');

// Delete ALL users except admin
db.prepare('DELETE FROM users WHERE email != ?').run('admin@viprakarma.com');

// Delete all other data
db.prepare('DELETE FROM astrologers').run();
db.prepare('DELETE FROM notifications').run();
db.prepare('DELETE FROM bookings').run();
db.prepare('DELETE FROM subscriptions').run();
db.prepare('DELETE FROM payments').run();
db.prepare('DELETE FROM pandits').run();
db.prepare('DELETE FROM chat_sessions').run();
db.prepare('DELETE FROM consultations').run();
db.prepare('DELETE FROM payment_verifications').run();
db.prepare('DELETE FROM subscription_requests').run();

console.log('✅ Database cleaned!');
console.log('✅ Only admin@viprakarma.com remains');
console.log('✅ All other users deleted');
console.log('✅ All subscriptions, payments, bookings deleted');

const remaining = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`✅ Total users: ${remaining.count} (should be 1 - admin only)`);

db.close();
