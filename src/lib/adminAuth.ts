import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Hardcoded admin credentials for super admin
const SUPER_ADMIN = {
  email: 'viprakarma@gmail.com',
  password: 'viprakarma'
};

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Check if it's the super admin
    if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
      return {
        success: true,
        user: {
          id: 0,
          email: SUPER_ADMIN.email,
          name: 'Super Admin',
          isAdmin: true,
          isSuperAdmin: true
        }
      };
    }

    // Check database for other admin users
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (!user[0].isAdmin) {
      return { success: false, error: 'Access denied - Admin only' };
    }

    const { password: _, ...userWithoutPassword } = user[0];
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export function isAdminUser(user: any): boolean {
  return user && (user.isAdmin === true || user.isSuperAdmin === true);
}

export function isSuperAdmin(user: any): boolean {
  return user && user.isSuperAdmin === true;
}

export async function verifyAdmin(request: Request): Promise<Response | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded.isAdmin && !decoded.isSuperAdmin) {
      return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 });
    }

    return null; // No error - user is authenticated
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }
}