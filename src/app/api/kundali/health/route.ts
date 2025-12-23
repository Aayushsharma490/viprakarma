import { NextRequest, NextResponse } from 'next/server';

const ASTRO_ENGINE_URL = process.env.ASTRO_ENGINE_URL || 'http://localhost:5005';

export async function GET(request: NextRequest) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000); // 10s timeout for health check

        const response = await fetch(`${ASTRO_ENGINE_URL}/health`, {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store'
        });
        clearTimeout(id);

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({ ...data, status: 'ok' });
        }

        return NextResponse.json(
            { status: 'starting', message: 'Engine is waking up' },
            { status: 200 } // Return 200 so the frontend knows we reached the API but engine is cold
        );
    } catch (error) {
        return NextResponse.json(
            { status: 'offline', message: 'Engine is currently offline' },
            { status: 200 }
        );
    }
}
