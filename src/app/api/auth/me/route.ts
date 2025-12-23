import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

        const userResult = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                isAdmin: users.isAdmin,
                phone: users.phone,
                canChatWithAstrologer: users.canChatWithAstrologer,
                isMahuratSubscribed: users.isMahuratSubscribed,
                mahuratSubscriptionExpiry: users.mahuratSubscriptionExpiry,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!userResult || userResult.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: userResult[0] });
    } catch (error) {
        console.error('Error in /api/auth/me:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
