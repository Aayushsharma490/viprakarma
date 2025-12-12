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
    Sun: "Surya",
    Moon: "Chandra",
    Mars: "Mangal",
    Mercury: "Budh",
    Jupiter: "Guru",
    Venus: "Shukra",
    Saturn: "Shani",
    Rahu: "Rahu",
    Ketu: "Ketu",
  };

  // Group planets by house using planet.house from backend
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

  return (
    <div className="flex flex-col items-center justify-center py-10 min-h-screen bg-[#3A1F00]">
      <h2 className="text-yellow-400 text-3xl font-bold mb-8 tracking-wide">
        Kundali
      </h2>
      {/* FIX MODE: pure CSS grid with stable quadrants and perfect square */}
      <div className="w-full max-w-[520px] aspect-square mx-auto">
        <div className="chart-grid grid grid-cols-3 grid-rows-3 w-full h-full relative border-4 border-white rounded-xl">
          {/* 9 cells — center always stable */}
          {[...Array(9)].map((_, idx) => (
            <div
              key={idx}
              className="relative flex items-center justify-center"
            />
          ))}
          {/* North-Indian style overlay kept via absolute positioned content */}
          <div className="absolute inset-0">
            {/* Outer diamond */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 500 500"
              className="absolute inset-0"
            >
              <polygon
                points="250,0 500,250 250,500 0,250"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              />
            </svg>
            {/* House content positioned in fixed quadrants */}
            {Array.from({ length: 12 }).map((_, i) => {
              const houseNumber = i + 1;
              const planetsInHouse = planetsByHouse[houseNumber] || [];
              const isAscendant = houseNumber === 1;
              // 3x3 grid coordinates
              const row = Math.floor((i % 12) / 4);
              const col = (i % 4) % 3;
              const top = `${(row + 0.5) * (100 / 3)}%`;
              const left = `${(col + 0.5) * (100 / 3)}%`;
              return (
                <div
                  key={houseNumber}
                  className="absolute text-center"
                  style={{
                    top,
                    left,
                    transform: "translate(-50%, -50%)",
                    width: "80px",
                    zIndex: 2,
                  }}
                >
                  <div className="text-xs font-bold mb-1 text-white">
                    {houseNumber}{" "}
                    {houses &&
                      houses[houseNumber - 1] &&
                      zodiacSigns[houses[houseNumber - 1].rashi]}
                  </div>
                  <div className="flex flex-col items-center justify-center text-[#FFD600] text-sm leading-tight min-h-[70px]">
                    {planetsInHouse.length > 0 ? (
                      planetsInHouse.map((planet: any) => (
                        <div key={planet.planet} className="font-bold">
                          {planetNames[planet.planet] || planet.planet}
                          {planet.isRetrograde ? "*" : ""}
                        </div>
                      ))
                    ) : isAscendant ? (
                      <div className="font-bold">Lagna</div>
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
