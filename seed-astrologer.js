import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbPath = path.resolve(process.cwd(), 'local.db');
const config = {
  url: process.env.TURSO_CONNECTION_URL || `file:${dbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN || '',
};

const client = createClient(config);

async function seedAstrologer() {
  try {
    console.log('Seeding astrologer...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const sql = `
      INSERT INTO astrologers (
        name, email, password, phone, specializations, experience, 
        rating, hourly_rate, is_approved, bio, is_online, created_at
      ) VALUES (
        'Test Astrologer', 
        'astrologer@test.com', 
        '${hashedPassword}', 
        '1234567890', 
        '["Vedic", "Numerology"]', 
        5, 
        4.5, 
        500, 
        1, 
        'Expert astrologer for testing.', 
        1, 
        '${new Date().toISOString()}'
      )
    `;
    
    await client.execute(sql);
    console.log('✅ Test Astrologer created: astrologer@test.com / password123');

  } catch (error) {
    console.error('Error seeding astrologer:', error);
  } finally {
    client.close();
  }
}

seedAstrologer();
