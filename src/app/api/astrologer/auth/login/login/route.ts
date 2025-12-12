import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { astrologers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'viprakarma_jwt_secret_2024_production');

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Find astrologer
        const astrologer = await db.select()
            .from(astrologers)
            .where(eq(astrologers.email, email.toLowerCase().trim()))
            .limit(1);

        if (astrologer.length === 0) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const astro = astrologer[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, astro.password);
        if (!validPassword) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check approval
        if (!astro.isApproved) {
            return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
        }

        // Generate JWT
        const token = await new SignJWT({
            id: astro.id,
            email: astro.email,
            role: 'astrologer'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            astrologer: {
                id: astro.id,
                name: astro.name,
                email: astro.email,
                photo: astro.photo
            }
        });

        response.cookies.set('astrologer_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400 // 24 hours
        });

        return response;

    } catch (error) {
        console.error('Astrologer login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
