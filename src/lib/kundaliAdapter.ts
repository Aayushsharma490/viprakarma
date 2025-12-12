/**
 * Kundali Adapter: Converts backend API response to EXT FORMAT
 * 
 * This adapter bridges the gap between your current backend format
 * and the EXT FORMAT system, ensuring data safety (no modification).
 */

import type { ExtFormatInput, ExtFormatPlanet } from './kundaliExtFormat';

export interface BackendPlanet {
  name: string;
  longitude: number;
  degreeInSign?: number;
  sign: string;
  house: number;
  isRetrograde?: boolean;
  speed?: number;
}

export interface BackendHouse {
  house: number;
  cusp?: number;
  sign: string;
}

export interface BackendKundaliData {
  ascendant: {
    degree: number;
    sign: string;
  };
  planets: BackendPlanet[];
  houses: BackendHouse[];
  charts?: {
    d1?: any;
    chandra?: any;
    d9?: any;
    d10?: any;
  };
}

/**
 * Convert backend planet format to EXT FORMAT planet
 */
function convertPlanet(planet: BackendPlanet): ExtFormatPlanet {
  return {
    name: planet.name,
    lon: planet.longitude, // Use as-is, no modification
    speed: planet.speed,
    retro: planet.isRetrograde ?? (planet.speed !== undefined && planet.speed < 0),
  };
}

/**
 * Extract house cusps from backend houses array
 * If cusps are not provided, returns undefined (will generate Whole Sign)
 */
function extractHouseCusps(houses: BackendHouse[]): number[] | undefined {
  if (!houses || houses.length !== 12) return undefined;
  
  // Check if all houses have cusp values
  const hasCusps = houses.every(h => h.cusp !== undefined);
  if (!hasCusps) return undefined;
  
  // Sort by house number and extract cusps
  const sorted = [...houses].sort((a, b) => a.house - b.house);
  return sorted.map(h => h.cusp!);
}

/**
 * Convert backend D1 (Lagna) chart to EXT FORMAT
 */
export function backendToExtFormatD1(data: BackendKundaliData): ExtFormatInput {
  const ascLon = data.ascendant.degree;
  const houseCusps = extractHouseCusps(data.houses);
  
  return {
    ascendant: ascLon,
    planets: data.planets.map(convertPlanet),
    houses: houseCusps, // If undefined, EXT FORMAT will generate Whole Sign
  };
}

/**
 * Convert backend Chandra (Moon) chart to EXT FORMAT
 * Assumes backend provides charts.chandra with planets and houses
 */
export function backendToExtFormatChandra(data: BackendKundaliData): ExtFormatInput | null {
  const chandra = data.charts?.chandra;
  if (!chandra) return null;
  
  // Find Moon's longitude from main planets
  const moon = data.planets.find(p => p.name === 'Moon');
  if (!moon) return null;
  
  // For Chandra chart, Moon's sign becomes house 1
  // We need to extract planets from chandra placements
  const chandraPlanets: ExtFormatPlanet[] = [];
  
  // If chandra has placements structure
  if (chandra.placements) {
    Object.values(chandra.placements).forEach((placement: any) => {
      placement.planets?.forEach((p: any) => {
        // Find corresponding planet longitude from main data
        const mainPlanet = data.planets.find(mp => mp.name === p.name);
        if (mainPlanet) {
          chandraPlanets.push({
            name: p.name,
            lon: mainPlanet.longitude, // Use main longitude (same for all vargas if not calculated separately)
            retro: p.retrograde ?? mainPlanet.isRetrograde,
          });
        }
      });
    });
  }
  
  // Moon's longitude becomes ascendant for Chandra chart
  return {
    ascendant: moon.longitude,
    planets: chandraPlanets,
    houses: undefined, // Generate Whole Sign from Moon's sign
  };
}

/**
 * Convert backend D9 (Navamsa) chart to EXT FORMAT
 */
export function backendToExtFormatD9(data: BackendKundaliData): ExtFormatInput | null {
  const d9 = data.charts?.d9;
  if (!d9) return null;
  
  // For D9, we need Navamsa ascendant
  // Typically, Navamsa ascendant = (D1 ascendant % 30) / 3 mapped to sign
  // But we'll use the first house sign from d9 placements if available
  const d9Planets: ExtFormatPlanet[] = [];
  let d9AscLon: number | undefined;
  
  if (d9.placements) {
    // Find house 1 to get ascendant
    const house1 = Object.values(d9.placements).find((p: any) => p.house === 1);
    if (house1) {
      // Infer ascendant from house 1 sign
      const signIndex = getSignIndexFromName(house1.sign);
      d9AscLon = signIndex * 30; // Whole Sign: sign start
    }
    
    Object.values(d9.placements).forEach((placement: any) => {
      placement.planets?.forEach((p: any) => {
        const mainPlanet = data.planets.find(mp => mp.name === p.name);
        if (mainPlanet) {
          // For D9, we might need Navamsa longitude if backend provides it
          // Otherwise, use main longitude (will be recalculated in EXT FORMAT if needed)
          d9Planets.push({
            name: p.name,
            lon: mainPlanet.longitude, // TODO: Use navamsa longitude if available
            retro: p.retrograde ?? mainPlanet.isRetrograde,
          });
        }
      });
    });
  }
  
  if (!d9AscLon) {
    // Fallback: calculate Navamsa ascendant from D1
    const d1Asc = data.ascendant.degree;
    const d1AscInSign = d1Asc % 30;
    const navamsaIndex = Math.floor(d1AscInSign / (30 / 9));
    const d1SignIndex = Math.floor(d1Asc / 30);
    // Navamsa sign calculation (simplified)
    const navamsaSignIndex = (d1SignIndex * 9 + navamsaIndex) % 12;
    d9AscLon = navamsaSignIndex * 30;
  }
  
  return {
    ascendant: d9AscLon,
    planets: d9Planets,
    houses: undefined, // Generate Whole Sign
  };
}

/**
 * Convert backend D10 (Dashamsa) chart to EXT FORMAT
 */
export function backendToExtFormatD10(data: BackendKundaliData): ExtFormatInput | null {
  const d10 = data.charts?.d10;
  if (!d10) return null;
  
  const d10Planets: ExtFormatPlanet[] = [];
  let d10AscLon: number | undefined;
  
  if (d10.placements) {
    const house1 = Object.values(d10.placements).find((p: any) => p.house === 1);
    if (house1) {
      const signIndex = getSignIndexFromName(house1.sign);
      d10AscLon = signIndex * 30;
    }
    
    Object.values(d10.placements).forEach((placement: any) => {
      placement.planets?.forEach((p: any) => {
        const mainPlanet = data.planets.find(mp => mp.name === p.name);
        if (mainPlanet) {
          d10Planets.push({
            name: p.name,
            lon: mainPlanet.longitude, // TODO: Use dashamsa longitude if available
            retro: p.retrograde ?? mainPlanet.isRetrograde,
          });
        }
      });
    });
  }
  
  if (!d10AscLon) {
    // Fallback: calculate Dashamsa ascendant from D1
    const d1Asc = data.ascendant.degree;
    const d1AscInSign = d1Asc % 30;
    const dashamsaIndex = Math.floor(d1AscInSign / (30 / 10));
    const d1SignIndex = Math.floor(d1Asc / 30);
    const dashamsaSignIndex = (d1SignIndex * 10 + dashamsaIndex) % 12;
    d10AscLon = dashamsaSignIndex * 30;
  }
  
  return {
    ascendant: d10AscLon,
    planets: d10Planets,
    houses: undefined, // Generate Whole Sign
  };
}

/**
 * Helper: Get sign index (0-11) from sign name
 */
function getSignIndexFromName(signName: string): number {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs.findIndex(s => s.toLowerCase() === signName.toLowerCase()) || 0;
}

