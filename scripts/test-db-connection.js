// Test database connection directly
const { db } = require('./src/db/index.ts');
const { users } = require('./src/db/schema.ts');

async function testConnection() {
    try {
        console.log('Testing database connection...');

        const result = await db.select().from(users).limit(1);
        console.log('✅ Database connection working!');
        console.log('Found users:', result.length);

        if (result.length > 0) {
            console.log('First user:', result[0].email);
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.error('Error details:', error.message);
    }
}

testConnection();
