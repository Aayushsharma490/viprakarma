import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
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

    if (!decoded.isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    const sessionId = params.sessionId;

    // Verify session exists and is active
    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, parseInt(sessionId)))
      .limit(1);

    if (!session || session.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    const activeSession = session[0];
    if (activeSession.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Session is not active'
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    await db
      .update(chatSessions)
      .set({
        status: 'ended',
        endTime: now,
      })
      .where(eq(chatSessions.id, parseInt(sessionId)));

    return NextResponse.json({
      success: true,
      message: 'Chat session ended successfully'
    });

  } catch (error) {
    console.error('End admin chat session error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
