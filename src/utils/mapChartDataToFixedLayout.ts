export type PlanetPlacementInput = {
  planet: string;
  signNumber: number;
  degree?: number;
  isRetrograde?: boolean;
};

export type FixedHouseData = {
  houseNumber: number;
  signNumber: number;
  planets: PlanetPlacementInput[];
};

export type ChartDataPayload = {
  ascendantSignNumber: number;
  planetPlacements: PlanetPlacementInput[];
};

/**
 * Maps Whole-Sign chart data to the 12 fixed North-Indian house boxes.
 * House 1 corresponds to the top diamond, and houses proceed anti-clockwise.
 */
export const mapChartDataToFixedLayout = (
  ascendantSignNumber: number,
  planetPlacements: PlanetPlacementInput[] = [],
): FixedHouseData[] => {
  const safeAsc = normalizeSignNumber(ascendantSignNumber);

  const fixedHouses: FixedHouseData[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNumber = idx + 1;
    const signNumber = normalizeSignNumber(((safeAsc + idx - 1) % 12) + 1);
    return {
      houseNumber,
      signNumber,
      planets: [],
    };
  });

  planetPlacements.forEach((planet) => {
    const target = fixedHouses.find(
      (house) => house.signNumber === normalizeSignNumber(planet.signNumber),
    );
    if (target) {
      target.planets.push({
        planet: planet.planet,
        signNumber: target.signNumber,
        degree: planet.degree,
        isRetrograde: planet.isRetrograde,
      });
    }
  });

  return fixedHouses;
};

const normalizeSignNumber = (value: number): number => {
  if (!Number.isFinite(value)) return 1;
  const normalized = Math.trunc(value);
  const mod = normalized % 12;
  return mod <= 0 ? mod + 12 : mod;
};


