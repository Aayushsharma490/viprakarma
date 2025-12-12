import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptionRequests, users, notifications } from '@/db/schema';
import { eq, and, desc, or, like } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// GET - List all subscription requests (Admin only)
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let query = db.select({
            request: subscriptionRequests,
            user: {
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
            }
        })
            .from(subscriptionRequests)
            .leftJoin(users, eq(subscriptionRequests.userId, users.id))
            .orderBy(desc(subscriptionRequests.createdAt))
            .$dynamic();

        const conditions: any[] = [];

        if (status) {
            conditions.push(eq(subscriptionRequests.status, status));
        }

        if (search) {
            conditions.push(
                or(
                    like(users.name, `%${search}%`),
                    like(users.email, `%${search}%`),
                    like(subscriptionRequests.planName, `%${search}%`)
                )
            );
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const requests = await query;

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
