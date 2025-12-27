import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, birthDate, birthTime, birthPlace, latitude, longitude } = body;

        if (!sessionId || !birthDate || !birthTime || !birthPlace || !latitude || !longitude) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate Kundali data
        const kundaliResponse = await fetch(`${process.env.ASTRO_ENGINE_URL || 'https://astro-engine-production.up.railway.app'}/kundali`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'User',
                gender: 'male',
                year: new Date(birthDate).getFullYear(),
                month: new Date(birthDate).getMonth() + 1,
                day: new Date(birthDate).getDate(),
                hour: parseInt(birthTime.split(':')[0]),
                minute: parseInt(birthTime.split(':')[1]),
                second: parseInt(birthTime.split(':')[2] || '0'),
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                timezone: '+05:30',
                city: birthPlace,
            }),
        });

        let kundaliData = null;
        if (kundaliResponse.ok) {
            kundaliData = await kundaliResponse.json();
        }

        // Generate Numerology data
        const numerologyData = {
            birthDate: birthDate,
            lifePathNumber: calculateLifePathNumber(birthDate),
            destinyNumber: 5, // Simplified
            soulUrgeNumber: 7, // Simplified
        };

        // Update session via your existing API
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/sessions/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                sessionId,
                userBirthDate: birthDate,
                userBirthTime: birthTime,
                userBirthPlace: birthPlace,
                userLatitude: latitude,
                userLongitude: longitude,
                kundaliData,
                numerologyData,
            }),
        });

        return NextResponse.json({
            success: true,
            kundaliData,
            numerologyData,
        });
    } catch (error) {
        console.error('Error saving birth details:', error);
        return NextResponse.json({ error: 'Failed to save birth details' }, { status: 500 });
    }
}

// Helper function for numerology
function calculateLifePathNumber(birthDate: string): number {
    const date = new Date(birthDate);
    let sum = date.getDate() + (date.getMonth() + 1) + date.getFullYear();
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return sum;
}
