import { NextResponse } from 'next/server';

// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ASTRO_ENGINE_URL = process.env.ASTRO_ENGINE_URL || 'http://localhost:5005';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { person1, person2 } = body;

        console.log('[Kundali Match] Calling astro-engine for:', person1.name, person2.name);

        const payload = {
            person1: {
                name: person1.name,
                gender: person1.gender || 'male',
                dateOfBirth: person1.dob || person1.dateOfBirth,
                timeOfBirth: person1.time || person1.timeOfBirth || '12:00:00',
                placeOfBirth: {
                    name: person1.place || 'Unknown',
                    latitude: person1.latitude || 0,
                    longitude: person1.longitude || 0
                }
            },
            person2: {
                name: person2.name,
                gender: person2.gender || 'female',
                dateOfBirth: person2.dob || person2.dateOfBirth,
                timeOfBirth: person2.time || person2.timeOfBirth || '12:00:00',
                placeOfBirth: {
                    name: person2.place || 'Unknown',
                    latitude: person2.latitude || 0,
                    longitude: person2.longitude || 0
                }
            }
        };

        console.log('[Kundali Match] Payload:', JSON.stringify(payload, null, 2));

        // Call astro-engine for accurate matching
        const response = await fetch(`${ASTRO_ENGINE_URL}/api/kundali-matching`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Kundali Match] Error response:', errorText);
            throw new Error(`Astro engine error: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('[Kundali Match] Result from astro-engine:', result);

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error: any) {
        console.error('[Kundali Match] Error:', error);

        // Provide helpful error message
        const errorMessage = error.message?.includes('fetch') || error.cause?.code === 'ECONNREFUSED'
            ? 'Cannot connect to astro-engine. Please ensure the astrological calculation server is running on port 5005.'
            : 'Failed to calculate match. Please try again.';

        return NextResponse.json({
            success: false,
            error: errorMessage,
            details: error.message
        }, { status: 500 });
    }
}
