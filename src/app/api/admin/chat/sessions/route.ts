import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, users, astrologers, chatMessages } from '@/db/schema';
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

    if (!decoded.isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    // Get all chat sessions with user and astrologer info
    const sessions = await db
      .select({
        id: chatSessions.id,
        userId: chatSessions.userId,
        userName: users.name,
        astrologerId: chatSessions.astrologerId,
        astrologerName: astrologers.name,
        sessionType: chatSessions.sessionType,
        status: chatSessions.status,
        startTime: chatSessions.startTime,
        endTime: chatSessions.endTime,
        messageCount: sql<number>`COUNT(${chatMessages.id})`,
        lastMessage: sql<string>`MAX(${chatMessages.content})`,
      })
      .from(chatSessions)
      .leftJoin(users, eq(chatSessions.userId, users.id))
      .leftJoin(astrologers, eq(chatSessions.astrologerId, astrologers.id))
      .leftJoin(chatMessages, eq(chatSessions.id, chatMessages.sessionId))
      .groupBy(
        chatSessions.id,
        chatSessions.userId,
        chatSessions.astrologerId,
        chatSessions.sessionType,
        chatSessions.status,
        chatSessions.startTime,
        chatSessions.endTime,
        users.name,
        astrologers.name
      )
      .orderBy(desc(chatSessions.startTime));

    return NextResponse.json(sessions);

  } catch (error) {
    console.error('Get admin chat sessions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
