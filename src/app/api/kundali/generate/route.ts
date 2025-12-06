import { NextRequest, NextResponse } from 'next/server';
import { generateKundali } from '../../../../../utils/kundaliCalcServer.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, day, month, year, hour, minute, second, gender, latitude, longitude } = body;

    // Validate required fields
    if (name === undefined || name === null ||
        day === undefined || day === null ||
        month === undefined || month === null ||
        year === undefined || year === null ||
        hour === undefined || hour === null ||
        minute === undefined || minute === null ||
        second === undefined || second === null ||
        gender === undefined || gender === null ||
        latitude === undefined || latitude === null ||
        longitude === undefined || longitude === null) {
      return NextResponse.json(
        { error: 'Missing required fields: name, day, month, year, hour, minute, second, gender, latitude, longitude' },
        { status: 400 }
      );
    }

    // Validate date ranges
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: 'Invalid date values' }, { status: 400 });
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
      return NextResponse.json({ error: 'Invalid time values' }, { status: 400 });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Invalid latitude/longitude values' }, { status: 400 });
    }

    console.log('Generating kundali for:', { name, day, month, year, hour, minute, second, gender, latitude, longitude });

    // Call Swiss Ephemeris WASM kundali engine
    const kundaliData = generateKundali({ year, month, day, hour, minute, second, gender }, latitude, longitude);

    // Return the kundali object directly
    return NextResponse.json(kundaliData);

  } catch (error) {
    console.error('Kundali generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during kundali generation' },
      { status: 500 }
    );
  }
}
