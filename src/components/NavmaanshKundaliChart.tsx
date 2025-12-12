'use client';

import NorthIndianKundali from './NorthIndianKundali';

interface PlacementMap {
  [key: string]: {
    house: number;
    sign: string;
    planets: Array<{ name: string; retrograde?: boolean }>;
  };
}

interface NavmaanshKundaliChartProps {
  planets: any[];
  placements?: PlacementMap;
  title?: string;
}

const mapPlacementsToPlanets = (placements?: PlacementMap) => {
  if (!placements) return [];
  return Object.values(placements)
    .sort((a, b) => a.house - b.house)
    .flatMap((house) =>
      house.planets.map((planet) => ({
        planet: planet.name,
        name: planet.name,
        house: house.house,
        rashi: house.sign,
        sign: house.sign,
        isRetrograde: planet.retrograde,
      })),
    );
};

const mapPlacementsToHouses = (placements?: PlacementMap) => {
  if (!placements) return [];
  return Object.values(placements)
    .sort((a, b) => a.house - b.house)
    .map((house) => ({ rashi: house.sign, sign: house.sign }));
};

export default function NavmaanshKundaliChart({
  planets,
  placements,
  title = 'Navamsa (D9)',
}: NavmaanshKundaliChartProps) {
  const planetData = placements ? mapPlacementsToPlanets(placements) : planets;
  const houseData = placements ? mapPlacementsToHouses(placements) : [];

  return <NorthIndianKundali planets={planetData} houses={houseData} title={title} />;
}
