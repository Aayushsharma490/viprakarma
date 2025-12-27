import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Fetch session data from your existing API
        const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/sessions/${sessionId}`, {
            headers: {
                'Authorization': authHeader,
            },
        });

        if (!sessionResponse.ok) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = await sessionResponse.json();

        // Return birth details and astrological data
        return NextResponse.json({
            success: true,
            hasBirthDetails: !!session.userBirthDate,
            birthDetails: session.userBirthDate ? {
                birthDate: session.userBirthDate,
                birthTime: session.userBirthTime,
                birthPlace: session.userBirthPlace,
                latitude: session.userLatitude,
                longitude: session.userLongitude,
            } : null,
            kundaliData: session.kundaliData,
            numerologyData: session.numerologyData,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }
}
