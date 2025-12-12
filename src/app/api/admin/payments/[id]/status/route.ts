import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { createClient } from '@libsql/client';
import { paymentVerifications, users, consultations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createNotification } from '@/lib/notifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Simplified - no auth required
    const { action, adminNotes } = await request.json();

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    if (!['approve', 'reject', 'approve_enable_chat'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const approveAction = action === 'approve' || action === 'approve_enable_chat';
    const newStatus = approveAction ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    // Get the payment verification record to find the user ID
    const paymentRecord = await db
      .select({ userId: paymentVerifications.userId, consultationId: paymentVerifications.consultationId })
      .from(paymentVerifications)
      .where(eq(paymentVerifications.id, id))
      .limit(1);

    if (!paymentRecord || paymentRecord.length === 0) {
      return NextResponse.json({ error: 'Payment verification not found' }, { status: 404 });
    }

    const userId = paymentRecord[0].userId;
    const relatedConsultationId = paymentRecord[0].consultationId as number | null;

    // Update payment verification status
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

    // Create a lightweight client for runtime column detection (backward-compat)
    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    let hasUsersChatColumn = true;
    let hasConsultationPaymentStatus = true;
    try {
      const u = await client.execute('PRAGMA table_info(users)');
      const colsU = Array.isArray(u.rows) ? u.rows : [];
      hasUsersChatColumn = colsU.some((r: any) => r.name === 'can_chat_with_astrologer');
    } catch {
      // default to true; if update fails we'll ignore
    }
    try {
      const c = await client.execute('PRAGMA table_info(consultations)');
      const colsC = Array.isArray(c.rows) ? c.rows : [];
      hasConsultationPaymentStatus = colsC.some((r: any) => r.name === 'payment_status');
    } catch {
      // default to true; if update fails we'll ignore
    }

    // On approval, update consultation payment status if linked and column exists
    if (approveAction && relatedConsultationId && hasConsultationPaymentStatus) {
      try {
        await db.update(consultations)
          .set({ paymentStatus: 'verified', updatedAt: now })
          .where(eq(consultations.id, relatedConsultationId));
      } catch (e) {
        console.warn('Skipping consultation payment_status update (compat):', e);
      }
    }

    // Optionally enable chat permission in same action, if column exists
    if (action === 'approve_enable_chat' && hasUsersChatColumn) {
      try {
        await db.update(users)
          .set({ canChatWithAstrologer: true })
          .where(eq(users.id, userId));
      } catch (e) {
        console.warn('Skipping users.can_chat_with_astrologer update (compat):', e);
      }
    }

    // Send notification to user about payment status
    try {
      if (approveAction) {
        await createNotification(
          userId,
          'Payment Approved',
          'Your payment has been verified and approved. You can now access your consultation services.',
          'success',
          '/consultation'
        );
      } else {
        await createNotification(
          userId,
          'Payment Rejected',
          adminNotes || 'Your payment verification was rejected. Please contact support for more details.',
          'error',
          '/consultation'
        );
      }
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PATCH admin payment status error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}
