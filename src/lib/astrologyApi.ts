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
  longitude: number; // Added longitude property
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

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const nakshatraList = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const nakshatraLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Real Astrology API integration with astronomy-engine
import { calculatePlanetaryPositions, calculatePlanetaryStrength, getNakshatra as getAstroNakshatra, type AstronomicalData } from './astronomyEngine';

export async function generateKundali(birthDetails: BirthDetails): Promise<KundaliData> {
  // Simulate API call with FASTER response
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validate birth details
  if (!birthDetails.day || !birthDetails.month || !birthDetails.year ||
      birthDetails.day < 1 || birthDetails.day > 31 ||
      birthDetails.month < 1 || birthDetails.month > 12 ||
      birthDetails.year < 1900 || birthDetails.year > new Date().getFullYear()) {
    throw new Error('Invalid birth date provided');
  }

  if (birthDetails.hour < 0 || birthDetails.hour > 23 ||
      birthDetails.minute < 0 || birthDetails.minute > 59) {
    throw new Error('Invalid birth time provided');
  }

  // Create date object from birth details
  const birthDate = new Date(
    birthDetails.year,
    birthDetails.month - 1,
    birthDetails.day,
    birthDetails.hour,
    birthDetails.minute
  );

  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid date created from birth details');
  }

  console.log('Generating kundali for:', {
    date: birthDate.toISOString(),
    latitude: birthDetails.latitude,
    longitude: birthDetails.longitude
  });

  // Get real astronomical calculations with error handling
  let astronomicalData: AstronomicalData;
  try {
    astronomicalData = calculatePlanetaryPositions(
      birthDate,
      birthDetails.latitude,
      birthDetails.longitude
    );
    console.log('Astronomical data calculated successfully');
  } catch (error) {
    console.error('Failed to calculate astronomical data:', error);
    throw new Error(`Kundali generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Map to our planet format
  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const planets: Planet[] = planetNames.map((name) => {
    const key = name.toLowerCase() as keyof typeof astronomicalData;
    const position = astronomicalData[key];
    const strength = calculatePlanetaryStrength(position, name);
    
    return {
      name,
      sign: position.sign,
      degree: position.degree,
      house: position.house,
      isRetrograde: position.isRetrograde || false,
      nakshatra: position.nakshatra,
      nakshatraPada: position.nakshatraPada,
      strength: strength.strength,
      benefic: strength.benefic,
      longitude: position.longitude, // Added longitude property
    };
  });

  // Ascendant from real calculations
  const ascendant = astronomicalData.ascendant.sign;
  
  // Generate houses based on real ascendant
  const houses: House[] = Array.from({ length: 12 }, (_, i) => {
    const signIndex = (ZODIAC_SIGNS.indexOf(ascendant) + i) % 12;
    return {
      house: i + 1,
      sign: ZODIAC_SIGNS[signIndex],
      lord: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][signIndex],
      degree: astronomicalData.ascendant.longitude + (i * 30)
    };
  });

  // Sun sign and moon sign from real calculations
  const sunSign = astronomicalData.sun.sign;
  const moonSign = astronomicalData.moon.sign;

  // Nakshatras
  const sunPlanet = planets.find(p => p.name === 'Sun')!;
  const moonPlanet = planets.find(p => p.name === 'Moon')!;
  const ascendantPlanetPosition = astronomicalData.ascendant;

  const nakshatras = {
    sun: {
      name: sunPlanet.nakshatra,
      lord: getAstroNakshatra(sunPlanet.longitude).lord,
      pada: sunPlanet.nakshatraPada,
      degree: `${Math.floor(sunPlanet.degree)}°${Math.floor((sunPlanet.degree % 1) * 60)}'`,
      characteristics: 'Represents soul, ego, authority, and life force'
    },
    moon: {
      name: moonPlanet.nakshatra,
      lord: getAstroNakshatra(moonPlanet.longitude).lord,
      pada: moonPlanet.nakshatraPada,
      degree: `${Math.floor(moonPlanet.degree)}°${Math.floor((moonPlanet.degree % 1) * 60)}'`,
      characteristics: 'Represents mind, emotions, and inner self'
    },
    ascendant: {
      name: ascendantPlanetPosition.nakshatra,
      lord: getAstroNakshatra(ascendantPlanetPosition.longitude).lord,
      pada: ascendantPlanetPosition.nakshatraPada,
      degree: `${Math.floor(ascendantPlanetPosition.degree)}°${Math.floor((ascendantPlanetPosition.degree % 1) * 60)}'`,
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
    marriage: `7th house analysis indicates a harmonious married life. Marriage is likely around age ${22 + Math.floor(Math.random() * 8)}. Venus placement suggests an understanding and supportive life partner. Compatibility with ${ZODIAC_SIGNS[Math.floor(Math.random() * 12)]} and ${ZODIAC_SIGNS[Math.floor(Math.random() * 12)]} signs is excellent.`,
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
  driverNumber: number;
  conductorNumber: number;
  insights: {
    lifePathMeaning: string;
    destinyMeaning: string;
    soulUrgeMeaning: string;
    personalityMeaning: string;
  };
}

export function calculateNumerology(name: string, dateOfBirth: string): NumerologyData {
  // Helper function to reduce number to single digit (except master numbers 11, 22, 33)
  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  // Calculate Life Path Number from date of birth
  const date = new Date(dateOfBirth);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const lifePath = reduceToSingleDigit(
    reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year)
  );

  // Driver Number (Birth Day reduced to single digit)
  const driverNumber = reduceToSingleDigit(day);

  // Conductor Number (Birth Month reduced to single digit)
  const conductorNumber = reduceToSingleDigit(month);

  // Calculate Destiny Number (full name)
  const nameValues: { [key: string]: number } = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
  };

  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const destinySum = cleanName.split('').reduce((sum, char) => sum + (nameValues[char] || 0), 0);
  const destiny = reduceToSingleDigit(destinySum);

  // Calculate Soul Urge (vowels only)
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const soulUrgeSum = cleanName.split('').reduce((sum, char) => {
    return vowels.includes(char) ? sum + (nameValues[char] || 0) : sum;
  }, 0);
  const soulUrge = reduceToSingleDigit(soulUrgeSum);

  // Calculate Personality (consonants only)
  const personalitySum = cleanName.split('').reduce((sum, char) => {
    return !vowels.includes(char) ? sum + (nameValues[char] || 0) : sum;
  }, 0);
  const personality = reduceToSingleDigit(personalitySum);

  // Generate insights
  const lifePathMeanings: { [key: number]: string } = {
    1: "You are a natural leader with strong willpower and determination. Your life path is about independence, innovation, and pioneering new ideas.",
    2: "You are a peacemaker and diplomat. Your life path involves cooperation, partnership, and bringing harmony to relationships.",
    3: "You are creative and expressive. Your life path is about communication, self-expression, and bringing joy to others through your talents.",
    4: "You are practical and hardworking. Your life path involves building solid foundations, structure, and creating lasting security.",
    5: "You are adventurous and freedom-loving. Your life path is about embracing change, experiencing variety, and exploring life's possibilities.",
    6: "You are nurturing and responsible. Your life path involves service, family, and creating harmony in your community.",
    7: "You are analytical and spiritual. Your life path is about seeking truth, wisdom, and deeper understanding of life's mysteries.",
    8: "You are ambitious and goal-oriented. Your life path involves material success, power, and managing resources effectively.",
    9: "You are compassionate and humanitarian. Your life path is about service to humanity, wisdom, and spiritual completion.",
    11: "You are a spiritual messenger with intuitive gifts. Your master number path involves inspiration, enlightenment, and uplifting humanity.",
    22: "You are a master builder with the ability to manifest dreams. Your path involves turning visions into reality on a grand scale.",
    33: "You are a master teacher with healing abilities. Your path involves compassionate service and spiritual guidance to humanity."
  };

  const destinyMeanings: { [key: number]: string } = {
    1: "Your destiny is to lead and initiate. You're meant to be independent, innovative, and blaze new trails.",
    2: "Your destiny is to mediate and harmonize. You're meant to bring people together and create peaceful solutions.",
    3: "Your destiny is to create and communicate. You're meant to express yourself and inspire others through your creativity.",
    4: "Your destiny is to build and organize. You're meant to create stable systems and lasting structures.",
    5: "Your destiny is to explore and adapt. You're meant to embrace freedom and experience life's adventures.",
    6: "Your destiny is to nurture and serve. You're meant to care for others and create harmonious environments.",
    7: "Your destiny is to analyze and enlighten. You're meant to seek knowledge and share spiritual wisdom.",
    8: "Your destiny is to achieve and prosper. You're meant to attain success and manage material abundance.",
    9: "Your destiny is to heal and inspire. You're meant to serve humanity with compassion and wisdom.",
    11: "Your master destiny is to illuminate and inspire. You're meant to be a spiritual beacon for others.",
    22: "Your master destiny is to manifest and construct. You're meant to build something of lasting significance.",
    33: "Your master destiny is to teach and heal. You're meant to guide others with unconditional love."
  };

  const soulUrgeMeanings: { [key: number]: string } = {
    1: "Deep inside, you desire independence, leadership, and the freedom to pursue your own unique path.",
    2: "Your soul craves partnership, harmony, and meaningful connections with others.",
    3: "You have an inner need for creative expression, joy, and sharing your artistic gifts.",
    4: "Your soul seeks security, stability, and the satisfaction of building something lasting.",
    5: "Deep down, you desire freedom, adventure, and the excitement of new experiences.",
    6: "Your soul craves responsibility, service, and creating harmony in your relationships.",
    7: "You have an inner need for solitude, spiritual growth, and understanding life's deeper truths.",
    8: "Your soul seeks material success, recognition, and the power to make a significant impact.",
    9: "Deep inside, you desire to serve humanity, share wisdom, and make the world better.",
    11: "Your soul craves spiritual enlightenment, inspiration, and the ability to uplift others.",
    22: "You have an inner need to manifest grand visions and create lasting legacies.",
    33: "Your soul seeks to teach, heal, and guide others with compassionate wisdom."
  };

  const personalityMeanings: { [key: number]: string } = {
    1: "Others see you as confident, independent, and a natural leader who takes initiative.",
    2: "People perceive you as diplomatic, gentle, and someone who brings people together.",
    3: "You appear creative, expressive, and someone who brings joy and enthusiasm to any situation.",
    4: "Others see you as reliable, practical, and someone they can depend on for stability.",
    5: "People perceive you as dynamic, adventurous, and someone who embraces change easily.",
    6: "You appear nurturing, responsible, and someone who cares deeply about others' well-being.",
    7: "Others see you as mysterious, analytical, and someone with deep spiritual insight.",
    8: "People perceive you as powerful, ambitious, and someone destined for success.",
    9: "You appear wise, compassionate, and someone with a humanitarian spirit.",
    11: "Others see you as inspiring, intuitive, and someone with special spiritual gifts.",
    22: "People perceive you as a visionary, capable of achieving extraordinary things.",
    33: "You appear as a master teacher, healer, and someone with profound wisdom."
  };

  return {
    lifePath,
    destiny,
    soulUrge,
    personality,
    driverNumber,
    conductorNumber,
    insights: {
      lifePathMeaning: lifePathMeanings[lifePath] || "Your unique path is filled with growth and discovery.",
      destinyMeaning: destinyMeanings[destiny] || "Your destiny unfolds through your choices and actions.",
      soulUrgeMeaning: soulUrgeMeanings[soulUrge] || "Your soul guides you toward your true purpose.",
      personalityMeaning: personalityMeanings[personality] || "Others see the best qualities in you.",
    }
  };
}
