import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
    let browser;

    try {
        const { html, width = 800, height = 800 } = await request.json();

        if (!html) {
            return NextResponse.json({ error: 'HTML content required' }, { status: 400 });
        }

        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setViewport({ width, height });


        // Set content with simpler wait condition
        await page.setContent(html, {
            waitUntil: 'domcontentloaded', // Changed from 'networkidle0' to avoid timeout
            timeout: 10000, // 10 second timeout
        });

        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
            omitBackground: false,
        });

        await browser.close();

        // Return as base64
        const base64 = screenshot.toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        return NextResponse.json({ image: dataUrl });

    } catch (error) {
        console.error('Chart capture error:', error);

        if (browser) {
            await browser.close();
        }

        return NextResponse.json(
            { error: 'Failed to capture chart', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
