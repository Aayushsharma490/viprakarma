import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pandits } from '@/db/schema';

// GET all pandits for public website
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const availableOnly = searchParams.get('availableOnly');

    let query = db
      .select()
      .from(pandits)
      .where(availableOnly === 'true' ? eq(pandits.available, true) : undefined)
      .orderBy(pandits.createdAt);

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const allPandits = await query;

    return NextResponse.json(allPandits);
  } catch (error) {
    console.error('Error fetching pandits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}