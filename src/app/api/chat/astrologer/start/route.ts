import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, chatMessages, astrologers, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  }

  const token = authHeader.substring(7);
  try {
    const decoded = await verifyToken(token);
    if (!decoded || (decoded as any).role === undefined) {
      return { error: NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }) };
    }
    return { decoded };
  } catch (err) {
    console.error('JWT verification error:', err);
    return { error: NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }) };
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const decoded: any = authResult.decoded;
    if (decoded.role !== 'user' && decoded.role !== 'astrologer') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 403 });
    }

    let sessionQuery;
    if (decoded.role === 'user') {
      sessionQuery = await db
        .select()
        .from(chatSessions)
        .where(and(
          eq(chatSessions.userId, decoded.userId),
          eq(chatSessions.sessionType, 'astrologer'),
          eq(chatSessions.status, 'active')
        ))
        .limit(1);

      if (!sessionQuery || sessionQuery.length === 0) {
        sessionQuery = await db
          .select()
          .from(chatSessions)
          .where(and(
            eq(chatSessions.userId, decoded.userId),
            eq(chatSessions.sessionType, 'astrologer'),
            eq(chatSessions.status, 'completed')
          ))
          .orderBy(chatSessions.endTime ? chatSessions.endTime : chatSessions.startTime)
          .limit(1);
      }
    } else {
      sessionQuery = await db
        .select()
        .from(chatSessions)
        .where(and(
          eq(chatSessions.astrologerId, decoded.userId),
          eq(chatSessions.sessionType, 'astrologer'),
          eq(chatSessions.status, 'active')
        ))
        .limit(1);
    }

    return NextResponse.json({
      success: true,
      session: sessionQuery && sessionQuery.length > 0 ? sessionQuery[0] : null,
    });
  } catch (error) {
    console.error('Get astrologer chat session error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const decoded: any = authResult.decoded;

    if (decoded.role !== 'user' && decoded.role !== 'astrologer') {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const bodyAstrologerId = body?.astrologerId;

    const userId = decoded.userId;

    if (decoded.role === 'user') {
      if (!bodyAstrologerId || isNaN(parseInt(bodyAstrologerId))) {
        return NextResponse.json({
          success: false,
          error: 'Astrologer selection is required to start chat'
        }, { status: 400 });
      }

      const userResult = await db
        .select({ canChatWithAstrologer: users.canChatWithAstrologer })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userResult || userResult.length === 0 || !userResult[0].canChatWithAstrologer) {
        return NextResponse.json({
          success: false,
          error: 'Chat with astrologer not enabled. Please complete payment verification.'
        }, { status: 403 });
      }
    }

    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.userId, userId),
        eq(chatSessions.sessionType, 'astrologer'),
        eq(chatSessions.status, 'active')
      ))
      .limit(1);

    if (existingSession && existingSession.length > 0) {
      const session = existingSession[0];
      if (decoded.role === 'astrologer' || !bodyAstrologerId || session.astrologerId === parseInt(bodyAstrologerId)) {
        return NextResponse.json({ success: true, session });
      }

      return NextResponse.json({
        success: false,
        error: 'Active chat already exists with another astrologer'
      }, { status: 409 });
    }

    let targetAstrologerId: number;

    if (decoded.role === 'astrologer') {
      targetAstrologerId = decoded.userId;
    } else {
      targetAstrologerId = parseInt(bodyAstrologerId as string);
    }

    const astrologerRecord = await db
      .select()
      .from(astrologers)
      .where(and(
        eq(astrologers.id, targetAstrologerId),
        eq(astrologers.isApproved, true)
      ))
      .limit(1);

    if (!astrologerRecord || astrologerRecord.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Selected astrologer is unavailable'
      }, { status: 404 });
    }

    const assignedAstrologer = astrologerRecord[0];
    const astrologerOnline = assignedAstrologer.isOnline === true;

    if (!astrologerOnline && decoded.role === 'user') {
      return NextResponse.json({
        success: false,
        error: 'Selected astrologer is currently offline. Please try again later.'
      }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newSession = await db
      .insert(chatSessions)
      .values({
        userId,
        astrologerId: assignedAstrologer.id,
        sessionType: 'astrologer',
        messages: '[]',
        status: 'active',
        startTime: now,
        createdAt: now,
      })
      .returning();

    if (!newSession || newSession.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create chat session'
      }, { status: 500 });
    }

    // Update user's active astrologer assignment
    await db
      .update(users)
      .set({
        activeConsultationAstrologerId: assignedAstrologer.id,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    await db
      .insert(chatMessages)
      .values({
        sessionId: newSession[0].id,
        senderId: assignedAstrologer.id,
        senderType: 'astrologer',
        messageType: 'text',
        content: `Hello! I'm ${assignedAstrologer.name}. I'm here to help you with your astrological queries. How can I assist you today?`,
        timestamp: now,
        createdAt: now,
      });

    // Send email to user when astrologer joins (only if astrologer is starting the session)
    if (decoded.role === 'astrologer') {
      const userData = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userData.length > 0) {
        const { sendAstrologerJoinedEmail } = await import('@/lib/email');
        await sendAstrologerJoinedEmail(
          userData[0].email,
          userData[0].name,
          assignedAstrologer.name
        ).catch(err => console.error('Failed to send astrologer joined email:', err));
      }
    }

    return NextResponse.json({
      success: true,
      session: newSession[0]
    });

  } catch (error) {
    console.error('Start astrologer chat error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

