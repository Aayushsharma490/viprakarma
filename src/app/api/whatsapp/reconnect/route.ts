import { NextRequest, NextResponse } from 'next/server';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
const ASTRO_ENGINE_URL = process.env.ASTRO_ENGINE_URL || process.env.NEXT_PUBLIC_ASTRO_ENGINE_URL || 'https://astro-engine-production-e9fd.up.railway.app';

export const dynamic = 'force-dynamic';

export async function POST() {
    const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, timeout = 10000) => {
        for (let i = 0; i <= retries; i++) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(id);

                if (response.ok) return response;
                if (i === retries) return response;
            } catch (err: any) {
                if (i === retries) throw err;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        throw new Error('All fetch attempts failed');
    };

    try {
        const response = await fetchWithRetry(`${ASTRO_ENGINE_URL}/whatsapp/reconnect`, {
            method: 'POST'
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('WhatsApp reconnect error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to reconnect to WhatsApp service'
        }, { status: 503 });
    }
}
