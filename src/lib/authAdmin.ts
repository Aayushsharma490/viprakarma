import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function authenticateAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    if (typeof decoded === 'object' && decoded.isAdmin) {
      return null; // Indicates success
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
