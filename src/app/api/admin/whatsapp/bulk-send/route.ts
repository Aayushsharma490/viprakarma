import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, isNotNull } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';
import { sendBulkWhatsApp } from '@/lib/wahaService';

export const dynamic = 'force-dynamic';

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
            .where(eq(users.id, decoded.userId))
            .limit(1);

        if (!adminUser || adminUser.length === 0 || !adminUser[0].isAdmin) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - Admin access required'
            }, { status: 403 });
        }

        const { senderName, senderPhone, message, messageLanguage } = await request.json();

        if (!senderName || !senderPhone || !message) {
            return NextResponse.json({
                success: false,
                error: 'Sender name, phone, and message are required'
            }, { status: 400 });
        }

        // Fetch all users with phone numbers
        const allUsers = await db
            .select({
                name: users.name,
                phone: users.phone
            })
            .from(users)
            .where(isNotNull(users.phone));

        if (allUsers.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No users with phone numbers found'
            }, { status: 404 });
        }

        console.log(`[bulk-send] Sending to ${allUsers.length} users`);

        // Send bulk WhatsApp messages with language support
        const result = await sendBulkWhatsApp(
            allUsers.map(u => ({ name: u.name, phone: u.phone || '' })),
            message,
            { name: senderName, phone: senderPhone },
            messageLanguage || 'en'
        );

        return NextResponse.json({
            success: true,
            sent: result.success,
            failed: result.failed,
            totalUsers: allUsers.length
        });

    } catch (error) {
        console.error('Bulk WhatsApp send error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
