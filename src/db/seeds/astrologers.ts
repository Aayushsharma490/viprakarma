import { db } from '@/db';
import { astrologers } from '@/db/schema';
import bcrypt from 'bcryptjs';

async function main() {
    const hashedPassword = await bcrypt.hash('Astro@123', 10);
    
    const sampleAstrologers = [
        {
            name: 'Pandit Rajesh Kumar',
            email: 'rajesh@kundali.com',
            password: hashedPassword,
            phone: '+919876543211',
            specializations: ['Vedic', 'Horoscope'],
            experience: 15,
            rating: 4.8,
            totalConsultations: 250,
            hourlyRate: 1500,
            isApproved: true,
            bio: 'Expert in Vedic astrology with 15 years of experience',
            photo: 'https://via.placeholder.com/150',
            isOnline: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Dr. Meera Reddy',
            email: 'meera@kundali.com',
            password: hashedPassword,
            phone: '+919876543212',
            specializations: ['Numerology', 'Name Analysis'],
            experience: 10,
            rating: 4.5,
            totalConsultations: 180,
            hourlyRate: 1200,
            isApproved: true,
            bio: 'Certified numerologist specializing in name corrections',
            photo: 'https://via.placeholder.com/150',
            isOnline: false,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Acharya Suresh Joshi',
            email: 'suresh@kundali.com',
            password: hashedPassword,
            phone: '+919876543213',
            specializations: ['Palmistry', 'Face Reading'],
            experience: 12,
            rating: 4.6,
            totalConsultations: 200,
            hourlyRate: 1000,
            isApproved: true,
            bio: 'Traditional palmist with expertise in hand analysis',
            photo: 'https://via.placeholder.com/150',
            isOnline: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Kavita Singh',
            email: 'kavita@kundali.com',
            password: hashedPassword,
            phone: '+919876543214',
            specializations: ['Tarot', 'Angel Cards'],
            experience: 8,
            rating: 4.7,
            totalConsultations: 150,
            hourlyRate: 800,
            isApproved: true,
            bio: 'Intuitive tarot reader with angel card expertise',
            photo: 'https://via.placeholder.com/150',
            isOnline: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Shastri Ramesh Iyer',
            email: 'ramesh@kundali.com',
            password: hashedPassword,
            phone: '+919876543215',
            specializations: ['KP Astrology', 'Prashna'],
            experience: 20,
            rating: 4.9,
            totalConsultations: 300,
            hourlyRate: 2000,
            isApproved: true,
            bio: 'Senior KP astrologer with 20+ years of practice',
            photo: 'https://via.placeholder.com/150',
            isOnline: false,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(astrologers).values(sampleAstrologers);
    
    console.log('✅ Astrologers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});