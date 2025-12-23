import { NextRequest, NextResponse } from 'next/server';

const ASTRO_ENGINE_URL = process.env.ASTRO_ENGINE_URL || 'http://localhost:5005';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, day, month, year, hour, minute, second, gender, latitude, longitude, timezone, city } = body;

    // Validate required fields
    if (!name || !day || !month || !year || hour === undefined || minute === undefined || second === undefined || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare payload for astro-engine
    const payload = {
      name,
      gender: gender || 'male',
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      second: Number(second || 0),
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: timezone || '+05:30',
      city: city || 'Unknown',
    };

    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, timeout = 30000) => {
      for (let i = 0; i <= retries; i++) {
        try {
          console.log(`[API] Attempt ${i + 1} to call astro-engine (timeout: ${timeout}ms)...`);
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);

          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(id);

          if (response.ok) return response;

          const errorText = await response.text();
          console.warn(`[API] Attempt ${i + 1} failed with status ${response.status}:`, errorText.substring(0, 100));

          // If it's a 502/503/504 or 408/429, it's likely a cold start or busy engine.
          const retryableStatuses = [408, 429, 502, 503, 504];
          if (!retryableStatuses.includes(response.status) && response.status < 500) {
            throw new Error(errorText || `Client error ${response.status} from astro-engine`);
          }

          if (i === retries) {
            throw new Error('Engine is taking too long to start. Please try again in 10 seconds.');
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.warn(`[API] Attempt ${i + 1} timed out.`);
          } else {
            console.warn(`[API] Attempt ${i + 1} error:`, err.message);
          }
          if (i === retries) throw err;
        }
        // Wait before retrying: 3s, 6s, 9s
        const backoff = (i + 1) * 3000;
        console.log(`[API] Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
      throw new Error('Unexpected error in generation flow');
    };

    console.log('[API] Sending request to astro-engine:', ASTRO_ENGINE_URL);

    // Call astro-engine server with retry logic
    const response = await fetchWithRetry(`${ASTRO_ENGINE_URL}/kundali`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Astro-engine error:', errorText);
      return NextResponse.json(
        { error: 'Failed to calculate kundali from astro-engine' },
        { status: 500 }
      );
    }

    const kundaliData = await response.json();

    // Validate that required fields are present
    if (!kundaliData.ayanamsa || !kundaliData.basicDetails || !kundaliData.planets) {
      console.error('[API] Invalid response from astro-engine:', kundaliData);
      return NextResponse.json(
        { error: 'Invalid kundali data received' },
        { status: 500 }
      );
    }

    console.log('[API] Successfully received kundali data from astro-engine');

    // Return the kundali object directly
    return NextResponse.json(kundaliData);

  } catch (error: any) {
    console.error('[API] Kundali generation error:', error);

    let errorMessage = 'Internal server error during kundali generation';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Sanitize if it's HTML (likely 502/504 page)
      if (errorMessage.includes('<!DOCTYPE html>') || errorMessage.includes('<html')) {
        errorMessage = 'The astrology engine is currently busy or starting up. Please try again in 30 seconds.';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
