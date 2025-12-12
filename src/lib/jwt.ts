// Use jose library for Next.js 15 compatibility (edge-compatible)
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'new_secret_key_to_force_logout_12345';

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
  } catch (error) {
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
