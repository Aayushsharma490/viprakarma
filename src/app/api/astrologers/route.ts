import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { astrologers } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate specializations array
function isValidSpecializations(specializations: any): boolean {
  if (!Array.isArray(specializations)) return false;
  if (specializations.length === 0) return false;
  return specializations.every(item => typeof item === 'string' && item.trim().length > 0);
}

// Helper function to exclude password from response
function excludePassword(astrologer: any) {
  const { password, ...astrologerWithoutPassword } = astrologer;
  return astrologerWithoutPassword;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Check if database is configured
    if (!db) {
      console.warn('[Astrologers API] Database not configured, returning empty array');
      return NextResponse.json([]);
    }

    // Single astrologer by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const astrologer = await db.select()
        .from(astrologers)
        .where(eq(astrologers.id, parseInt(id)))
        .limit(1);

      if (astrologer.length === 0) {
        return NextResponse.json({
          error: 'Astrologer not found',
          code: 'ASTROLOGER_NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json(excludePassword(astrologer[0]));
    }

    // List astrologers with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isApproved = searchParams.get('isApproved');
    const isOnline = searchParams.get('isOnline');
    const specialization = searchParams.get('specialization');

    let query = db.select().from(astrologers);

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(like(astrologers.name, `%${search}%`));
    }

    if (isApproved !== null) {
      const approvedValue = isApproved === 'true';
      conditions.push(eq(astrologers.isApproved, approvedValue));
    }

    if (isOnline !== null) {
      const onlineValue = isOnline === 'true';
      conditions.push(eq(astrologers.isOnline, onlineValue));
    }

    if (specialization) {
      conditions.push(like(astrologers.specializations, `%${specialization}%`));
    }

    // Always filter out deleted astrologers
    conditions.push(eq(astrologers.isDeleted, false));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query
      .orderBy(desc(astrologers.createdAt))
      .limit(limit)
      .offset(offset);

    // Exclude passwords from all results
    const resultsWithoutPasswords = results.map(excludePassword);

    return NextResponse.json(resultsWithoutPasswords);

  } catch (error) {
    console.error('[Astrologers API] Error:', error);
    // Return empty array as fallback to prevent frontend errors
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      specializations,
      experience,
      hourlyRate,
      languages,
      location,
      bio,
      photo
    } = body;

    // Validate required fields
    if (!name || !email || !password || !phone || !specializations || !experience || !hourlyRate || !languages || !location) {
      return NextResponse.json({
        error: "Missing required fields",
        code: "MISSING_REQUIRED_FIELDS"
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({
        error: "Invalid email format",
        code: "INVALID_EMAIL"
      }, { status: 400 });
    }

    // Validate specializations
    if (!isValidSpecializations(specializations)) {
      return NextResponse.json({
        error: "Specializations must be a non-empty array of strings",
        code: "INVALID_SPECIALIZATIONS"
      }, { status: 400 });
    }

    // Validate experience is a positive number
    if (typeof experience !== 'number' || experience < 0) {
      return NextResponse.json({
        error: "Experience must be a positive number",
        code: "INVALID_EXPERIENCE"
      }, { status: 400 });
    }

    // Validate hourlyRate is a positive number
    if (typeof hourlyRate !== 'number' || hourlyRate <= 0) {
      return NextResponse.json({
        error: "Hourly rate must be a positive number",
        code: "INVALID_HOURLY_RATE"
      }, { status: 400 });
    }

    // Validate languages & location
    if (typeof languages !== 'string' || languages.trim() === '') {
      return NextResponse.json({
        error: "Languages must be a non-empty string",
        code: "INVALID_LANGUAGES"
      }, { status: 400 });
    }

    if (typeof location !== 'string' || location.trim() === '') {
      return NextResponse.json({
        error: "Location must be a non-empty string",
        code: "INVALID_LOCATION"
      }, { status: 400 });
    }

    // Check if email already exists
    const existingAstrologer = await db.select()
      .from(astrologers)
      .where(eq(astrologers.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingAstrologer.length > 0) {
      return NextResponse.json({
        error: "Email already exists",
        code: "DUPLICATE_EMAIL"
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create astrologer
    const newAstrologer = await db.insert(astrologers)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone.trim(),
        specializations: specializations,
        experience: experience,
        hourlyRate: hourlyRate,
        languages: languages.trim(),
        location: location.trim(),
        rating: 0.0,
        totalConsultations: 0,
        isApproved: false,
        isOnline: false,
        bio: bio?.trim() || null,
        photo: photo?.trim() || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(excludePassword(newAstrologer[0]), { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if astrologer exists
    const existingAstrologer = await db.select()
      .from(astrologers)
      .where(eq(astrologers.id, parseInt(id)))
      .limit(1);

    if (existingAstrologer.length === 0) {
      return NextResponse.json({
        error: 'Astrologer not found',
        code: 'ASTROLOGER_NOT_FOUND'
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and prepare updates
    if (body.name !== undefined) {
      updates.name = body.name.trim();
    }

    if (body.email !== undefined) {
      if (!isValidEmail(body.email)) {
        return NextResponse.json({
          error: "Invalid email format",
          code: "INVALID_EMAIL"
        }, { status: 400 });
      }

      // Check if new email already exists (excluding current astrologer)
      const emailCheck = await db.select()
        .from(astrologers)
        .where(
          and(
            eq(astrologers.email, body.email.toLowerCase().trim()),
            // Use NOT EQUAL by checking id is different
          )
        )
        .limit(1);

      if (emailCheck.length > 0 && emailCheck[0].id !== parseInt(id)) {
        return NextResponse.json({
          error: "Email already exists",
          code: "DUPLICATE_EMAIL"
        }, { status: 400 });
      }

      updates.email = body.email.toLowerCase().trim();
    }

    if (body.password !== undefined) {
      updates.password = await bcrypt.hash(body.password, SALT_ROUNDS);
    }

    if (body.phone !== undefined) {
      updates.phone = body.phone.trim();
    }

    if (body.specializations !== undefined) {
      if (!isValidSpecializations(body.specializations)) {
        return NextResponse.json({
          error: "Specializations must be a non-empty array of strings",
          code: "INVALID_SPECIALIZATIONS"
        }, { status: 400 });
      }
      updates.specializations = body.specializations;
    }

    if (body.experience !== undefined) {
      if (typeof body.experience !== 'number' || body.experience < 0) {
        return NextResponse.json({
          error: "Experience must be a positive number",
          code: "INVALID_EXPERIENCE"
        }, { status: 400 });
      }
      updates.experience = body.experience;
    }

    if (body.hourlyRate !== undefined) {
      if (typeof body.hourlyRate !== 'number' || body.hourlyRate <= 0) {
        return NextResponse.json({
          error: "Hourly rate must be a positive number",
          code: "INVALID_HOURLY_RATE"
        }, { status: 400 });
      }
      updates.hourlyRate = body.hourlyRate;
    }

    if (body.languages !== undefined) {
      if (typeof body.languages !== 'string' || body.languages.trim() === '') {
        return NextResponse.json({
          error: "Languages must be a non-empty string",
          code: "INVALID_LANGUAGES"
        }, { status: 400 });
      }
      updates.languages = body.languages.trim();
    }

    if (body.location !== undefined) {
      if (typeof body.location !== 'string' || body.location.trim() === '') {
        return NextResponse.json({
          error: "Location must be a non-empty string",
          code: "INVALID_LOCATION"
        }, { status: 400 });
      }
      updates.location = body.location.trim();
    }

    if (body.rating !== undefined) {
      updates.rating = body.rating;
    }

    if (body.totalConsultations !== undefined) {
      updates.totalConsultations = body.totalConsultations;
    }

    if (body.isApproved !== undefined) {
      updates.isApproved = body.isApproved;
    }

    if (body.isOnline !== undefined) {
      updates.isOnline = body.isOnline;
    }

    if (body.bio !== undefined) {
      updates.bio = body.bio?.trim() || null;
    }

    if (body.photo !== undefined) {
      updates.photo = body.photo?.trim() || null;
    }

    // Update astrologer
    const updated = await db.update(astrologers)
      .set(updates)
      .where(eq(astrologers.id, parseInt(id)))
      .returning();

    return NextResponse.json(excludePassword(updated[0]));

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if astrologer exists
    const existingAstrologer = await db.select()
      .from(astrologers)
      .where(eq(astrologers.id, parseInt(id)))
      .limit(1);

    if (existingAstrologer.length === 0) {
      return NextResponse.json({
        error: 'Astrologer not found',
        code: 'ASTROLOGER_NOT_FOUND'
      }, { status: 404 });
    }

    // Soft delete - set isDeleted to true instead of removing from database
    const deleted = await db.update(astrologers)
      .set({ isDeleted: true })
      .where(eq(astrologers.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Astrologer deleted successfully',
      astrologer: excludePassword(deleted[0])
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}