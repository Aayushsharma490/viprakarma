import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, notifications } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Send expiry reminder to specific user (Manual)
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded: any;

        try {
            decoded = await verifyToken(token);
        } catch (err) {
            return NextResponse.json({
                success: false,
                error: 'Invalid token'
            }, { status: 401 });
        }

        // Verify admin
        const adminUser = await db
            .select()
            .from(users)
            .where(and(
                eq(users.id, decoded.userId),
                eq(users.isAdmin, true)
            ))
            .limit(1);

        if (!adminUser || adminUser.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - Admin access required'
            }, { status: 403 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Get user subscription details
        const user = await db
            .select()
            .from(users)
            .where(and(
                eq(users.id, userId),
                eq(users.isMahuratSubscribed, true)
            ))
            .limit(1);

        if (!user || user.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'User not found or not subscribed'
            }, { status: 404 });
        }

        const userData = user[0];
        const expiryDate = new Date(userData.mahuratSubscriptionExpiry || '');
        const now = new Date();
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Create reminder notification
        await db.insert(notifications).values({
            userId: userId,
            title: 'Subscription Expiry Reminder',
            message: `Your Mahurat subscription will expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} on ${expiryDate.toLocaleDateString()}. Renew now to continue enjoying our services!`,
            type: 'warning',
            isRead: false,
            link: '/subscription',
            createdAt: now.toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: 'Reminder sent successfully',
            daysRemaining
        });

    } catch (error) {
        console.error('Send reminder error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// GET - Send automatic reminders to all users (Cron job)
export async function GET(request: NextRequest) {
    try {
        const now = new Date();

        // Calculate dates for 7, 3, and 1 day reminders
        const dates = [7, 3, 1].map(days => {
            const date = new Date(now);
            date.setDate(date.getDate() + days);
            return { days, date: date.toISOString().split('T')[0] };
        });

        let remindersSent = 0;

        for (const { days, date } of dates) {
            // Find users expiring on this date
            const expiringUsers = await db
                .select()
                .from(users)
                .where(and(
                    eq(users.isMahuratSubscribed, true),
                    lt(users.mahuratSubscriptionExpiry, new Date(date + 'T23:59:59').toISOString())
                ));

            for (const user of expiringUsers) {
                const expiryDate = new Date(user.mahuratSubscriptionExpiry || '');
                const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                if (daysRemaining === days) {
                    await db.insert(notifications).values({
                        userId: user.id,
                        title: 'Subscription Expiry Reminder',
                        message: `Your Mahurat subscription will expire in ${days} day${days !== 1 ? 's' : ''} on ${expiryDate.toLocaleDateString()}. Renew now to continue enjoying our services!`,
                        type: 'warning',
                        isRead: false,
                        link: '/subscription',
                        createdAt: now.toISOString(),
                    });
                    remindersSent++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            remindersSent
        });

    } catch (error) {
        console.error('Auto reminder error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
