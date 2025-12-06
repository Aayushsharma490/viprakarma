import React from "react";

const HINDU_NAMES: Record<string, string> = {
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

const SIZE = 400;
const PADDING = 20;
const CENTER = SIZE / 2;

const HOUSE_POSITIONS: Record<number, { x: number; y: number }> = {
  1:   { x: CENTER,             y: SIZE - PADDING - 10 },      // bottom-center
  2:   { x: CENTER + 65,        y: SIZE - PADDING - 35 },      // bottom-right
  3:   { x: SIZE - PADDING - 20,     y: CENTER + 20 },         // right-middle
  4:   { x: SIZE - PADDING - 35, y: CENTER - 45 },             // right-top
  5:   { x: SIZE - PADDING - 65, y: PADDING + 35 },            // top-right
  6:   { x: CENTER,             y: PADDING + 10 },             // top-center
  7:   { x: PADDING + 65,       y: PADDING + 35 },             // top-left
  8:   { x: PADDING + 35,       y: CENTER - 45 },              // left-top
  9:   { x: PADDING + 20,       y: CENTER + 20 },              // left-middle
  10:  { x: PADDING + 35,       y: SIZE - PADDING - 35 },      // left-bottom
  11:  { x: CENTER - 65,        y: SIZE - PADDING - 35 },      // bottom-left
  12:  { x: CENTER,             y: CENTER + 65 },              // bottom-middle
};

// House number positions (edge-aligned, matches AstroSage)
const HOUSE_NUMBER_POSITIONS: Record<number, { x: number; y: number }> = {
  1:  { x: CENTER, y: SIZE - PADDING },
  2:  { x: CENTER + 80, y: SIZE - PADDING - 25 },
  3:  { x: SIZE - PADDING, y: CENTER },
  4:  { x: SIZE - PADDING - 25, y: PADDING + 40 },
  5:  { x: SIZE - PADDING - 65, y: PADDING },
  6:  { x: CENTER, y: PADDING },
  7:  { x: PADDING + 65, y: PADDING },
  8:  { x: PADDING + 25, y: PADDING + 40 },
  9:  { x: PADDING, y: CENTER },
  10: { x: PADDING + 25, y: SIZE - PADDING - 25 },
  11: { x: CENTER - 80, y: SIZE - PADDING - 25 },
  12: { x: CENTER, y: CENTER + 90 },
};

// Layout offsets for text in each house
const SIGN_OFFSET = { dx: 0, dy: -18 };
const PLANET_OFFSET = { dx: 0, dy: 4, lineHeight: 13 };
const HOUSE_NUMBER_OFFSET: Record<number, { dx: number; dy: number }> = {
  1:  { dx: 0,  dy: 32 },      // bottom-center
  2:  { dx: 28, dy: 24 },      // bottom-right
  3:  { dx: 32, dy: 0 },       // right-middle
  4:  { dx: 28, dy: -24 },     // right-top
  5:  { dx: 0,  dy: -32 },     // top-right
  6:  { dx: 0,  dy: -32 },     // top-center
  7:  { dx: -28, dy: -24 },    // top-left
  8:  { dx: -32, dy: 0 },      // left-top
  9:  { dx: -28, dy: 24 },     // left-middle
  10: { dx: -28, dy: 32 },     // left-bottom
  11: { dx: -32, dy: 24 },     // bottom-left
  12: { dx: 0,  dy: 32 },      // bottom-middle
};

// Text offsets for each house: house number, sign label, planet list
const TEXT_OFFSETS: Record<number, {
  houseNum: { dx: number; dy: number },
  signLabel: { dx: number; dy: number },
  planetList: { dx: number; dy: number }
}> = {
  1: { houseNum: { dx: 0, dy: 0 }, signLabel: { dx: 0, dy: -18 }, planetList: { dx: 0, dy: 10 } },
  2: { houseNum: { dx: 18, dy: 0 }, signLabel: { dx: 18, dy: -18 }, planetList: { dx: 18, dy: 10 } },
  3: { houseNum: { dx: 18, dy: 0 }, signLabel: { dx: 18, dy: -18 }, planetList: { dx: 18, dy: 10 } },
  4: { houseNum: { dx: 18, dy: 0 }, signLabel: { dx: 18, dy: -18 }, planetList: { dx: 18, dy: 10 } },
  5: { houseNum: { dx: 0, dy: -18 }, signLabel: { dx: 0, dy: -36 }, planetList: { dx: 0, dy: -8 } },
  6: { houseNum: { dx: -18, dy: 0 }, signLabel: { dx: -18, dy: -18 }, planetList: { dx: -18, dy: 10 } },
  7: { houseNum: { dx: -18, dy: 0 }, signLabel: { dx: -18, dy: -18 }, planetList: { dx: -18, dy: 10 } },
  8: { houseNum: { dx: -18, dy: 0 }, signLabel: { dx: -18, dy: -18 }, planetList: { dx: -18, dy: 10 } },
  9: { houseNum: { dx: 0, dy: 18 }, signLabel: { dx: 0, dy: 0 }, planetList: { dx: 0, dy: 28 } },
  10: { houseNum: { dx: 0, dy: 18 }, signLabel: { dx: 0, dy: 0 }, planetList: { dx: 0, dy: 28 } },
  11: { houseNum: { dx: 0, dy: 18 }, signLabel: { dx: 0, dy: 0 }, planetList: { dx: 0, dy: 28 } },
  12: { houseNum: { dx: 0, dy: 18 }, signLabel: { dx: 0, dy: 0 }, planetList: { dx: 0, dy: 28 } },
};

type PlanetInput = {
  name?: string;
  planet?: string;
  house?: number;
  rashi?: string;
  sign?: string;
  degree?: number;
  isRetrograde?: boolean;
};

type NorthIndianKundaliProps = {
  planets?: PlanetInput[];
  houses?: Array<{ rashi?: string; sign?: string }>;
  title?: string;
};

export default function NorthIndianKundali({
  planets = [],
  houses = [],
  title,
}: NorthIndianKundaliProps) {
  const planetsByHouse: Record<number, PlanetInput[]> = {};
  for (let i = 1; i <= 12; i++) {
    planetsByHouse[i] = [];
  }
  planets.forEach((planet) => {
    const house = planet.house ?? 0;
    if (house >= 1 && house <= 12) {
      planetsByHouse[house].push(planet);
    }
  });

  const getRashiLabel = (houseNumber: number) => {
    const data = houses?.[houseNumber - 1];
    if (!data) return "";
    const raw = (data.rashi || data.sign || "").toString();
    if (!raw) return "";
    const formatted = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    return RASHI_ABBR[formatted as keyof typeof RASHI_ABBR] || formatted.slice(0, 3);
  };

  const drawChartGrid = () => (
    <g stroke="#C77DFF" strokeWidth={2} fill="none">
      {/* outer square */}
      <rect
        x={PADDING}
        y={PADDING}
        width={SIZE - PADDING * 2}
        height={SIZE - PADDING * 2}
      />
      {/* diagonal X */}
      <line x1={PADDING} y1={PADDING} x2={SIZE - PADDING} y2={SIZE - PADDING} />
      <line x1={SIZE - PADDING} y1={PADDING} x2={PADDING} y2={SIZE - PADDING} />
      {/* vertical & horizontal cross */}
      <line x1={CENTER} y1={PADDING} x2={CENTER} y2={SIZE - PADDING} />
      <line x1={PADDING} y1={CENTER} x2={SIZE - PADDING} y2={CENTER} />
      {/* inner diamond connecting midpoints */}
      <line x1={CENTER} y1={PADDING} x2={SIZE - PADDING} y2={CENTER} />
      <line x1={SIZE - PADDING} y1={CENTER} x2={CENTER} y2={SIZE - PADDING} />
      <line x1={CENTER} y1={SIZE - PADDING} x2={PADDING} y2={CENTER} />
      <line x1={PADDING} y1={CENTER} x2={CENTER} y2={PADDING} />
    </g>
  );

  const renderHouseContent = () => (
    <>
      {Array.from({ length: 12 }).map((_, idx) => {
        const houseNumber = idx + 1;
        const pos = HOUSE_POSITIONS[houseNumber];
        if (!pos) return null;

        const label = getRashiLabel(houseNumber);
        const planetsInHouse = planetsByHouse[houseNumber];

        // Layout offsets
        // Use center for sign/planets, edge for house number
        const { x: cx, y: cy } = pos;
        const numPos = HOUSE_NUMBER_POSITIONS[houseNumber];
        // Nudge house number further inside
        const safeNumY = (numPos.y > cy) ? numPos.y - 10 : numPos.y + 10;
        const safeNumX = (numPos.x > cx) ? numPos.x - 10 : numPos.x < cx ? numPos.x + 10 : numPos.x;
        // Sign label closer to center
        const safeSignY = cy - 8;
        // Planets: smaller font, more vertical gap
        const planetStartY = cy + 8;
        const planetLineHeight = 15;

        return (
          <g key={houseNumber}>
            {/* Sign label at top of house, slightly above center */}
            {label && (
              <text
                x={cx}
                y={safeSignY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#E0BBFF"
                fontSize={12}
              >
                {label}
              </text>
            )}
            {/* Planet list, stacked below center, no overlap */}
            {planetsInHouse.map((planet, i) => {
              const rawName = planet.name || planet.planet || "";
              const display =
                HINDU_NAMES[rawName as keyof typeof HINDU_NAMES] || rawName;
              const retro = planet.isRetrograde ? "*" : "";
              return (
                <text
                  key={`${houseNumber}-${rawName}-${i}`}
                  x={cx}
                  y={planetStartY + i * planetLineHeight}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#FFFFFF"
                  fontSize={12}
                  fontWeight={600}
                >
                  {display}
                  {retro}
                </text>
              );
            })}
            {/* House number, edge-aligned, moved further out */}
            <text
              x={safeNumX}
              y={safeNumY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#F3E8FF"
              fontSize={13}
              fontWeight={700}
            >
              {houseNumber}
            </text>
          </g>
        );
      })}
    </>
  );

  return (
    <div className="flex flex-col items-center" style={{ gap: "0.75rem" }}>
      {title && (
        <h3 className="text-center text-lg font-semibold text-white">{title}</h3>
      )}
      <div
        className="rounded-xl"
        style={{
          width: "400px",
          maxWidth: "100%",
          background: "#2A1F3A",
          border: "4px solid #C77DFF",
          padding: "0.75rem",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "400px",
            position: "relative",
          }}
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%">
            {drawChartGrid()}
            {renderHouseContent()}
          </svg>
        </div>
      </div>
    </div>
  );
}