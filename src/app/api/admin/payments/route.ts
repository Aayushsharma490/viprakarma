import { NextRequest, NextResponse } from 'next/server';
import { db, client } from '@/db';
import { paymentVerifications, users, consultations, astrologers } from '@/db/schema';
import { eq, or, like, and } from 'drizzle-orm';
import { createClient } from '@libsql/client';

async function ensurePaymentVerificationsTable() {
  try {
    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "payment_verifications" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" integer NOT NULL,
        "booking_id" integer,
        "subscription_id" integer,
        "consultation_id" integer,
        "amount" integer NOT NULL,
        "payment_method" text NOT NULL,
        "payer_name" text NOT NULL,
        "bank_name" text,
        "account_number" text,
        "transaction_id" text,
        "phone_number" text NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "admin_notes" text,
        "verified_by" integer,
        "verified_at" text,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL
      );
    `);
  } catch (e) {
    console.error('Failed to ensure payment_verifications table:', e);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simplified - no auth required
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Ensure table exists (runtime safeguard for local/dev environments)
    await ensurePaymentVerificationsTable();

    // Detect presence of optional columns (backward compatibility for remote DB)
    let hasConsultationId = true;
    try {
      const pragma = await client.execute('PRAGMA table_info(payment_verifications)');
      const cols = Array.isArray(pragma.rows) ? pragma.rows : [];
      hasConsultationId = cols.some((r: any) => r.name === 'consultation_id');
    } catch {}

    // Get payment verifications from database
    let whereConditions = [];

    if (status) {
      whereConditions.push(eq(paymentVerifications.status, status));
    }

    if (search) {
      // Search by payer name, phone, or user name/email
      whereConditions.push(
        or(
          like(paymentVerifications.payerName, `%${search}%`),
          like(paymentVerifications.phoneNumber, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    const selectBase: any = {
      id: paymentVerifications.id,
      userId: paymentVerifications.userId,
      bookingId: paymentVerifications.bookingId,
      subscriptionId: paymentVerifications.subscriptionId,
      amount: paymentVerifications.amount,
      paymentMethod: paymentVerifications.paymentMethod,
      payerName: paymentVerifications.payerName,
      bankName: paymentVerifications.bankName,
      accountNumber: paymentVerifications.accountNumber,
      transactionId: paymentVerifications.transactionId,
      phoneNumber: paymentVerifications.phoneNumber,
      status: paymentVerifications.status,
      adminNotes: paymentVerifications.adminNotes,
      verifiedBy: paymentVerifications.verifiedBy,
      verifiedAt: paymentVerifications.verifiedAt,
      createdAt: paymentVerifications.createdAt,
      updatedAt: paymentVerifications.updatedAt,
      user: {
        name: users.name,
        email: users.email,
      },
    };
    if (hasConsultationId) {
      selectBase.consultationId = paymentVerifications.consultationId;
    }

    const baseQuery = db
      .select(selectBase)
      .from(paymentVerifications)
      .leftJoin(users, eq(paymentVerifications.userId, users.id));

    const conditionedQuery = whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    const payments = await conditionedQuery
      .limit(limit)
      .offset(offset);

    // Add consultation data for payments that have consultationId
    return NextResponse.json(payments, { status: 200 });

  } catch (error) {
    console.error('GET admin payments error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}
