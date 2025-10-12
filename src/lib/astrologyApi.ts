// Astrology API integration
// Using comprehensive mock data for demonstration - replace with actual API calls

export interface BirthDetails {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraPada: number;
  strength: string;
  benefic: boolean;
}

export interface House {
  house: number;
  sign: string;
  lord: string;
  degree: number;
}

export interface Dasha {
  planet: string;
  startDate: string;
  endDate: string;
  level: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha';
}

export interface Yoga {
  name: string;
  description: string;
  planets: string[];
  strength: 'Strong' | 'Moderate' | 'Weak';
}

export interface Nakshatra {
  name: string;
  lord: string;
  pada: number;
  degree: string;
  characteristics: string;
}

export interface KundaliData {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  planets: Planet[];
  houses: House[];
  nakshatras: {
    sun: Nakshatra;
    moon: Nakshatra;
    ascendant: Nakshatra;
  };
  dashas: {
    current: Dasha;
    mahadashas: Dasha[];
  };
  yogas: Yoga[];
  doshas: {
    mangalDosha: boolean;
    kalSarpDosha: boolean;
    pitruDosha: boolean;
    sadheSatiActive: boolean;
  };
  predictions: {
    personality: string;
    career: string;
    finance: string;
    health: string;
    marriage: string;
    education: string;
  };
  planetaryStrengths: Array<{
    planet: string;
    shadbala: number;
    strengthPercent: number;
    status: string;
  }>;
  remedies: string[];
}

const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const nakshatraList = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const nakshatraLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

function calculateAscendant(details: BirthDetails): string {
  // Simplified calculation - in real implementation, use Swiss Ephemeris
  const hourAngle = (details.hour + details.minute / 60) * 15;
  const signIndex = Math.floor((hourAngle + details.longitude) / 30) % 12;
  return zodiacSigns[signIndex];
}

function calculatePlanetPosition(planetName: string, details: BirthDetails): { sign: string; degree: number; house: number } {
  // Mock calculation based on date - replace with actual ephemeris
  const seed = details.day + details.month * 31 + details.year + planetName.charCodeAt(0);
  const signIndex = seed % 12;
  const degree = (seed % 30) + (details.hour / 24) * 30;
  const house = ((signIndex + Math.floor(degree / 30)) % 12) + 1;
  
  return {
    sign: zodiacSigns[signIndex],
    degree: degree,
    house: house
  };
}

function getNakshatra(degree: number): { name: string; lord: string; pada: number } {
  const totalDegree = degree % 360;
  const nakshatraIndex = Math.floor(totalDegree / 13.333333);
  const lordIndex = nakshatraIndex % 9;
  const pada = Math.floor(((totalDegree % 13.333333) / 3.333333) + 1);
  
  return {
    name: nakshatraList[nakshatraIndex],
    lord: nakshatraLords[lordIndex],
    pada: pada
  };
}

export async function generateKundali(birthDetails: BirthDetails): Promise<KundaliData> {
  // Simulate API call with FASTER response
  await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced from 1500ms to 500ms
  
  const ascendant = calculateAscendant(birthDetails);
  
  // Generate planetary positions
  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const planets: Planet[] = planetNames.map((name, index) => {
    const position = calculatePlanetPosition(name, birthDetails);
    const nakshatra = getNakshatra(position.degree);
    
    return {
      name,
      sign: position.sign,
      degree: position.degree,
      house: position.house,
      isRetrograde: Math.random() > 0.7,
      nakshatra: nakshatra.name,
      nakshatraPada: nakshatra.pada,
      strength: ['Exalted', 'Own Sign', 'Friendly', 'Neutral', 'Enemy', 'Debilitated'][Math.floor(Math.random() * 6)],
      benefic: ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(name)
    };
  });

  // Generate houses
  const houses: House[] = Array.from({ length: 12 }, (_, i) => {
    const signIndex = (zodiacSigns.indexOf(ascendant) + i) % 12;
    return {
      house: i + 1,
      sign: zodiacSigns[signIndex],
      lord: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][signIndex],
      degree: (i * 30) + (birthDetails.hour * 1.25)
    };
  });

  // Sun sign from date
  const sunSign = zodiacSigns[birthDetails.month - 1];
  const moonSign = planets.find(p => p.name === 'Moon')?.sign || 'Taurus';

  // Nakshatras
  const sunPlanet = planets.find(p => p.name === 'Sun')!;
  const moonPlanet = planets.find(p => p.name === 'Moon')!;
  
  const nakshatras = {
    sun: {
      name: sunPlanet.nakshatra,
      lord: getNakshatra(sunPlanet.degree).lord,
      pada: sunPlanet.nakshatraPada,
      degree: `${Math.floor(sunPlanet.degree)}°${Math.floor((sunPlanet.degree % 1) * 60)}'`,
      characteristics: 'Represents soul, ego, authority, and life force'
    },
    moon: {
      name: moonPlanet.nakshatra,
      lord: getNakshatra(moonPlanet.degree).lord,
      pada: moonPlanet.nakshatraPada,
      degree: `${Math.floor(moonPlanet.degree)}°${Math.floor((moonPlanet.degree % 1) * 60)}'`,
      characteristics: 'Represents mind, emotions, and inner self'
    },
    ascendant: {
      name: nakshatraList[Math.floor(Math.random() * 27)],
      lord: nakshatraLords[Math.floor(Math.random() * 9)],
      pada: Math.floor(Math.random() * 4) + 1,
      degree: `${Math.floor(houses[0].degree)}°${Math.floor((houses[0].degree % 1) * 60)}'`,
      characteristics: 'Represents physical body, personality, and life path'
    }
  };

  // Dashas
  const currentYear = new Date().getFullYear();
  const dashas = {
    current: {
      planet: 'Jupiter',
      startDate: `${currentYear - 1}-03-15`,
      endDate: `${currentYear + 15}-03-15`,
      level: 'Mahadasha' as const
    },
    mahadashas: [
      { planet: 'Saturn', startDate: `${currentYear - 20}-03-15`, endDate: `${currentYear - 1}-03-15`, level: 'Mahadasha' as const },
      { planet: 'Jupiter', startDate: `${currentYear - 1}-03-15`, endDate: `${currentYear + 15}-03-15`, level: 'Mahadasha' as const },
      { planet: 'Rahu', startDate: `${currentYear + 15}-03-15`, endDate: `${currentYear + 33}-03-15`, level: 'Mahadasha' as const },
    ]
  };

  // Yogas
  const yogas: Yoga[] = [
    {
      name: 'Gajakesari Yoga',
      description: 'Jupiter in Kendra from Moon brings wisdom, prosperity, and respect',
      planets: ['Jupiter', 'Moon'],
      strength: 'Strong'
    },
    {
      name: 'Raj Yoga',
      description: 'Lords of Kendra and Trikona together create royal combination for power and status',
      planets: ['Jupiter', 'Venus'],
      strength: 'Moderate'
    },
    {
      name: 'Dhana Yoga',
      description: 'Lords of wealth houses create financial prosperity',
      planets: ['Venus', 'Mercury'],
      strength: 'Strong'
    },
    {
      name: 'Budhaditya Yoga',
      description: 'Sun and Mercury together enhance intelligence and communication skills',
      planets: ['Sun', 'Mercury'],
      strength: 'Moderate'
    }
  ];

  // Planetary Strengths
  const planetaryStrengths = planets.map(planet => {
    const shadbala = Math.random() * 1000 + 200;
    const strengthPercent = (shadbala / 1200) * 100;
    let status = 'Weak';
    if (strengthPercent > 75) status = 'Very Strong';
    else if (strengthPercent > 60) status = 'Strong';
    else if (strengthPercent > 40) status = 'Average';
    
    return {
      planet: planet.name,
      shadbala: Math.round(shadbala),
      strengthPercent: Math.round(strengthPercent),
      status
    };
  });

  // Predictions
  const predictions = {
    personality: `With ${ascendant} ascendant, you possess strong communication skills and adaptability. Your ${moonSign} Moon sign makes you emotionally stable and practical. The placement of planets in your chart indicates a balanced personality with both materialistic and spiritual inclinations.`,
    career: `Your 10th house lord placement suggests success in ${['business', 'government service', 'creative fields', 'technology', 'healthcare'][Math.floor(Math.random() * 5)]}. Jupiter's influence brings opportunities for growth and recognition. Saturn's aspect provides discipline and long-term stability in career matters.`,
    finance: `Strong Dhana Yogas in your chart indicate good financial prospects. The 2nd and 11th house placements suggest multiple income sources. Favorable periods for wealth accumulation are during Jupiter and Venus dashas. Investment in ${['real estate', 'stocks', 'gold', 'mutual funds'][Math.floor(Math.random() * 4)]} will be beneficial.`,
    health: `Overall health looks promising. 6th house indicates good immunity. However, pay attention to ${['digestive system', 'respiratory issues', 'joint problems', 'stress-related ailments'][Math.floor(Math.random() * 4)]}. Regular exercise and yoga will maintain vitality. Avoid excessive work stress.`,
    marriage: `7th house analysis indicates a harmonious married life. Marriage is likely around age ${22 + Math.floor(Math.random() * 8)}. Venus placement suggests an understanding and supportive life partner. Compatibility with ${zodiacSigns[Math.floor(Math.random() * 12)]} and ${zodiacSigns[Math.floor(Math.random() * 12)]} signs is excellent.`,
    education: `Mercury's strong placement indicates excellent academic abilities. Success in ${['engineering', 'medicine', 'law', 'business', 'arts', 'research'][Math.floor(Math.random() * 6)]} streams. Jupiter's blessings bring opportunities for higher education abroad. Focus on studies during Mercury and Jupiter periods for best results.`
  };

  // Doshas
  const marsHouses = [1, 4, 7, 8, 12];
  const mangalDosha = marsHouses.includes(planets.find(p => p.name === 'Mars')?.house || 0);
  
  return {
    sunSign,
    moonSign,
    ascendant,
    planets,
    houses,
    nakshatras,
    dashas,
    yogas,
    doshas: {
      mangalDosha,
      kalSarpDosha: Math.random() > 0.8,
      pitruDosha: Math.random() > 0.85,
      sadheSatiActive: Math.random() > 0.7
    },
    predictions,
    planetaryStrengths,
    remedies: [
      mangalDosha ? 'Perform Mangal Shanti Puja to reduce Mangal Dosha effects' : 'Chant Hanuman Chalisa for Mars strength',
      'Wear Yellow Sapphire (Pukhraj) for Jupiter blessings after consulting an astrologer',
      'Donate to charity on Saturdays to strengthen Saturn and reduce malefic effects',
      'Practice meditation and yoga daily for mental peace and spiritual growth',
      'Recite Gayatri Mantra 108 times daily during sunrise for overall well-being',
      'Feed cows on Thursdays to enhance Jupiter\'s positive influence',
      'Light a diya (lamp) in front of Lord Ganesha every evening for obstacle removal',
      `Visit ${['Hanuman', 'Shiva', 'Vishnu', 'Durga'][Math.floor(Math.random() * 4)]} temple regularly for divine blessings`
    ],
  };
}

export interface NumerologyData {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  insights: {
    lifePathMeaning: string;
    destinyMeaning: string;
    soulUrgeMeaning: string;
    personalityMeaning: string;
  };
}

export function calculateNumerology(
  name: string,
  dateOfBirth: string
): NumerologyData {
  // Simple numerology calculation
  const reduceNumber = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return num;
  };

  // Life Path Number from date of birth
  const date = new Date(dateOfBirth);
  const lifePath = reduceNumber(
    date.getDate() + (date.getMonth() + 1) + date.getFullYear()
  );

  // Destiny Number from full name
  const nameValues: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  
  const destiny = reduceNumber(
    name.toLowerCase().split('').reduce((sum, char) => {
      return sum + (nameValues[char] || 0);
    }, 0)
  );

  // Soul Urge (vowels)
  const vowels = 'aeiou';
  const soulUrge = reduceNumber(
    name.toLowerCase().split('').reduce((sum, char) => {
      return vowels.includes(char) ? sum + (nameValues[char] || 0) : sum;
    }, 0)
  );

  // Personality (consonants)
  const personality = reduceNumber(
    name.toLowerCase().split('').reduce((sum, char) => {
      return !vowels.includes(char) && nameValues[char] ? sum + nameValues[char] : sum;
    }, 0)
  );

  return {
    lifePath,
    destiny,
    soulUrge,
    personality,
    insights: {
      lifePathMeaning: `Life Path ${lifePath} represents leadership, independence, and innovation.`,
      destinyMeaning: `Destiny ${destiny} indicates your life purpose and ultimate goals.`,
      soulUrgeMeaning: `Soul Urge ${soulUrge} reveals your inner motivations and desires.`,
      personalityMeaning: `Personality ${personality} shows how others perceive you.`,
    },
  };
}