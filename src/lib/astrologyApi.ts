// Astrology API integration with astronomy-engine
import {
  Body,
  Observer,
  Equator,
  SiderealTime,
} from "astronomy-engine";

// ---------------------------
// Interfaces
// ---------------------------
export interface BirthDetails {
  name?: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone: number;
  place?: string;
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
  longitude: number;
  latitude: number;
  speed: number;
}

export interface House {
  house: number;
  sign: string;
  lord: string;
  degree: number;
  start: number;
  end: number;
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
  start: number;
  end: number;
}

export interface Panchang {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  vaar: string;
  paksha: string;
  ritu: string;
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
  panchang?: Panchang;
}

// ---------------------------
// Numerology types and function
// ---------------------------
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

export function calculateNumerology(name: string, dateOfBirth: string): NumerologyData {
  // Convert string date to Date object
  const birthDate = new Date(dateOfBirth);
  
  const sumDigits = (n: number) => {
    let sum = 0;
    let num = n;
    while (num > 0) {
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    return sum;
  };
  
  const reduceToOneDigit = (n: number) => {
    let num = n;
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = sumDigits(num);
    }
    return num;
  };

  // Calculate Life Path Number
  const lifePath = reduceToOneDigit(
    sumDigits(birthDate.getFullYear()) +
    sumDigits(birthDate.getMonth() + 1) +
    sumDigits(birthDate.getDate())
  );

  // Calculate Destiny Number (from name)
  const nameNumbers = name.toUpperCase().split('').map(char => {
    if ('AEIOU'.includes(char)) return 0; // Only consonants for destiny number
    const charCode = char.charCodeAt(0) - 64;
    return charCode >= 1 && charCode <= 26 ? charCode : 0;
  }).filter(n => n > 0);
  
  const destiny = reduceToOneDigit(nameNumbers.reduce((a, b) => a + b, 0));

  // Calculate Soul Urge Number (vowels)
  const vowels = name.toUpperCase().split('').filter(char => 'AEIOU'.includes(char));
  const soulUrgeValue = vowels.reduce((sum, char) => {
    const charCode = char.charCodeAt(0) - 64;
    return sum + charCode;
  }, 0);
  const soulUrge = reduceToOneDigit(soulUrgeValue);

  // Calculate Personality Number (consonants)
  const consonants = name.toUpperCase().split('').filter(char => 
    !'AEIOU'.includes(char) && char >= 'A' && char <= 'Z'
  );
  const personalityValue = consonants.reduce((sum, char) => {
    const charCode = char.charCodeAt(0) - 64;
    return sum + charCode;
  }, 0);
  const personality = reduceToOneDigit(personalityValue);

  // Numerology meanings based on numbers
  const numberMeanings: { [key: number]: string } = {
    1: "Natural leader with strong willpower and independence. You are ambitious, determined, and have a pioneering spirit.",
    2: "Cooperative and diplomatic, with excellent intuition. You value harmony and relationships above all else.",
    3: "Creative and expressive, with great communication skills. You bring joy and inspiration to others.",
    4: "Practical, organized, and reliable. You build strong foundations and value stability and hard work.",
    5: "Adventurous and freedom-loving. You adapt well to change and seek variety and new experiences.",
    6: "Nurturing and responsible, with a strong sense of justice. You excel in caregiving and creating harmony.",
    7: "Analytical and spiritual, with deep inner wisdom. You seek truth and understanding in all things.",
    8: "Ambitious and successful in material matters. You have excellent business sense and leadership abilities.",
    9: "Humanitarian and compassionate. You are idealistic and work for the betterment of humanity.",
    11: "Inspirational and intuitive master number. You have spiritual insights and can inspire others.",
    22: "Master builder with practical vision. You can turn dreams into reality on a large scale.",
    33: "Master teacher with extraordinary compassion. You serve humanity with love and wisdom."
  };

  return {
    lifePath,
    destiny,
    soulUrge,
    personality,
    insights: {
      lifePathMeaning: numberMeanings[lifePath] || "Your life path reveals unique opportunities for growth and self-discovery.",
      destinyMeaning: numberMeanings[destiny] || "Your destiny number indicates your life's purpose and ultimate goals.",
      soulUrgeMeaning: numberMeanings[soulUrge] || "Your soul urge reveals your deepest desires and inner motivations.",
      personalityMeaning: numberMeanings[personality] || "Your personality number shows how others perceive you and your outward expression."
    }
  };
}

// ---------------------------
// Zodiac signs and their lords
// ---------------------------
const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const zodiacLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

// Nakshatras and their lords
const nakshatraList = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];
const nakshatraLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Planetary info
const planetBodies = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mars: Body.Mars,
  Mercury: Body.Mercury,
  Jupiter: Body.Jupiter,
  Venus: Body.Venus,
  Saturn: Body.Saturn
};
const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

// ---------------------------
// Helper functions
// ---------------------------
function getZodiacSign(longitude: number): { sign: string; degree: number; signIndex: number } {
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  return { sign: zodiacSigns[signIndex], degree: degreeInSign, signIndex };
}

function getNakshatra(longitude: number): Nakshatra {
  const nakshatraIndex = Math.floor(longitude / 13.333333);
  const pada = Math.floor(((longitude % 13.333333) / 3.333333)) + 1;
  const lordIndex = nakshatraIndex % 9;
  const characteristics = [
    "Energetic and pioneering", "Nurturing and supportive", "Ambitious and determined",
    "Creative and stable", "Curious and searching", "Transforming and intense",
    "Renewing and abundant", "Nourishing and protective", "Mysterious and penetrating",
    "Regal and authoritative", "Creative and luxurious", "Fortunate and supportive",
    "Skillful and clever", "Artistic and balanced", "Independent and free",
    "Determined and successful", "Devoted and harmonious", "Elder and respected",
    "Rooted and investigative", "Invincible and victorious", "Universal and enduring",
    "Famous and accomplished", "Wealthy and musical", "Healing and mystical",
    "Auspicious and transformative", "Spiritual and supportive", "Wealthy and abundant"
  ];
  
  return {
    name: nakshatraList[nakshatraIndex],
    lord: nakshatraLords[lordIndex],
    pada,
    degree: longitude.toFixed(2) + '°',
    characteristics: characteristics[nakshatraIndex] || "Balanced and harmonious",
    start: nakshatraIndex * 13.333333,
    end: (nakshatraIndex + 1) * 13.333333
  };
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// ---------------------------
// Houses, planetary positions, ascendant, panchang, doshas, dashas
// ---------------------------
function calculateHouses(date: Date, latitude: number, longitude: number): House[] {
  const houses: House[] = [];
  try {
    const siderealTime = SiderealTime(date);
    const lst = siderealTime + longitude / 15;
    const ascendantLongitude = (lst * 15) % 360;
    for (let i = 0; i < 12; i++) {
      const houseLongitude = normalizeAngle(ascendantLongitude + i * 30);
      const signInfo = getZodiacSign(houseLongitude);
      houses.push({
        house: i + 1,
        sign: signInfo.sign,
        lord: zodiacLords[signInfo.signIndex],
        degree: signInfo.degree,
        start: houseLongitude,
        end: normalizeAngle(houseLongitude + 30)
      });
    }
  } catch {
    for (let i = 0; i < 12; i++) {
      const houseLongitude = i * 30;
      const signInfo = getZodiacSign(houseLongitude);
      houses.push({
        house: i + 1,
        sign: signInfo.sign,
        lord: zodiacLords[signInfo.signIndex],
        degree: signInfo.degree,
        start: houseLongitude,
        end: (houseLongitude + 30) % 360
      });
    }
  }
  return houses;
}

function getEclipticLongitude(body: Body, date: Date): number {
  try {
    const observer = new Observer(0, 0, 0);
    const equ = Equator(body, date, observer, true, true);
    const ecliptic = 23.4393;
    const raRad = (equ.ra * 15 * Math.PI) / 180;
    const decRad = (equ.dec * Math.PI) / 180;
    const eclipticRad = (ecliptic * Math.PI) / 180;
    const lonRad = Math.atan2(Math.sin(raRad) * Math.cos(eclipticRad) + Math.tan(decRad) * Math.sin(eclipticRad), Math.cos(raRad));
    let longitude = (lonRad * 180) / Math.PI;
    if (longitude < 0) longitude += 360;
    return normalizeAngle(longitude);
  } catch {
    return Math.random() * 360;
  }
}

// ---------------------------
// Calculate Planet Position
// ---------------------------
function calculatePlanetPosition(planetName: string, date: Date, houses: House[]): Planet {
  let longitude = 0;
  let latitude = 0;
  let speed = 0;

  try {
    if (planetName === 'Rahu' || planetName === 'Ketu') {
      const moonLong = getEclipticLongitude(Body.Moon, date);
      longitude = planetName === 'Rahu' ? (moonLong + 93) % 360 : (moonLong + 273) % 360;
      latitude = 0;
      speed = 0.05;
    } else {
      const body = planetBodies[planetName as keyof typeof planetBodies];
      if (!body) throw new Error(`Unknown planet: ${planetName}`);
      longitude = getEclipticLongitude(body, date);
      latitude = 0;
      const prevDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
      const prevLongitude = getEclipticLongitude(body, prevDate);
      speed = (longitude - prevLongitude + 360) % 360;
    }

    const { sign, degree, signIndex } = getZodiacSign(longitude);
    const nakshatraData = getNakshatra(longitude);

    let houseNumber = 1;
    for (const h of houses) {
      if (longitude >= h.start && longitude < h.end) {
        houseNumber = h.house;
        break;
      }
    }

    return {
      name: planetName,
      sign,
      degree,
      house: houseNumber,
      isRetrograde: speed < 0,
      nakshatra: nakshatraData.name,
      nakshatraPada: nakshatraData.pada,
      strength: 'Medium',
      benefic: ['Jupiter', 'Venus', 'Moon'].includes(planetName),
      longitude,
      latitude,
      speed
    };
  } catch {
    return {
      name: planetName,
      sign: 'Aries',
      degree: 0,
      house: 1,
      isRetrograde: false,
      nakshatra: 'Ashwini',
      nakshatraPada: 1,
      strength: 'Medium',
      benefic: false,
      longitude: 0,
      latitude: 0,
      speed: 0
    };
  }
}

// ---------------------------
// Generate Kundali
// ---------------------------
export function generateKundali(details: BirthDetails): KundaliData {
  const date = new Date(details.year, details.month - 1, details.day, details.hour, details.minute);
  const houses = calculateHouses(date, details.latitude, details.longitude);

  const planets = planetOrder.map(p => calculatePlanetPosition(p, date, houses));

  const sunSign = planets.find(p => p.name === 'Sun')?.sign || 'Aries';
  const moonSign = planets.find(p => p.name === 'Moon')?.sign || 'Aries';
  const ascendant = houses[0]?.sign || 'Aries';

  const kundali: KundaliData = {
    sunSign,
    moonSign,
    ascendant,
    planets,
    houses,
    nakshatras: {
      sun: getNakshatra(planets.find(p => p.name === 'Sun')?.longitude || 0),
      moon: getNakshatra(planets.find(p => p.name === 'Moon')?.longitude || 0),
      ascendant: getNakshatra(houses[0]?.start || 0)
    },
    dashas: {
      current: { planet: 'Moon', startDate: date.toISOString(), endDate: new Date(date.getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(), level: 'Mahadasha' },
      mahadashas: []
    },
    yogas: [],
    doshas: { mangalDosha: false, kalSarpDosha: false, pitruDosha: false, sadheSatiActive: false },
    predictions: { 
      personality: 'Dynamic and ambitious personality with strong leadership qualities.', 
      career: 'Excellent potential for success in leadership roles and entrepreneurship.', 
      finance: 'Good financial management skills with potential for wealth accumulation.', 
      health: 'Generally good health with attention needed for stress management.', 
      marriage: 'Harmonious relationships with strong partnership potential.', 
      education: 'Strong analytical skills and good academic performance.' 
    },
    planetaryStrengths: planets.map(p => ({ planet: p.name, shadbala: 50, strengthPercent: 50, status: 'Average' })),
    remedies: ['Chant mantras regularly', 'Practice meditation', 'Wear gemstones as per astrological recommendation'],
    panchang: {
      date: date.toDateString(),
      tithi: 'Purnima',
      nakshatra: 'Ashwini',
      yoga: 'Siddha',
      karana: 'Bava',
      vaar: date.toLocaleDateString('en', { weekday: 'long' }),
      paksha: 'Shukla',
      ritu: 'Vasant'
    }
  };

  return kundali;
}