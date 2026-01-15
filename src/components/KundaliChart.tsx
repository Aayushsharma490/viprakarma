"use client";

interface KundaliChartProps {
  planets: any[];
  houses: any[];
  ascendant: string;
}

const zodiacSigns: Record<string, string> = {
  Aries: "Ari",
  Taurus: "Tau",
  Gemini: "Gem",
  Cancer: "Can",
  Leo: "Leo",
  Virgo: "Vir",
  Libra: "Lib",
  Scorpio: "Sco",
  Sagittarius: "Sag",
  Capricorn: "Cap",
  Aquarius: "Aqu",
  Pisces: "Pis",
};

export default function KundaliChart({
  planets,
  houses,
  ascendant,
}: KundaliChartProps) {
  const planetNames: Record<string, string> = {
    Sun: "Su",
    Moon: "Mo",
    Mars: "Ma",
    Mercury: "Me",
    Jupiter: "Ju",
    Venus: "Ve",
    Saturn: "Sa",
    Rahu: "Ra",
    Ketu: "Ke",
  };

  // Group planets by house
  const planetsByHouse: Record<number, any[]> = {};
  for (let i = 1; i <= 12; i++) {
    planetsByHouse[i] = [];
  }
  planets.forEach((planet: any) => {
    const house = planet.house;
    if (house >= 1 && house <= 12) {
      planetsByHouse[house].push(planet);
    }
  });

  // PERFECT North Indian chart positions - each house centered in its triangle
  const positions = [
    { top: '22%', left: '50%' },    // 1 - Top center
    { top: '22%', left: '64%' },    // 2 - Top right
    { top: '36%', left: '78%' },    // 3 - Right top
    { top: '50%', left: '78%' },    // 4 - Right middle
    { top: '64%', left: '78%' },    // 5 - Right bottom
    { top: '78%', left: '64%' },    // 6 - Bottom right
    { top: '78%', left: '50%' },    // 7 - Bottom center
    { top: '78%', left: '36%' },    // 8 - Bottom left
    { top: '64%', left: '22%' },    // 9 - Left bottom
    { top: '50%', left: '22%' },    // 10 - Left middle
    { top: '36%', left: '22%' },    // 11 - Left top
    { top: '22%', left: '36%' },    // 12 - Top left
  ];

  return (
    <div className="flex flex-col items-center justify-center py-10 min-h-screen bg-[#3A1F00]">
      <h2 className="text-yellow-400 text-3xl font-bold mb-8 tracking-wide">
        Kundali Chart
      </h2>
      <div className="w-full max-w-[650px] aspect-square mx-auto p-4">
        <div className="w-full h-full relative border-4 border-orange-700 rounded-2xl bg-[#FFF8DC] shadow-2xl">
          {/* SVG for diamond and cross lines */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 500 500"
            className="absolute inset-0"
            preserveAspectRatio="none"
          >
            {/* Outer diamond */}
            <polygon
              points="250,10 490,250 250,490 10,250"
              fill="none"
              stroke="#D2691E"
              strokeWidth="3"
            />
            {/* Vertical center line */}
            <line x1="250" y1="10" x2="250" y2="490" stroke="#D2691E" strokeWidth="2.5" />
            {/* Horizontal center line */}
            <line x1="10" y1="250" x2="490" y2="250" stroke="#D2691E" strokeWidth="2.5" />
          </svg>

          {/* Houses and planets */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }).map((_, i) => {
              const houseNumber = i + 1;
              const planetsInHouse = planetsByHouse[houseNumber] || [];
              const isAscendant = houseNumber === 1;
              const position = positions[i];

              return (
                <div
                  key={houseNumber}
                  className="absolute"
                  style={{
                    top: position.top,
                    left: position.left,
                    transform: "translate(-50%, -50%)",
                    width: "110px",
                    zIndex: 10,
                  }}
                >
                  {/* House number */}
                  <div className="text-center text-base font-black mb-1 text-red-700">
                    {houseNumber}
                  </div>

                  {/* Planets with degrees */}
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    {planetsInHouse.length > 0 ? (
                      planetsInHouse.map((planet: any) => {
                        const degree = planet.degreeInSign ? planet.degreeInSign.toFixed(1) : '';
                        return (
                          <div key={planet.planet} className="text-center">
                            <span className="font-bold text-sm text-gray-800">
                              {degree}°
                            </span>
                            <br />
                            <span className="font-black text-base text-orange-800">
                              {planetNames[planet.planet] || planet.planet}
                              {planet.isRetrograde ? "*" : ""}
                            </span>
                          </div>
                        );
                      })
                    ) : isAscendant ? (
                      <div className="font-black text-sm text-teal-700">Lagna</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
