import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// --- CONSTANTS ---
const HINDU_NAMES: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve",
  Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Uranus: "Ur", Neptune: "Ne", Pluto: "Pl",
};

// Hindi planet names (full names)
const HINDI_NAMES: Record<string, string> = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध",
  Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि",
  Rahu: "राहु", Ketu: "केतु", Uranus: "यूरेनस",
  Neptune: "नेप्च्यून", Pluto: "प्लूटो",
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

const WIDTH = 700;
const HEIGHT = 700;
const PADDING = 40;  // Increased from 20 to 40
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

// House positions for PLANET/CONTENT placement (center of the cell).
// ADJUSTED for larger chart with more padding and to keep content inside boundaries
const HOUSE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: CENTER_X, y: 180 },              // Top center - House 1
  2: { x: 220, y: 100 },                   // Top left - House 2  
  3: { x: 100, y: 220 },                   // Left top - House 3
  4: { x: 160, y: CENTER_Y },              // Left center - House 4
  5: { x: 100, y: 480 },                   // Left bottom - House 5
  6: { x: 220, y: 600 },                   // Bottom left - House 6
  7: { x: CENTER_X, y: 520 },              // Bottom center - House 7
  8: { x: 480, y: 600 },                   // Bottom right - House 8
  9: { x: 600, y: 480 },                   // Right bottom - House 9
  10: { x: 540, y: CENTER_Y },             // Right center - House 10
  11: { x: 600, y: 220 },                  // Right top - House 11
  12: { x: 480, y: 100 },                  // Top right - House 12
};

const RASHI_CORNER_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: CENTER_X, y: 240 },             // Bottom of H1
  2: { x: 280, y: 30 },                   // Top Right of H2
  3: { x: 30, y: 280 },                   // Bottom Left of H3
  4: { x: 240, y: CENTER_Y },             // Right of H4
  5: { x: 30, y: HEIGHT - 280 },          // Top Left of H5
  6: { x: 280, y: HEIGHT - 30 },          // Bottom Right of H6
  7: { x: CENTER_X, y: HEIGHT - 240 },    // Top of H7
  8: { x: WIDTH - 280, y: HEIGHT - 30 },  // Bottom Left of H8
  9: { x: WIDTH - 30, y: HEIGHT - 280 },  // Top Right of H9
  10: { x: WIDTH - 240, y: CENTER_Y },    // Left of H10
  11: { x: WIDTH - 30, y: 280 },          // Bottom Right of H11
  12: { x: WIDTH - 280, y: 30 },          // Top Left of H12
};

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
  const { language } = useLanguage();

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
    return SIGN_INDEX[full] ? full : "";
  };

  const houseToSign: Record<number, string> = {};
  if (houses.length >= 12) {
    for (let i = 0; i < 12; i++) {
      houseToSign[i + 1] = normalizeSign(houses[i].sign || houses[i].rashi);
    }
  }

  const drawChartGrid = () => (
    <g stroke="#f4a261" strokeWidth={1.5} fill="none">
      <rect x={PADDING} y={PADDING} width={WIDTH - PADDING * 2} height={HEIGHT - PADDING * 2} />
      {/* Main Diagonals */}
      <line x1={PADDING} y1={PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} />
      <line x1={WIDTH - PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} />
      {/* Inner Rhombus */}
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

        const pos = HOUSE_POSITIONS[houseNumber];
        if (!pos) return null;

        const cx = pos.x;
        const cy = pos.y;
        const rashiIndex = SIGN_INDEX[rashi];

        const planetsInHouse = planetsByHouse[houseNumber].filter(p => {
          const name = p.name || p.planet || "";
          return !name.toLowerCase().includes("lagna") &&
            !name.toLowerCase().includes("ascendants") &&
            name.toLowerCase() !== "asc";
        });

        const numPlanets = planetsInHouse.length;

        // Dynamic squishing logic for high planet counts
        const getPlanetStackPositions = (count: number): {
          positions: Array<{ x: number; y: number }>;
          fontSize: number;
          degreeSize: number;
        } => {
          if (count === 0) return { positions: [], fontSize: 22, degreeSize: 16 };

          // LARGER font sizes for better visibility
          let itemHeight = 38; // More spacing
          let fontSize = 20;   // Larger planet names
          let degreeSize = 15; // Larger degrees

          if (count >= 3) {
            itemHeight = 32;
            fontSize = 18;
            degreeSize = 14;
          }
          if (count >= 5) {
            itemHeight = 28;
            fontSize = 16;
            degreeSize = 12;
          }
          if (count >= 7) {
            itemHeight = 24;
            fontSize = 14;
            degreeSize = 11;
          }

          const totalHeight = (count * itemHeight);
          const startY = cy - (totalHeight / 2) + (itemHeight / 2);

          return {
            positions: planetsInHouse.map((_, i) => ({
              x: cx,
              y: startY + i * itemHeight,
            })),
            fontSize,
            degreeSize
          };
        };

        const { positions, fontSize, degreeSize } = getPlanetStackPositions(numPlanets);

        return (
          <g key={houseNumber}>
            {/* Rashi Number - MOVED INSIDE HOUSE */}
            <text
              x={cx}
              y={numPlanets > 0 ? cy - (numPlanets * 14 + 30) : cy - 35}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#d90429" // Red color for Rashi Number
              fontSize={18}  // Increased from 14 to 18
              fontWeight={700}  // Increased from 600 to 700
              opacity={0.75}    // Increased from 0.6 to 0.75
            >
              {rashiIndex}
            </text>

            {planetsInHouse.map((planet, i) => {
              const rawName = planet.name || planet.planet || "";
              // Use Hindi names if language is 'hi', otherwise use English abbreviations
              const display = language === 'hi'
                ? (HINDI_NAMES[rawName as keyof typeof HINDI_NAMES] || rawName)
                : (HINDU_NAMES[rawName as keyof typeof HINDU_NAMES] || rawName);
              const retro = planet.isRetrograde ? "*" : "";
              // Format degree: e.g., 23.45 -> 23°27' (approx) or just 23.5°
              // Using simple fixed decimal for clarity: 23.5°
              const degDisplay = planet.degree !== undefined
                ? `${planet.degree.toFixed(1)}°`
                : "";

              const color = PLANET_COLORS[rawName as keyof typeof PLANET_COLORS] || "#000000";
              const pPos = positions[i];
              if (!pPos) return null;

              return (
                <g key={`${houseNumber}-${rawName}-${i}`}>
                  {/* Degree - centered above name */}
                  {degDisplay && (
                    <text
                      x={pPos.x}
                      y={pPos.y - (fontSize * 0.85)} // Shifted up further
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#374151" // Dark Gray for Degree
                      fontSize={degreeSize}
                      fontWeight={500}
                      opacity={0.9}
                    >
                      {degDisplay}
                    </text>
                  )}

                  {/* Planet name - centered */}
                  <text
                    x={pPos.x}
                    y={pPos.y + (degreeSize * 0.4)} // Shifted down further
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={color}
                    fontSize={fontSize}
                    fontWeight={700}
                  >
                    {display}{retro}
                  </text>
                </g>
              );
            })}
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
      <div className="rounded-xl w-full bg-[#ffffff] border-2 border-[#ddd] p-2">
        <div className="w-full aspect-square relative">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#fef6e4" />
            {drawChartGrid()}
            {renderHouseContent()}
          </svg>
        </div>
      </div>
    </div>
  );
}