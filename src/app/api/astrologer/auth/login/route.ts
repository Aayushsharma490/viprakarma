import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { astrologers, chatSessions } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Check if astrologer exists with provided credentials
    const astrologer = await db
      .select()
      .from(astrologers)
      .where(eq(astrologers.email, email.toLowerCase().trim()))
      .limit(1);

    if (astrologer.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Astrologer not found. Please contact admin to set up your account.'
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, astrologer[0].password);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password.'
      }, { status: 401 });
    }

    const token = await generateToken({
      userId: astrologer[0].id,
      email: astrologer[0].email,
      role: 'astrologer',
    });

    // Check for active chat sessions
    const activeSession = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.astrologerId, astrologer[0].id),
          eq(chatSessions.status, 'active')
        )
      )
      .orderBy(desc(chatSessions.startTime))
      .limit(1);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: astrologer[0].id,
        name: astrologer[0].name,
        email: astrologer[0].email
      },
      activeSession: activeSession.length > 0 ? activeSession[0] : null,
    });

  } catch (error) {
    console.error('Astrologer login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
