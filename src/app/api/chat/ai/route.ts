import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { db } from '@/db';
import { chatSessions } from '@/db/schema';

export const dynamic = 'force-dynamic';

// OpenAI is disabled for now
const openai = null;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let responseMessage = '';

    // Use mock responses for now
    responseMessage = getMockResponse(message);

    // Save chat session
    try {
      await db.insert(chatSessions).values({
        userId: (decoded as any).userId,
        sessionType: 'ai_chat',
        messages: JSON.stringify([{ role: 'user', content: message }, { role: 'assistant', content: responseMessage }]),
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('kundali') || lowerMessage.includes('birth chart')) {
    return 'Your Kundali, or birth chart, is a cosmic map showing the positions of planets at your birth time. It reveals your karmic patterns, strengths, and life path. To create an accurate Kundali, I need your exact birth date, time, and place. The planetary positions influence different aspects of your life - Sun represents your soul, Moon your mind, and other planets govern career, relationships, health, and more.';
  }

  if (lowerMessage.includes('numerology') || lowerMessage.includes('number')) {
    return 'Numerology is the ancient science of numbers and their vibrations. Your Life Path Number, calculated from your birth date, reveals your core purpose. Your Destiny Number from your name shows your life mission. Numbers carry specific energies - 1 represents leadership, 2 harmony, 3 creativity, and so on. Each number between 1-9 has unique characteristics that influence your personality and destiny.';
  }

  if (lowerMessage.includes('palmistry') || lowerMessage.includes('palm')) {
    return 'Palmistry, or Hasta Samudrika Shastra, is the art of reading hands to understand character and destiny. The major lines - Heart, Head, Life, and Fate - reveal different aspects of your journey. The Heart line shows emotional nature, Head line indicates intellect, Life line represents vitality, and Fate line reveals career path. Mounts on the palm represent planetary influences.';
  }

  if (lowerMessage.includes('remedy') || lowerMessage.includes('solution')) {
    return 'Vedic remedies can help balance planetary influences. Common remedies include: 1) Mantra chanting for spiritual alignment, 2) Gemstone wearing to strengthen beneficial planets, 3) Charity and service to reduce negative karma, 4) Fasting on specific days, 5) Performing specific pujas and rituals. The key is consistency and faith. Remedies work gradually to bring positive changes.';
  }

  if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
    return 'Career success depends on the 10th house (karma bhava) in your chart and the strength of Saturn, Sun, and Mercury. Strong Mercury favors communication and business, while Saturn indicates discipline and hard work. Jupiter brings wisdom and teaching opportunities. The current planetary transits also affect career timing. Consider your natural talents aligned with planetary strengths.';
  }

  if (lowerMessage.includes('relationship') || lowerMessage.includes('love') || lowerMessage.includes('marriage')) {
    return 'Relationships are governed by Venus (love), Mars (passion), and the 7th house (partnerships) in your chart. Compatibility is assessed through Kundali matching (Guna Milan). Moon sign compatibility shows emotional harmony. Venus placement indicates love nature. The current Dasha period also influences relationship timing. Strong Jupiter brings wisdom and lasting bonds.';
  }

  if (lowerMessage.includes('health') || lowerMessage.includes('wellness')) {
    return 'Health matters are indicated by the 6th house, Ascendant, and Moon in your chart. Each planet governs specific body parts - Sun for heart, Moon for mind, Mars for blood, etc. Ayurveda complements Vedic astrology for holistic wellness. Regular yoga, meditation, and following natural rhythms (Dinacharya) help maintain balance. Strengthening weak planets through remedies can improve health.';
  }

  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return 'You\'re most welcome! 🙏 May the cosmic energies guide you towards prosperity and enlightenment. Remember, astrology is a tool for self-awareness and positive change. Feel free to ask if you have more questions. Om Shanti! ✨';
  }

  // Default response
  return 'That\'s an interesting question! Vedic astrology offers profound insights into all aspects of life. Based on your inquiry, I can help you understand planetary influences, birth chart analysis, compatibility, career guidance, health matters, and spiritual growth. Could you share more specific details about your birth date, time, and place, or let me know which area of life you\'d like guidance on - career, relationships, health, or spiritual path?';
}
