const Database = require('better-sqlite3');
const db = new Database('./local.db');

console.log('Tables:', db.prepare('SELECT name FROM sqlite_master WHERE type="table"').all());
db.close();
