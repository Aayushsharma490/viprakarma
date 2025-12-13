import { NextResponse } from 'next/server';
import { searchCities } from '@/lib/locations';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ cities: [] });
    }

    // searchCities is already case-insensitive
    const results = searchCities(query).slice(0, 10);

    return NextResponse.json({ cities: results });
}
