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

async function verifyRahulStatus() {
  try {
    console.log('Verifying status for rahul@test.com...');
    
    const userResult = await client.execute({
        sql: "SELECT id, email, can_chat_with_astrologer, subscription_plan FROM users WHERE email = 'rahul@test.com'",
        args: []
    });
    console.log('User Record:', userResult.rows);

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    client.close();
  }
}

verifyRahulStatus();
