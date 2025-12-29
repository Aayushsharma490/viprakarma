import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, paymentVerifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user has chat permission enabled
    const user = await db
      .select({ canChatWithAstrologer: users.canChatWithAstrologer })
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      canChatWithAstrologer: user[0].canChatWithAstrologer
    });

  } catch (error) {
    console.error('GET user chat status error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}
