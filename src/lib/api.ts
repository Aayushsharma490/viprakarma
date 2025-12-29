/**
 * API Base URL Helper for Vercel Deployment
 * 
 * CRITICAL RULES:
 * - Client-side (browser): Use relative URLs (/api/...)
 * - Server-side (SSR/API): Use absolute URLs (https://...)
 */

export const BASE_URL =
    typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        : "";

/**
 * Get API URL - Use ONLY for server-side fetching
 * For client-side, just use: fetch('/api/...')
 */
export function getApiUrl(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // On client (browser), return relative URL
    if (typeof window !== "undefined") {
        return normalizedPath;
    }

    // On server, return absolute URL
    return `${BASE_URL}${normalizedPath}`;
}

/**
 * Example usage:
 * 
 * // ✅ CLIENT-SIDE (in components)
 * fetch('/api/astrologers')
 * 
 * // ✅ SERVER-SIDE (in server components/API routes)
 * fetch(getApiUrl('/api/astrologers'))
 */
