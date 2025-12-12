import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
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

        // Find user by email
        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase().trim()))
            .limit(1);

        if (user.length === 0) {
            // Don't reveal if email exists or not (security)
            return NextResponse.json({
                success: true,
                message: 'If this email is registered, you will receive a reset code.',
            });
        }

        // Generate 6-digit reset code
        const resetToken = crypto.randomInt(100000, 999999).toString();

        // Set expiry to 15 minutes from now
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 15);
        const resetTokenExpiry = expiryDate.toISOString();

        // Update user with reset token
        await db
            .update(users)
            .set({
                resetToken,
                resetTokenExpiry,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, user[0].id));

        console.log(`[Forgot Password] Reset code generated for ${email}: ${resetToken}`);

        // Return the code (for MVP - in production, send via email)
        return NextResponse.json({
            success: true,
            message: 'Reset code generated successfully',
            resetCode: resetToken, // Remove this in production!
            expiresIn: '15 minutes',
        });
    } catch (error) {
        console.error('[Forgot Password] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
