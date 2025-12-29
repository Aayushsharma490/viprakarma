import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // Parse request body with error handling
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('[Forgot Password] JSON parse error:', parseError);
            return NextResponse.json(
                { error: 'Invalid request format. Please check your input.' },
                { status: 400 }
            );
        }

        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

        // Check if database is available
        if (!db) {
            console.error('[Forgot Password] Database not available');
            return NextResponse.json(
                { error: 'Service temporarily unavailable. Please try again later.' },
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

        // Send reset code via email
        const emailResult = await sendPasswordResetEmail(email, resetToken);

        if (!emailResult.success) {
            console.error('[Forgot Password] Failed to send email, but continuing...');
        }

        // Return the code (for MVP - in production, remove this!)
        return NextResponse.json({
            success: true,
            message: emailResult.success
                ? 'Reset code sent to your email'
                : 'Reset code generated (email sending failed)',
            expiresIn: '15 minutes',
            emailSent: emailResult.success,
        });
    } catch (error) {
        console.error('[Forgot Password] Error:', error);
        console.error('[Forgot Password] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('[Forgot Password] Error message:', error instanceof Error ? error.message : String(error));
        return NextResponse.json(
            {
                error: 'Failed to process request',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
