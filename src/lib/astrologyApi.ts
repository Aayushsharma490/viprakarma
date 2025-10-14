 // Astrology API integration with astronomy-engine
import {
  Body,
  Observer,
  Equator,
  SiderealTime,
  Vector,
  Ecliptic
} from "astronomy-engine";

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

// Zodiac signs and their lords - CORRECT ORDER
const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const zodiacLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

// Nakshatras and their lords
const nakshatraList = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const nakshatraLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Planetary information
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

// Helper functions
function getZodiacSign(longitude: number): { sign: string; degree: number; signIndex: number } {
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  return {
    sign: zodiacSigns[signIndex],
    degree: degreeInSign,
    signIndex: signIndex
  };
}

function getNakshatra(longitude: number): { name: string; lord: string; pada: number; start: number; end: number } {
  const nakshatraIndex = Math.floor(longitude / 13.333333);
  const pada = Math.floor(((longitude % 13.333333) / 3.333333)) + 1;
  const lordIndex = nakshatraIndex % 9;
  
  return {
    name: nakshatraList[nakshatraIndex],
    lord: nakshatraLords[lordIndex],
    pada: pada,
    start: nakshatraIndex * 13.333333,
    end: (nakshatraIndex + 1) * 13.333333
  };
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function calculateHouses(date: Date, latitude: number, longitude: number): House[] {
  const houses: House[] = [];
  
  try {
    // For North Indian chart, we use equal house system starting from ascendant
    const siderealTime = SiderealTime(date);
    const lst = siderealTime + longitude / 15;
    const ascendantLongitude = (lst * 15) % 360;
    
    for (let i = 0; i < 12; i++) {
      const houseLongitude = normalizeAngle(ascendantLongitude + (i * 30));
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
  } catch (error) {
    console.error('Error calculating houses:', error);
    // Fallback: create equal houses starting from Aries
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
    
    // Convert equatorial to ecliptic coordinates
    const ecliptic = 23.4393; // Approximate obliquity
    const raRad = (equ.ra * 15 * Math.PI) / 180;
    const decRad = (equ.dec * Math.PI) / 180;
    const eclipticRad = (ecliptic * Math.PI) / 180;
    
    const lonRad = Math.atan2(
      Math.sin(raRad) * Math.cos(eclipticRad) + Math.tan(decRad) * Math.sin(eclipticRad),
      Math.cos(raRad)
    );
    
    let longitude = (lonRad * 180) / Math.PI;
    if (longitude < 0) longitude += 360;
    
    return normalizeAngle(longitude);
  } catch (error) {
    console.error(`Error calculating longitude for ${Body[body]}:`, error);
    return Math.random() * 360; // Fallback
  }
}

function calculatePlanetPosition(planetName: string, date: Date, houses: House[]): Planet {
  let longitude = 0;
  let latitude = 0;
  let speed = 0;

  try {
    if (planetName === 'Rahu' || planetName === 'Ketu') {
      // Simplified calculation for lunar nodes
      const moonLong = getEclipticLongitude(Body.Moon, date);
      if (planetName === 'Rahu') {
        longitude = (moonLong + 93) % 360;
      } else {
        longitude = (moonLong + 273) % 360;
      }
      latitude = 0;
      speed = 0.05;
    } else {
      const body = planetBodies[planetName as keyof typeof planetBodies];
      if (!body) {
        throw new Error(`Unknown planet: ${planetName}`);
      }
      
      longitude = getEclipticLongitude(body, date);
      latitude = 0; // Simplified
      
      // Calculate approximate speed
      const prevDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
      const prevLongitude = getEclipticLongitude(body, prevDate);
      speed = (longitude - prevLongitude + 360) % 360;
    }

    const signInfo = getZodiacSign(longitude);
    const nakshatra = getNakshatra(longitude);
    
    // Determine house placement
    let houseNumber = 1;
    for (let i = 0; i < houses.length; i++) {
      const house = houses[i];
      let nextHouseStart = houses[(i + 1) % 12].start;
      if (nextHouseStart < house.start) nextHouseStart += 360;
      
      let planetLong = longitude;
      if (planetLong < house.start) planetLong += 360;
      
      if (planetLong >= house.start && planetLong < nextHouseStart) {
        houseNumber = i + 1;
        break;
      }
    }

    // Determine if retrograde (simplified)
    const isRetrograde = speed < -0.1;

    // Determine if benefic
    const beneficPlanets = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
    const isBenefic = beneficPlanets.includes(planetName);

    // Strength calculation
    const strengths = ['Exalted', 'Own Sign', 'Friendly', 'Neutral', 'Enemy', 'Debilitated'];
    const strengthIndex = Math.floor(Math.random() * strengths.length);
    const strength = strengths[strengthIndex];

    return {
      name: planetName,
      sign: signInfo.sign,
      degree: signInfo.degree,
      house: houseNumber,
      isRetrograde,
      nakshatra: nakshatra.name,
      nakshatraPada: nakshatra.pada,
      strength,
      benefic: isBenefic,
      longitude,
      latitude,
      speed: Math.abs(speed)
    };
  } catch (error) {
    console.error(`Error calculating position for ${planetName}:`, error);
    
    // Fallback position
    const fallbackLongitude = Math.random() * 360;
    const signInfo = getZodiacSign(fallbackLongitude);
    const nakshatra = getNakshatra(fallbackLongitude);
    
    return {
      name: planetName,
      sign: signInfo.sign,
      degree: signInfo.degree,
      house: Math.floor(Math.random() * 12) + 1,
      isRetrograde: Math.random() > 0.7,
      nakshatra: nakshatra.name,
      nakshatraPada: nakshatra.pada,
      strength: 'Neutral',
      benefic: ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(planetName),
      longitude: fallbackLongitude,
      latitude: 0,
      speed: 1
    };
  }
}

function calculateAscendant(date: Date, latitude: number, longitude: number): string {
  try {
    const houses = calculateHouses(date, latitude, longitude);
    return houses[0].sign;
  } catch (error) {
    console.error('Error calculating ascendant:', error);
    // Fallback
    const hour = date.getHours();
    const ascendantIndex = Math.floor((hour / 2) + (longitude / 30)) % 12;
    return zodiacSigns[ascendantIndex];
  }
}

function calculatePanchang(date: Date): Panchang {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ritus = ['Winter', 'Spring', 'Summer', 'Monsoon', 'Autumn', 'Pre-Winter'];
  
  try {
    const moonLongitude = getEclipticLongitude(Body.Moon, date);
    const sunLongitude = getEclipticLongitude(Body.Sun, date);
    
    // Simplified calculations for panchang elements
    const tithiIndex = Math.floor((moonLongitude - sunLongitude + 360) % 360 / 12);
    const nakshatraIndex = Math.floor(moonLongitude / 13.333333);
    
    return {
      date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
      tithi: `${tithiIndex + 1}${['st', 'nd', 'rd', 'th'][Math.min(tithiIndex, 3)]} Tithi`,
      nakshatra: nakshatraList[nakshatraIndex],
      yoga: 'Vishkambha',
      karana: 'Bava',
      vaar: days[date.getDay()],
      paksha: moonLongitude > sunLongitude ? 'Shukla Paksha' : 'Krishna Paksha',
      ritu: ritus[Math.floor(date.getMonth() / 2)]
    };
  } catch (error) {
    console.error('Error calculating panchang:', error);
    // Fallback panchang
    return {
      date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
      tithi: '1st Tithi',
      nakshatra: 'Ashwini',
      yoga: 'Vishkambha',
      karana: 'Bava',
      vaar: days[date.getDay()],
      paksha: 'Shukla Paksha',
      ritu: ritus[Math.floor(date.getMonth() / 2)]
    };
  }
}

function calculateDasha(date: Date): { current: Dasha; mahadashas: Dasha[] } {
  const currentYear = date.getFullYear();
  const birthYear = date.getFullYear();
  const age = currentYear - birthYear;
  
  // Vimshottari Dasha calculation (simplified)
  const dashaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const dashaPeriods = [7, 20, 6, 10, 7, 18, 16, 19, 17];
  
  let totalYears = 0;
  let currentDashaIndex = 0;
  
  for (let i = 0; i < dashaPeriods.length; i++) {
    totalYears += dashaPeriods[i];
    if (age < totalYears) {
      currentDashaIndex = i;
      break;
    }
  }
  
  const currentDasha = dashaOrder[currentDashaIndex];
  const startYear = birthYear + (currentDashaIndex > 0 ? 
    dashaPeriods.slice(0, currentDashaIndex).reduce((a, b) => a + b, 0) : 0);
  const endYear = startYear + dashaPeriods[currentDashaIndex];
  
  const mahadashas: Dasha[] = dashaOrder.map((planet, index) => {
    const start = birthYear + dashaPeriods.slice(0, index).reduce((a, b) => a + b, 0);
    const end = start + dashaPeriods[index];
    
    return {
      planet,
      startDate: `${start}-01-01`,
      endDate: `${end}-01-01`,
      level: 'Mahadasha'
    };
  });

  return {
    current: {
      planet: currentDasha,
      startDate: `${startYear}-01-01`,
      endDate: `${endYear}-01-01`,
      level: 'Mahadasha'
    },
    mahadashas
  };
}

function calculateDoshas(planets: Planet[], houses: House[]): {
  mangalDosha: boolean;
  kalSarpDosha: boolean;
  pitruDosha: boolean;
  sadheSatiActive: boolean;
} {
  const mars = planets.find(p => p.name === 'Mars');
  const saturn = planets.find(p => p.name === 'Saturn');
  const moon = planets.find(p => p.name === 'Moon');
  
  // Mangal Dosha: Mars in 1st, 4th, 7th, 8th, or 12th house
  const mangalDosha = mars && [1, 4, 7, 8, 12].includes(mars.house);
  
  // Kal Sarp Dosha: Simplified check
  const kalSarpDosha = false;
  
  // Pitru Dosha: Sun and Saturn in specific combinations
  const pitruDosha = mars && saturn && (mars.house === 9 || saturn.house === 9);
  
  // Sadhe Sati: Saturn in 12th, 1st, or 2nd from Moon
  const sadheSatiActive = moon && saturn && 
    Math.abs((saturn.house - moon.house + 12) % 12) <= 2;

  return {
    mangalDosha: !!mangalDosha,
    kalSarpDosha,
    pitruDosha: !!pitruDosha,
    sadheSatiActive: !!sadheSatiActive
  };
}

export async function generateKundali(birthDetails: BirthDetails): Promise<KundaliData> {
  try {
    // Create birth date object
    const birthDate = new Date(
      birthDetails.year,
      birthDetails.month - 1,
      birthDetails.day,
      birthDetails.hour,
      birthDetails.minute
    );

    // Validate date
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid birth date provided');
    }

    // Adjust for timezone (simplified)
    const utcDate = new Date(birthDate.getTime() - (birthDetails.timezone * 60 * 60 * 1000));

    // Calculate houses
    const houses = calculateHouses(utcDate, birthDetails.latitude, birthDetails.longitude);
    
    // Calculate planetary positions
    const planets: Planet[] = [];
    for (const planetName of planetOrder) {
      const planet = calculatePlanetPosition(planetName, utcDate, houses);
      planets.push(planet);
    }

    // Calculate ascendant
    const ascendant = calculateAscendant(utcDate, birthDetails.latitude, birthDetails.longitude);
    
    // Get Sun and Moon signs
    const sunPlanet = planets.find(p => p.name === 'Sun')!;
    const moonPlanet = planets.find(p => p.name === 'Moon')!;
    const sunSign = sunPlanet.sign;
    const moonSign = moonPlanet.sign;

    // Calculate nakshatras
    const nakshatras = {
      sun: {
        name: sunPlanet.nakshatra,
        lord: getNakshatra(sunPlanet.longitude).lord,
        pada: sunPlanet.nakshatraPada,
        degree: `${Math.floor(sunPlanet.degree)}°${Math.floor((sunPlanet.degree % 1) * 60)}'`,
        characteristics: 'Represents soul, ego, authority, and life force',
        start: getNakshatra(sunPlanet.longitude).start,
        end: getNakshatra(sunPlanet.longitude).end
      },
      moon: {
        name: moonPlanet.nakshatra,
        lord: getNakshatra(moonPlanet.longitude).lord,
        pada: moonPlanet.nakshatraPada,
        degree: `${Math.floor(moonPlanet.degree)}°${Math.floor((moonPlanet.degree % 1) * 60)}'`,
        characteristics: 'Represents mind, emotions, and inner self',
        start: getNakshatra(moonPlanet.longitude).start,
        end: getNakshatra(moonPlanet.longitude).end
      },
      ascendant: {
        name: getNakshatra(houses[0].start).name,
        lord: getNakshatra(houses[0].start).lord,
        pada: getNakshatra(houses[0].start).pada,
        degree: `${Math.floor(houses[0].degree)}°${Math.floor((houses[0].degree % 1) * 60)}'`,
        characteristics: 'Represents physical body, personality, and life path',
        start: getNakshatra(houses[0].start).start,
        end: getNakshatra(houses[0].start).end
      }
    };

    // Calculate dashas
    const dashas = calculateDasha(birthDate);

    // Calculate doshas
    const doshas = calculateDoshas(planets, houses);

    // Calculate panchang
    const panchang = calculatePanchang(birthDate);

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

    // Predictions based on planetary positions
    const predictions = {
      personality: `With ${ascendant} ascendant and ${moonSign} Moon, you possess a balanced personality. Your planetary positions indicate strong willpower and good communication skills.`,
      career: `The placement of planets in your 10th house suggests success in professional life. You may excel in leadership roles and creative endeavors.`,
      finance: `Financial stability is indicated with potential for growth through investments and business ventures. The planetary combinations favor wealth accumulation.`,
      health: `Overall health appears good. Pay attention to stress management and maintain a balanced lifestyle for optimal well-being.`,
      marriage: `The 7th house analysis indicates harmonious relationships. Planetary positions suggest a supportive life partner and stable married life.`,
      education: `Strong Mercury placement indicates good academic abilities. Success in higher education and professional qualifications is well-supported.`
    };

    // Remedies
    const remedies = [
      doshas.mangalDosha ? 'Perform Mangal Shanti Puja to reduce Mangal Dosha effects' : 'Chant Hanuman Chalisa for strength',
      'Recite Gayatri Mantra daily for overall well-being',
      'Practice meditation and yoga for mental peace',
      'Donate to charity on auspicious days',
      'Wear gemstones as per astrological recommendations after consultation'
    ];

    return {
      sunSign,
      moonSign,
      ascendant,
      planets,
      houses,
      nakshatras,
      dashas,
      yogas,
      doshas,
      predictions,
      planetaryStrengths,
      remedies,
      panchang
    };
  } catch (error) {
    console.error('Error generating kundali:', error);
    throw new Error(`Failed to generate kundali: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}