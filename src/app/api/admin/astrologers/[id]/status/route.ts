import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { astrologers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const { isApproved } = await request.json();

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json({ error: 'isApproved must be a boolean' }, { status: 400 });
    }

    // Check if astrologer exists
    const existingAstrologer = await db
      .select()
      .from(astrologers)
      .where(eq(astrologers.id, id))
      .limit(1);

    if (existingAstrologer.length === 0) {
      return NextResponse.json({ error: 'Astrologer not found' }, { status: 404 });
    }

    // Update astrologer approval status
    const updatedAstrologer = await db
      .update(astrologers)
      .set({ isApproved })
      .where(eq(astrologers.id, id))
      .returning();

    return NextResponse.json(updatedAstrologer[0]);
  } catch (error) {
    console.error('Error updating astrologer status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
