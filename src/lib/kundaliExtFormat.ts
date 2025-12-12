/**
 * Kundali EXT FORMAT Core Utilities
 * 
 * Self-contained logic to transform raw planetary data (EXT FORMAT) into
 * correct Kundali charts using Whole Sign house system. No data modification.
 * 
 * Input: EXT FORMAT JSON with ascendant, planets (lon), houses (optional cusps)
 * Output: Mapped data for North/South/East Indian chart rendering
 */

// ============================================================================
// CONSTANTS & MAPPINGS
// ============================================================================

export const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SIGN_ABBR = [
  'Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir',
  'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'
];

export const HINDU_PLANET_NAMES: Record<string, string> = {
  Sun: 'Surya',
  Moon: 'Chandra',
  Mars: 'Mangal',
  Mercury: 'Budh',
  Jupiter: 'Guru',
  Venus: 'Shukra',
  Saturn: 'Shani',
  Rahu: 'Rahu',
  Ketu: 'Ketu',
};

// Planet priority for collision handling (lower number = higher priority)
export const PLANET_PRIORITY: Record<string, number> = {
  Sun: 1,
  Moon: 2,
  Ascendant: 3,
  Mars: 4,
  Mercury: 5,
  Jupiter: 6,
  Venus: 7,
  Saturn: 8,
  Rahu: 9,
  Ketu: 10,
};

// Sign rulers (Vedic)
export const SIGN_RULERS: Record<number, string> = {
  0: 'Mars',    // Aries
  1: 'Venus',   // Taurus
  2: 'Mercury', // Gemini
  3: 'Moon',    // Cancer
  4: 'Sun',     // Leo
  5: 'Mercury', // Virgo
  6: 'Venus',   // Libra
  7: 'Mars',    // Scorpio
  8: 'Jupiter', // Sagittarius
  9: 'Saturn',  // Capricorn
  10: 'Saturn', // Aquarius
  11: 'Jupiter', // Pisces
};

export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// ============================================================================
// CORE MATH FUNCTIONS
// ============================================================================

/**
 * Normalize degree to [0, 360)
 */
export function normalize(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Get sign index (0-11) from longitude
 */
export function signIndexFromLon(lon: number): number {
  return Math.floor(normalize(lon) / 30);
}

/**
 * Get degree within sign (0-30)
 */
export function degreeInSign(lon: number): number {
  const normalized = normalize(lon);
  const signIdx = signIndexFromLon(normalized);
  return normalized - signIdx * 30;
}

/**
 * Get sign name from longitude
 */
export function getSignName(lon: number): string {
  return SIGN_NAMES[signIndexFromLon(lon)];
}

/**
 * Get sign abbreviation from longitude
 */
export function getSignAbbr(lon: number): string {
  return SIGN_ABBR[signIndexFromLon(lon)];
}

// ============================================================================
// HOUSE ASSIGNMENT (WHOLE SIGN - PRIMARY METHOD)
// ============================================================================

/**
 * Calculate house number (1-12) using Whole Sign system
 * 
 * @param planetLon Planet longitude (0-360)
 * @param ascLon Ascendant longitude (0-360)
 * @returns House number (1-12)
 */
export function planetHouseWholeSign(planetLon: number, ascLon: number): number {
  const pSign = signIndexFromLon(planetLon);
  const aSign = signIndexFromLon(ascLon);
  return ((pSign - aSign + 12) % 12) + 1;
}

/**
 * Generate Whole Sign house cusps from ascendant
 * 
 * @param ascLon Ascendant longitude (0-360)
 * @returns Array of 12 cusp degrees (house 1-12)
 */
export function generateWholeSignCusps(ascLon: number): number[] {
  const ascSign = signIndexFromLon(ascLon);
  const cusps: number[] = [];
  
  for (let i = 0; i < 12; i++) {
    const signIdx = (ascSign + i) % 12;
    cusps.push(signIdx * 30); // Each sign starts at signIndex * 30
  }
  
  return cusps;
}

/**
 * Get house cusp degree for a specific house (1-12) using Whole Sign
 * 
 * @param houseNum House number (1-12)
 * @param ascLon Ascendant longitude
 * @returns Cusp degree (0-360)
 */
export function getHouseCusp(houseNum: number, ascLon: number): number {
  const ascSign = signIndexFromLon(ascLon);
  const houseSign = (ascSign + houseNum - 1) % 12;
  return houseSign * 30;
}

/**
 * Calculate degree within house (0-30) for a planet
 * 
 * @param planetLon Planet longitude
 * @param houseNum House number (1-12)
 * @param ascLon Ascendant longitude
 * @returns Degree in house (0-30)
 */
export function degreeInHouse(planetLon: number, houseNum: number, ascLon: number): number {
  const houseCusp = getHouseCusp(houseNum, ascLon);
  const normalizedPlanet = normalize(planetLon);
  const normalizedCusp = normalize(houseCusp);
  
  // Calculate difference, handling wrap-around
  let diff = normalizedPlanet - normalizedCusp;
  if (diff < 0) diff += 360;
  
  // Return degree within the 30° house
  return diff % 30;
}

// ============================================================================
// CHART MAPPING (NORTH/SOUTH/EAST INDIAN)
// ============================================================================

/**
 * North Indian Chart: House-fixed, signs rotate
 * 
 * @param planetLon Planet longitude
 * @param ascLon Ascendant longitude
 * @returns House cell index (1-12) where planet should be placed
 */
export function northIndianHouseMapping(planetLon: number, ascLon: number): number {
  return planetHouseWholeSign(planetLon, ascLon);
}

/**
 * Get sign for a specific house in North Indian chart
 * 
 * @param houseNum House number (1-12)
 * @param ascLon Ascendant longitude
 * @returns Sign index (0-11)
 */
export function getNorthIndianHouseSign(houseNum: number, ascLon: number): number {
  const house1Sign = signIndexFromLon(ascLon);
  return (house1Sign + houseNum - 1) % 12;
}

/**
 * South Indian Chart: Sign-fixed, houses rotate
 * 
 * @param planetLon Planet longitude
 * @returns Sign box index (0-11) where planet should be placed
 */
export function southIndianSignMapping(planetLon: number): number {
  return signIndexFromLon(planetLon);
}

/**
 * Get house number for a planet in South Indian chart
 * 
 * @param planetLon Planet longitude
 * @param ascLon Ascendant longitude
 * @returns House number (1-12) to display in the sign box
 */
export function getSouthIndianPlanetHouse(planetLon: number, ascLon: number): number {
  return planetHouseWholeSign(planetLon, ascLon);
}

// ============================================================================
// NAKSHATRA & PADA
// ============================================================================

/**
 * Calculate Nakshatra index (0-26) from longitude
 */
export function getNakshatraIndex(lon: number): number {
  const normalized = normalize(lon);
  const nakshatraSize = 360 / 27; // 13°20' = 13.3333...
  return Math.floor(normalized / nakshatraSize);
}

/**
 * Get Nakshatra name from longitude
 */
export function getNakshatraName(lon: number): string {
  return NAKSHATRA_NAMES[getNakshatraIndex(lon)];
}

/**
 * Calculate Pada index (1-4) from longitude
 */
export function getPadaIndex(lon: number): number {
  const normalized = normalize(lon);
  const nakshatraSize = 360 / 27;
  const nakshatraDegree = normalized % nakshatraSize;
  const padaSize = nakshatraSize / 4; // 3°20' per pada
  return Math.floor(nakshatraDegree / padaSize) + 1;
}

// ============================================================================
// PLANET PROCESSING & COLLISION HANDLING
// ============================================================================

export interface ExtFormatPlanet {
  name: string;
  lon: number;
  speed?: number;
  retro?: boolean;
}

export interface ProcessedPlanet {
  name: string;
  hinduName: string;
  lon: number;
  signIndex: number;
  signName: string;
  signAbbr: string;
  degreeInSign: number;
  house: number;
  degreeInHouse: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  priority: number;
}

/**
 * Process a single planet from EXT FORMAT
 */
export function processPlanet(
  planet: ExtFormatPlanet,
  ascLon: number
): ProcessedPlanet {
  const normalizedLon = normalize(planet.lon);
  const signIdx = signIndexFromLon(normalizedLon);
  const degInSign = degreeInSign(normalizedLon);
  const house = planetHouseWholeSign(normalizedLon, ascLon);
  const degInHouse = degreeInHouse(normalizedLon, house, ascLon);
  
  // Detect retrograde if not explicitly set
  const isRetro = planet.retro ?? (planet.speed !== undefined && planet.speed < 0);
  
  return {
    name: planet.name,
    hinduName: HINDU_PLANET_NAMES[planet.name] || planet.name,
    lon: normalizedLon,
    signIndex: signIdx,
    signName: SIGN_NAMES[signIdx],
    signAbbr: SIGN_ABBR[signIdx],
    degreeInSign: degInSign,
    house,
    degreeInHouse: degInHouse,
    nakshatra: getNakshatraName(normalizedLon),
    pada: getPadaIndex(normalizedLon),
    retrograde: isRetro,
    priority: PLANET_PRIORITY[planet.name] || 99,
  };
}

/**
 * Group planets by house and sort by priority + degree
 */
export function groupPlanetsByHouse(
  planets: ProcessedPlanet[],
  maxStackSize: number = 6
): Record<number, ProcessedPlanet[]> {
  const byHouse: Record<number, ProcessedPlanet[]> = {};
  
  // Initialize all houses
  for (let i = 1; i <= 12; i++) {
    byHouse[i] = [];
  }
  
  // Group by house
  planets.forEach(planet => {
    byHouse[planet.house].push(planet);
  });
  
  // Sort each house: first by priority, then by degreeInHouse
  for (let i = 1; i <= 12; i++) {
    byHouse[i].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.degreeInHouse - b.degreeInHouse;
    });
    
    // Handle overflow: if more than maxStackSize, mark excess
    if (byHouse[i].length > maxStackSize) {
      // Keep first maxStackSize planets, mark rest as overflow
      const overflow = byHouse[i].length - maxStackSize;
      byHouse[i] = byHouse[i].slice(0, maxStackSize);
      // Store overflow count (can be used in rendering)
      (byHouse[i] as any).overflowCount = overflow;
    }
  }
  
  return byHouse;
}

// ============================================================================
// WHEEL CHART PLOTTING (SVG/CANVAS)
// ============================================================================

export type RotationMode = 'ASC_TOP' | 'ARIES_TOP';

export interface WheelPlotPoint {
  x: number;
  y: number;
  angle: number;
  radius: number;
}

/**
 * Convert longitude to screen coordinates for wheel chart
 * 
 * @param lon Planet longitude (0-360)
 * @param ascLon Ascendant longitude (0-360)
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param baseRadius Base radius from center
 * @param ringIndex Ring index for stacking (0 = innermost)
 * @param ringSpacing Spacing between rings
 * @param rotationMode 'ASC_TOP' (ascendant at top) or 'ARIES_TOP' (Aries at top)
 */
export function plotWheelPoint(
  lon: number,
  ascLon: number,
  centerX: number,
  centerY: number,
  baseRadius: number,
  ringIndex: number = 0,
  ringSpacing: number = 20,
  rotationMode: RotationMode = 'ASC_TOP'
): WheelPlotPoint {
  const normalizedLon = normalize(lon);
  const normalizedAsc = normalize(ascLon);
  
  let finalLon: number;
  if (rotationMode === 'ASC_TOP') {
    // Rotate so ascendant appears at top (90° in screen coords)
    finalLon = normalize(normalizedLon - normalizedAsc);
  } else {
    // Aries at top
    finalLon = normalizedLon;
  }
  
  // Convert to screen angle: 0° at top = 90° in math coords
  const screenDeg = 90 - finalLon;
  const rad = (screenDeg * Math.PI) / 180;
  
  const radius = baseRadius + ringIndex * ringSpacing;
  const x = centerX + radius * Math.cos(rad);
  const y = centerY + radius * Math.sin(rad);
  
  return { x, y, angle: screenDeg, radius };
}

// ============================================================================
// SIGN & HOUSE RULERS
// ============================================================================

/**
 * Get ruler of a sign
 */
export function getSignRuler(signIndex: number): string {
  return SIGN_RULERS[signIndex] || 'Unknown';
}

/**
 * Get ruler of a house (sign ruler of the house's sign)
 */
export function getHouseRuler(houseNum: number, ascLon: number): string {
  const houseSign = getNorthIndianHouseSign(houseNum, ascLon);
  return getSignRuler(houseSign);
}

// ============================================================================
// MAIN PROCESSING FUNCTION
// ============================================================================

export interface ExtFormatInput {
  ascendant: number;
  ayanamsa?: number;
  planets: ExtFormatPlanet[];
  houses?: number[]; // Optional: 12 cusp degrees (if provided, use them; otherwise generate Whole Sign)
  datetime_utc?: string;
  location?: { lat: number; lon: number };
}

export interface ProcessedKundaliData {
  ascendant: {
    lon: number;
    signIndex: number;
    signName: string;
    signAbbr: string;
    degreeInSign: number;
  };
  planets: ProcessedPlanet[];
  planetsByHouse: Record<number, ProcessedPlanet[]>;
  houses: {
    cusps: number[];
    signs: number[]; // Sign index for each house (1-12)
  };
  nakshatras: {
    ascendant: { name: string; pada: number };
    moon?: { name: string; pada: number };
  };
}

/**
 * Process complete EXT FORMAT input into renderable Kundali data
 */
export function processExtFormat(input: ExtFormatInput): ProcessedKundaliData {
  const normalizedAsc = normalize(input.ascendant);
  const ascSignIdx = signIndexFromLon(normalizedAsc);
  
  // Generate or use provided house cusps
  const houseCusps = input.houses && input.houses.length === 12
    ? input.houses.map(normalize) // Use provided cusps (normalized)
    : generateWholeSignCusps(normalizedAsc); // Generate Whole Sign cusps
  
  // Process all planets
  const processedPlanets = input.planets.map(p => processPlanet(p, normalizedAsc));
  
  // Find Moon for nakshatra
  const moon = processedPlanets.find(p => p.name === 'Moon');
  
  // Group by house with collision handling
  const planetsByHouse = groupPlanetsByHouse(processedPlanets, 6);
  
  // Get house signs
  const houseSigns: number[] = [];
  for (let i = 1; i <= 12; i++) {
    houseSigns.push(getNorthIndianHouseSign(i, normalizedAsc));
  }
  
  return {
    ascendant: {
      lon: normalizedAsc,
      signIndex: ascSignIdx,
      signName: SIGN_NAMES[ascSignIdx],
      signAbbr: SIGN_ABBR[ascSignIdx],
      degreeInSign: degreeInSign(normalizedAsc),
    },
    planets: processedPlanets,
    planetsByHouse,
    houses: {
      cusps: houseCusps,
      signs: houseSigns,
    },
    nakshatras: {
      ascendant: {
        name: getNakshatraName(normalizedAsc),
        pada: getPadaIndex(normalizedAsc),
      },
      moon: moon ? {
        name: moon.nakshatra,
        pada: moon.pada,
      } : undefined,
    },
  };
}

