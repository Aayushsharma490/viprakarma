import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, astrologers, bookings, payments, paymentVerifications } from '@/db/schema';
import { count, sum, desc, eq } from 'drizzle-orm';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  try {
    // Get stats from database
    const [userStats] = await db.select({ count: count() }).from(users);
    const [astrologerStats] = await db.select({ count: count() }).from(astrologers);
    const [bookingStats] = await db.select({ count: count() }).from(bookings);
    const [paymentStats] = await db.select({ count: count() }).from(payments);
    const [revenueStats] = await db.select({ total: sum(payments.amount) }).from(payments);

    // Get recent bookings
    const recentBookings = await db
      .select({
        id: bookings.id,
        userName: users.name,
        astrologerName: astrologers.name,
        serviceType: bookings.serviceType,
        amount: bookings.amount,
        status: bookings.status,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(astrologers, eq(bookings.astrologerId, astrologers.id))
      .orderBy(desc(bookings.createdAt))
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers: userStats.count,
        totalAstrologers: astrologerStats.count,
        totalBookings: bookingStats.count,
        totalPayments: paymentStats.count,
        totalRevenue: revenueStats.total || 0
      },
      recentBookings
    }, { status: 200 });

  } catch (error) {
    console.error('GET admin dashboard error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}
