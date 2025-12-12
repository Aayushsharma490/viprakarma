import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, users, chatMessages } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const astrologerId = decoded.userId;

    // Get chat sessions for this astrologer
    const sessions = await db
      .select({
        id: chatSessions.id,
        userId: chatSessions.userId,
        astrologerId: chatSessions.astrologerId,
        sessionType: chatSessions.sessionType,
        status: chatSessions.status,
        startTime: chatSessions.startTime,
        endTime: chatSessions.endTime,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        messageCount: sql<number>`COUNT(${chatMessages.id})`,
        lastMessage: sql<string>`MAX(${chatMessages.content})`,
      })
      .from(chatSessions)
      .leftJoin(users, eq(chatSessions.userId, users.id))
      .leftJoin(chatMessages, eq(chatSessions.id, chatMessages.sessionId))
      .where(eq(chatSessions.astrologerId, astrologerId))
      .groupBy(
        chatSessions.id,
        chatSessions.userId,
        chatSessions.astrologerId,
        chatSessions.sessionType,
        chatSessions.status,
        chatSessions.startTime,
        chatSessions.endTime,
        users.name,
        users.email,
        users.phone
      )
      .orderBy(desc(chatSessions.startTime));

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Get astrologer sessions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

