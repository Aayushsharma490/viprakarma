import { db } from '@/db';
import { payments } from '@/db/schema';

async function main() {
    const samplePayments = [
        {
            userId: 2,
            bookingId: 1,
            subscriptionId: null,
            amount: 750,
            currency: 'INR',
            razorpayOrderId: 'order_RP001',
            razorpayPaymentId: 'pay_RP001',
            razorpaySignature: 'sig_RP001',
            status: 'completed',
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            userId: 3,
            bookingId: 2,
            subscriptionId: null,
            amount: 750,
            currency: 'INR',
            razorpayOrderId: 'order_RP002',
            razorpayPaymentId: 'pay_RP002',
            razorpaySignature: 'sig_RP002',
            status: 'completed',
            createdAt: new Date('2024-01-16T14:20:00').toISOString(),
        },
        {
            userId: 4,
            bookingId: 3,
            subscriptionId: null,
            amount: 5000,
            currency: 'INR',
            razorpayOrderId: 'order_RP003',
            razorpayPaymentId: null,
            razorpaySignature: null,
            status: 'pending',
            createdAt: new Date('2024-01-17T09:15:00').toISOString(),
        },
        {
            userId: 2,
            bookingId: 4,
            subscriptionId: null,
            amount: 400,
            currency: 'INR',
            razorpayOrderId: 'order_RP004',
            razorpayPaymentId: 'pay_RP004',
            razorpaySignature: 'sig_RP004',
            status: 'completed',
            createdAt: new Date('2024-01-18T16:45:00').toISOString(),
        },
        {
            userId: 3,
            bookingId: 5,
            subscriptionId: null,
            amount: 2000,
            currency: 'INR',
            razorpayOrderId: 'order_RP005',
            razorpayPaymentId: 'pay_RP005',
            razorpaySignature: 'sig_RP005',
            status: 'completed',
            createdAt: new Date('2024-01-19T11:30:00').toISOString(),
        },
    ];

    const result = await db.insert(payments).values(samplePayments).returning();
    
    console.log(`✅ Payments seeder completed successfully - Inserted ${result.length} payment records`);
}

main().catch((error) => {
    console.error('❌ Payments seeder failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
});