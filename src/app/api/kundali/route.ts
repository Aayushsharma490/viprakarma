import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL =
  process.env.ASTRO_ENGINE_URL || "https://astro-engine-production.up.railway.app/kundali";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await fetch(ENGINE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[kundali-api] Engine error:", error);
    return NextResponse.json(
      {
        error: "Astro engine unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
