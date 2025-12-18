// Use jose library for Next.js 15 compatibility (edge-compatible)
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'viprakarma_jwt_secret_2024_production';

// Diagnostic log (scrubbed)
if (typeof window === 'undefined') {
  console.log(`[JWT] Using ${process.env.JWT_SECRET_KEY ? 'environment' : 'default'} secret key`);
}

export async function generateToken(payload: any): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(JWT_SECRET));

  return token;
}

// Alias for backward compatibility
export const signToken = generateToken;

export async function verifyToken(token: string): Promise<any> {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return verified.payload;
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      console.warn('[JWT] Token expired');
      throw new Error('Token expired');
    }
    console.error('[JWT] Verification failed:', error.message || error);
    throw new Error('Invalid token');
  }
}

export async function decodeToken(token: string): Promise<any> {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return verified.payload;
  } catch (error) {
    return null;
  }
}
