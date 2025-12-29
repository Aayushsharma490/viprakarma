import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { astrologers } from '@/db/schema';
import { eq } from 'drizzle-orm';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export async function GET() {
  try {
    const approvedAstrologers = await db
      .select({
        id: astrologers.id,
        name: astrologers.name,
        specializations: astrologers.specializations,
        experience: astrologers.experience,
        rating: astrologers.rating,
        totalConsultations: astrologers.totalConsultations,
        hourlyRate: astrologers.hourlyRate,
        bio: astrologers.bio,
        photo: astrologers.photo,
        isOnline: astrologers.isOnline,
      })
      .from(astrologers)
      .where(eq(astrologers.isApproved, true));

    return NextResponse.json({
      success: true,
      astrologers: approvedAstrologers
    });

  } catch (error) {
    console.error('Get astrologers list error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
