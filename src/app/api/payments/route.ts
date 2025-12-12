import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single payment fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.id, parseInt(id)))
        .limit(1);

      if (payment.length === 0) {
        return NextResponse.json(
          { error: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(payment[0], { status: 200 });
    }

    // List payments with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const bookingId = searchParams.get('bookingId');
    const subscriptionId = searchParams.get('subscriptionId');
    const status = searchParams.get('status');

    let query = db.select().from(payments);

    // Build filter conditions
    const conditions = [];

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(payments.userId, parseInt(userId)));
    }

    if (bookingId) {
      if (isNaN(parseInt(bookingId))) {
        return NextResponse.json(
          { error: 'Valid bookingId is required', code: 'INVALID_BOOKING_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(payments.bookingId, parseInt(bookingId)));
    }

    if (subscriptionId) {
      if (isNaN(parseInt(subscriptionId))) {
        return NextResponse.json(
          { error: 'Valid subscriptionId is required', code: 'INVALID_SUBSCRIPTION_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(payments.subscriptionId, parseInt(subscriptionId)));
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Status must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(payments.status, status));
    }

    // Apply filters if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sort by createdAt descending and apply pagination
    const results = await query
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, bookingId, subscriptionId, amount, currency, razorpayOrderId, razorpayPaymentId, razorpaySignature, status } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        { error: 'amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (!razorpayOrderId) {
      return NextResponse.json(
        { error: 'razorpayOrderId is required', code: 'MISSING_RAZORPAY_ORDER_ID' },
        { status: 400 }
      );
    }

    // Validate that at least one of bookingId or subscriptionId is provided
    if (!bookingId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Either bookingId or subscriptionId must be provided', code: 'MISSING_BOOKING_OR_SUBSCRIPTION' },
        { status: 400 }
      );
    }

    // Validate amount is positive integer
    if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: 'amount must be a positive integer', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate userId is integer
    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { error: 'userId must be an integer', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Validate bookingId is integer if provided
    if (bookingId && !Number.isInteger(bookingId)) {
      return NextResponse.json(
        { error: 'bookingId must be an integer', code: 'INVALID_BOOKING_ID' },
        { status: 400 }
      );
    }

    // Validate subscriptionId is integer if provided
    if (subscriptionId && !Number.isInteger(subscriptionId)) {
      return NextResponse.json(
        { error: 'subscriptionId must be an integer', code: 'INVALID_SUBSCRIPTION_ID' },
        { status: 400 }
      );
    }

    // Create payment record
    const newPayment = await db
      .insert(payments)
      .values({
        userId,
        bookingId: bookingId || null,
        subscriptionId: subscriptionId || null,
        amount,
        currency: currency || 'INR',
        razorpayOrderId: razorpayOrderId.trim(),
        razorpayPaymentId: razorpayPaymentId ? razorpayPaymentId.trim() : null,
        razorpaySignature: razorpaySignature ? razorpaySignature.trim() : null,
        status: status || 'pending',
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newPayment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if payment exists
    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { razorpayPaymentId, razorpaySignature, status, amount, currency } = body;

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate amount if provided
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount))) {
      return NextResponse.json(
        { error: 'amount must be a positive integer', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (razorpayPaymentId !== undefined) {
      updates.razorpayPaymentId = razorpayPaymentId ? razorpayPaymentId.trim() : null;
    }

    if (razorpaySignature !== undefined) {
      updates.razorpaySignature = razorpaySignature ? razorpaySignature.trim() : null;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (amount !== undefined) {
      updates.amount = amount;
    }

    if (currency !== undefined) {
      updates.currency = currency.trim();
    }

    const updated = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if payment exists
    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(payments)
      .where(eq(payments.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Payment deleted successfully',
        payment: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}