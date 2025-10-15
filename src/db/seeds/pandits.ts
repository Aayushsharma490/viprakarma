import { db } from '@/db';
import { pandits } from '@/db/schema';

export async function seedPandits() {
  console.log('🌱 Seeding pandits...');

  const samplePandits = [
    {
      name: 'Pandit Rajesh Sharma',
      specialization: 'Vedic Rituals & Pujas',
      experience: 18,
      languages: 'Hindi, English, Sanskrit',
      rating: 4.8,
      pricePerHour: 1800,
      location: 'Mumbai',
      description: 'Expert in traditional Vedic rituals with deep knowledge of ancient scriptures. Specializes in complex pujas and havans for various occasions.',
      imageUrl: null,
      phoneNumber: '+919876543210',
      whatsappNumber: '+919876543210',
      available: true,
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Acharya Suresh Joshi',
      specialization: 'Marriage Ceremonies (Vivah Sanskar)',
      experience: 22,
      languages: 'Hindi, Marathi, Sanskrit',
      rating: 4.9,
      pricePerHour: 2500,
      location: 'Pune',
      description: 'Renowned marriage ceremony specialist with over two decades of experience. Conducts traditional Hindu weddings with authentic rituals.',
      imageUrl: null,
      phoneNumber: '+919876543211',
      whatsappNumber: '+919876543211',
      available: true,
      createdAt: new Date().toISOString(),
    },
    // Add more sample pandits as needed...
  ];

  try {
    // Clear existing data
    await db.delete(pandits);
    
    // Insert new data
    await db.insert(pandits).values(samplePandits);
    
    console.log('✅ Pandits seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding pandits:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedPandits();
}