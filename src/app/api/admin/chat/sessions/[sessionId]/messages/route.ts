import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
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

    // Verify session exists
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

    // Get messages for the session
    const messages = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        sender: chatMessages.senderType,
        timestamp: chatMessages.timestamp,
      })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, parseInt(sessionId)))
      .orderBy(asc(chatMessages.timestamp));

    return NextResponse.json(messages);

  } catch (error) {
    console.error('Get admin chat messages error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

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
    const { content, sender } = await request.json();

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required'
      }, { status: 400 });
    }

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

    // Create new message
    const now = new Date().toISOString();
    const newMessage = await db
      .insert(chatMessages)
      .values({
        sessionId: parseInt(sessionId),
        senderId: decoded.userId,
        senderType: sender || 'admin',
        messageType: 'text',
        content,
        timestamp: now,
        createdAt: now,
      })
      .returning();

    if (!newMessage || newMessage.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to send message'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: newMessage[0]
    });

  } catch (error) {
    console.error('Send admin chat message error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
