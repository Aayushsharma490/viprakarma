import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      decoded = await verifyToken(token);
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 });
    }

    if (decoded.role !== 'astrologer') {
      return NextResponse.json({
        success: false,
        error: 'Astrologer access required'
      }, { status: 403 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    // Verify session belongs to authenticated astrologer
    const session = await db
      .select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.id, parseInt(sessionId)),
        eq(chatSessions.astrologerId, decoded.userId),
        eq(chatSessions.status, 'active')
      ))
      .limit(1);

    if (!session || session.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or not active'
      }, { status: 404 });
    }

    const activeSession = session[0];

    const now = new Date().toISOString();
    await db
      .update(chatSessions)
      .set({
        status: 'completed',
        endTime: now,
      })
      .where(eq(chatSessions.id, parseInt(sessionId)));

    await db
      .update(users)
      .set({
        canChatWithAstrologer: false,
        activeConsultationAstrologerId: null,
        updatedAt: now,
      })
      .where(eq(users.id, activeSession.userId));

    return NextResponse.json({
      success: true,
      message: 'Chat session ended successfully'
    });

  } catch (error) {
    console.error('End astrologer chat error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

