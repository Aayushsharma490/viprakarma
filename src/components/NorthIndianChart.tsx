// components/NorthIndianChart.tsx

import type { Planet, House } from '@/lib/astrologyApi';

interface NorthIndianChartProps {
  planets: Planet[];
  houses: House[];
  ascendant: string;
}

const PLANET_ABBREVIATIONS: { [key: string]: string } = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];


const HouseBox = ({ houseNumber, signIndex, planetsInHouse }: { houseNumber: number; signIndex: number; planetsInHouse: Planet[] }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center border border-amber-800 bg-amber-50">
      {/* Sign Number */}
      <span className="absolute top-1 left-1 text-xs text-amber-900 font-mono">{signIndex + 1}</span>
      
      {/* House Number (Lagna) */}
      {houseNumber === 1 && (
        <span className="text-sm font-bold text-red-600">Lg</span>
      )}
      
      {/* Planets */}
      <div className="text-center text-xs sm:text-sm font-semibold text-gray-800 flex flex-wrap gap-x-2 justify-center px-1">
        {planetsInHouse.map(planet => (
           <span key={planet.name} className={`${planet.isRetrograde ? 'underline' : ''}`}>
             {PLANET_ABBREVIATIONS[planet.name]}
           </span>
        ))}
      </div>
    </div>
  );
};


export default function NorthIndianChart({ planets, houses, ascendant }: NorthIndianChartProps) {
  if (!houses || houses.length === 0) {
    return <div>Loading chart...</div>;
  }

  const ascendantSignIndex = ZODIAC_SIGNS.indexOf(ascendant);

  // Map planets to their respective signs
  const planetsBySign: { [key: string]: Planet[] } = {};
  ZODIAC_SIGNS.forEach(sign => {
    planetsBySign[sign] = [];
  });
  planets.forEach(planet => {
    if (planetsBySign[planet.sign]) {
      planetsBySign[planet.sign].push(planet);
    }
  });

  // The order of houses in the North Indian chart layout
  const houseRenderOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // This is for grid layout
  
  return (
    <div className="w-full max-w-lg mx-auto aspect-square p-4 bg-white rounded-lg shadow-lg">
      <div className="relative w-full h-full">
        {/* Main rotated container for the diamond shape */}
        <div className="absolute inset-0 transform rotate-45">
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5">
            {/* The grid is laid out as if it were square, but the rotation creates the diamond */}
            {/* We map the house numbers to the grid positions */}
            {[
              { houseIndex: 11, gridPos: 'col-start-1 row-start-1' }, // House 12
              { houseIndex: 0, gridPos: 'col-start-2 row-start-1' },   // House 1 (Lagna)
              { houseIndex: 1, gridPos: 'col-start-3 row-start-1' },  // House 2
              { houseIndex: 10, gridPos: 'col-start-1 row-start-2' }, // House 11
              { houseIndex: 9, gridPos: 'col-start-3 row-start-2' }, // House 10
              { houseIndex: 8, gridPos: 'col-start-1 row-start-3' },  // House 9
              { houseIndex: 7, gridPos: 'col-start-2 row-start-3' }, // House 8
              { houseIndex: 6, gridPos: 'col-start-3 row-start-3' }, // House 7
            ].map(({ houseIndex, gridPos }) => {
              const house = houses[houseIndex];
              return (
                <div key={houseIndex} className={`transform -rotate-45 ${gridPos}`}>
                   <HouseBox
                    houseNumber={house.house}
                    signIndex={house.signIndex}
                    planetsInHouse={planetsBySign[house.sign]}
                  />
                </div>
              );
            })}

             {/* Center four houses */}
             <div className="col-start-2 row-start-2 grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
                {[
                    { houseIndex: 3, gridPos: 'col-start-1 row-start-1' }, // House 4
                    { houseIndex: 2, gridPos: 'col-start-2 row-start-1' }, // House 3
                    { houseIndex: 4, gridPos: 'col-start-1 row-start-2' }, // House 5
                    { houseIndex: 5, gridPos: 'col-start-2 row-start-2' }, // House 6
                ].map(({houseIndex, gridPos}) => {
                    const house = houses[houseIndex];
                    return (
                        <div key={houseIndex} className={`transform -rotate-45 ${gridPos}`}>
                             <HouseBox
                                houseNumber={house.house}
                                signIndex={house.signIndex}
                                planetsInHouse={planetsBySign[house.sign]}
                            />
                        </div>
                    )
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}