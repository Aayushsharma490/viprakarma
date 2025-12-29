/**
 * Safe fetch utility for Vercel deployment
 * Always checks response.ok before parsing JSON
 * Prevents "Unexpected end of JSON input" errors
 */

export interface FetchOptions extends RequestInit {
    timeout?: number;
}

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    success: boolean;
    status: number;
}

/**
 * Safe fetch that ALWAYS returns proper JSON
 * ✅ Checks response.ok BEFORE calling .json()
 * ✅ Handles empty responses
 * ✅ Handles HTML error pages
 * ✅ Handles network errors
 */
export async function safeFetch<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    try {
        const { timeout = 30000, ...fetchOptions } = options;

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // ✅ CRITICAL: Check response.ok BEFORE calling .json()
        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `Request failed with status ${response.status}`;

            try {
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } else {
                    // Response is not JSON (might be HTML error page)
                    const text = await response.text();
                    errorMessage = text.substring(0, 200) || errorMessage;
                }
            } catch {
                // If parsing fails, use status text
                errorMessage = response.statusText || errorMessage;
            }

            return {
                success: false,
                error: errorMessage,
                status: response.status,
            };
        }

        // Response is OK, now safe to parse JSON
        try {
            const data = await response.json();
            return {
                success: true,
                data,
                status: response.status,
            };
        } catch (parseError) {
            // JSON parsing failed even though response was OK
            return {
                success: false,
                error: 'Invalid JSON response from server',
                status: response.status,
            };
        }
    } catch (error: any) {
        // Network error or timeout
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timeout',
                status: 408,
            };
        }

        return {
            success: false,
            error: error.message || 'Network error',
            status: 0,
        };
    }
}

/**
 * Convenience method for POST requests with JSON body
 */
export async function safePost<T = any>(
    url: string,
    body: any,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    return safeFetch<T>(url, {
        ...options,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: JSON.stringify(body),
    });
}

/**
 * Convenience method for GET requests
 */
export async function safeGet<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    return safeFetch<T>(url, {
        ...options,
        method: 'GET',
    });
}
