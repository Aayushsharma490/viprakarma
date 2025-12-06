import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbPath = path.resolve(process.cwd(), 'local.db');
const config = {
  url: process.env.TURSO_CONNECTION_URL || `file:${dbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN || '',
};

const client = createClient(config);

async function checkUser2() {
  const rs = await client.execute("SELECT can_chat_with_astrologer FROM users WHERE id = 2");
  console.log(rs.rows);
}
checkUser2();
