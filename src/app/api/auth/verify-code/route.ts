import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code are required' },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        // Check verification code
        const user = await db
            .select()
            .from(users)
            .where(and(
                eq(users.email, email.toLowerCase().trim()),
                eq(users.resetToken, code),
                gt(users.resetTokenExpiry, now)
            ))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or expired verification code' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Code verified successfully'
        });

    } catch (error) {
        console.error('[Verify Code] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
