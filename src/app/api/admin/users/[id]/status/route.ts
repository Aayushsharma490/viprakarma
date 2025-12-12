import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { db } from '@/db';
import { users, chatSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({
        error: 'Invalid user ID',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        error: 'User not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action || !['ban', 'unban', 'promote', 'demote', 'enable_chat', 'disable_chat'].includes(action)) {
      return NextResponse.json({
        error: 'Invalid action. Must be one of: ban, unban, promote, demote, enable_chat, disable_chat',
        code: 'INVALID_ACTION'
      }, { status: 400 });
    }

    const user = existingUser[0];
    let updateData: any = {};

    switch (action) {
      case 'promote':
        if (user.isAdmin) {
          return NextResponse.json({
            error: 'User is already an admin',
            code: 'ALREADY_ADMIN'
          }, { status: 400 });
        }
        updateData.isAdmin = true;
        break;

      case 'demote':
        if (!user.isAdmin) {
          return NextResponse.json({
            error: 'User is not an admin',
            code: 'NOT_ADMIN'
          }, { status: 400 });
        }
        updateData.isAdmin = false;
        break;

      case 'enable_chat':
        // Simply enable chat permission
        updateData.canChatWithAstrologer = true;
        break;

      case 'disable_chat':
        // Disable chat and clean up active sessions
        updateData.canChatWithAstrologer = false;
        updateData.activeConsultationAstrologerId = null;

        // End any active chat sessions for this user
        try {
          const now = new Date().toISOString();
          await db.update(chatSessions)
            .set({
              status: 'completed',
              endTime: now,
            })
            .where(and(
              eq(chatSessions.userId, userId),
              eq(chatSessions.status, 'active')
            ));
        } catch (sessionError) {
          console.warn('Failed to end active sessions:', sessionError);
          // Continue with user update even if session cleanup fails
        }
        break;

      case 'ban':
        // For now, we'll just mark as inactive. You might want to add a banned field
        updateData.subscriptionPlan = 'banned';
        break;

      case 'unban':
        if (user.subscriptionPlan !== 'banned') {
          return NextResponse.json({
            error: 'User is not banned',
            code: 'NOT_BANNED'
          }, { status: 400 });
        }
        updateData.subscriptionPlan = 'free';
        break;
    }

    // Update the user
    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json({
      message: 'User status updated successfully',
      user: updatedUser[0]
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH admin user status error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}
