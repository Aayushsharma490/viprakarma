import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const currentDate = new Date().toISOString();
    
    // Hash all passwords with bcrypt
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const testPassword = await bcrypt.hash('Test@123', 10);
    
    const sampleUsers = [
        {
            email: 'admin@kundali.com',
            password: adminPassword,
            name: 'Admin User',
            phone: '+919876543210',
            dateOfBirth: null,
            timeOfBirth: null,
            placeOfBirth: null,
            subscriptionPlan: 'free',
            subscriptionExpiry: null,
            isAdmin: true,
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            email: 'rahul@test.com',
            password: testPassword,
            name: 'Rahul Sharma',
            phone: '+919812345678',
            dateOfBirth: '1995-03-15',
            timeOfBirth: '10:30 AM',
            placeOfBirth: 'Mumbai',
            subscriptionPlan: 'monthly',
            subscriptionExpiry: new Date('2025-02-15').toISOString(),
            isAdmin: false,
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            email: 'priya@test.com',
            password: testPassword,
            name: 'Priya Patel',
            phone: '+919823456789',
            dateOfBirth: '1998-07-22',
            timeOfBirth: '02:15 PM',
            placeOfBirth: 'Delhi',
            subscriptionPlan: 'annual',
            subscriptionExpiry: new Date('2025-12-31').toISOString(),
            isAdmin: false,
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            email: 'amit@test.com',
            password: testPassword,
            name: 'Amit Kumar',
            phone: '+919834567890',
            dateOfBirth: '1992-11-08',
            timeOfBirth: '06:45 AM',
            placeOfBirth: 'Bangalore',
            subscriptionPlan: 'free',
            subscriptionExpiry: null,
            isAdmin: false,
            createdAt: currentDate,
            updatedAt: currentDate,
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
    console.log(`📊 Seeded ${sampleUsers.length} users (1 admin, 3 regular users)`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});