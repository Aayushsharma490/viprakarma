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

async function checkRajesh() {
  try {
    console.log('Checking for rajesh@kundali.com...');
    
    const result = await client.execute({
        sql: "SELECT * FROM astrologers WHERE email = 'rajesh@kundali.com'",
        args: []
    });
    console.log('Astrologer Record:', result.rows);

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    client.close();
  }
}

checkRajesh();
