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

async function checkRahulPayments() {
  try {
    console.log('Checking data for rahul@test.com (ID: 2)...');
    
    const userResult = await client.execute({
        sql: "SELECT * FROM users WHERE email = 'rahul@test.com'",
        args: []
    });
    console.log('User:', userResult.rows);

    if (userResult.rows.length === 0) {
        console.log('User rahul@test.com not found.');
        return;
    }
    
    const userId = userResult.rows[0].id;

    const subscriptions = await client.execute({
        sql: "SELECT * FROM subscriptions WHERE user_id = ?",
        args: [userId]
    });
    console.log('Subscriptions:', subscriptions.rows);

    const payments = await client.execute({
        sql: "SELECT * FROM payments WHERE user_id = ?",
        args: [userId]
    });
    console.log('Payments:', payments.rows);

    const paymentVerifications = await client.execute({
        sql: "SELECT * FROM payment_verifications WHERE user_id = ?",
        args: [userId]
    });
    console.log('Payment Verifications:', paymentVerifications.rows);

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    client.close();
  }
}

checkRahulPayments();
