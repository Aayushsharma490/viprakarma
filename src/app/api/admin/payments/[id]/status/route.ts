import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentVerifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simplified - no auth required
    const { action, adminNotes } = await request.json();

    const id = parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    const updated = await db
      .update(paymentVerifications)
      .set({
        status: newStatus,
        adminNotes: adminNotes || null,
        verifiedAt: now,
        updatedAt: now,
      })
      .where(eq(paymentVerifications.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PATCH admin payment status error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}
