import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { astrologers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST - Approve/Reject astrologer
export async function POST(
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

        if (isApproved === undefined) {
            return NextResponse.json({ error: 'isApproved field is required' }, { status: 400 });
        }

        // Check if astrologer exists
        const existing = await db
            .select()
            .from(astrologers)
            .where(eq(astrologers.id, id))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: 'Astrologer not found' }, { status: 404 });
        }

        // Update approval status
        const updated = await db
            .update(astrologers)
            .set({ isApproved: isApproved })
            .where(eq(astrologers.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            message: isApproved ? 'Astrologer approved successfully' : 'Astrologer rejected successfully',
            astrologer: updated[0]
        });
    } catch (error) {
        console.error('Error approving/rejecting astrologer:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
