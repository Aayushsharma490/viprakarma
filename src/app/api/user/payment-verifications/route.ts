import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentVerifications } from '@/db/schema';
import { eq } from 'drizzle-orm';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export async function GET(req: NextRequest) {
  try {
    // Get user ID from query params or auth context
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Fetch payment verifications for the user
    const payments = await db
      .select({
        id: paymentVerifications.id,
        amount: paymentVerifications.amount,
        paymentMethod: paymentVerifications.paymentMethod,
        payerName: paymentVerifications.payerName,
        phoneNumber: paymentVerifications.phoneNumber,
        status: paymentVerifications.status,
        adminNotes: paymentVerifications.adminNotes,
        verifiedAt: paymentVerifications.verifiedAt,
        createdAt: paymentVerifications.createdAt,
      })
      .from(paymentVerifications)
      .where(eq(paymentVerifications.userId, parseInt(userId)))
      .orderBy(paymentVerifications.createdAt);

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching user payment verifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payment verifications'
    }, { status: 500 });
  }
}
