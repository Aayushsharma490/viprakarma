import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { paymentVerifications, payments } from '@/db/schema';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      paymentId,
      signature,
      userId,
      bookingId,
      subscriptionId,
      amount,
      paymentDetails,
      consultationId,
      paymentVerificationId
    } = await req.json();

    // If payment details are provided, save to payment_verifications table
    if (paymentDetails) {
      // Validate required fields
      if (!userId) {
        return NextResponse.json({
          success: false,
          error: 'User ID is required for payment verification'
        }, { status: 400 });
      }

      if (!paymentDetails.payerName || !paymentDetails.phoneNumber || !paymentDetails.paymentMethod) {
        return NextResponse.json({
          success: false,
          error: 'Missing required payment details'
        }, { status: 400 });
      }

      // Try to update an existing pending verification (e.g., created during consultation)
      const now = new Date().toISOString();
      const existing = await db
        .select()
        .from(paymentVerifications)
        .where(paymentVerificationId
          ? eq(paymentVerifications.id, paymentVerificationId)
          : consultationId
            ? eq(paymentVerifications.consultationId, consultationId)
            : eq(paymentVerifications.userId, userId))
        .limit(1);

      if (existing && existing.length > 0 && existing[0].status === 'pending') {
        await db.update(paymentVerifications)
          .set({
            bookingId,
            subscriptionId,
            consultationId: consultationId || existing[0].consultationId || null,
            amount,
            paymentMethod: paymentDetails.paymentMethod,
            payerName: paymentDetails.payerName,
            bankName: paymentDetails.bankName || null,
            accountNumber: paymentDetails.accountNumber || null,
            transactionId: paymentDetails.transactionId || null,
            phoneNumber: paymentDetails.phoneNumber,
            updatedAt: now,
          })
          .where(eq(paymentVerifications.id, existing[0].id));
      } else {
        // Save new payment verification request
        await db.insert(paymentVerifications).values({
          userId,
          bookingId,
          subscriptionId,
          consultationId: consultationId || null,
          amount,
          paymentMethod: paymentDetails.paymentMethod,
          payerName: paymentDetails.payerName,
          bankName: paymentDetails.bankName || null,
          accountNumber: paymentDetails.accountNumber || null,
          transactionId: paymentDetails.transactionId || null,
          phoneNumber: paymentDetails.phoneNumber,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verification request submitted successfully'
      });
    }

    // Original Razorpay verification logic
    if (!process.env.RAZORPAY_KEY_SECRET_) {
      return NextResponse.json({ success: false, error: 'Configuration error' }, { status: 500 });
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET_)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;

    if (isValid) {
      // Save payment details to database
      await db.insert(payments).values({
        userId,
        bookingId,
        subscriptionId,
        amount,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, paymentId });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
