import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
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
  return user && user.isAdmin === true;
}