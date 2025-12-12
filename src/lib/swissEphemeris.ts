// Swiss Ephemeris integration using astronomy-engine
// High-precision astronomical calculations for Vedic astrology

import * as Astronomy from "astronomy-engine";

export interface SwissEphemerisData {
  planets: Array<{
    name: string;
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
    isRetrograde: boolean;
  }>;
  houses: Array<{
    cusp: number;
    house: number;
  }>;
  ascendant: number;
  mc: number;
  ayanamsa: number;
  julianDay: number;
}

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  latitude: number;
  longitude: number;
  timezone: number; // offset in hours
}

// Planet constants (matching Swiss Ephemeris)
export const PLANETS = {
  SUN: 0,
  MOON: 1,
  MERCURY: 2,
  VENUS: 3,
  MARS: 4,
  JUPITER: 5,
  SATURN: 6,
  URANUS: 7,
  NEPTUNE: 8,
  PLUTO: 9,
  MEAN_NODE: 10, // Rahu
  TRUE_NODE: 11,
  MEAN_APOG: 12, // Ketu
  OSCU_APOG: 13,
  CHIRON: 15,
  PHOLUS: 16,
  CERES: 17,
  PALLAS: 18,
  JUNO: 19,
  VESTA: 20,
  INTP_APOG: 21,
  INTP_PERG: 22,
} as const;

export const PLANET_NAMES = {
  [PLANETS.SUN]: "Sun",
  [PLANETS.MOON]: "Moon",
  [PLANETS.MERCURY]: "Mercury",
  [PLANETS.VENUS]: "Venus",
  [PLANETS.MARS]: "Mars",
  [PLANETS.JUPITER]: "Jupiter",
  [PLANETS.SATURN]: "Saturn",
  [PLANETS.URANUS]: "Uranus",
  [PLANETS.NEPTUNE]: "Neptune",
  [PLANETS.PLUTO]: "Pluto",
  [PLANETS.MEAN_NODE]: "Rahu",
  [PLANETS.MEAN_APOG]: "Ketu",
} as const;

// House system constants
export const HOUSE_SYSTEMS = {
  PLACIDUS: "P",
  KOCH: "K",
  EQUAL: "E",
  WHOLE_SIGN: "W",
  REGIOMONTANUS: "R",
  CAMPANUS: "C",
  MERIDIAN: "X",
} as const;

// Ayanamsa constants
export const AYANAMSAS = {
  LAHIRI: 1,
  RAMAN: 3,
  KRISHNAMURTI: 5,
  DJWHAL_KHUL: 7,
  FAGAN_BRADLEY: 8,
} as const;

export class SwissEphemerisCalculator {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Astronomy Engine doesn't need initialization
      this.initialized = true;
      console.log("Astronomy Engine initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Astronomy Engine:", error);
      throw error;
    }
  }

  /**
   * Calculate Julian Day from Gregorian date
   */
  calculateJulianDay(birthData: BirthData): number {
    const { year, month, day, hour, minute, second = 0, timezone } = birthData;

    // Convert local time to UTC
    // Calculate total minutes and handle day rollover properly
    const totalLocalMinutes = hour * 60 + minute;
    const timezoneMinutes = timezone * 60;
    const totalUTCMinutes = totalLocalMinutes - timezoneMinutes;

    let utcDay = day;
    let utcMonth = month;
    let utcYear = year;
    let utcHour = Math.floor(totalUTCMinutes / 60);
    let utcMinute = totalUTCMinutes % 60;
    const utcSecond = second;

    // Handle negative minutes
    if (utcMinute < 0) {
      utcHour -= 1;
      utcMinute += 60;
    }

    // Handle day rollover
    if (utcHour < 0) {
      utcHour += 24;
      utcDay -= 1;
      if (utcDay < 1) {
        utcMonth -= 1;
        if (utcMonth < 1) {
          utcMonth = 12;
          utcYear -= 1;
        }
        // Calculate last day of previous month
        utcDay = new Date(utcYear, utcMonth, 0).getDate();
      }
    } else if (utcHour >= 24) {
      utcHour -= 24;
      utcDay += 1;
      const daysInMonth = new Date(utcYear, utcMonth, 0).getDate();
      if (utcDay > daysInMonth) {
        utcDay = 1;
        utcMonth += 1;
        if (utcMonth > 12) {
          utcMonth = 1;
          utcYear += 1;
        }
      }
    }

    // Create UTC date using Date.UTC to ensure proper UTC handling
    const utcDate = new Date(
      Date.UTC(utcYear, utcMonth - 1, utcDay, utcHour, utcMinute, utcSecond)
    );

    // Use Astronomy Engine's MakeTime function
    const time = Astronomy.MakeTime(utcDate);
    // Convert UT (days since J2000) to Julian Day
    return time.ut + 2451545.0;
  }

  /**
   * Calculate planet positions
   */
  async calculatePlanetPositions(
    julianDay: number
  ): Promise<SwissEphemerisData["planets"]> {
    const planets: SwissEphemerisData["planets"] = [];

    // Convert Julian Day to Date for astronomy-engine
    const date = new Date((julianDay - 2440587.5) * 86400000);

    const planetMappings = [
      { id: PLANETS.SUN, name: "Sun", body: Astronomy.Body.Sun },
      { id: PLANETS.MOON, name: "Moon", body: Astronomy.Body.Moon },
      { id: PLANETS.MERCURY, name: "Mercury", body: Astronomy.Body.Mercury },
      { id: PLANETS.VENUS, name: "Venus", body: Astronomy.Body.Venus },
      { id: PLANETS.MARS, name: "Mars", body: Astronomy.Body.Mars },
      { id: PLANETS.JUPITER, name: "Jupiter", body: Astronomy.Body.Jupiter },
      { id: PLANETS.SATURN, name: "Saturn", body: Astronomy.Body.Saturn },
    ];

    for (const mapping of planetMappings) {
      try {
        const time = Astronomy.MakeTime(date);

        let longitude: number;
        let latitude: number;
        let distance: number;

        if (mapping.body === Astronomy.Body.Sun) {
          // Use SunPosition for accurate geocentric coordinates
          const sunPos = Astronomy.SunPosition(time);
          longitude = sunPos.elon;
          latitude = sunPos.elat;
          distance = 1.0; // Sun's distance is approximately 1 AU
        } else {
          // Calculate equatorial coordinates first
          const observer = new Astronomy.Observer(0, 0, 0);
          const equatorial = Astronomy.Equator(
            mapping.body,
            time,
            observer,
            false,
            true
          );

          // Convert to ecliptic coordinates using vector
          const ecliptic = Astronomy.Ecliptic(equatorial.vec);
          longitude = ecliptic.elon;
          latitude = ecliptic.elat;
          distance = equatorial.dist;
        }

        // Calculate speed (approximate)
        const time2 = Astronomy.MakeTime(
          new Date(date.getTime() + 24 * 60 * 60 * 1000)
        ); // 1 day later
        let longitude2: number;
        if (mapping.body === Astronomy.Body.Sun) {
          const sunPos2 = Astronomy.SunPosition(time2);
          longitude2 = sunPos2.elon;
        } else {
          longitude2 = Astronomy.EclipticLongitude(mapping.body, time2);
        }
        const speed = longitude2 - longitude;

        planets.push({
          name: mapping.name,
          longitude: longitude,
          latitude: latitude,
          distance: distance,
          speed: speed,
          isRetrograde: speed < 0,
        });
      } catch (error) {
        console.warn(
          `Failed to calculate position for ${mapping.name}:`,
          error
        );
      }
    }

    // Calculate lunar nodes (Rahu and Ketu) using proper astronomical calculation
    const time = Astronomy.MakeTime(date);

    // Calculate the Moon's position
    const moonEquatorial = Astronomy.Equator(
      Astronomy.Body.Moon,
      time,
      new Astronomy.Observer(0, 0, 0),
      false,
      true
    );
    const moonEcliptic = Astronomy.Ecliptic(moonEquatorial.vec);

    // For lunar nodes, we need to find where the Moon's orbit intersects the ecliptic
    // Lunar nodes REGRESS (move backwards) at approximately 19.34 degrees per year
    // Calculate node position based on date
    const daysSinceJ2000 = julianDay - 2451545.0;
    const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
    const nodeRegression = yearsSinceJ2000 * 19.34; // degrees per year (retrograde motion)

    // Mean node position for J2000.0: 125.04° (tropical)
    const baseNodeLongitude = 125.04;
    const nodeLongitude =
      (((baseNodeLongitude - nodeRegression) % 360) + 360) % 360;

    planets.push({
      name: "Rahu",
      longitude: nodeLongitude,
      latitude: 0, // Nodes are on ecliptic
      distance: 1, // Approximate distance
      speed: -0.053, // Lunar nodes move retrograde at about 0.053 degrees per day
      isRetrograde: true,
    });

    planets.push({
      name: "Ketu",
      longitude: (nodeLongitude + 180) % 360,
      latitude: 0,
      distance: 1,
      speed: -0.053,
      isRetrograde: true,
    });

    return planets;
  }

  /**
   * Calculate houses and angles
   */
  async calculateHouses(
    julianDay: number,
    latitude: number,
    longitude: number,
    houseSystem = HOUSE_SYSTEMS.WHOLE_SIGN
  ): Promise<{
    houses: SwissEphemerisData["houses"];
    ascendant: number;
    mc: number;
  }> {
    // Convert Julian Day to Date
    const date = new Date((julianDay - 2440587.5) * 86400000);

    try {
      // Calculate ascendant using astronomy-engine
      const observer = new Astronomy.Observer(latitude, longitude, 0);
      const time = Astronomy.MakeTime(date);

      // Get local sidereal time
      const gst = Astronomy.SiderealTime(time); // Greenwich Sidereal Time in hours
      const lst = gst + longitude / 15.0; // Local Sidereal Time in hours
      const ramc = (lst * 15.0) % 360; // Right Ascension of Midheaven in degrees

      // Calculate ascendant using proper formula (Jean Meeus method)
      // tan(Asc) = cos(RAMC) / (-sin(obliquity) × tan(latitude) - cos(obliquity) × sin(RAMC))
      const obliquity = 23.4397; // Obliquity of ecliptic in degrees
      const ramcRad = (ramc * Math.PI) / 180;
      const latRad = (latitude * Math.PI) / 180;
      const oblRad = (obliquity * Math.PI) / 180;

      const numerator = Math.cos(ramcRad);
      const denominator =
        -Math.sin(oblRad) * Math.tan(latRad) -
        Math.cos(oblRad) * Math.sin(ramcRad);

      let ascRad = Math.atan2(numerator, denominator);
      if (ascRad < 0) {
        ascRad += 2 * Math.PI;
      }

      const ascendant = ((ascRad * 180) / Math.PI) % 360;
      const mc = ramc % 360;

      // For whole sign houses, each house is 30 degrees starting from ascendant
      const houses: SwissEphemerisData["houses"] = Array.from(
        { length: 12 },
        (_, i) => ({
          cusp: (ascendant + i * 30) % 360,
          house: i + 1,
        })
      );

      return {
        houses,
        ascendant,
        mc,
      };
    } catch (error) {
      console.warn("Failed to calculate houses:", error);

      // Fallback: simple calculation
      const ascendant = (date.getHours() * 15 + longitude) % 360;

      return {
        houses: Array.from({ length: 12 }, (_, i) => ({
          cusp: (ascendant + i * 30) % 360,
          house: i + 1,
        })),
        ascendant,
        mc: (ascendant + 90) % 360,
      };
    }
  }

  /**
   * Calculate ayanamsa
   */
  async calculateAyanamsa(
    julianDay: number,
    ayanamsaType: number = AYANAMSAS.LAHIRI
  ): Promise<number> {
    const daysSinceJ2000 = julianDay - 2451545.0;
    const centuriesSinceJ2000 = daysSinceJ2000 / 36525.0;

    switch (ayanamsaType) {
      case AYANAMSAS.LAHIRI:
        // Lahiri ayanamsa calculation
        // Reference epoch: 1900-01-01 (JD 2415020.5), Ayanamsa = 22.46°
        // Rate: approximately 50.27 arcseconds per year (0.01397° per year)
        const jd1900 = 2415020.5;
        const yearsSince1900 = (julianDay - jd1900) / 365.25;
        const baseLahiri = 22.46;
        const annualIncreaseLahiri = 50.27 / 3600; // 50.27 arcseconds to degrees
        return baseLahiri + yearsSince1900 * annualIncreaseLahiri;

      case AYANAMSAS.RAMAN:
        // Raman ayanamsa (approximately 2 degrees less than Lahiri)
        const baseRaman = 21.85646389;
        const annualIncreaseRaman = 0.01398635;
        return baseRaman + (daysSinceJ2000 / 365.25) * annualIncreaseRaman;

      case AYANAMSAS.KRISHNAMURTI:
        // Krishnamurti ayanamsa (approximately 6 degrees less than Lahiri)
        const baseKrishnamurti = 17.85646389;
        const annualIncreaseKrishnamurti = 0.01398635;
        return (
          baseKrishnamurti +
          (daysSinceJ2000 / 365.25) * annualIncreaseKrishnamurti
        );

      case AYANAMSAS.DJWHAL_KHUL:
        // Djwhal Khul ayanamsa (approximately 4 degrees less than Lahiri)
        const baseDjwhal = 19.85646389;
        const annualIncreaseDjwhal = 0.01398635;
        return baseDjwhal + (daysSinceJ2000 / 365.25) * annualIncreaseDjwhal;

      case AYANAMSAS.FAGAN_BRADLEY:
        // Fagan-Bradley ayanamsa (approximately 1.5 degrees less than Lahiri)
        const baseFagan = 22.35646389;
        const annualIncreaseFagan = 0.01398635;
        return baseFagan + (daysSinceJ2000 / 365.25) * annualIncreaseFagan;

      default:
        // Default to Lahiri
        const baseDefault = 23.85646389;
        const annualIncreaseDefault = 0.01398635;
        return baseDefault + (daysSinceJ2000 / 365.25) * annualIncreaseDefault;
    }
  }

  /**
   * Main calculation function
   */
  async calculate(
    birthData: BirthData,
    ayanamsaType?: number
  ): Promise<SwissEphemerisData> {
    await this.initialize();

    const julianDay = this.calculateJulianDay(birthData);

    const [planets, housesData, ayanamsa] = await Promise.all([
      this.calculatePlanetPositions(julianDay),
      this.calculateHouses(julianDay, birthData.latitude, birthData.longitude),
      this.calculateAyanamsa(julianDay, ayanamsaType),
    ]);

    // Convert ascendant and MC from tropical to sidereal
    const ascendantSidereal = this.tropicalToSidereal(
      housesData.ascendant,
      ayanamsa
    );
    const mcSidereal = this.tropicalToSidereal(housesData.mc, ayanamsa);

    return {
      planets,
      houses: housesData.houses,
      ascendant: ascendantSidereal,
      mc: mcSidereal,
      ayanamsa,
      julianDay,
    };
  }

  /**
   * Convert tropical longitude to sidereal
   */
  tropicalToSidereal(longitude: number, ayanamsa: number): number {
    return (longitude - ayanamsa + 360) % 360;
  }

  /**
   * Convert sidereal longitude to tropical
   */
  siderealToTropical(longitude: number, ayanamsa: number): number {
    return (longitude + ayanamsa) % 360;
  }
}

// Export singleton instance
export const swissEphemeris = new SwissEphemerisCalculator();
