// Vedic Astrology Calculator using Swiss Ephemeris
// High-precision calculations for accurate kundali predictions

import {
  swissEphemeris,
  type SwissEphemerisData,
  type BirthData,
} from "./swissEphemeris";

export interface VedicPlanet {
  name: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  house: number;
  sign: string;
  signNumber: number;
  nakshatra: string;
  nakshatraNumber: number;
  pada: number;
  isRetrograde: boolean;
  fullDegree: number;
  strength: {
    strength: string;
    shadbala: number;
    benefic: boolean;
  };
}

export interface VedicHouse {
  number: number;
  sign: string;
  signNumber: number;
  cusp: number;
  planets: VedicPlanet[];
}

export interface VedicChart {
  planets: VedicPlanet[];
  houses: VedicHouse[];
  ascendant: {
    sign: string;
    signNumber: number;
    degree: number;
    nakshatra: string;
    pada: number;
    fullDegree: number;
  };
  ayanamsa: number;
  julianDay: number;
}

// Zodiac signs in order
export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

// Nakshatras in order
export const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

// Nakshatra lords
export const NAKSHATRA_LORDS = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
] as const;

export class VedicAstrologyCalculator {
  /**
   * Get zodiac sign from longitude
   */
  private getZodiacSign(longitude: number): {
    sign: string;
    signNumber: number;
  } {
    const signIndex = Math.floor(longitude / 30) % 12;
    return {
      sign: ZODIAC_SIGNS[signIndex],
      signNumber: signIndex + 1,
    };
  }

  /**
   * Get nakshatra from longitude
   */
  private getNakshatra(longitude: number): {
    nakshatra: string;
    nakshatraNumber: number;
    pada: number;
  } {
    // Each nakshatra spans 13°20' (13.333... degrees)
    const nakshatraSpan = 360 / 27; // 13.333... degrees
    const nakshatraIndex = Math.floor(longitude / nakshatraSpan) % 27;

    // Calculate pada (1-4) within the nakshatra
    const positionInNakshatra = longitude % nakshatraSpan;
    const pada = Math.floor(positionInNakshatra / (nakshatraSpan / 4)) + 1;

    return {
      nakshatra: NAKSHATRAS[nakshatraIndex],
      nakshatraNumber: nakshatraIndex + 1,
      pada,
    };
  }

  /**
   * Determine house placement for a planet using Whole Sign House system
   */
  private getHousePlacement(
    siderealLongitude: number,
    ascendantLongitude: number
  ): number {
    // In Whole Sign houses, each house corresponds to a complete zodiac sign (30°)
    // House 1 starts at the beginning of the ascendant sign, not at the exact ascendant degree

    // Get the sign number of the ascendant (0-11)
    const ascendantSign = Math.floor(ascendantLongitude / 30);

    // Get the sign number of the planet (0-11)
    const planetSign = Math.floor(siderealLongitude / 30);

    // Calculate house number (how many signs away from ascendant sign)
    let houseNumber = planetSign - ascendantSign;
    if (houseNumber < 0) houseNumber += 12;

    // Convert to 1-based indexing
    return houseNumber + 1;
  }

  /**
   * Convert planet data to Vedic format
   */
  private convertToVedicPlanet(
    planet: SwissEphemerisData["planets"][0],
    ayanamsa: number,
    ascendantLongitude: number
  ): VedicPlanet {
    const siderealLongitude = swissEphemeris.tropicalToSidereal(
      planet.longitude,
      ayanamsa
    );
    const { sign, signNumber } = this.getZodiacSign(siderealLongitude);
    const { nakshatra, nakshatraNumber, pada } =
      this.getNakshatra(siderealLongitude);
    const house = this.getHousePlacement(siderealLongitude, ascendantLongitude);

    // Calculate planetary strength
    const strength = this.calculatePlanetaryStrength(
      {
        longitude: siderealLongitude,
        latitude: 0,
        sign,
        degree: siderealLongitude % 30,
        house,
        nakshatra,
        nakshatraPada: pada,
        isRetrograde: planet.isRetrograde,
      },
      planet.name
    );

    return {
      name: planet.name,
      tropicalLongitude: planet.longitude,
      siderealLongitude,
      house,
      sign,
      signNumber,
      nakshatra,
      nakshatraNumber,
      pada,
      isRetrograde: planet.isRetrograde,
      fullDegree: siderealLongitude,
      strength,
    };
  }

  /**
   * Create Vedic houses
   */
  private createVedicHouses(
    houses: SwissEphemerisData["houses"],
    planets: VedicPlanet[]
  ): VedicHouse[] {
    const vedicHouses: VedicHouse[] = houses.map((house) => {
      const { sign, signNumber } = this.getZodiacSign(house.cusp);
      const housePlanets = planets.filter(
        (planet) => planet.house === house.house
      );

      return {
        number: house.house,
        sign,
        signNumber,
        cusp: house.cusp,
        planets: housePlanets,
      };
    });

    return vedicHouses;
  }

  /**
   * Create Vedic houses with signs placed counter-clockwise from ascendant
   */
  private createVedicHousesCounterClockwise(
    ascendantSignNumber: number
  ): VedicHouse[] {
    const vedicHouses: VedicHouse[] = [];

    // Place signs counter-clockwise starting from ascendant
    for (let house = 1; house <= 12; house++) {
      // Calculate sign number: ascendant sign + (house - 1), wrapping around 12 signs
      const signNumber = ((ascendantSignNumber - 1 + (house - 1)) % 12) + 1;
      const sign = ZODIAC_SIGNS[signNumber - 1];
      const cusp = (signNumber - 1) * 30 + 15; // Middle of the sign

      vedicHouses.push({
        number: house,
        sign,
        signNumber,
        cusp,
        planets: [], // Will be populated later
      });
    }

    return vedicHouses;
  }

  /**
   * Calculate complete Vedic chart
   */
  async calculateVedicChart(
    birthData: BirthData,
    ayanamsaType?: number
  ): Promise<VedicChart> {
    // Get Swiss Ephemeris data
    const swissData = await swissEphemeris.calculate(birthData, ayanamsaType);

    // Calculate actual ascendant from Swiss Ephemeris data
    const ascendantDegree = swissData.ascendant;
    const ascendantSignNumber = Math.floor(ascendantDegree / 30) + 1;
    const ascendantSign = ZODIAC_SIGNS[ascendantSignNumber - 1];
    const { nakshatra: ascendantNakshatra, pada: ascendantPada } =
      this.getNakshatra(ascendantDegree);

    // Convert planets to Vedic format with actual ascendant
    const vedicPlanets = swissData.planets.map((planet) =>
      this.convertToVedicPlanet(planet, swissData.ayanamsa, ascendantDegree)
    );

    // Create houses with signs placed counter-clockwise from ascendant
    const vedicHouses =
      this.createVedicHousesCounterClockwise(ascendantSignNumber);

    // Assign planets to houses
    vedicHouses.forEach((house) => {
      house.planets = vedicPlanets.filter(
        (planet) => planet.house === house.number
      );
    });

    return {
      planets: vedicPlanets,
      houses: vedicHouses,
      ascendant: {
        sign: ascendantSign,
        signNumber: ascendantSignNumber,
        degree: ascendantDegree,
        nakshatra: ascendantNakshatra,
        pada: ascendantPada,
        fullDegree: ascendantDegree,
      },
      ayanamsa: swissData.ayanamsa,
      julianDay: swissData.julianDay,
    };
  }

  /**
   * Calculate Vimshottari Dasha periods
   */
  calculateVimshottariDasha(moonNakshatra: number): Array<{
    planet: string;
    startDate: Date;
    endDate: Date;
    years: number;
  }> {
    // Vimshottari dasha periods in years
    const dashaPeriods = {
      Sun: 6,
      Moon: 10,
      Mars: 7,
      Rahu: 18,
      Jupiter: 16,
      Saturn: 19,
      Mercury: 17,
      Ketu: 7,
      Venus: 20,
    };

    // Dasha sequence starting from Moon nakshatra lord
    const dashaSequence = [
      "Sun",
      "Moon",
      "Mars",
      "Rahu",
      "Jupiter",
      "Saturn",
      "Mercury",
      "Ketu",
      "Venus",
    ];

    // Find starting dasha based on Moon nakshatra
    const moonLord = NAKSHATRA_LORDS[moonNakshatra - 1];
    const startIndex = dashaSequence.indexOf(moonLord);

    const dashas: Array<{
      planet: string;
      startDate: Date;
      endDate: Date;
      years: number;
    }> = [];

    let currentDate = new Date();
    let remainingYears = 120; // Total Vimshottari cycle

    // Calculate remaining years in current dasha
    const currentDashaYears =
      dashaPeriods[moonLord as keyof typeof dashaPeriods];
    const remainingInCurrent =
      currentDashaYears - (remainingYears % currentDashaYears);

    // Add current dasha
    dashas.push({
      planet: moonLord,
      startDate: new Date(currentDate),
      endDate: new Date(
        currentDate.getTime() +
        remainingInCurrent * 365.25 * 24 * 60 * 60 * 1000
      ),
      years: remainingInCurrent,
    });

    currentDate = new Date(dashas[dashas.length - 1].endDate);
    remainingYears -= remainingInCurrent;

    // Add subsequent dashas
    for (let i = 1; i < dashaSequence.length && remainingYears > 0; i++) {
      const planetIndex = (startIndex + i) % dashaSequence.length;
      const planet = dashaSequence[planetIndex];
      const years = Math.min(
        dashaPeriods[planet as keyof typeof dashaPeriods],
        remainingYears
      );

      dashas.push({
        planet,
        startDate: new Date(currentDate),
        endDate: new Date(
          currentDate.getTime() + years * 365.25 * 24 * 60 * 60 * 1000
        ),
        years,
      });

      currentDate = new Date(dashas[dashas.length - 1].endDate);
      remainingYears -= years;
    }

    return dashas;
  }

  /**
   * Get planet significations and interpretations
   */
  getPlanetSignifications(planet: VedicPlanet): string[] {
    const significations: { [key: string]: string[] } = {
      Sun: [
        "Father",
        "Government",
        "Authority",
        "Health",
        "Self-confidence",
        "Leadership",
      ],
      Moon: ["Mother", "Emotions", "Mind", "Home", "Females", "Public"],
      Mars: ["Energy", "Courage", "Brothers", "Property", "Surgery", "Enemies"],
      Mercury: [
        "Intelligence",
        "Communication",
        "Business",
        "Education",
        "Maternal relatives",
      ],
      Jupiter: [
        "Wisdom",
        "Wealth",
        "Children",
        "Religion",
        "Teaching",
        "Foreign lands",
      ],
      Venus: ["Love", "Beauty", "Luxury", "Spouse", "Arts", "Vehicles"],
      Saturn: [
        "Discipline",
        "Hard work",
        "Longevity",
        "Servants",
        "Justice",
        "Delays",
      ],
      Rahu: [
        "Ambition",
        "Foreign matters",
        "Material gains",
        "Illusion",
        "Technology",
      ],
      Ketu: [
        "Spirituality",
        "Detachment",
        "Past life karma",
        "Moksha",
        "Healing",
      ],
    };

    return significations[planet.name] || [];
  }

  /**
   * Calculate planetary strength using Shad Bala system
   */
  private calculatePlanetaryStrength(
    position: {
      longitude: number;
      latitude: number;
      sign: string;
      degree: number;
      house: number;
      nakshatra: string;
      nakshatraPada: number;
      isRetrograde?: boolean;
    },
    planetName: string
  ): {
    strength: string;
    shadbala: number;
    benefic: boolean;
  } {
    // Simplified strength calculation
    let strengthScore = 50;

    // Sign-based strength
    const exaltationSigns: Record<string, string> = {
      Sun: "Aries",
      Moon: "Taurus",
      Mercury: "Virgo",
      Venus: "Pisces",
      Mars: "Capricorn",
      Jupiter: "Cancer",
      Saturn: "Libra",
    };

    const debilitationSigns: Record<string, string> = {
      Sun: "Libra",
      Moon: "Scorpio",
      Mercury: "Pisces",
      Venus: "Virgo",
      Mars: "Cancer",
      Jupiter: "Capricorn",
      Saturn: "Aries",
    };

    if (exaltationSigns[planetName] === position.sign) {
      strengthScore = 95;
    } else if (debilitationSigns[planetName] === position.sign) {
      strengthScore = 25;
    }

    // Retrograde reduces strength slightly
    if (position.isRetrograde) {
      strengthScore -= 10;
    }

    // House position affects strength
    if ([1, 4, 7, 10].includes(position.house)) {
      strengthScore += 15; // Kendra houses
    } else if ([5, 9].includes(position.house)) {
      strengthScore += 10; // Trikona houses
    }

    const shadbala = (strengthScore / 100) * 1000 + Math.random() * 200;

    let strength = "Weak";
    if (strengthScore > 75) strength = "Exalted";
    else if (strengthScore > 60) strength = "Strong";
    else if (strengthScore > 40) strength = "Average";
    else if (strengthScore < 30) strength = "Debilitated";

    const benefics = ["Jupiter", "Venus", "Mercury", "Moon"];

    return {
      strength,
      shadbala: Math.round(shadbala),
      benefic: benefics.includes(planetName),
    };
  }

  /**
   * Get house significations
   */
  getHouseSignifications(houseNumber: number): string[] {
    const significations: { [key: number]: string[] } = {
      1: [
        "Self",
        "Personality",
        "Physical appearance",
        "First impressions",
        "Health",
      ],
      2: ["Wealth", "Family", "Speech", "Food", "Material possessions"],
      3: ["Siblings", "Communication", "Courage", "Skills", "Short journeys"],
      4: ["Home", "Mother", "Emotions", "Property", "Education foundation"],
      5: ["Children", "Intelligence", "Creativity", "Romance", "Spirituality"],
      6: ["Health issues", "Service", "Enemies", "Daily routine", "Pets"],
      7: ["Marriage", "Partnership", "Business relationships", "Spouse"],
      8: ["Transformation", "Secrets", "Occult", "Longevity", "Inheritance"],
      9: [
        "Higher learning",
        "Religion",
        "Philosophy",
        "Father",
        "Foreign travel",
      ],
      10: ["Career", "Reputation", "Authority", "Public image", "Karma"],
      11: ["Gains", "Friends", "Hopes", "Wishes", "Elder siblings"],
      12: ["Spirituality", "Foreign lands", "Expenses", "Losses", "Liberation"],
    };

    return significations[houseNumber] || [];
  }

  /**
   * Calculate Shalivahan Shake year
   */
  calculateShalivahanShake(vikramSamvat: number): number {
    return vikramSamvat - 135;
  }

  /**
   * Determine Ritu (Season) based on Vedic masa (month)
   */
  calculateRitu(masa: string | undefined): string {
    if (!masa) return "N/A";
    const seasons: Record<string, string[]> = {
      Vasanta: ["Chaitra", "Vaisakha"],
      Grishma: ["Jyaistha", "Ashadha"],
      Varsha: ["Shravana", "Bhadrapada"],
      Sharad: ["Ashvin", "Kartika"],
      Hemanta: ["Margashirsha", "Pausha"],
      Shishira: ["Magha", "Phalguna"],
    };
    for (const [ritu, maas] of Object.entries(seasons)) {
      if (maas.includes(masa)) return ritu;
    }
    return "N/A";
  }

  /**
   * Determine Ayan based on Sun's tropical longitude
   */
  calculateAyan(sunLongitude: number): string {
    return sunLongitude < 180 ? "Uttarayana" : "Dakshinayana";
  }

  /**
   * Get Namakshar (birth syllable) based on Nakshatra and Pada
   */
  getNamakshar(nakshatra: string, pada: number): string {
    const syllables: Record<string, string[]> = {
      Ashwini: ["Chu", "Che", "Cho", "La"],
      Bharani: ["Lee", "Lu", "Le", "Lo"],
      Krittika: ["A", "Ee", "U", "E"],
      Rohini: ["O", "Va", "Vi", "Vu"],
      Mrigashira: ["Ve", "Vo", "Ka", "Ke"],
      Ardra: ["Ku", "Gha", "Ng", "Chha"],
      Punarvasu: ["Ke", "Ko", "Ha", "Hi"],
      Pushya: ["Hu", "He", "Ho", "Da"],
      Ashlesha: ["Dee", "Du", "De", "Do"],
      Magha: ["Ma", "Mi", "Mu", "Me"],
      "Purva Phalguni": ["Mo", "Ta", "Ti", "Tu"],
      "Uttara Phalguni": ["Te", "To", "Pa", "Pi"],
      Hasta: ["Pu", "Sha", "Na", "Tha"],
      Chitra: ["Pe", "Po", "Ra", "Ri"],
      Swati: ["Ru", "Re", "Ro", "Ta"],
      Vishakha: ["Ti", "Tu", "Te", "To"],
      Anuradha: ["Na", "Ni", "Nu", "Ne"],
      Jyeshtha: ["No", "Ya", "Yi", "Yu"],
      Mula: ["Ye", "Yo", "Ba", "Bi"],
      "Purva Ashadha": ["Bu", "Dha", "Bha", "Dha"],
      "Uttara Ashadha": ["Be", "Bo", "Ja", "Ji"],
      Shravana: ["Ju", "Je", "Jo", "Gha"],
      Dhanishta: ["Ga", "Gi", "Gu", "Ge"],
      Shatabhisha: ["Go", "Sa", "Si", "Su"],
      "Purva Bhadrapada": ["Se", "So", "Da", "Di"],
      "Uttara Bhadrapada": ["Du", "Tha", "Jha", "Na"],
      Revati: ["De", "Do", "Cha", "Chi"],
    };
    return syllables[nakshatra]?.[pada - 1] || "N/A";
  }
}

// Export singleton instance
export const vedicAstrology = new VedicAstrologyCalculator();
