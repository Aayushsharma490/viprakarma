import React from "react";

/**
 * NorthIndianKundaliExact.tsx
 *
 * Fully data-safe North-Indian (diamond) style Kundali chart that:
 * - Uses house cusps and absolute longitudes exactly as provided.
 * - Computes degreeInHouse = (planetLongitude - houseStart + 360) % 30.
 * - Stacks multiple planets per house and applies small degree-based y‑offset.
 * - Renders via SVG with viewBox="0 0 600 600" so it scales perfectly.
 *
 * This component NEVER mutates or reassigns houses, signs, dashas, or ephemeris.
 */

type PlanetInput = {
  name: string;
  sign: string;
  house: number; // 1..12
  longitude: number; // absolute ecliptic longitude 0..360
  retrograde?: boolean;
  degree?: number; // optional degree inside sign, for display only
};

type Props = {
  planets: PlanetInput[];
  houses: number[]; // length 12, cusp degrees for house1..house12
  size?: number; // default 600
  showDegrees?: boolean;
};

const HINDU_NAME_MAP: Record<string, string> = {
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

const RASHI_ABBR: Record<string, string> = {
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

export default function NorthIndianKundaliExact({
  planets,
  houses,
  size = 600,
  showDegrees = true,
}: Props) {
  // Fail‑safe: ensure we always have 12 cusp degrees without changing input reference
  const safeHouses =
    Array.isArray(houses) && houses.length === 12
      ? houses.slice(0, 12)
      : new Array(12).fill(0);

  // Fixed house centers for a 600×600 viewBox in the required North Indian layout:
  // House 1  = Top‑Center
  // House 2  = Top‑Right
  // House 3  = Right‑Top
  // House 4  = Right‑Center
  // House 5  = Right‑Bottom
  // House 6  = Bottom‑Right
  // House 7  = Bottom‑Center
  // House 8  = Bottom‑Left
  // House 9  = Left‑Bottom
  // House 10 = Left‑Center
  // House 11 = Left‑Top
  // House 12 = Top‑Left
  const houseCenters: Record<
    number,
    { x: number; y: number; boxW: number; boxH: number }
  > = {
    1: { x: 300, y: 60, boxW: 180, boxH: 120 }, // top‑center
    2: { x: 430, y: 120, boxW: 150, boxH: 100 }, // top‑right
    3: { x: 520, y: 210, boxW: 130, boxH: 110 }, // right‑top
    4: { x: 520, y: 300, boxW: 150, boxH: 100 }, // right‑center
    5: { x: 520, y: 390, boxW: 150, boxH: 100 }, // right‑bottom
    6: { x: 430, y: 480, boxW: 150, boxH: 100 }, // bottom‑right
    7: { x: 300, y: 540, boxW: 180, boxH: 120 }, // bottom‑center
    8: { x: 170, y: 480, boxW: 150, boxH: 100 }, // bottom‑left
    9: { x: 80, y: 390, boxW: 130, boxH: 110 }, // left‑bottom
    10: { x: 80, y: 300, boxW: 150, boxH: 100 }, // left‑center
    11: { x: 80, y: 210, boxW: 150, boxH: 100 }, // left‑top
    12: { x: 170, y: 120, boxW: 150, boxH: 100 }, // top‑left
  };

  // Normalize angle to 0..360
  const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

  // degreeInHouse calculation per spec:
  // degreeInHouse = (planetLongitude - houseStartDegree + 360) % 30
  const getDegreeInHouse = (planetLongitude: number, houseIndex: number) => {
    const houseStart = norm360(safeHouses[houseIndex - 1] || 0);
    const pLong = norm360(planetLongitude);
    const diff = (pLong - houseStart + 360) % 360;
    return diff % 30; // 0 .. <30
  };

  // Group planets by house (1..12) without mutating original objects
  const planetsByHouse: Record<number, PlanetInput[]> = {};
  for (let i = 1; i <= 12; i++) planetsByHouse[i] = [];
  planets.forEach((pl) => {
    const h = Math.min(Math.max(Math.round(pl.house), 1), 12);
    planetsByHouse[h].push(pl);
  });

  // Precompute sorted planets per house, by degreeInHouse ascending
  const houseRenderData = Object.fromEntries(
    Object.entries(planetsByHouse).map(([hStr, pls]) => {
      const houseNum = Number(hStr);
      const data = pls
        .map((pl) => {
          const degIn = getDegreeInHouse(pl.longitude, houseNum);
          return { pl, degIn };
        })
        .sort((a, b) => a.degIn - b.degIn);
      return [houseNum, data];
    }),
  ) as Record<number, { pl: PlanetInput; degIn: number }[]>;

  // Render planets in a given house using stacking + degree‑based offset
  const renderPlanetsInHouse = (houseNum: number) => {
    const list = houseRenderData[houseNum] || [];
    const center = houseCenters[houseNum];
    if (!center) return null;

    const { x: cx, y: cy, boxW, boxH } = center;
    const N = list.length;
    if (N === 0) return null;

    // Vertical limits for text inside the house
    const topInsideY = cy - boxH / 2 + 18;
    const bottomInsideY = cy + boxH / 2 - 18;
    const availableHeight = Math.max(10, bottomInsideY - topInsideY);

    // Equal spacing baseline
    const baseSpacing = availableHeight / Math.max(1, N);

    return list.map(({ pl, degIn }, idx) => {
      // normalized depth inside house [0..1]
      const normalized = degIn / 30; // 0..1

      // Baseline stacked Y (top to bottom)
      const stackY = topInsideY + baseSpacing * (idx + 0.5);

      // Small offset based on degree to reflect exact depth, without edge‑sticking
      const degreeOffset = (normalized - 0.5) * (baseSpacing * 0.4);
      const finalY = stackY + degreeOffset;
      const finalX = cx;

      const displayName = HINDU_NAME_MAP[pl.name] ?? pl.name;
      const retro = pl.retrograde ? "*" : "";
      const degText = showDegrees ? ` ${Math.round(degIn)}°` : "";

      return (
        <g key={`${houseNum}-${idx}`}>
          <text
            x={finalX}
            y={finalY}
            textAnchor="middle"
            fontSize={12}
            fontFamily="sans-serif"
          >
            {`${displayName}${retro}${degText}`}
          </text>
        </g>
      );
    });
  };

  const renderHouseBox = (houseNum: number) => {
    const c = houseCenters[houseNum];
    if (!c) return null;

    const { x, y, boxW, boxH } = c;
    const rectX = x - boxW / 2;
    const rectY = y - boxH / 2;
    const houseStartDeg = safeHouses[houseNum - 1] || 0;

    return (
      <g key={`house-${houseNum}`}>
        {/* invisible guide box for text layout */}
        <rect
          x={rectX}
          y={rectY}
          width={boxW}
          height={boxH}
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth={1}
          rx={6}
        />

        {/* house number top‑center */}
        <text
          x={x}
          y={rectY + 14}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fontFamily="sans-serif"
        >
          {houseNum}
        </text>

        {/* rashi abbrev bottom‑center; inferred from any planet in that house, if present */}
        <text
          x={x}
          y={rectY + boxH - 6}
          textAnchor="middle"
          fontSize={12}
          fontFamily="sans-serif"
          fill="#475569"
        >
          {(() => {
            const any = planetsByHouse[houseNum][0];
            if (any && any.sign) {
              return RASHI_ABBR[any.sign] ?? any.sign.substring(0, 3);
            }
            return "";
          })()}
        </text>

        {/* optional: show cusp degree in corner, purely visual */}
        <text
          x={x + boxW / 2 - 6}
          y={rectY + 14}
          textAnchor="end"
          fontSize={10}
          fontFamily="monospace"
          fill="#94a3b8"
        >
          {`${Math.round(norm360(houseStartDeg))}°`}
        </text>
      </g>
    );
  };

  return (
    <div style={{ width: "100%", maxWidth: size, margin: "0 auto" }}>
      <svg
        viewBox="0 0 600 600"
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background diamond for North‑Indian look */}
        <g>
          <polygon
            points="300,20 540,300 300,580 60,300"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth={2}
          />
          {/* main diagonals */}
          <line
            x1={300}
            y1={20}
            x2={300}
            y2={580}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <line
            x1={60}
            y1={300}
            x2={540}
            y2={300}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        </g>

        {/* Houses and labels */}
        <g>{Array.from({ length: 12 }, (_, i) => renderHouseBox(i + 1))}</g>

        {/* Planets */}
        <g>{Array.from({ length: 12 }, (_, i) => renderPlanetsInHouse(i + 1))}</g>
      </svg>
    </div>
  );
}



