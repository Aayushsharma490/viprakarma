/**
 * API Base URL Helper for Vercel Deployment
 * Always use absolute URLs for fetch calls
 */

export const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

/**
 * Safe API fetch with absolute URL
 * Use this instead of relative URLs
 */
export function getApiUrl(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${normalizedPath}`;
}

/**
 * Example usage:
 * 
 * // ❌ DON'T DO THIS (breaks on Vercel)
 * fetch('/api/pandit')
 * 
 * // ✅ DO THIS (works everywhere)
 * fetch(getApiUrl('/api/pandit'))
 */
