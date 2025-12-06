const Database = require('better-sqlite3');
const db = new Database('./local.db');

db.prepare(`INSERT INTO consultations (user_id, astrologer_id, mode, payment_status, request_status, details, created_at, updated_at) VALUES (1, 1, 'chat', 'pending', 'waiting_admin', '{"name":"Test User"}', datetime('now'), datetime('now'))`).run();
console.log('Inserted successfully');
db.close();
