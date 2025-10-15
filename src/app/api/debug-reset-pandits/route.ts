import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pandits } from '@/db/schema';

export async function POST() {
  try {
    // Delete all pandits
    await db.delete(pandits);
    
    // Add one sample pandit
    await db.insert(pandits).values({
      name: 'Sample Pandit',
      specialization: 'General Pujas',
      experience: 5,
      languages: 'Hindi, English',
      rating: 4.5,
      pricePerHour: 1000,
      location: 'Delhi',
      description: 'This is a sample pandit for testing',
      phoneNumber: '+919876543210',
      whatsappNumber: '+919876543210',
      available: 1,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'Database reset successfully with one sample pandit' 
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { error: 'Failed to reset database' },
      { status: 500 }
    );
  }
}