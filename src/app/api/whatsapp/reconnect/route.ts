import { NextRequest, NextResponse } from 'next/server';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
const ASTRO_ENGINE_URL = process.env.NEXT_PUBLIC_ASTRO_ENGINE_URL || 'https://astro-engine-production.up.railway.app';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const response = await fetch(`${ASTRO_ENGINE_URL}/whatsapp/reconnect`, {
            method: 'POST'
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('WhatsApp reconnect error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to reconnect'
        }, { status: 500 });
    }
}
