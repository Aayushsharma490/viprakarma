import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pandits } from '@/db/schema';

// GET all pandits - Public API
export async function GET() {
  try {
    console.log('📞 GET /api/pandits called');
    const allPandits = await db.select().from(pandits);
    console.log(`✅ Found ${allPandits.length} pandits`);
    return NextResponse.json(allPandits);
  } catch (error) {
    console.error('❌ Error fetching pandits:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - Add new pandit
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/pandits called');
    const body = await request.json();
    console.log('Request body:', body);
    
    // Required fields check
    if (!body.name || !body.specialization || !body.experience || !body.languages || !body.pricePerHour || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into database
    const [newPandit] = await db.insert(pandits).values({
      name: body.name,
      specialization: body.specialization,
      experience: parseInt(body.experience),
      languages: body.languages,
      rating: parseFloat(body.rating) || 4.5,
      pricePerHour: parseInt(body.pricePerHour),
      location: body.location,
      description: body.description || '',
      imageUrl: body.imageUrl || '',
      phoneNumber: body.phoneNumber || '',
      whatsappNumber: body.whatsappNumber || '',
      available: body.available ? 1 : 0,
      createdAt: new Date().toISOString()
    }).returning();

    console.log('✅ Pandit added successfully:', newPandit);
    
    return NextResponse.json({
      message: 'Pandit added successfully',
      pandit: newPandit
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error adding pandit:', error);
    return NextResponse.json(
      { error: 'Failed to add pandit: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}