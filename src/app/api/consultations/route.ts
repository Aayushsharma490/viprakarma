import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { consultations, paymentVerifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Consultation - JSON parse error:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid request format'
      }, { status: 400 });
    }

    const { userId, astrologerId, type, formData } = body;

    if (!userId || !type || !formData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Create consultation record
    const consultation = await db
      .insert(consultations)
      .values({
        userId: userId,
        astrologerId: astrologerId || null,
        mode: type,
        paymentStatus: 'pending',
        requestStatus: 'waiting_admin',
        details: formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // Create payment verification request linked to consultation
    const paymentVerification = await db
      .insert(paymentVerifications)
      .values({
        userId: userId,
        bookingId: null,
        subscriptionId: null,
        consultationId: consultation[0].id,
        amount: type === 'chat' ? 500 : type === 'call' ? 800 : type === 'video' ? 1000 : 999,
        paymentMethod: 'consultation_fee',
        payerName: formData.name,
        phoneNumber: formData.phone || '0000000000',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      consultationId: consultation[0].id,
      paymentId: paymentVerification[0].id,
      amount: paymentVerification[0].amount,
      type,
      formData,
    });

  } catch (error) {
    console.error('Payment verification creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 });
    }

    // Get user's consultations
    const userConsultations = await db
      .select()
      .from(consultations)
      .where(eq(consultations.userId, decoded.id));

    return NextResponse.json({
      success: true,
      consultations: userConsultations,
    });

  } catch (error) {
    console.error('Consultations fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

