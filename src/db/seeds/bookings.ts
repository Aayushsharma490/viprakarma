import { db } from '@/db';
import { bookings } from '@/db/schema';

async function main() {
    const sampleBookings = [
        {
            userId: 2,
            astrologerId: 1,
            bookingType: 'astrologer',
            serviceType: 'chat',
            scheduledDate: '2024-12-15',
            scheduledTime: '10:00 AM',
            duration: 30,
            amount: 750,
            status: 'completed',
            notes: 'Career guidance consultation',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 3,
            astrologerId: 3,
            bookingType: 'astrologer',
            serviceType: 'call',
            scheduledDate: '2025-01-20',
            scheduledTime: '02:30 PM',
            duration: 45,
            amount: 750,
            status: 'confirmed',
            notes: 'Palmistry reading session',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 4,
            astrologerId: null,
            bookingType: 'pandit',
            serviceType: 'puja',
            scheduledDate: '2025-02-01',
            scheduledTime: '06:00 AM',
            duration: 120,
            amount: 5000,
            status: 'pending',
            notes: 'Ganesh puja at home',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 2,
            astrologerId: 4,
            bookingType: 'astrologer',
            serviceType: 'chat',
            scheduledDate: '2024-12-10',
            scheduledTime: '04:00 PM',
            duration: 30,
            amount: 400,
            status: 'completed',
            notes: 'Love life reading',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 3,
            astrologerId: 5,
            bookingType: 'astrologer',
            serviceType: 'call',
            scheduledDate: '2025-01-25',
            scheduledTime: '11:00 AM',
            duration: 60,
            amount: 2000,
            status: 'confirmed',
            notes: 'Marriage compatibility analysis',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 4,
            astrologerId: null,
            bookingType: 'pandit',
            serviceType: 'ceremony',
            scheduledDate: '2025-02-10',
            scheduledTime: '09:00 AM',
            duration: 180,
            amount: 8000,
            status: 'pending',
            notes: 'Griha Pravesh ceremony',
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(bookings).values(sampleBookings);
    
    console.log('✅ Bookings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});