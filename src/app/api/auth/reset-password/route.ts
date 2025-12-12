import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, code, newPassword } = await request.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { error: 'Email, reset code, and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Check if database is available
        if (!db) {
            return NextResponse.json(
                { error: 'Service temporarily unavailable' },
                { status: 503 }
            );
        }

        // Find user with matching email and reset token
        const user = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.email, email.toLowerCase().trim()),
                    eq(users.resetToken, code)
                )
            )
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json(
                { error: 'Invalid reset code or email' },
                { status: 400 }
            );
        }

        // Check if token has expired
        const now = new Date();
        const tokenExpiry = new Date(user[0].resetTokenExpiry || '');

        if (now > tokenExpiry) {
            return NextResponse.json(
                { error: 'Reset code has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await db
            .update(users)
            .set({
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, user[0].id));

        console.log(`[Reset Password] Password reset successful for ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.',
        });
    } catch (error) {
        console.error('[Reset Password] Error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    }
}
