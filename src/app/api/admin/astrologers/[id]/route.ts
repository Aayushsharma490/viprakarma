import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { astrologers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone, password, specializations, experience, hourlyRate, bio, languages, location, isApproved, isOnline } = body;

    // Check if astrologer exists
    const existingAstrologer = await db
      .select()
      .from(astrologers)
      .where(eq(astrologers.id, id))
      .limit(1);

    if (existingAstrologer.length === 0) {
      return NextResponse.json({ error: 'Astrologer not found' }, { status: 404 });
    }

    // Prepare update data (only update provided fields)
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (experience !== undefined) updateData.experience = parseInt(experience);
    if (hourlyRate !== undefined) updateData.hourlyRate = parseInt(hourlyRate);
    if (bio !== undefined) updateData.bio = bio;
    if (languages !== undefined) updateData.languages = languages;
    if (location !== undefined) updateData.location = location;
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (isOnline !== undefined) updateData.isOnline = isOnline;


    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update astrologer
    const updatedAstrologer = await db
      .update(astrologers)
      .set(updateData)
      .where(eq(astrologers.id, id))
      .returning();

    return NextResponse.json(updatedAstrologer[0]);
  } catch (error) {
    console.error('Error updating astrologer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    // Check if astrologer exists
    const existingAstrologer = await db
      .select()
      .from(astrologers)
      .where(eq(astrologers.id, id))
      .limit(1);

    if (existingAstrologer.length === 0) {
      return NextResponse.json({ error: 'Astrologer not found' }, { status: 404 });
    }

    // Delete astrologer
    await db
      .delete(astrologers)
      .where(eq(astrologers.id, id));

    return NextResponse.json({ message: 'Astrologer deleted successfully' });
  } catch (error) {
    console.error('Error deleting astrologer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
