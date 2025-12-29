import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for:', email);

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Query user by email (case-insensitive search)
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    console.log('User found:', userResults.length > 0);

    // Check if user exists
    if (userResults.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const user = userResults[0];

    console.log('User is admin:', user.isAdmin);

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        {
          error: 'Unauthorized: Admin access required',
          code: 'ADMIN_ACCESS_REQUIRED'
        },
        { status: 403 }
      );
    }

    // Generate JWT token with actual isAdmin value from database
    const token = await signToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });

    console.log('Token generated successfully');

    // Prepare user object without password
    const { password: _, ...userWithoutPassword } = user;

    // Return success response with token as string
    return NextResponse.json(
      {
        success: true,
        token,
        user: userWithoutPassword
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      {
        error: 'Login failed',
        code: 'LOGIN_FAILED'
      },
      { status: 500 }
    );
  }
}
