import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const config = {
  url: process.env.TURSO_CONNECTION_URL || `file:${path.resolve(process.cwd(), 'local.db')}`,
  authToken: process.env.TURSO_AUTH_TOKEN || '',
};

const client = createClient(config);

async function checkData() {
  try {
    console.log('Checking users...');
    const users = await client.execute('SELECT * FROM users');
    console.log('Users count:', users.rows.length);
    console.log('Users:', users.rows);

    console.log('Checking astrologers...');
    const astrologers = await client.execute('SELECT * FROM astrologers');
    console.log('Astrologers count:', astrologers.rows.length);
    console.log('Astrologers:', astrologers.rows);

    console.log('Checking chat_sessions...');
    const sessions = await client.execute('SELECT * FROM chat_sessions');
    console.log('Sessions count:', sessions.rows.length);
    console.log('Sessions:', sessions.rows);

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    client.close();
  }
}

checkData();
