import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
    const adminEmail = 'viprakarma@gmail.com';

    // Check if admin user already exists
    const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.email, adminEmail))
        .limit(1);

    if (existingAdmin.length > 0) {
        console.log('ℹ️  Admin user already exists, skipping...');
        return;
    }

    // Hash the password with 10 salt rounds
    const hashedPassword = await bcrypt.hash('viprakarma', 10);

    // Create admin user
    const adminUser = {
        email: 'viprakarma@gmail.com',
        password: hashedPassword,
        name: 'Viprakarma Admin',
        phone: '+919999999999',
        dateOfBirth: null,
        timeOfBirth: null,
        placeOfBirth: null,
        subscriptionPlan: 'free',
        subscriptionExpiry: null,
        isAdmin: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(users).values(adminUser);

    console.log('✅ Admin user created successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});