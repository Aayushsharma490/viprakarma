import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Hardcoded admin credentials
    if (email === 'viprakarma@gmail.com' && password === 'viprakarma') {
      const token = jwt.sign(
        { 
          userId: 1,
          email: 'viprakarma@gmail.com',
          isAdmin: true,
          isSuperAdmin: true
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        message: 'Login successful',
        token,
        user: {
          id: 1,
          email: 'viprakarma@gmail.com',
          name: 'Super Admin',
          isAdmin: true,
          isSuperAdmin: true
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}