import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Type definitions
export interface AdminTokenPayload {
  userId: number;
  email: string;
  isAdmin: boolean | number; // Support both boolean and number (1/0)
}

export interface AuthResult {
  authenticated: boolean;
  user?: AdminTokenPayload;
  error?: string;
}

/**
 * Verifies an admin JWT token synchronously
 * @param token - JWT token string to verify
 * @returns Decoded token payload if valid, null if invalid
 */
export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const decoded = await verifyToken(token);

    if (!decoded) {
      return null;
    }

    // Ensure the decoded token has required fields
    if (typeof decoded.userId !== 'number' ||
        typeof decoded.email !== 'string' ||
        (typeof decoded.isAdmin !== 'boolean' && typeof decoded.isAdmin !== 'number')) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Extracts JWT token from Authorization header
 * @param request - NextRequest object
 * @returns Token string or null if not found/malformed
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return null;
    }

    // Check for Bearer token format
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    const token = parts[1];

    if (!token || token.trim() === '') {
      return null;
    }

    return token;
  } catch (error) {
    console.error('Token extraction error:', error);
    return null;
  }
}

/**
 * Checks if a request is from an authenticated admin user
 * @param request - NextRequest object
 * @returns AuthResult object with authentication status and user info
 */
export async function isAdminAuthenticated(request: NextRequest): Promise<AuthResult> {
  try {
    // Extract token from request
    const token = extractTokenFromRequest(request);

    if (!token) {
      return {
        authenticated: false,
        error: 'No token provided'
      };
    }

    // Verify token
    const decoded = await verifyAdminToken(token);

    if (!decoded) {
      return {
        authenticated: false,
        error: 'Invalid or expired token'
      };
    }

    // Check if user is admin (handle both boolean and number types)
    const isAdmin = Boolean(decoded.isAdmin);

    if (!isAdmin) {
      return {
        authenticated: false,
        error: 'Admin access required'
      };
    }

    return {
      authenticated: true,
      user: decoded
    };
  } catch (error) {
    console.error('Admin authentication check error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Middleware guard function that requires admin authentication
 * @param request - NextRequest object
 * @returns NextResponse with error if not authenticated/authorized, null if successful
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await isAdminAuthenticated(request);

  if (!authResult.authenticated) {
    return NextResponse.json(
      {
        error: authResult.error || 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      },
      { status: 401 }
    );
  }

  return null;
}
