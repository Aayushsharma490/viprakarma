import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, users, astrologers } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// GET method - List bookings with filters and pagination, or single booking by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single booking fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const booking = await db.select()
        .from(bookings)
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json({ 
          error: 'Booking not found',
          code: "BOOKING_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(booking[0], { status: 200 });
    }

    // List bookings with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const astrologerId = searchParams.get('astrologerId');
    const status = searchParams.get('status');
    const bookingType = searchParams.get('bookingType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build WHERE conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(bookings.userId, parseInt(userId)));
    }

    if (astrologerId) {
      conditions.push(eq(bookings.astrologerId, parseInt(astrologerId)));
    }

    if (status) {
      conditions.push(eq(bookings.status, status));
    }

    if (bookingType) {
      conditions.push(eq(bookings.bookingType, bookingType));
    }

    if (startDate) {
      conditions.push(gte(bookings.scheduledDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(bookings.scheduledDate, endDate));
    }

    let query = db.select().from(bookings);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(bookings.createdAt))
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

// POST method - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      astrologerId,
      bookingType,
      serviceType,
      scheduledDate,
      scheduledTime,
      duration,
      amount,
      status,
      notes
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!bookingType) {
      return NextResponse.json({ 
        error: "bookingType is required",
        code: "MISSING_BOOKING_TYPE" 
      }, { status: 400 });
    }

    if (!serviceType) {
      return NextResponse.json({ 
        error: "serviceType is required",
        code: "MISSING_SERVICE_TYPE" 
      }, { status: 400 });
    }

    if (!scheduledDate) {
      return NextResponse.json({ 
        error: "scheduledDate is required",
        code: "MISSING_SCHEDULED_DATE" 
      }, { status: 400 });
    }

    if (!scheduledTime) {
      return NextResponse.json({ 
        error: "scheduledTime is required",
        code: "MISSING_SCHEDULED_TIME" 
      }, { status: 400 });
    }

    if (duration === undefined || duration === null) {
      return NextResponse.json({ 
        error: "duration is required",
        code: "MISSING_DURATION" 
      }, { status: 400 });
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json({ 
        error: "amount is required",
        code: "MISSING_AMOUNT" 
      }, { status: 400 });
    }

    // Validate bookingType enum
    if (!['astrologer', 'pandit'].includes(bookingType)) {
      return NextResponse.json({ 
        error: "bookingType must be 'astrologer' or 'pandit'",
        code: "INVALID_BOOKING_TYPE" 
      }, { status: 400 });
    }

    // Validate serviceType enum
    if (!['chat', 'call', 'puja', 'ceremony'].includes(serviceType)) {
      return NextResponse.json({ 
        error: "serviceType must be 'chat', 'call', 'puja', or 'ceremony'",
        code: "INVALID_SERVICE_TYPE" 
      }, { status: 400 });
    }

    // Validate astrologerId required for astrologer bookings
    if (bookingType === 'astrologer' && !astrologerId) {
      return NextResponse.json({ 
        error: "astrologerId is required for astrologer bookings",
        code: "MISSING_ASTROLOGER_ID" 
      }, { status: 400 });
    }

    // Validate status enum if provided
    if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        error: "status must be 'pending', 'confirmed', 'completed', or 'cancelled'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(scheduledDate)) {
      return NextResponse.json({ 
        error: "scheduledDate must be in ISO format (YYYY-MM-DD)",
        code: "INVALID_DATE_FORMAT" 
      }, { status: 400 });
    }

    // Verify userId exists
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Verify astrologerId exists if provided
    if (astrologerId) {
      const astrologerExists = await db.select()
        .from(astrologers)
        .where(eq(astrologers.id, astrologerId))
        .limit(1);

      if (astrologerExists.length === 0) {
        return NextResponse.json({ 
          error: "Astrologer not found",
          code: "ASTROLOGER_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Create booking
    const newBooking = await db.insert(bookings)
      .values({
        userId,
        astrologerId: astrologerId || null,
        bookingType,
        serviceType,
        scheduledDate,
        scheduledTime,
        duration,
        amount,
        status: status || 'pending',
        notes: notes || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// PUT method - Update booking by ID
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

    const body = await request.json();
    const {
      userId,
      astrologerId,
      bookingType,
      serviceType,
      scheduledDate,
      scheduledTime,
      duration,
      amount,
      status,
      notes
    } = body;

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ 
        error: 'Booking not found',
        code: "BOOKING_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate bookingType if provided
    if (bookingType && !['astrologer', 'pandit'].includes(bookingType)) {
      return NextResponse.json({ 
        error: "bookingType must be 'astrologer' or 'pandit'",
        code: "INVALID_BOOKING_TYPE" 
      }, { status: 400 });
    }

    // Validate serviceType if provided
    if (serviceType && !['chat', 'call', 'puja', 'ceremony'].includes(serviceType)) {
      return NextResponse.json({ 
        error: "serviceType must be 'chat', 'call', 'puja', or 'ceremony'",
        code: "INVALID_SERVICE_TYPE" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        error: "status must be 'pending', 'confirmed', 'completed', or 'cancelled'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate date format if provided
    if (scheduledDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(scheduledDate)) {
        return NextResponse.json({ 
          error: "scheduledDate must be in ISO format (YYYY-MM-DD)",
          code: "INVALID_DATE_FORMAT" 
        }, { status: 400 });
      }
    }

    // Validate userId exists if provided
    if (userId) {
      const userExists = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userExists.length === 0) {
        return NextResponse.json({ 
          error: "User not found",
          code: "USER_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Validate astrologerId exists if provided
    if (astrologerId) {
      const astrologerExists = await db.select()
        .from(astrologers)
        .where(eq(astrologers.id, astrologerId))
        .limit(1);

      if (astrologerExists.length === 0) {
        return NextResponse.json({ 
          error: "Astrologer not found",
          code: "ASTROLOGER_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (userId !== undefined) updates.userId = userId;
    if (astrologerId !== undefined) updates.astrologerId = astrologerId;
    if (bookingType !== undefined) updates.bookingType = bookingType;
    if (serviceType !== undefined) updates.serviceType = serviceType;
    if (scheduledDate !== undefined) updates.scheduledDate = scheduledDate;
    if (scheduledTime !== undefined) updates.scheduledTime = scheduledTime;
    if (duration !== undefined) updates.duration = duration;
    if (amount !== undefined) updates.amount = amount;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    // Update booking
    const updatedBooking = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedBooking[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// DELETE method - Delete booking by ID
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

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ 
        error: 'Booking not found',
        code: "BOOKING_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete booking
    const deletedBooking = await db.delete(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Booking deleted successfully',
      booking: deletedBooking[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}