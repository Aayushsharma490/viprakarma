const Database = require('better-sqlite3');
const db = new Database('./local.db');

function columnExists(table, column) {
  const stmt = db.prepare(`PRAGMA table_info(${table})`);
  const rows = stmt.all();
  return rows.some(r => r.name === column);
}

try {
  const table = 'payment_verifications';
  const col = 'consultation_id';
  if (!columnExists(table, col)) {
    console.log(`Adding column ${col} to ${table}...`);
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} INTEGER;`);
    console.log('Column added.');
  } else {
    console.log(`Column ${col} already exists.`);
  }
} catch (e) {
  console.error('Migration error:', e);
  process.exitCode = 1;
} finally {
  db.close();
}
