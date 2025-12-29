import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, users, astrologers } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
// Helper function to validate message structure
function validateMessages(messages: any): boolean {
  if (!Array.isArray(messages)) return false;

  return messages.every(msg => {
    return (
      msg &&
      typeof msg === 'object' &&
      typeof msg.role === 'string' &&
      typeof msg.content === 'string' &&
      typeof msg.timestamp === 'string'
    );
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const session = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, parseInt(id)))
        .limit(1);

      if (session.length === 0) {
        return NextResponse.json(
          { error: 'Chat session not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(session[0], { status: 200 });
    }

    // List with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userIdParam = searchParams.get('userId');
    const astrologerIdParam = searchParams.get('astrologerId');
    const sessionType = searchParams.get('sessionType');
    const status = searchParams.get('status');

    let query = db.select().from(chatSessions);

    // Build filter conditions
    const conditions = [];

    if (userIdParam) {
      const userId = parseInt(userIdParam);
      if (!isNaN(userId)) {
        conditions.push(eq(chatSessions.userId, userId));
      }
    }

    if (astrologerIdParam) {
      const astrologerId = parseInt(astrologerIdParam);
      if (!isNaN(astrologerId)) {
        conditions.push(eq(chatSessions.astrologerId, astrologerId));
      }
    }

    if (sessionType) {
      if (sessionType !== 'ai' && sessionType !== 'astrologer') {
        return NextResponse.json(
          { error: 'Invalid sessionType. Must be "ai" or "astrologer"', code: 'INVALID_SESSION_TYPE' },
          { status: 400 }
        );
      }
      conditions.push(eq(chatSessions.sessionType, sessionType));
    }

    if (status) {
      if (status !== 'active' && status !== 'ended') {
        return NextResponse.json(
          { error: 'Invalid status. Must be "active" or "ended"', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(chatSessions.status, status));
    }

    // Apply filters if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting, pagination
    const results = await query
      .orderBy(desc(chatSessions.startTime))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, astrologerId, sessionType, messages, status, startTime, endTime } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!sessionType) {
      return NextResponse.json(
        { error: 'sessionType is required', code: 'MISSING_SESSION_TYPE' },
        { status: 400 }
      );
    }

    if (!startTime) {
      return NextResponse.json(
        { error: 'startTime is required', code: 'MISSING_START_TIME' },
        { status: 400 }
      );
    }

    // Validate sessionType enum
    if (sessionType !== 'ai' && sessionType !== 'astrologer') {
      return NextResponse.json(
        { error: 'Invalid sessionType. Must be "ai" or "astrologer"', code: 'INVALID_SESSION_TYPE' },
        { status: 400 }
      );
    }

    // Validate astrologerId requirement for astrologer sessions
    if (sessionType === 'astrologer' && !astrologerId) {
      return NextResponse.json(
        { error: 'astrologerId is required for astrologer session type', code: 'MISSING_ASTROLOGER_ID' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && status !== 'active' && status !== 'ended') {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "ended"', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate userId exists
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Validate astrologerId if provided
    if (astrologerId) {
      const astrologerExists = await db
        .select()
        .from(astrologers)
        .where(eq(astrologers.id, parseInt(astrologerId)))
        .limit(1);

      if (astrologerExists.length === 0) {
        return NextResponse.json(
          { error: 'Astrologer not found', code: 'ASTROLOGER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Validate and parse messages
    const parsedMessages = messages || [];
    if (!Array.isArray(parsedMessages)) {
      return NextResponse.json(
        { error: 'messages must be a JSON array', code: 'INVALID_MESSAGES_FORMAT' },
        { status: 400 }
      );
    }

    if (parsedMessages.length > 0 && !validateMessages(parsedMessages)) {
      return NextResponse.json(
        { error: 'Invalid message structure. Each message must have role, content, and timestamp', code: 'INVALID_MESSAGE_STRUCTURE' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      userId: parseInt(userId),
      sessionType,
      messages: parsedMessages,
      status: status || 'active',
      startTime,
      createdAt: new Date().toISOString(),
    };

    if (astrologerId) {
      insertData.astrologerId = parseInt(astrologerId);
    }

    if (endTime) {
      insertData.endTime = endTime;
    }

    // Create chat session
    const newSession = await db
      .insert(chatSessions)
      .values(insertData)
      .returning();

    // Send email notification if it's an astrologer session
    if (sessionType === 'astrologer' && astrologerId) {
      // We already fetched astrologerExists and userExists above, but let's be safe and access them
      // Since we validated them, we know they exist.
      // However, the `astrologerExists` variable is scoped inside the `if (astrologerId)` block above.
      // We need to fetch details again or restructure. 
      // Actually, looking at the code structure:
      // 'userExists' is available in higher scope.
      // 'astrologerExists' is inside `if (astrologerId)`. 

      // Let's refetch to be clean or move the logic. 
      // Refetching is safer to avoid scope issues without major refactor.
      const astrologerDetails = await db
        .select()
        .from(astrologers)
        .where(eq(astrologers.id, parseInt(astrologerId)))
        .limit(1);

      if (astrologerDetails.length > 0) {
        const astrologer = astrologerDetails[0];
        const user = userExists[0];
        const chatLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://viprakarma.com'}/admin/chat/${newSession[0].id}`;

        // Import dynamically to avoid top-level simplified import issues if any
        const { sendChatNotificationEmail } = await import('@/lib/email');

        // Don't await the email so we don't block the response
        sendChatNotificationEmail(
          astrologer.email,
          astrologer.name,
          user.name,
          chatLink
        ).catch(err => console.error('Failed to send background email:', err));
      }
    }

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if session exists
    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, parseInt(id)))
      .limit(1);

    if (existingSession.length === 0) {
      return NextResponse.json(
        { error: 'Chat session not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { sessionType, messages, status, endTime, astrologerId } = body;

    // Validate sessionType if being updated
    if (sessionType && sessionType !== 'ai' && sessionType !== 'astrologer') {
      return NextResponse.json(
        { error: 'Invalid sessionType. Must be "ai" or "astrologer"', code: 'INVALID_SESSION_TYPE' },
        { status: 400 }
      );
    }

    // Validate status if being updated
    if (status && status !== 'active' && status !== 'ended') {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "ended"', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate astrologerId if being updated
    if (astrologerId) {
      const astrologerExists = await db
        .select()
        .from(astrologers)
        .where(eq(astrologers.id, parseInt(astrologerId)))
        .limit(1);

      if (astrologerExists.length === 0) {
        return NextResponse.json(
          { error: 'Astrologer not found', code: 'ASTROLOGER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Handle messages update - append to existing messages
    let updatedMessages = existingSession[0].messages;
    if (messages !== undefined) {
      if (!Array.isArray(messages)) {
        return NextResponse.json(
          { error: 'messages must be a JSON array', code: 'INVALID_MESSAGES_FORMAT' },
          { status: 400 }
        );
      }

      if (messages.length > 0 && !validateMessages(messages)) {
        return NextResponse.json(
          { error: 'Invalid message structure. Each message must have role, content, and timestamp', code: 'INVALID_MESSAGE_STRUCTURE' },
          { status: 400 }
        );
      }

      // Append new messages to existing ones
      const currentMessages = Array.isArray(existingSession[0].messages) ? existingSession[0].messages : [];
      updatedMessages = [...currentMessages, ...messages];
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (sessionType !== undefined) {
      updateData.sessionType = sessionType;
    }

    if (messages !== undefined) {
      updateData.messages = updatedMessages;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (endTime !== undefined) {
      updateData.endTime = endTime;
    }

    if (astrologerId !== undefined) {
      updateData.astrologerId = astrologerId ? parseInt(astrologerId) : null;
    }

    // Update session
    const updated = await db
      .update(chatSessions)
      .set(updateData)
      .where(eq(chatSessions.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if session exists
    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, parseInt(id)))
      .limit(1);

    if (existingSession.length === 0) {
      return NextResponse.json(
        { error: 'Chat session not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete session
    const deleted = await db
      .delete(chatSessions)
      .where(eq(chatSessions.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Chat session deleted successfully',
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}
