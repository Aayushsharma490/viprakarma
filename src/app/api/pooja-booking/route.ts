import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { poojaBookings } from '@/db/schema';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, poojaName, description, date, time, location, purpose, phone, email, occasion } = body;

        // Validate required fields
        if (!userId || !poojaName || !date || !location || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newBooking = await db.insert(poojaBookings).values({
            userId,
            poojaName,
            description,
            date,
            time,
            location,
            purpose,
            phone,
            email,
            occasion,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning();

        return NextResponse.json(newBooking[0], { status: 201 });
    } catch (error) {
        console.error('Error creating pooja booking:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
