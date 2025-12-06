import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const newUser = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password: hashedPassword,
        subscriptionPlan: 'free',
        isAdmin: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const { password: _, ...userWithoutPassword } = newUser[0];

    const token = signToken({
      userId: newUser[0].id,
      email: newUser[0].email,
      isAdmin: false,
    });

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(newUser[0].email, newUser[0].name).catch(console.error);

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}