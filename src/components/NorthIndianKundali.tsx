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

// Hindi zodiac sign names
const HINDI_SIGNS: Record<string, string> = {
  Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क",
  Leo: "सिंह", Virgo: "कन्या", Libra: "तुला", Scorpio: "वृश्चिक",
  Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन"
};

const WIDTH = 800;  // Increased from 700
const HEIGHT = 800; // Increased from 700
const PADDING = 50;  // Increased from 40
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

// House positions for PLANET/CONTENT placement (center of the cell).
// ADJUSTED for larger chart with more padding and to keep content inside boundaries
const HOUSE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: CENTER_X, y: 200 },              // Top center - House 1
  2: { x: 240, y: 110 },                   // Top left - House 2  
  3: { x: 110, y: 240 },                   // Left top - House 3
  4: { x: 180, y: CENTER_Y },              // Left center - House 4
  5: { x: 110, y: 560 },                   // Left bottom - House 5
  6: { x: 240, y: 690 },                   // Bottom left - House 6
  7: { x: CENTER_X, y: 600 },              // Bottom center - House 7
  8: { x: 560, y: 690 },                   // Bottom right - House 8
  9: { x: 690, y: 560 },                   // Right bottom - House 9
  10: { x: 620, y: CENTER_Y },             // Right center - House 10
  11: { x: 690, y: 240 },                  // Right top - House 11
  12: { x: 560, y: 110 },                  // Top right - House 12
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
  degree?: number; degreeInSign?: number; isRetrograde?: boolean;
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
          if (count === 0) return { positions: [], fontSize: 24, degreeSize: 18 };

          // OPTIMIZED font sizes and spacing for maximum clarity
          let itemHeight = 48; // Better spacing between planets
          let fontSize = 24;   // Larger planet names for clarity
          let degreeSize = 18; // Larger degrees for visibility

          if (count >= 3) {
            itemHeight = 42;
            fontSize = 22;
            degreeSize = 17;
          }
          if (count >= 5) {
            itemHeight = 36;
            fontSize = 20;
            degreeSize = 15;
          }
          if (count >= 7) {
            itemHeight = 30;
            fontSize = 18;
            degreeSize = 14;
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
            {/* Rashi Number - CLEARLY VISIBLE */}
            <text
              x={cx}
              y={numPlanets > 0 ? cy - (numPlanets * 16 + 35) : cy - 40}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#c1121f" // Darker red for better visibility
              fontSize={22}  // Larger for clarity
              fontWeight={800}  // Bolder
              opacity={0.9}    // More opaque
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              {rashiIndex}
            </text>

            {planetsInHouse.map((planet, i) => {
              const planetName = planet.name || planet.planet || "?";
              const planetLabel = language === 'hi'
                ? (HINDI_NAMES[planetName as keyof typeof HINDI_NAMES] || planetName)
                : (HINDU_NAMES[planetName as keyof typeof HINDU_NAMES] || planetName);
              // Use degreeInSign if available, fallback to degree
              const degreeValue = planet.degreeInSign ?? planet.degree;
              const degree = degreeValue !== undefined ? `${Math.floor(degreeValue)}°` : '';
              const retrograde = planet.isRetrograde ? "(R)" : "";

              // Debug log for first planet
              if (i === 0 && houseNumber === 1) {
                console.log('[Chart Debug] Planet data:', {
                  name: planetName,
                  degreeInSign: planet.degreeInSign,
                  degree: planet.degree,
                  degreeValue,
                  displayDegree: degree
                });
              }

              const color = PLANET_COLORS[planetName as keyof typeof PLANET_COLORS] || "#000000";
              const pPos = positions[i];
              if (!pPos) return null;

              return (
                <g key={i}>
                  {/* Degree - clearly visible above planet */}
                  {degree && (
                    <text
                      x={pPos.x}
                      y={pPos.y - (fontSize * 0.65)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#374151" // Darker gray for better contrast
                      fontSize={degreeSize}
                      fontWeight={600}  // Bolder
                      opacity={0.95}    // More opaque
                      style={{ textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}
                    >
                      {degree}
                    </text>
                  )}
                  {/* Planet Name - clearly visible */}
                  <text
                    x={pPos.x}
                    y={pPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={color}
                    fontSize={fontSize}
                    fontWeight={700}  // Bolder for clarity
                    style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}
                  >
                    {planetLabel}{retrograde}
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