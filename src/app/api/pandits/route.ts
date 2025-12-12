import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pandits } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const pandit = await db.select()
        .from(pandits)
        .where(eq(pandits.id, parseInt(id)))
        .limit(1);

      if (pandit.length === 0) {
        return NextResponse.json({ 
          error: 'Pandit not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(pandit[0], { status: 200 });
    }

    // List with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const specialization = searchParams.get('specialization');
    const location = searchParams.get('location');
    const available = searchParams.get('available');

    let query = db.select().from(pandits);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(like(pandits.name, `%${search}%`));
    }

    if (specialization) {
      conditions.push(eq(pandits.specialization, specialization));
    }

    if (location) {
      conditions.push(eq(pandits.location, location));
    }

    if (available !== null && available !== undefined) {
      const isAvailable = available === 'true' || available === '1';
      conditions.push(eq(pandits.available, isAvailable));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(pandits.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email,
      specialization, 
      experience, 
      languages, 
      pricePerHour, 
      location,
      description,
      imageUrl,
      rating,
      available
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required and must not be empty",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    if (email && (typeof email !== 'string' || email.trim() === '')) {
      return NextResponse.json({ 
        error: "Email must be a valid string",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    if (!specialization || typeof specialization !== 'string' || specialization.trim() === '') {
      return NextResponse.json({ 
        error: "Specialization is required and must not be empty",
        code: "INVALID_SPECIALIZATION" 
      }, { status: 400 });
    }

    if (experience === undefined || experience === null || typeof experience !== 'number' || experience < 0) {
      return NextResponse.json({ 
        error: "Experience must be a positive integer (>= 0)",
        code: "INVALID_EXPERIENCE" 
      }, { status: 400 });
    }

    if (!languages || typeof languages !== 'string' || languages.trim() === '') {
      return NextResponse.json({ 
        error: "Languages is required and must not be empty",
        code: "INVALID_LANGUAGES" 
      }, { status: 400 });
    }

    if (!pricePerHour || typeof pricePerHour !== 'number' || pricePerHour <= 0) {
      return NextResponse.json({ 
        error: "Price per hour must be a positive integer (> 0)",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (!location || typeof location !== 'string' || location.trim() === '') {
      return NextResponse.json({ 
        error: "Location is required and must not be empty",
        code: "INVALID_LOCATION" 
      }, { status: 400 });
    }

    // Validate optional rating
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return NextResponse.json({ 
          error: "Rating must be between 0 and 5",
          code: "INVALID_RATING" 
        }, { status: 400 });
      }
    }

    // Prepare insert data with defaults
    const insertData: any = {
      name: name.trim(),
      email: email ? email.trim() : null,
      specialization: specialization.trim(),
      experience: experience,
      languages: languages.trim(),
      pricePerHour: pricePerHour,
      location: location.trim(),
      rating: rating !== undefined && rating !== null ? rating : 4.5,
      available: available !== undefined && available !== null ? available : true,
      createdAt: new Date().toISOString()
    };

    if (description) {
      insertData.description = description.trim();
    }

    if (imageUrl) {
      insertData.imageUrl = imageUrl.trim();
    }

    const newPandit = await db.insert(pandits)
      .values(insertData)
      .returning();

    return NextResponse.json(newPandit[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if pandit exists
    const existing = await db.select()
      .from(pandits)
      .where(eq(pandits.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Pandit not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and prepare updates
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json({ 
          error: "Name must not be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.email !== undefined) {
      if (body.email && (typeof body.email !== 'string' || body.email.trim() === '')) {
        return NextResponse.json({ 
          error: "Email must be a valid string",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
      updates.email = body.email ? body.email.trim() : null;
    }

    if (body.specialization !== undefined) {
      if (typeof body.specialization !== 'string' || body.specialization.trim() === '') {
        return NextResponse.json({ 
          error: "Specialization must not be empty",
          code: "INVALID_SPECIALIZATION" 
        }, { status: 400 });
      }
      updates.specialization = body.specialization.trim();
    }

    if (body.experience !== undefined) {
      if (typeof body.experience !== 'number' || body.experience < 0) {
        return NextResponse.json({ 
          error: "Experience must be a positive integer (>= 0)",
          code: "INVALID_EXPERIENCE" 
        }, { status: 400 });
      }
      updates.experience = body.experience;
    }

    if (body.languages !== undefined) {
      if (typeof body.languages !== 'string' || body.languages.trim() === '') {
        return NextResponse.json({ 
          error: "Languages must not be empty",
          code: "INVALID_LANGUAGES" 
        }, { status: 400 });
      }
      updates.languages = body.languages.trim();
    }

    if (body.pricePerHour !== undefined) {
      if (typeof body.pricePerHour !== 'number' || body.pricePerHour <= 0) {
        return NextResponse.json({ 
          error: "Price per hour must be a positive integer (> 0)",
          code: "INVALID_PRICE" 
        }, { status: 400 });
      }
      updates.pricePerHour = body.pricePerHour;
    }

    if (body.location !== undefined) {
      if (typeof body.location !== 'string' || body.location.trim() === '') {
        return NextResponse.json({ 
          error: "Location must not be empty",
          code: "INVALID_LOCATION" 
        }, { status: 400 });
      }
      updates.location = body.location.trim();
    }

    if (body.rating !== undefined) {
      if (typeof body.rating !== 'number' || body.rating < 0 || body.rating > 5) {
        return NextResponse.json({ 
          error: "Rating must be between 0 and 5",
          code: "INVALID_RATING" 
        }, { status: 400 });
      }
      updates.rating = body.rating;
    }

    if (body.description !== undefined) {
      updates.description = body.description ? body.description.trim() : null;
    }

    if (body.imageUrl !== undefined) {
      updates.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    }

    if (body.available !== undefined) {
      updates.available = body.available;
    }

    // Update the record
    const updated = await db.update(pandits)
      .set(updates)
      .where(eq(pandits.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if pandit exists
    const existing = await db.select()
      .from(pandits)
      .where(eq(pandits.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Pandit not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete the record
    const deleted = await db.delete(pandits)
      .where(eq(pandits.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Pandit deleted successfully',
      pandit: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}