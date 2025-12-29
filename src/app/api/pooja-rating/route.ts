import { NextResponse } from 'next/server';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { poojaName, rating, review } = body;

        if (!poojaName || !rating) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // TODO: Save to database
        // await db.ratings.create({ ... })

        console.log('Rating received:', { poojaName, rating, review });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting rating:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
