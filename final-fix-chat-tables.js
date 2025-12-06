
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const config = {
  url: process.env.TURSO_CONNECTION_URL || `file:${path.resolve(process.cwd(), 'local.db')}`,
  authToken: process.env.TURSO_AUTH_TOKEN || '',
};

console.log(`Connecting to database at: ${config.url}`);

const client = createClient(config);

async function resetChatTables() {
  try {
    console.log('Dropping chat_messages table (if it exists)...');
    await client.execute('DROP TABLE IF EXISTS chat_messages');
    console.log('...dropped.');

    console.log('Dropping chat_sessions table (if it exists)...');
    await client.execute('DROP TABLE IF EXISTS chat_sessions');
    console.log('...dropped.');

    console.log('Creating chat_sessions table...');
    await client.execute(`
      CREATE TABLE chat_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          astrologer_id INTEGER,
          session_type TEXT NOT NULL,
          status TEXT DEFAULT 'active' NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (astrologer_id) REFERENCES astrologers (id)
      );
    `);
    console.log('...chat_sessions table created.');

    console.log('Creating chat_messages table...');
    await client.execute(`
      CREATE TABLE chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          sender_type TEXT NOT NULL,
          message_type TEXT DEFAULT 'text' NOT NULL,
          content TEXT,
          file_url TEXT,
          file_name TEXT,
          file_size INTEGER,
          timestamp TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
      );
    `);
    console.log('...chat_messages table created.');

    console.log('\n✅ Chat tables have been successfully reset in the correct database.');

  } catch (error) {
    console.error('\n❌ Error resetting chat tables:', error);
  } finally {
    client.close();
    console.log('Database connection closed.');
  }
}

resetChatTables();
