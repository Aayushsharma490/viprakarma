import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Check if database is configured
        if (!db) {
            console.warn('[Notifications API] Database not configured, returning empty notifications');
            return NextResponse.json({
                success: true,
                notifications: [],
                unreadCount: 0
            });
        }

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId || decoded.id; // Support both just in case

        const userNotifications = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(20);

        const unreadCount = userNotifications.filter(n => !n.isRead).length;

        return NextResponse.json({
            success: true,
            notifications: userNotifications,
            unreadCount
        });

    } catch (error) {
        console.error('[Notifications API] Error:', error);
        // Return empty notifications as fallback
        return NextResponse.json({
            success: true,
            notifications: [],
            unreadCount: 0
        });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId || decoded.id;
        const { notificationId, markAll } = await request.json();

        if (markAll) {
            await db.update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.userId, userId));
        } else if (notificationId) {
            await db.update(notifications)
                .set({ isRead: true })
                .where(and(
                    eq(notifications.id, notificationId),
                    eq(notifications.userId, userId)
                ));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
