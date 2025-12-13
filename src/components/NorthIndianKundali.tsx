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

const WIDTH = 500;
const HEIGHT = 340;
const PADDING = 20;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

// House positions for PLANET/CONTENT placement (center of the cell).
// REFINED CENTROIDS to ensure text does not touch lines. Based on 500x340 SVG.
// Adjusted centroids to be more "inward" for the outer triangles to avoid border clipping.
const HOUSE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: CENTER_X, y: 80 },               // Top Center (Square/Diamond)
  2: { x: 135, y: 55 },                    // Top Left (Triangle) - Moved inward
  3: { x: 65, y: 100 },                    // Left Top (Triangle) - Moved inward
  4: { x: 90, y: CENTER_Y },               // Left Center (Square/Diamond)
  5: { x: 65, y: HEIGHT - 100 },           // Left Bottom (Triangle) - Moved inward
  6: { x: 135, y: HEIGHT - 55 },           // Bottom Left (Triangle) - Moved inward
  7: { x: CENTER_X, y: HEIGHT - 80 },      // Bottom Center (Square/Diamond)
  8: { x: WIDTH - 135, y: HEIGHT - 55 },   // Bottom Right (Triangle) - Moved inward
  9: { x: WIDTH - 65, y: HEIGHT - 100 },   // Right Bottom (Triangle) - Moved inward
  10: { x: WIDTH - 90, y: CENTER_Y },      // Right Center (Square/Diamond)
  11: { x: WIDTH - 65, y: 100 },           // Right Top (Triangle) - Moved inward
  12: { x: WIDTH - 135, y: 55 },           // Top Right (Triangle) - Moved inward
};

const RASHI_CORNER_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: CENTER_X, y: 155 },        // Bottom-Center of Diamond 1
  2: { x: 220, y: 20 },              // Top-Right corner of Triangle 2
  3: { x: 20, y: 150 },              // Bottom-Left corner of Triangle 3
  4: { x: 150, y: CENTER_Y },        // Right-Center of Diamond 4
  5: { x: 20, y: HEIGHT - 150 },     // Top-Left corner of Triangle 5
  6: { x: 220, y: HEIGHT - 20 },     // Bottom-Right corner of Triangle 6
  7: { x: CENTER_X, y: HEIGHT - 155 },// Top-Center of Diamond 7
  8: { x: WIDTH - 220, y: HEIGHT - 20 }, // Bottom-Left corner of Triangle 8
  9: { x: WIDTH - 20, y: HEIGHT - 150 }, // Top-Right corner of Triangle 9
  10: { x: WIDTH - 150, y: CENTER_Y },   // Left-Center of Diamond 10
  11: { x: WIDTH - 20, y: 150 },         // Bottom-Right corner of Triangle 11
  12: { x: WIDTH - 220, y: 20 },         // Top-Left corner of Triangle 12
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
          positions: Array<{ x: number; y: number; degreeY: number; planetY: number }>;
          fontSize: number;
          degreeSize: number;
        } => {
          if (count === 0) return { positions: [], fontSize: 16, degreeSize: 12 };

          // Increased spacing to prevent overlap
          let offsetStep = 22; // Increased from 18
          let fontSize = 15;
          let degreeSize = 11;

          if (count >= 3) {
            offsetStep = 19; // Increased from 15
            fontSize = 13;
            degreeSize = 10;
          }
          if (count >= 5) {
            offsetStep = 16; // Increased from 12
            fontSize = 11;
            degreeSize = 9;
          }
          if (count >= 7) {
            offsetStep = 14; // New tier for very crowded houses
            fontSize = 10;
            degreeSize = 8;
          }

          const totalHeight = (count - 1) * offsetStep;
          // Center roughly around cy but slightly lower to account for Rashi number
          const stackCenterY = cy + 5;
          const startY = stackCenterY - (totalHeight / 2);

          return {
            positions: planetsInHouse.map((_, i) => ({
              x: cx,
              y: startY + i * offsetStep,
              degreeY: (startY + i * offsetStep) - (degreeSize / 2),
              planetY: (startY + i * offsetStep) + (degreeSize / 2),
            })),
            fontSize,
            degreeSize
          };
        };

        const { positions, fontSize, degreeSize } = getPlanetStackPositions(numPlanets);

        return (
          <g key={houseNumber}>
            <text
              x={cx}
              y={cy - (numPlanets > 0 ? (numPlanets * 8 + 10) : 15)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#000000"
              fontSize={14}
              fontWeight={500}
              opacity={0.8}
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
              const color = PLANET_COLORS[rawName as keyof typeof PLANET_COLORS] || "#000000";
              const pPos = positions[i];
              if (!pPos) return null;

              // Format degree - ensure it's a number and format properly
              const degreeValue = planet.degree;

              // Debug logging
              if (i === 0 && houseNumber === 1) {
                console.log('Planet data:', planet);
                console.log('Degree value:', degreeValue, 'Type:', typeof degreeValue);
              }

              const degree = (degreeValue !== undefined && degreeValue !== null)
                ? Math.floor(degreeValue).toString().padStart(2, '0')
                : '';

              return (
                <g key={`${houseNumber}-${rawName}-${i}`}>
                  {/* Degree above planet name */}
                  {degree && (
                    <text
                      x={pPos.x}
                      y={pPos.y - (fontSize * 0.85)} // Increased spacing
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={degreeSize}
                      fontWeight={400}
                      fill="#666"
                    >
                      {degree}°
                    </text>
                  )}
                  {/* Planet name below degree */}
                  <text
                    x={pPos.x}
                    y={pPos.y + (degree ? (fontSize * 0.4) : 0)} // Increased spacing
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