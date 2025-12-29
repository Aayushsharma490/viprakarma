import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptionRequests, users, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Approve subscription request
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

        const { requestId, adminNotes } = await request.json();

        if (!requestId) {
            return NextResponse.json({
                success: false,
                error: 'Request ID is required'
            }, { status: 400 });
        }

        // Get the subscription request
        const subRequest = await db
            .select()
            .from(subscriptionRequests)
            .where(eq(subscriptionRequests.id, requestId))
            .limit(1);

        if (!subRequest || subRequest.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Subscription request not found'
            }, { status: 404 });
        }

        const request_data = subRequest[0];

        // Calculate expiry date (1 year from now)
        const now = new Date();
        const expiryDate = new Date(now);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // Update subscription request
        await db
            .update(subscriptionRequests)
            .set({
                status: 'approved',
                adminNotes: adminNotes || '',
                approvedBy: decoded.userId,
                processedAt: now.toISOString(),
                expiryDate: expiryDate.toISOString(),
                updatedAt: now.toISOString(),
            })
            .where(eq(subscriptionRequests.id, requestId));

        // Update user's subscription status
        await db
            .update(users)
            .set({
                isMahuratSubscribed: true,
                mahuratSubscriptionExpiry: expiryDate.toISOString(),
                updatedAt: now.toISOString(),
            })
            .where(eq(users.id, request_data.userId));

        // Create notification for user
        await db.insert(notifications).values({
            userId: request_data.userId,
            title: 'Subscription Approved! 🎉',
            message: `Your ${request_data.planName} subscription has been approved and is now active until ${expiryDate.toLocaleDateString()}.`,
            type: 'success',
            isRead: false,
            link: '/mahurat',
            createdAt: now.toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: 'Subscription approved successfully'
        });

    } catch (error) {
        console.error('Approve subscription error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
