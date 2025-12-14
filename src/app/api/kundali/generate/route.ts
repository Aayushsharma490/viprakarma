import { NextRequest, NextResponse } from 'next/server';

const ASTRO_ENGINE_URL = process.env.ASTRO_ENGINE_URL || 'http://localhost:5005';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, day, month, year, hour, minute, second, gender, latitude, longitude, timezone, city } = body;

    // Validate required fields
    if (!name || !day || !month || !year || hour === undefined || minute === undefined || second === undefined || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare payload for astro-engine
    const payload = {
      name,
      gender: gender || 'male',
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      second: Number(second || 0),
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: timezone || '+05:30',
      city: city || 'Unknown',
    };

    console.log('[API] Sending request to astro-engine:', ASTRO_ENGINE_URL);

    // Call astro-engine server
    const response = await fetch(`${ASTRO_ENGINE_URL}/kundali`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Astro-engine error:', errorText);
      return NextResponse.json(
        { error: 'Failed to calculate kundali from astro-engine' },
        { status: 500 }
      );
    }

    const kundaliData = await response.json();

    // Validate that required fields are present
    if (!kundaliData.ayanamsa || !kundaliData.basicDetails || !kundaliData.planets) {
      console.error('[API] Invalid response from astro-engine:', kundaliData);
      return NextResponse.json(
        { error: 'Invalid kundali data received' },
        { status: 500 }
      );
    }

    console.log('[API] Successfully received kundali data from astro-engine');

    // Return the kundali object directly
    return NextResponse.json(kundaliData);

  } catch (error) {
    console.error('[API] Kundali generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during kundali generation' },
      { status: 500 }
    );
  }
}
