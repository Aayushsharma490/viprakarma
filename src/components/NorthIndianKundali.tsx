import React from "react";

// --- CONSTANTS (UNCHANGED) ---
const HINDU_NAMES: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve",
  Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Uranus: "Ur", Neptune: "Ne", Pluto: "Pl",
};
const PLANET_COLORS: Record<string, string> = {
  Sun: "#e63946", Moon: "#457b9d", Mars: "#2a9d8f", Mercury: "#457b9d", Jupiter: "#9d4edd",
  Venus: "#06a77d", Saturn: "#e63946", Rahu: "#e63946", Ketu: "#d4a574", Uranus: "#e63946",
  Neptune: "#2f3e46", Pluto: "#9d4edd",
};
const RASHI_ABBR: Record<string, string> = {
  Aries: "Ari", Taurus: "Tau", Gemini: "Gem", Cancer: "Can", Leo: "Leo", Virgo: "Vir",
  Libra: "Lib", Scorpio: "Sco", Sagittarius: "Sag", Capricorn: "Cap", Aquarius: "Aqu", Pisces: "Pis",
};

const WIDTH = 500;
const HEIGHT = 340;
const PADDING = 20;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

// House positions for PLANET/CONTENT placement (center of the cell).
// REFINED CENTROIDS to ensure text does not touch lines. Based on 500x340 SVG.
const HOUSE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: CENTER_X, y: 70 },               // Top Center (moved down slightly)
  2: { x: 160, y: 40 },                    // Top Left (Triangle)
  3: { x: 60, y: 80 },                     // Left Top (Triangle)
  4: { x: 80, y: CENTER_Y },               // Left Center (moved right slightly)
  5: { x: 60, y: HEIGHT - 80 },            // Left Bottom (Triangle)
  6: { x: 160, y: HEIGHT - 40 },           // Bottom Left (Triangle)
  7: { x: CENTER_X, y: HEIGHT - 70 },      // Bottom Center (moved up slightly)
  8: { x: WIDTH - 160, y: HEIGHT - 40 },   // Bottom Right (Triangle)
  9: { x: WIDTH - 60, y: HEIGHT - 80 },    // Right Bottom (Triangle)
  10: { x: WIDTH - 80, y: CENTER_Y },      // Right Center (moved left slightly)
  11: { x: WIDTH - 60, y: 80 },            // Right Top (Triangle)
  12: { x: WIDTH - 160, y: 40 },           // Top Right (Triangle)
};

// Corner positions for RASHI NUMBER (1-12) and RASHI ABBREVIATION (3-letter label)
// MIRRORED X COORDINATES
const RASHI_CORNER_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: CENTER_X + 15, y: PADDING + 35 },      // Was -15
  2: { x: CENTER_X - 45, y: PADDING + 35 },      // Was +45
  3: { x: PADDING + 35, y: PADDING + 35 },       // Was WIDTH - 35
  4: { x: PADDING + 35, y: CENTER_Y - 15 },      // Was WIDTH - 35
  5: { x: PADDING + 35, y: HEIGHT - PADDING - 35 }, // Was WIDTH - 35
  6: { x: CENTER_X - 45, y: HEIGHT - PADDING - 35 }, // Was +45
  7: { x: CENTER_X - 15, y: HEIGHT - PADDING - 35 }, // Was +15
  8: { x: CENTER_X + 45, y: HEIGHT - PADDING - 35 }, // Was -45
  9: { x: WIDTH - PADDING - 35, y: HEIGHT - PADDING - 35 }, // Was PADDING + 35
  10: { x: WIDTH - PADDING - 35, y: CENTER_Y + 15 }, // Was PADDING + 35
  11: { x: WIDTH - PADDING - 35, y: PADDING + 35 },  // Was PADDING + 35
  12: { x: CENTER_X + 45, y: PADDING + 35 },         // Was -45
};

// Zodiac Sign Index
const SIGN_INDEX: Record<string, number> = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4, Leo: 5, Virgo: 6,
  Libra: 7, Scorpio: 8, Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12,
};

type PlanetInput = {
  name?: string; planet?: string; house?: number; rashi?: string; sign?: string;
  degree?: number; isRetrograde?: boolean;
};

type NorthIndianKundaliProps = {
  planets?: PlanetInput[];
  houses?: Array<{ rashi?: string; sign?: string }>;
  title?: string;
};

export default function NorthIndianKundali({ planets = [], houses = [], title }: NorthIndianKundaliProps) {

  const planetsByHouse: Record<number, PlanetInput[]> = {};
  for (let i = 1; i <= 12; i++) planetsByHouse[i] = [];
  planets.forEach((planet) => {
    const house = planet.house ?? 0;
    if (house >= 1 && house <= 12) {
      planetsByHouse[house].push(planet);
    }
  });

  const normalizeSign = (raw: string | undefined | null): string => {
    const s = (raw || "").trim();
    if (!s) return "";
    const full = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return SIGN_INDEX[full] ? full : ""; // Simplified normalization
  };

  const asc = normalizeSign((houses?.[0]?.sign || houses?.[0]?.rashi || "").toString()) || "Aries";
  const ascIdx = SIGN_INDEX[asc] ?? 1;

  // Standard North Indian: House 1 is always fixed at Top Center.
  // No complex mapping needed. The "Sign" rotates, the "House" stays.


  // House Number to Sign mapping
  const houseToSign: Record<number, string> = {};
  if (houses.length >= 12) {
    for (let i = 0; i < 12; i++) {
      houseToSign[i + 1] = normalizeSign(houses[i].sign || houses[i].rashi);
    }
  }

  const drawChartGrid = () => (
    <g stroke="#f4a261" strokeWidth={1.5} fill="none">
      <rect x={PADDING} y={PADDING} width={WIDTH - PADDING * 2} height={HEIGHT - PADDING * 2} />
      <line x1={PADDING} y1={PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} />
      <line x1={WIDTH - PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} />
      <line x1={CENTER_X} y1={PADDING} x2={WIDTH - PADDING} y2={CENTER_Y} />
      <line x1={WIDTH - PADDING} y1={CENTER_Y} x2={CENTER_X} y2={HEIGHT - PADDING} />
      <line x1={CENTER_X} y1={HEIGHT - PADDING} x2={PADDING} y2={CENTER_Y} />
      <line x1={PADDING} y1={CENTER_Y} x2={CENTER_X} y2={PADDING} />
    </g>
  );

  const renderHouseContent = () => (
    <>
      {Array.from({ length: 12 }).map((_, idx) => {
        const houseNumber = idx + 1;
        const rashi = houseToSign[houseNumber];
        if (!rashi) return null;

        // FIXED HOUSE LOGIC: House 1 is always in Cell 1, House 2 in Cell 2, etc.
        const pos = HOUSE_POSITIONS[houseNumber];
        const cornerPos = RASHI_CORNER_POSITIONS[houseNumber];
        if (!pos || !cornerPos) return null;

        const rashiIndex = SIGN_INDEX[rashi];
        const { x: cx, y: cy } = pos;


        // FIXED House Numbers (1, 4, 7, 10) REMOVED per user request


        const planetsInHouse = planetsByHouse[houseNumber]
          .filter(p => {
            const name = p.name || p.planet || "";
            return !name.toLowerCase().includes("lagna") && !name.toLowerCase().includes("ascendant") && name.toLowerCase() !== "asc";
          });

        const numPlanets = planetsInHouse.length;

        // Optimized vertical placement for stacked text (Degree, Planet)
        const getPlanetStackPositions = (count: number) => {
          if (count === 0) return [];
          const offsetStep = 18; // Vertical space for two lines (Degree + Planet)
          // Shift planets down by 10px to make room for the larger House Number at center
          const planetCenterY = cy + 10;
          const startY = planetCenterY - ((count - 1) * offsetStep) / 2;
          return planetsInHouse.map((_, i) => ({
            x: cx,
            y: startY + i * offsetStep,
            degreeY: (startY + i * offsetStep) - 6, // Degree is slightly above planet
            planetY: (startY + i * offsetStep) + 6, // Planet is slightly below center
          }));
        };
        const planetPositions = getPlanetStackPositions(numPlanets);

        return (
          <g key={houseNumber}>
            {/* RASHI NUMBER REMOVED per user request */}


            {/* RASHI ABBREVIATION REMOVED per user request */}


            {/* HOUSE NUMBER (1-12) - Bigger, Black, Centered, Not Bold */}
            <text
              x={cx}
              y={cy - 20} // Moved up to avoid overlap with planets (now at cy+10)
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#000000"
              fontSize={14} // Increased size
              fontWeight={500} // Slight weight for readability, not bold
              fontFamily="sans-serif"
              opacity={0.9}
            >
              {rashiIndex}
            </text>

            {/* Planets with Degrees (Stacked vertically) */}
            {planetsInHouse.map((planet, i) => {

              const rawName = planet.name || planet.planet || "";
              const display = HINDU_NAMES[rawName as keyof typeof HINDU_NAMES] || rawName;
              const retro = planet.isRetrograde ? "*" : "";
              const color = PLANET_COLORS[rawName as keyof typeof PLANET_COLORS] || "#000000";
              const pos = planetPositions[i] || { x: cx, y: cy, degreeY: cy, planetY: cy };
              const degree = planet.degree ? planet.degree.toFixed(0).padStart(2, '0') : '';

              return (
                <g key={`${houseNumber}-${rawName}-${i}`}>
                  {/* Degree */}
                  {degree && (
                    <text
                      x={pos.x} y={pos.degreeY} textAnchor="middle" dominantBaseline="middle"
                      fontSize={12} fontWeight={400} fill="#000"
                    >
                      {degree}
                    </text>
                  )}
                  {/* Planet Abbreviation + Retrograde */}
                  <text
                    x={pos.x} y={pos.planetY} textAnchor="middle" dominantBaseline="middle"
                    fill={color} fontSize={16} fontWeight={700}
                  >
                    {display}
                    {retro}
                  </text>
                </g>
              );
            })}


            {/* HOUSE NUMBER REMOVED */}

          </g>
        );
      })}
    </>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      {title && (
        <h3 className="text-center text-lg font-semibold text-white">
          {title}
        </h3>
      )}
      <div className="rounded-xl w-[520px] max-w-full bg-[#ffffff] border-2 border-[#ddd] p-3">
        <div className="w-full h-[340px] relative">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#fef6e4" />
            {drawChartGrid()}
            {renderHouseContent()}
          </svg>
        </div>
      </div>
    </div>
  );
}