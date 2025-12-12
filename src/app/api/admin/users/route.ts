import { NextRequest, NextResponse } from 'next/server';
import { db, client } from '@/db';
import { users, paymentVerifications } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Simplified - no auth required
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const plan = searchParams.get('plan');
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit') || '50';
    const offsetValue = parseInt(searchParams.get('offset') || '0');
    const limit = limitParam === 'all'
      ? null
      : Math.min(parseInt(limitParam || '50') || 50, 1000);
    const offset = Number.isNaN(offsetValue) ? 0 : offsetValue;

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
        canChatWithAstrologer: users.canChatWithAstrologer,
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

    let paginatedQuery = conditionedQuery.orderBy(desc(users.createdAt));

    if (offset > 0) {
      paginatedQuery = paginatedQuery.offset(offset);
    }

    if (limit !== null) {
      paginatedQuery = paginatedQuery.limit(limit);
    }

    let result;

    try {
      result = await paginatedQuery;
    } catch (error: any) {
      if (error?.code === 'SQL_INPUT_ERROR' && error.message?.includes('can_chat_with_astrologer')) {
        await client.execute(`ALTER TABLE users ADD COLUMN can_chat_with_astrologer INTEGER NOT NULL DEFAULT 0`);
        result = await paginatedQuery;
      } else {
        throw error;
      }
    }

    // Group payment verifications by user
    const userMap = new Map();

    result.forEach(row => {
      if (!userMap.has(row.id)) {
        userMap.set(row.id, {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          subscriptionPlan: row.subscriptionPlan,
          isAdmin: row.isAdmin,
          canChatWithAstrologer: row.canChatWithAstrologer,
          createdAt: row.createdAt,
          paymentVerifications: []
        });
      }

      if (row.paymentVerifications && row.paymentVerifications.id) {
        userMap.get(row.id).paymentVerifications.push(row.paymentVerifications);
      }
    });

    const resultArray = Array.from(userMap.values());

    return NextResponse.json(resultArray, { status: 200 });

  } catch (error) {
    console.error('GET admin users error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}
