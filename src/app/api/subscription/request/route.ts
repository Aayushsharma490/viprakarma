import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptionRequests, users, notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Create subscription request
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

        const {
            planId,
            planName,
            amount,
            duration,
            paymentMethod,
            payerName,
            phoneNumber,
            transactionId,
            paymentScreenshot
        } = await request.json();

        if (!planId || !planName || !amount || !paymentMethod || !payerName || !phoneNumber) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Create subscription request
        const newRequest = await db.insert(subscriptionRequests).values({
            userId: decoded.userId,
            planId,
            planName,
            amount,
            duration: duration || '1 Year',
            paymentMethod,
            payerName,
            phoneNumber,
            transactionId: transactionId || '',
            paymentScreenshot: paymentScreenshot || '',
            status: 'pending',
            requestedAt: now,
            createdAt: now,
            updatedAt: now,
        }).returning();

        // Create notification for user
        await db.insert(notifications).values({
            userId: decoded.userId,
            title: 'Subscription Request Submitted',
            message: `Your ${planName} subscription request has been submitted and is pending admin approval.`,
            type: 'info',
            isRead: false,
            createdAt: now,
        });

        return NextResponse.json({
            success: true,
            request: newRequest[0]
        });

    } catch (error) {
        console.error('Subscription request error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// GET - Get user's subscription requests
export async function GET(request: NextRequest) {
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

        const requests = await db
            .select()
            .from(subscriptionRequests)
            .where(eq(subscriptionRequests.userId, decoded.userId))
            .orderBy(desc(subscriptionRequests.createdAt));

        return NextResponse.json({
            success: true,
            requests
        });

    } catch (error) {
        console.error('Get subscription requests error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
