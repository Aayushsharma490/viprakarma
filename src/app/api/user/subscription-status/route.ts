import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptionRequests } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded: any;

        try {
            decoded = await verifyToken(token);
        } catch (err: any) {
            return NextResponse.json({ error: err.message || 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId;

        // Fetch all active subscriptions for the user
        const now = new Date();
        const activeSubscriptions = await db
            .select({
                planId: subscriptionRequests.planId,
                planName: subscriptionRequests.planName,
                expiryDate: subscriptionRequests.expiryDate,
                status: subscriptionRequests.status,
            })
            .from(subscriptionRequests)
            .where(
                and(
                    eq(subscriptionRequests.userId, userId),
                    eq(subscriptionRequests.status, 'approved'),
                    gte(subscriptionRequests.expiryDate, now.toISOString())
                )
            );

        const subscriptions = activeSubscriptions.map(sub => ({
            planId: sub.planId,
            planName: sub.planName,
            expiryDate: sub.expiryDate,
            isActive: true
        }));

        return NextResponse.json({ subscriptions });
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
