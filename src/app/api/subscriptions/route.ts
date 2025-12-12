import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptions, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Helper function to validate date format (ISO 8601)
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
}

// Helper function to validate plan enum
function isValidPlan(plan: string): boolean {
  return ['monthly', 'annual'].includes(plan);
}

// Helper function to validate status enum
function isValidStatus(status: string): boolean {
  return ['pending', 'active', 'expired', 'cancelled'].includes(status);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, parseInt(id)))
        .limit(1);

      if (subscription.length === 0) {
        return NextResponse.json(
          { error: 'Subscription not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(subscription[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userIdFilter = searchParams.get('userId');
    const statusFilter = searchParams.get('status');
    const planFilter = searchParams.get('plan');

    // Build query conditions
    const conditions = [];
    
    if (userIdFilter) {
      if (isNaN(parseInt(userIdFilter))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(subscriptions.userId, parseInt(userIdFilter)));
    }

    if (statusFilter) {
      if (!isValidStatus(statusFilter)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: pending, active, expired, cancelled', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(subscriptions.status, statusFilter));
    }

    if (planFilter) {
      if (!isValidPlan(planFilter)) {
        return NextResponse.json(
          { error: 'Invalid plan. Must be one of: monthly, annual', code: 'INVALID_PLAN' },
          { status: 400 }
        );
      }
      conditions.push(eq(subscriptions.plan, planFilter));
    }

    let query = db.select().from(subscriptions);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(subscriptions.createdAt))
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
    const { userId, plan, amount, startDate, endDate, razorpayOrderId, razorpayPaymentId, status } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!plan) {
      return NextResponse.json(
        { error: 'plan is required', code: 'MISSING_PLAN' },
        { status: 400 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        { error: 'amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'startDate is required', code: 'MISSING_START_DATE' },
        { status: 400 }
      );
    }

    if (!endDate) {
      return NextResponse.json(
        { error: 'endDate is required', code: 'MISSING_END_DATE' },
        { status: 400 }
      );
    }

    if (!razorpayOrderId) {
      return NextResponse.json(
        { error: 'razorpayOrderId is required', code: 'MISSING_RAZORPAY_ORDER_ID' },
        { status: 400 }
      );
    }

    // Validate plan enum
    if (!isValidPlan(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: monthly, annual', code: 'INVALID_PLAN' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !isValidStatus(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, active, expired, cancelled', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate date formats
    if (!isValidISODate(startDate)) {
      return NextResponse.json(
        { error: 'startDate must be a valid ISO 8601 date format', code: 'INVALID_START_DATE_FORMAT' },
        { status: 400 }
      );
    }

    if (!isValidISODate(endDate)) {
      return NextResponse.json(
        { error: 'endDate must be a valid ISO 8601 date format', code: 'INVALID_END_DATE_FORMAT' },
        { status: 400 }
      );
    }

    // Validate endDate is after startDate
    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: 'endDate must be after startDate', code: 'INVALID_DATE_RANGE' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate userId is valid integer
    if (isNaN(parseInt(userId.toString()))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Validate user exists
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId.toString())))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Create subscription
    const newSubscription = await db
      .insert(subscriptions)
      .values({
        userId: parseInt(userId.toString()),
        plan: plan.trim(),
        amount: parseInt(amount.toString()),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        razorpayOrderId: razorpayOrderId.trim(),
        razorpayPaymentId: razorpayPaymentId ? razorpayPaymentId.trim() : null,
        status: status ? status.trim() : 'pending',
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newSubscription[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if subscription exists
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .limit(1);

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and add fields to update
    if (body.plan !== undefined) {
      if (!isValidPlan(body.plan)) {
        return NextResponse.json(
          { error: 'Invalid plan. Must be one of: monthly, annual', code: 'INVALID_PLAN' },
          { status: 400 }
        );
      }
      updates.plan = body.plan.trim();
    }

    if (body.status !== undefined) {
      if (!isValidStatus(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: pending, active, expired, cancelled', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = body.status.trim();
    }

    if (body.amount !== undefined) {
      if (typeof body.amount !== 'number' || body.amount <= 0) {
        return NextResponse.json(
          { error: 'amount must be a positive number', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
      updates.amount = parseInt(body.amount.toString());
    }

    if (body.startDate !== undefined) {
      if (!isValidISODate(body.startDate)) {
        return NextResponse.json(
          { error: 'startDate must be a valid ISO 8601 date format', code: 'INVALID_START_DATE_FORMAT' },
          { status: 400 }
        );
      }
      updates.startDate = body.startDate.trim();
    }

    if (body.endDate !== undefined) {
      if (!isValidISODate(body.endDate)) {
        return NextResponse.json(
          { error: 'endDate must be a valid ISO 8601 date format', code: 'INVALID_END_DATE_FORMAT' },
          { status: 400 }
        );
      }
      updates.endDate = body.endDate.trim();
    }

    // Validate date range if both dates are being updated or one is being updated
    const finalStartDate = updates.startDate || existingSubscription[0].startDate;
    const finalEndDate = updates.endDate || existingSubscription[0].endDate;
    
    if (new Date(finalEndDate) <= new Date(finalStartDate)) {
      return NextResponse.json(
        { error: 'endDate must be after startDate', code: 'INVALID_DATE_RANGE' },
        { status: 400 }
      );
    }

    if (body.razorpayOrderId !== undefined) {
      updates.razorpayOrderId = body.razorpayOrderId.trim();
    }

    if (body.razorpayPaymentId !== undefined) {
      updates.razorpayPaymentId = body.razorpayPaymentId ? body.razorpayPaymentId.trim() : null;
    }

    if (body.userId !== undefined) {
      if (isNaN(parseInt(body.userId.toString()))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      // Validate user exists
      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(body.userId.toString())))
        .limit(1);

      if (userExists.length === 0) {
        return NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 400 }
        );
      }

      updates.userId = parseInt(body.userId.toString());
    }

    // Update subscription
    const updated = await db
      .update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, parseInt(id)))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if subscription exists
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .limit(1);

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete subscription
    const deleted = await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Subscription deleted successfully',
        subscription: deleted[0],
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