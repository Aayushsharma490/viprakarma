import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { astrologers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const allAstrologers = await db
      .select({
        id: astrologers.id,
        name: astrologers.name,
        email: astrologers.email,
        phone: astrologers.phone,
        specializations: astrologers.specializations,
        experience: astrologers.experience,
        rating: astrologers.rating,
        totalConsultations: astrologers.totalConsultations,
        hourlyRate: astrologers.hourlyRate,
        isApproved: astrologers.isApproved,
        bio: astrologers.bio,
        isOnline: astrologers.isOnline,
        createdAt: astrologers.createdAt,
      })
      .from(astrologers)
      .orderBy(astrologers.createdAt);

    return NextResponse.json(allAstrologers);
  } catch (error) {
    console.error('Error fetching astrologers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, specializations, experience, hourlyRate, bio } = await request.json();

    // Check for missing required fields (allow 0 for numbers)
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!password) missingFields.push('password');
    // Specializations is JSON array or string
    if (!specializations) missingFields.push('specializations');

    // Allow 0 for experience and hourlyRate
    if (experience === undefined || experience === null) missingFields.push('experience');
    if (hourlyRate === undefined || hourlyRate === null) missingFields.push('hourlyRate');

    // Bio is optional
    // if (!bio) missingFields.push('bio');

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // Check if astrologer already exists
    const existingAstrologer = await db
      .select()
      .from(astrologers)
      .where(eq(astrologers.email, email))
      .limit(1);

    if (existingAstrologer.length > 0) {
      return NextResponse.json({ error: 'Astrologer with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new astrologer
    const newAstrologer = await db
      .insert(astrologers)
      .values({
        name,
        email,
        phone,
        password: hashedPassword,
        specializations,
        experience: parseInt(experience),
        rating: 4.5,
        totalConsultations: 0,
        hourlyRate: parseInt(hourlyRate),
        isApproved: true,
        bio,
        isOnline: false,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newAstrologer[0], { status: 201 });
  } catch (error) {
    console.error('Error creating astrologer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
