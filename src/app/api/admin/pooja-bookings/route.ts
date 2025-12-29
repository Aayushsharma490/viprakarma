import { NextResponse } from 'next/server';
import { db } from '@/db';
import { poojaBookings, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export async function GET() {
    try {
        const bookings = await db
            .select({
                id: poojaBookings.id,
                userName: users.name,
                userEmail: users.email,
                poojaName: poojaBookings.poojaName,
                date: poojaBookings.date,
                time: poojaBookings.time,
                location: poojaBookings.location,
                purpose: poojaBookings.purpose,
                phone: poojaBookings.phone,
                occasion: poojaBookings.occasion,
                status: poojaBookings.status,
                createdAt: poojaBookings.createdAt,
            })
            .from(poojaBookings)
            .leftJoin(users, eq(poojaBookings.userId, users.id))
            .orderBy(desc(poojaBookings.createdAt));

        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Error fetching pooja bookings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
