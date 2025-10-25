import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { paymentVerifications, payments } from '@/db/schema';

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
      paymentDetails
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

      // Save payment verification request
      await db.insert(paymentVerifications).values({
        userId,
        bookingId,
        subscriptionId,
        amount,
        paymentMethod: paymentDetails.paymentMethod,
        payerName: paymentDetails.payerName,
        bankName: paymentDetails.bankName || null,
        accountNumber: paymentDetails.accountNumber || null,
        transactionId: paymentDetails.transactionId || null,
        phoneNumber: paymentDetails.phoneNumber,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Payment verification request submitted successfully'
      });
    }

    // Original Razorpay verification logic
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ success: false, error: 'Configuration error' }, { status: 500 });
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
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
