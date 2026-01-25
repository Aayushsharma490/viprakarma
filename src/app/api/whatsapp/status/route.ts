import { NextRequest, NextResponse } from 'next/server';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
const ASTRO_ENGINE_URL = process.env.ASTRO_ENGINE_URL || process.env.NEXT_PUBLIC_ASTRO_ENGINE_URL || 'https://astro-engine-production-e9fd.up.railway.app';

export const dynamic = 'force-dynamic';

export async function GET() {
    const fetchWithRetry = async (url: string, retries = 2, timeout = 10000) => {
        for (let i = 0; i <= retries; i++) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    signal: controller.signal,
                    next: { revalidate: 0 } // Disable caching
                });
                clearTimeout(id);

                if (response.ok) return response;

                if (i === retries) return response;
            } catch (err: any) {
                if (i === retries) throw err;
            }
            // Small delay between retries
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        throw new Error('All fetch attempts failed');
    };

    try {
        const response = await fetchWithRetry(`${ASTRO_ENGINE_URL}/whatsapp/status`);
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
