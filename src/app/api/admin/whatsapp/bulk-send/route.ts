import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, astrologers } from '@/db/schema';
import { eq, isNotNull } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';
import { sendBulkWhatsApp } from '@/lib/wahaService';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
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

        const { senderName, senderPhone, message, messageLanguage, recipients } = await request.json();

        if (!senderName || !senderPhone || !message) {
            return NextResponse.json({
                success: false,
                error: 'Sender name, phone, and message are required'
            }, { status: 400 });
        }

        let targets: { name: string; phone: string }[] = [];

        // Fetch Users
        if (recipients === 'all' || recipients === 'users') {
            const userRecipients = await db
                .select({
                    name: users.name,
                    phone: users.phone
                })
                .from(users)
                .where(isNotNull(users.phone));

            targets = [...targets, ...userRecipients.map(u => ({ name: u.name, phone: u.phone || '' }))];
        }

        // Fetch Astrologers
        if (recipients === 'all' || recipients === 'astrologers') {
            const astrologerRecipients = await db
                .select({
                    name: astrologers.name,
                    phone: astrologers.phone
                })
                .from(astrologers)
                .where(isNotNull(astrologers.phone));

            targets = [...targets, ...astrologerRecipients.map(a => ({ name: a.name, phone: a.phone || '' }))];
        }

        // Remove duplicates based on phone
        const uniqueTargets = Array.from(new Map(targets.map(item => [item.phone, item])).values());

        if (uniqueTargets.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No valid recipients found'
            }, { status: 404 });
        }

        console.log(`[bulk-send] Sending to ${uniqueTargets.length} recipients`);

        // Send bulk WhatsApp messages with language support
        const result = await sendBulkWhatsApp(
            uniqueTargets,
            message,
            { name: senderName, phone: senderPhone },
            messageLanguage || 'en'
        );

        return NextResponse.json({
            success: true,
            sent: result.success,
            failed: result.failed,
            totalRecipients: uniqueTargets.length
        });

    } catch (error) {
        console.error('Bulk WhatsApp send error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
