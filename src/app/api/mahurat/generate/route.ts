import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { calculateMahurat } from '@/lib/mahuratUtils';
import { sendWhatsAppMessage, formatMahuratMessage } from '@/lib/wahaService';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        let userId = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = await verifyToken(token);
                userId = decoded.userId || decoded.id;
            } catch (e) {
                console.warn('[Mahurat API] Invalid token provided, proceeding as guest');
            }
        }

        if (userId) {
            // Log user info if available, but don't block
            const user = await db.select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (user && user.length > 0) {
                console.log('[Mahurat API] Request from authenticated user:', user[0].email);
            }
        }

        const { purpose, rashi, phoneNumber, startDate, endDate, location } = await request.json();

        if (!purpose || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!rashi) {
            return NextResponse.json({ error: 'Rashi is required' }, { status: 400 });
        }

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
        }

        // Calculate mahurat with Rashi consideration (async function that calls astro-engine)
        const mahurats = await calculateMahurat(
            purpose,
            start,
            end,
            location || { lat: 28.6139, lon: 77.2090 }, // Default to Delhi
            rashi // Pass Rashi for filtering
        );

        // Send WhatsApp message with results
        let whatsappSent = false;
        let whatsappError = null;
        try {
            console.log('═══════════════════════════════════════════════════');
            console.log('[Mahurat API] 📱 Preparing WhatsApp Message');
            console.log('[Mahurat API] Recipient phone:', phoneNumber);
            console.log('[Mahurat API] Purpose:', purpose);
            console.log('[Mahurat API] Rashi:', rashi);
            console.log('[Mahurat API] Mahurats found:', mahurats?.length || 0);

            if (!mahurats || mahurats.length === 0) {
                console.warn('[Mahurat API] ⚠️ No mahurats found, skipping WhatsApp');
                whatsappError = 'No auspicious timings found for the selected period';
            } else {
                // Format message with ALL mahurats (bilingual: Hindi + English)
                const whatsappMessage = formatMahuratMessage(mahurats, purpose, rashi);
                console.log('[Mahurat API] ✓ Message formatted successfully');
                console.log('[Mahurat API] Message length:', whatsappMessage.length, 'characters');
                console.log('[Mahurat API] Message includes:', mahurats.length, 'mahurat(s) in Hindi & English');
                console.log('[Mahurat API] Message preview (first 200 chars):');
                console.log(whatsappMessage.substring(0, 200) + '...');

                console.log('[Mahurat API] 🚀 Attempting to send WhatsApp message...');
                whatsappSent = await sendWhatsAppMessage(phoneNumber, whatsappMessage);

                if (!whatsappSent) {
                    console.error('[Mahurat API] ❌ Failed to send WhatsApp message');
                    console.error('[Mahurat API] Possible reasons:');
                    console.error('[Mahurat API]   1. WhatsApp not connected (scan QR in admin panel)');
                    console.error('[Mahurat API]   2. Astro-engine not running');
                    console.error('[Mahurat API]   3. Invalid phone number format');
                    whatsappError = 'WhatsApp service unavailable. Please contact admin.';
                } else {
                    console.log('[Mahurat API] ✅ SUCCESS! WhatsApp message sent');
                    console.log('[Mahurat API] Sent to:', phoneNumber);
                    console.log('[Mahurat API] Content: Bilingual message with', mahurats.length, 'mahurat(s)');
                }
            }
            console.log('═══════════════════════════════════════════════════');
        } catch (error) {
            console.error('═══════════════════════════════════════════════════');
            console.error('[Mahurat API] ❌ WhatsApp Error:', error);
            console.error('[Mahurat API] Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('[Mahurat API] Error message:', error instanceof Error ? error.message : String(error));
            console.error('═══════════════════════════════════════════════════');
            whatsappError = 'Failed to send WhatsApp message. Please try again.';
            // Don't fail the request if WhatsApp fails
        }

        return NextResponse.json({
            success: true,
            mahurats,
            whatsappSent,
            whatsappError: whatsappSent ? null : whatsappError
        });

    } catch (error) {
        console.error('Mahurat generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
