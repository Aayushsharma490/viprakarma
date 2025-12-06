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

async function approveRahulPayment() {
  try {
    console.log('Approving payment for rahul@test.com...');
    
    // 1. Get User ID
    const userResult = await client.execute({
        sql: "SELECT id FROM users WHERE email = 'rahul@test.com'",
        args: []
    });
    
    if (userResult.rows.length === 0) {
        console.log('User not found');
        return;
    }
    const userId = userResult.rows[0].id;

    const now = new Date().toISOString();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now
    const expiryDateStr = expiryDate.toISOString();

    // 2. Create Subscription Record
    const subResult = await client.execute({
        sql: `INSERT INTO subscriptions (
            user_id, plan, amount, start_date, end_date, 
            razorpay_order_id, razorpay_payment_id, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [
            userId, 
            'monthly', 
            499, 
            now, 
            expiryDateStr, 
            'order_manual_approval', 
            'pay_manual_approval', 
            'active', 
            now
        ]
    });
    const subId = subResult.rows[0].id;
    console.log('Created Subscription ID:', subId);

    // 3. Create Payment Record
    await client.execute({
        sql: `INSERT INTO payments (
            user_id, subscription_id, amount, currency, 
            razorpay_order_id, razorpay_payment_id, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            userId,
            subId,
            499,
            'INR',
            'order_manual_approval',
            'pay_manual_approval',
            'captured',
            now
        ]
    });
    console.log('Created Payment Record');

    // 4. Update User
    await client.execute({
        sql: `UPDATE users SET 
            subscription_plan = 'monthly',
            subscription_expiry = ?,
            can_chat_with_astrologer = 1,
            updated_at = ?
            WHERE id = ?`,
        args: [expiryDateStr, now, userId]
    });
    console.log('Updated User permissions');

    console.log('✅ Payment approved and permissions granted for rahul@test.com');

  } catch (error) {
    console.error('Error approving payment:', error);
  } finally {
    client.close();
  }
}

approveRahulPayment();
