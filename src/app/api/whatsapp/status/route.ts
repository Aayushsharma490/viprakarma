import { NextRequest, NextResponse } from 'next/server';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
const ASTRO_ENGINE_URL = process.env.ASTRO_ENGINE_URL || process.env.NEXT_PUBLIC_ASTRO_ENGINE_URL || 'https://astro-engine-production.up.railway.app';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const response = await fetch(`${ASTRO_ENGINE_URL}/whatsapp/status`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('WhatsApp status error:', error);
        return NextResponse.json({
            status: 'DISCONNECTED',
            connected: false,
            error: 'Failed to connect to WhatsApp service'
        }, { status: 503 });
    }
}
