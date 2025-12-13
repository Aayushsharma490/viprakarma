import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    // Verify session belongs to authenticated user
    const session = await db
      .select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.id, parseInt(sessionId)),
        eq(chatSessions.status, 'active')
      ))
      .limit(1);

    if (!session || session.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or inactive'
      }, { status: 404 });
    }

    const foundSession = session[0];

    // Check if user has access to this session
    if (decoded.role === 'user' && foundSession.userId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    if (decoded.role === 'astrologer' && foundSession.astrologerId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Get messages for the session
    const messages = await db
      .select({
        id: chatMessages.id,
        senderId: chatMessages.senderId,
        senderType: chatMessages.senderType,
        messageType: chatMessages.messageType,
        content: chatMessages.content,
        fileUrl: chatMessages.fileUrl,
        fileName: chatMessages.fileName,
        fileSize: chatMessages.fileSize,
        timestamp: chatMessages.timestamp,
      })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, parseInt(sessionId)))
      .orderBy(asc(chatMessages.timestamp));

    return NextResponse.json({
      success: true,
      messages,
      session: foundSession,
    });

  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

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

    const { sessionId, content, messageType = 'text', fileUrl, fileName, fileSize } = await request.json();

    if (!sessionId || !content) {
      return NextResponse.json({
        success: false,
        error: 'Session ID and content are required'
      }, { status: 400 });
    }

    // Verify session belongs to authenticated user/astrologer
    const session = await db
      .select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.id, parseInt(sessionId)),
        eq(chatSessions.status, 'active')
      ))
      .limit(1);

    if (!session || session.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or inactive'
      }, { status: 404 });
    }

    const foundSession = session[0];

    // Check if user/astrologer has access to this session
    if (decoded.role === 'user' && foundSession.userId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    if (decoded.role === 'astrologer' && foundSession.astrologerId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Create new message
    const now = new Date().toISOString();
    const newMessage = await db
      .insert(chatMessages)
      .values({
        sessionId: parseInt(sessionId),
        senderId: decoded.userId,
        senderType: decoded.role,
        messageType,
        content,
        fileUrl,
        fileName,
        fileSize,
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

    // Send email to astrologer on FIRST user message
    if (decoded.role === 'user') {
      // Check if this is the first user message in the session
      const messageCount = await db
        .select()
        .from(chatMessages)
        .where(and(
          eq(chatMessages.sessionId, parseInt(sessionId)),
          eq(chatMessages.senderType, 'user')
        ));

      if (messageCount.length === 1) { // This is the first message
        // Get astrologer and user details
        const { astrologers, users } = await import('@/db/schema');

        if (!foundSession.astrologerId) {
          console.error('No astrologer assigned to session');
        } else {
          const astrologerData = await db
            .select()
            .from(astrologers)
            .where(eq(astrologers.id, foundSession.astrologerId))
            .limit(1);

          const userData = await db
            .select()
            .from(users)
            .where(eq(users.id, foundSession.userId))
            .limit(1);

          if (astrologerData.length > 0 && userData.length > 0) {
            const { sendNewChatRequestEmail } = await import('@/lib/email');
            await sendNewChatRequestEmail(
              astrologerData[0].email,
              astrologerData[0].name,
              userData[0].name
            ).catch(err => console.error('Failed to send email to astrologer:', err));
          }
        }
      }
    }

    // Send email to user when astrologer sends a message
    if (decoded.role === 'astrologer') {
      const { astrologers, users } = await import('@/db/schema');

      const astrologerData = await db
        .select()
        .from(astrologers)
        .where(eq(astrologers.id, decoded.userId))
        .limit(1);

      const userData = await db
        .select()
        .from(users)
        .where(eq(users.id, foundSession.userId))
        .limit(1);

      if (astrologerData.length > 0 && userData.length > 0) {
        const { sendAstrologerMessageEmail } = await import('@/lib/email');
        await sendAstrologerMessageEmail(
          userData[0].email,
          userData[0].name,
          astrologerData[0].name,
          content
        ).catch(err => console.error('Failed to send message notification to user:', err));
      }
    }

    return NextResponse.json({
      success: true,
      message: newMessage[0]
    });

  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

