import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pandits } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authenticateAdmin } from '@/lib/authAdmin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateAdmin(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const panditId = parseInt(params.id, 10);
    if (isNaN(panditId)) {
      return NextResponse.json({ error: 'Invalid pandit ID' }, { status: 400 });
    }

    const body = await request.json();
    const { isApproved } = body;

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid isApproved value' }, { status: 400 });
    }

    const existingPandit = await db
      .select()
      .from(pandits)
      .where(eq(pandits.id, panditId))
      .limit(1);

    if (existingPandit.length === 0) {
      return NextResponse.json({ error: 'Pandit not found' }, { status: 404 });
    }

    const updatedPandit = await db
      .update(pandits)
      .set({ isApproved: isApproved ? 1 : 0 })
      .where(eq(pandits.id, panditId))
      .returning();

    return NextResponse.json(updatedPandit[0]);
  } catch (error) {
    console.error('Error updating pandit status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
