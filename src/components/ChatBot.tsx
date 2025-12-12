'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Comprehensive mock data for astrology responses
const rashiPalData: Record<string, string> = {
  aries: "♈ Aries (Mesh): Today brings excellent opportunities for career growth. Your natural leadership qualities will shine. Lucky color: Red. Lucky number: 9. Favorable time: 10 AM - 12 PM. Health: Good. Romance: Singles may meet someone special. Finances: Unexpected gains possible.",
  taurus: "♉ Taurus (Vrishabh): Financial stability is on your side today. Focus on long-term investments. Lucky color: Pink. Lucky number: 6. Favorable time: 2 PM - 4 PM. Health: Take care of throat issues. Romance: Express your feelings openly. Finances: Good day for property matters.",
  gemini: "♊ Gemini (Mithun): Communication is your strength today. Network and build connections. Lucky color: Yellow. Lucky number: 5. Favorable time: 11 AM - 1 PM. Health: Mental alertness high. Romance: Exciting conversations with partner. Finances: Multiple income sources active.",
  cancer: "♋ Cancer (Kark): Family matters need your attention. Emotional bonds strengthen. Lucky color: White. Lucky number: 2. Favorable time: 9 AM - 11 AM. Health: Stay hydrated. Romance: Deep emotional connections. Finances: Save for future security.",
  leo: "♌ Leo (Simha): Your charisma attracts recognition and praise today. Lucky color: Gold. Lucky number: 1. Favorable time: 12 PM - 2 PM. Health: Excellent vitality. Romance: Plan something special for loved one. Finances: Business expansion favorable.",
  virgo: "♍ Virgo (Kanya): Attention to detail brings success in work projects. Lucky color: Green. Lucky number: 5. Favorable time: 8 AM - 10 AM. Health: Maintain diet routine. Romance: Practical approach works. Finances: Wise financial decisions ahead.",
  libra: "♎ Libra (Tula): Balance and harmony in relationships is emphasized. Lucky color: Blue. Lucky number: 6. Favorable time: 3 PM - 5 PM. Health: Good overall. Romance: Romantic evening possible. Finances: Partnerships bring profits.",
  scorpio: "♏ Scorpio (Vrishchik): Transformation and deep insights come your way. Lucky color: Maroon. Lucky number: 9. Favorable time: 6 PM - 8 PM. Health: Strong immunity. Romance: Intense emotional connections. Finances: Hidden opportunities revealed.",
  sagittarius: "♐ Sagittarius (Dhanu): Adventure and learning opportunities abound today. Lucky color: Purple. Lucky number: 3. Favorable time: 1 PM - 3 PM. Health: Stay active. Romance: Fun and laughter with partner. Finances: Travel-related gains.",
  capricorn: "♑ Capricorn (Makar): Hard work pays off with tangible results today. Lucky color: Black. Lucky number: 8. Favorable time: 7 AM - 9 AM. Health: Watch knee joints. Romance: Steady progress in relationship. Finances: Career advancement likely.",
  aquarius: "♒ Aquarius (Kumbh): Innovation and unique ideas bring recognition. Lucky color: Electric Blue. Lucky number: 4. Favorable time: 4 PM - 6 PM. Health: Good circulation. Romance: Unconventional romance blooms. Finances: Technology investments favorable.",
  pisces: "♓ Pisces (Meen): Intuition guides you to the right decisions today. Lucky color: Sea Green. Lucky number: 7. Favorable time: 5 PM - 7 PM. Health: Emotional wellness important. Romance: Dreamy romantic moments. Finances: Creative ventures profitable."
};

const astrologyTopics: Record<string, string> = {
  kundali: "A Kundali (birth chart) is a cosmic map showing planetary positions at your birth time. It reveals your personality, life path, career, relationships, and destiny. Our advanced Kundali generator provides 12 houses, planetary positions, dashas (periods), yogas (combinations), nakshatras (lunar mansions), and detailed predictions. Visit our Kundali page for your personalized chart! 🌟",
  numerology: "Numerology is the mystical science of numbers. Your Life Path Number reveals your life purpose, Destiny Number shows your talents, Soul Urge Number indicates inner desires, and Personality Number reflects how others see you. Each number (1-9) carries unique vibrations influencing your life. Try our Numerology calculator for deep insights! 🔢",
  palmistry: "Palmistry (Chiromancy) reads the lines, mounts, and shapes of your palms to reveal personality traits, health, career, and life events. Major lines include Life Line (vitality), Heart Line (emotions), Head Line (intellect), and Fate Line (destiny). Upload your palm photo on our Palmistry page for AI-powered analysis! 🖐️",
  planets: "The 9 celestial bodies (Navagraha) are: Sun (soul/authority), Moon (mind/emotions), Mars (energy/courage), Mercury (intellect/communication), Jupiter (wisdom/luck), Venus (love/luxury), Saturn (discipline/karma), Rahu (desires/obsessions), and Ketu (spirituality/liberation). Each influences different life aspects based on their placement in your chart.",
  houses: "The 12 houses represent life areas: 1st (self/personality), 2nd (wealth/family), 3rd (siblings/courage), 4th (home/mother), 5th (children/creativity), 6th (health/enemies), 7th (marriage/partnerships), 8th (longevity/transformation), 9th (fortune/spirituality), 10th (career/fame), 11th (gains/friends), 12th (losses/liberation).",
  doshas: "Doshas are astrological afflictions: Mangal Dosha (Mars affecting marriage), Kaal Sarp Dosha (Rahu-Ketu alignment), Shani Dosha (Saturn's malefic effects), and Pitra Dosha (ancestral karma). These can be remedied through specific rituals, mantras, gemstones, and charitable acts. Consult our experts for personalized remedies!",
  nakshatras: "The 27 Nakshatras (lunar mansions) are: Ashwini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishta, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, and Revati. Each spans 13°20' and influences personality and destiny.",
  yogas: "Yogas are planetary combinations creating specific effects: Raj Yoga (power/status), Dhana Yoga (wealth), Gajakesari Yoga (wisdom/fame), Budhaditya Yoga (intelligence), Chandra Mangal Yoga (prosperity), Viparita Raja Yoga (success from adversity), Neecha Bhanga Yoga (cancellation of debilitation), and many more. Hundreds of yogas exist!",
  dashas: "Dasha systems predict life events timing. Vimshottari Dasha (120-year cycle) is most popular, with planetary periods: Ketu (7 yrs), Venus (20 yrs), Sun (6 yrs), Moon (10 yrs), Mars (7 yrs), Rahu (18 yrs), Jupiter (16 yrs), Saturn (19 yrs), Mercury (17 yrs). Each period brings specific experiences based on planetary strength and placement.",
  remedies: "Astrological remedies include: Gemstones (Ruby for Sun, Pearl for Moon, Coral for Mars, Emerald for Mercury, Yellow Sapphire for Jupiter, Diamond for Venus, Blue Sapphire for Saturn), Mantras (specific chants), Pujas (worship rituals), Donations (charity on specific days), Fasting (vrat on planetary days), and Yantras (mystical diagrams). Book a Pandit for personalized puja services!"
};

const getAIResponse = (userInput: string): string => {
  const input = userInput.toLowerCase().trim();

  // Rashi Pal / Daily Horoscope queries
  if (input.includes('rashi') || input.includes('horoscope') || input.includes('today') || input.includes('daily')) {
    const signs = Object.keys(rashiPalData);
    for (const sign of signs) {
      if (input.includes(sign)) {
        return `📅 **Daily Horoscope**\n\n${rashiPalData[sign]}\n\nWould you like horoscopes for other signs? Just ask! ✨`;
      }
    }
    return `📅 **Daily Horoscope Available for All Zodiac Signs!**\n\nChoose your sign:\n♈ Aries • ♉ Taurus • ♊ Gemini • ♋ Cancer • ♌ Leo • ♍ Virgo • ♎ Libra • ♏ Scorpio • ♐ Sagittarius • ♑ Capricorn • ♒ Aquarius • ♓ Pisces\n\nJust ask: "What's my horoscope for Aries today?" or "Rashi Pal for Leo" 🌟`;
  }

  // Specific astrology topics
  const topics = Object.keys(astrologyTopics);
  for (const topic of topics) {
    if (input.includes(topic)) {
      return astrologyTopics[topic];
    }
  }

  // Kundali related queries
  if (input.includes('birth chart') || input.includes('chart')) {
    return astrologyTopics.kundali;
  }

  // Marriage/relationship queries
  if (input.includes('marriage') || input.includes('relationship') || input.includes('love') || input.includes('partner')) {
    return "💕 **Marriage & Relationship Astrology**\n\nYour 7th house governs marriage and partnerships. Venus represents love and romance, while Mars indicates passion. Key factors include:\n• 7th house lord placement\n• Venus-Mars connection\n• Navamsa chart analysis\n• Matching of Kundalis (Gun Milan)\n• Mangal Dosha check\n\nFor detailed compatibility analysis and marriage timing predictions, generate your Kundali or consult our expert astrologers! 💑";
  }

  // Career queries
  if (input.includes('career') || input.includes('job') || input.includes('profession') || input.includes('work')) {
    return "💼 **Career Astrology**\n\nYour 10th house (karma bhava) governs career and profession. Key factors:\n• 10th house lord strength\n• Saturn (karaka for career)\n• Mercury (business/communication)\n• Sun (authority/government)\n• Jupiter (teaching/advisory)\n\nStrong 2nd, 6th, and 11th houses indicate financial success. Current dasha period determines career timing. Generate your Kundali for detailed career predictions and suitable profession analysis! 📊";
  }

  // Health queries
  if (input.includes('health') || input.includes('disease') || input.includes('illness')) {
    return "🏥 **Health Astrology**\n\n6th house governs diseases and health challenges. Planetary influences:\n• Sun: Heart, bones, right eye\n• Moon: Mind, blood, left eye\n• Mars: Blood disorders, accidents\n• Mercury: Nervous system, skin\n• Jupiter: Liver, diabetes\n• Venus: Reproductive system\n• Saturn: Chronic diseases, bones\n• Rahu: Mysterious ailments\n• Ketu: Sudden health issues\n\nAscendant lord's strength determines overall vitality. Consult our astrologers for health predictions and remedial measures! 💊";
  }

  // Wealth/money queries
  if (input.includes('money') || input.includes('wealth') || input.includes('finance') || input.includes('rich')) {
    return "💰 **Wealth & Finance Astrology**\n\nDhana Yogas (wealth combinations) in your chart:\n• 2nd house: Family wealth, savings\n• 5th house: Speculative gains\n• 9th house: Fortune, luck\n• 11th house: Income, profits\n\nJupiter is karaka for wealth expansion. Venus indicates luxury and comfort. Strong Laxmi Yoga brings prosperity. Current dasha of wealth lords brings financial gains. Generate your Kundali to identify wealth yogas and best periods for financial success! 💎";
  }

  // Gemstone queries
  if (input.includes('gemstone') || input.includes('stone') || input.includes('ruby') || input.includes('pearl')) {
    return "💎 **Gemstone Recommendations**\n\nWear gemstones based on planetary strength:\n• Ruby (Manik) - Sun - Boosts confidence, authority\n• Pearl (Moti) - Moon - Calms mind, emotions\n• Red Coral (Moonga) - Mars - Increases energy, courage\n• Emerald (Panna) - Mercury - Enhances intellect, communication\n• Yellow Sapphire (Pukhraj) - Jupiter - Brings wisdom, prosperity\n• Diamond (Heera) - Venus - Attracts love, luxury\n• Blue Sapphire (Neelam) - Saturn - Discipline, karmic balance\n• Hessonite (Gomed) - Rahu - Removes obstacles\n• Cat's Eye (Lehsunia) - Ketu - Spiritual growth\n\n⚠️ Wear only after proper analysis! Wrong gemstones can cause adverse effects. Consult our expert astrologers for personalized recommendations!";
  }

  // General greeting
  if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('namaste')) {
    return "🙏 Namaste! Welcome to Viprakarma! I'm your AI Astrology assistant. I can help you with:\n\n📅 Daily Horoscope (Rashi Pal) for all zodiac signs\n🌟 Kundali & Birth Chart analysis\n🔢 Numerology insights\n🖐️ Palmistry readings\n🪐 Planetary influences & Nakshatras\n💑 Marriage & Relationship compatibility\n💼 Career & Finance predictions\n💎 Gemstone recommendations\n🙏 Doshas & Remedies\n\nWhat would you like to explore today? ✨";
  }

  // Default response with suggestions
  return `🔮 **I can help you with:**\n\n📅 Daily Horoscope - Ask "Rashi Pal for [your sign]"\n🌟 Kundali Analysis - "Tell me about Kundali"\n🔢 Numerology - "What is numerology?"\n🖐️ Palmistry - "Explain palmistry"\n🪐 Planets & Nakshatras - "Tell me about planets"\n💑 Love & Marriage - "Marriage predictions"\n💼 Career Guidance - "Career astrology"\n💰 Wealth & Finance - "Money predictions"\n💎 Gemstones - "Which gemstone should I wear?"\n🙏 Remedies - "Astrological remedies"\n\nFor personalized detailed predictions, visit our Kundali Generator or Talk to Expert Astrologers! ✨`;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🙏 Namaste! I\'m your AI Astrology assistant at Viprakarma. Ask me about daily horoscope (Rashi Pal), Kundali, numerology, palmistry, planets, yogas, nakshatras, remedies, and more! How can I guide you today? ✨',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      setTimeout(() => {
        const aiResponse: Message = {
          role: 'assistant',
          content: getAIResponse(currentInput),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-amber-600 text-white shadow-2xl flex items-center justify-center hover:bg-amber-700 transition-all hover:scale-110"
          suppressHydrationWarning
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Astrologer</h3>
                <p className="text-xs text-white/90">Online • Always here for you</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-amber-50/30">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-gray-800 border border-amber-200'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-amber-200 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-amber-200 p-4 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about horoscope, kundali..."
                className="flex-1 border-amber-300 focus:border-amber-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}