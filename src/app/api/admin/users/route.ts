import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, paymentVerifications } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Simplified - no auth required
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const plan = searchParams.get('plan');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions
    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.phone, `%${search}%`)
        )
      );
    }

    if (plan && plan !== 'all') {
      whereConditions.push(eq(users.subscriptionPlan, plan));
    }

    if (status && status !== 'all') {
      if (status === 'admin') {
        whereConditions.push(eq(users.isAdmin, true));
      } else if (status === 'user') {
        whereConditions.push(eq(users.isAdmin, false));
      }
    }

    // Get users with their payment verifications
    const baseQuery = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        subscriptionPlan: users.subscriptionPlan,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        paymentVerifications: {
          id: paymentVerifications.id,
          status: paymentVerifications.status,
          amount: paymentVerifications.amount,
          createdAt: paymentVerifications.createdAt,
        },
      })
      .from(users)
      .leftJoin(paymentVerifications, eq(users.id, paymentVerifications.userId));

    const conditionedQuery = whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    const usersWithPayments = await conditionedQuery
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Group payment verifications by user
    const userMap = new Map();

    usersWithPayments.forEach(row => {
      if (!userMap.has(row.id)) {
        userMap.set(row.id, {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          subscriptionPlan: row.subscriptionPlan,
          isAdmin: row.isAdmin,
          createdAt: row.createdAt,
          paymentVerifications: []
        });
      }

      if (row.paymentVerifications && row.paymentVerifications.id) {
        userMap.get(row.id).paymentVerifications.push(row.paymentVerifications);
      }
    });

    const result = Array.from(userMap.values());

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('GET admin users error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}
