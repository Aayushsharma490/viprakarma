"use strict";

/**
 * Astro Engine (FIX MODE)
 * -----------------------
 * Dedicated Node.js microservice that performs all Swiss Ephemeris
 * calculations outside the Next.js serverless runtime.
 */

const http = require("http");
const path = require("path");
const fs = require("fs");
const sweph = require("sweph");

const PORT = Number(process.env.ASTRO_ENGINE_PORT || 5005);
const EPHE_PATH =
  process.env.SWE_EPHE_PATH ||
  path.resolve(__dirname, "swisseph-master", "ephe");

const { constants } = sweph;

// --- FIX MODE: Swiss Ephemeris .se1 loading ---
console.log("[astro-engine][FIX MODE] EPHE_PATH resolved to:", EPHE_PATH);
let epheOk = false;
try {
  const stat = fs.statSync(EPHE_PATH);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(EPHE_PATH);
    const hasSe1 = files.some((f) => f.toLowerCase().endsWith(".se1"));
    if (!hasSe1) {
      console.error(
        "[astro-engine][FIX MODE] No .se1 files found in EPHE_PATH"
      );
    } else {
      epheOk = true;
    }
  } else {
    console.error("[astro-engine][FIX MODE] EPHE_PATH is not a directory");
  }
} catch (err) {
  console.error("[astro-engine][FIX MODE] Failed to inspect EPHE_PATH:", err);
}

if (!epheOk) {
  throw new Error("EPHE FILES NOT LOADED");
}

// Make sure Swiss Ephemeris always uses external ephemeris files with Lahiri
console.log("[astro-engine][FIX MODE] set_ephe_path + set_sid_mode(LAHIRI)");
sweph.set_ephe_path(EPHE_PATH);
sweph.set_sid_mode(constants.SE_SIDM_LAHIRI, 0, 0);

const RASHIS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const SIGN_TYPES = [
  "movable",
  "fixed",
  "dual",
  "movable",
  "fixed",
  "dual",
  "movable",
  "fixed",
  "dual",
  "movable",
  "fixed",
  "dual",
];

const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

const NAKSHATRA_LORDS = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

const BENEFIC_PLANETS = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);

const PLANET_CONFIG = [
  { id: constants.SE_SUN, name: "Sun" },
  { id: constants.SE_MOON, name: "Moon" },
  { id: constants.SE_MARS, name: "Mars" },
  { id: constants.SE_MERCURY, name: "Mercury" },
  { id: constants.SE_JUPITER, name: "Jupiter" },
  { id: constants.SE_VENUS, name: "Venus" },
  { id: constants.SE_SATURN, name: "Saturn" },
  { id: constants.SE_MEAN_NODE, name: "Rahu" },
  { id: constants.SE_URANUS, name: "Uranus" },
  { id: constants.SE_NEPTUNE, name: "Neptune" },
  { id: constants.SE_PLUTO, name: "Pluto" },
];

function normalizeDegree(value) {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function getSignIndex(degree) {
  return Math.floor(normalizeDegree(degree) / 30) % 12;
}

function formatDMS(degree) {
  const norm = normalizeDegree(degree);
  const deg = Math.floor(norm);
  const minutesFloat = (norm - deg) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);
  return `${deg}Â°${minutes}'${seconds}"`;
}

function parseTimezoneOffset(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length) {
    const match = value.trim().match(/^([+-]?)(\d{1,2})(?::?(\d{2}))?$/);
    if (match) {
      const sign = match[1] === "-" ? -1 : 1;
      const hours = Number(match[2]);
      const minutes = match[3] ? Number(match[3]) : 0;
      return sign * (hours + minutes / 60);
    }
  }

  // Default to IST if nothing valid is provided.
  return 5.5;
}

function toUtcDate({ year, month, day, hour, minute, second }, timezone) {
  // timezone is already a number (e.g., 5.5 for IST +05:30)
  // Convert to total minutes
  const tzTotalMinutes = timezone * 60;

  // Convert local time to UTC
  const totalLocalMinutes = hour * 60 + minute;
  const totalUTCMinutes = totalLocalMinutes - tzTotalMinutes;

  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;
  let utcHour = Math.floor(totalUTCMinutes / 60);
  let utcMinute = totalUTCMinutes % 60;
  const utcSecond = second;

  // Handle negative minutes
  if (utcMinute < 0) {
    utcHour -= 1;
    utcMinute += 60;
  }

  // Handle day rollover
  if (utcHour < 0) {
    utcHour += 24;
    utcDay -= 1;
    if (utcDay < 1) {
      utcMonth -= 1;
      if (utcMonth < 1) {
        utcMonth = 12;
        utcYear -= 1;
      }
      utcDay = new Date(utcYear, utcMonth, 0).getDate();
    }
  } else if (utcHour >= 24) {
    utcHour -= 24;
    utcDay += 1;
    const daysInMonth = new Date(utcYear, utcMonth, 0).getDate();
    if (utcDay > daysInMonth) {
      utcDay = 1;
      utcMonth += 1;
      if (utcMonth > 12) {
        utcMonth = 1;
        utcYear += 1;
      }
    }
  }

  return {
    year: utcYear,
    month: utcMonth,
    day: utcDay,
    hour: utcHour,
    minute: utcMinute,
    second: utcSecond,
  };
}

function calculateNakshatra(degree) {
  const normalized = normalizeDegree(degree);
  // 27 nakshatras â†’ 13Â°20' each = 13.333333... degrees
  const span = 360 / 27; // 13.333333...
  const index = Math.floor(normalized / span);
  const withinNak = normalized % span;
  // 4 padas per nakshatra â†’ 3Â°20' each = 3.333333... degrees
  const pada = Math.floor(withinNak / (span / 4)) + 1;
  return {
    name: NAKSHATRAS[index],
    lord: NAKSHATRA_LORDS[index],
    index: index + 1,
    pada,
    fraction: withinNak / span,
  };
}

// D9 (Navamsa) Parashara mapping
function getNavamsaSignIndex(longitude) {
  const norm = normalizeDegree(longitude);
  const signIndex = Math.floor(norm / 30); // 0..11
  const degInSign = norm % 30;
  const part = Math.floor(degInSign / (30 / 9)); // 0..8
  // Parashara: navamsaSign = (signIndex * 9 + part) % 12
  return (signIndex * 9 + part) % 12;
}

// D10 (Dashamsa) classical Parashara rule
function getDashamsaSignIndex(longitude) {
  const norm = normalizeDegree(longitude);
  const signIndex = Math.floor(norm / 30); // 0..11
  const degInSign = norm % 30;
  const d10Index = Math.floor(degInSign / 3); // 0..9  (10 parts of 3Â°)

  // Movable: start from same sign
  // Fixed: start from 9th sign from it
  // Dual: start from 5th sign from it
  const signType = SIGN_TYPES[signIndex]; // movable/fixed/dual
  let startSign = signIndex;
  if (signType === "fixed") {
    startSign = (signIndex + 8) % 12; // 9th from it (offset 8 because 0-based)
  } else if (signType === "dual") {
    startSign = (signIndex + 4) % 12; // 5th from it
  }

  return (startSign + d10Index) % 12;
}

function houseFromAscendant(planetDegree, ascDegree) {
  // Whole-sign house system: The entire sign containing ascendant is House 1
  const ascSignIndex = getSignIndex(ascDegree);
  const planetSignIndex = getSignIndex(planetDegree);
  // Calculate house number by sign difference
  const house = ((planetSignIndex - ascSignIndex + 12) % 12) + 1;
  return house;
}

function createEmptyPlacements(startSignIndex) {
  const placements = {};
  for (let i = 0; i < 12; i += 1) {
    const signIndex = (startSignIndex + i) % 12;
    placements[i + 1] = {
      house: i + 1,
      sign: RASHIS[signIndex],
      signIndex,
      planets: [],
    };
  }
  return placements;
}

function buildChartPlacements({
  baseSignIndex,
  ascLabel,
  ascHouse,
  planets,
  houseResolver,
}) {
  const placements = createEmptyPlacements(baseSignIndex);
  placements[ascHouse].planets.push({
    name: ascLabel,
    label: ascLabel,
    retrograde: false,
  });

  planets.forEach((planet) => {
    const houseNumber = houseResolver(planet);
    if (placements[houseNumber]) {
      placements[houseNumber].planets.push({
        name: planet.name,
        label: `${planet.name} ${formatDMS(planet.longitude)}`,
        retrograde: planet.isRetrograde,
      });
    }
  });

  return placements;
}

function formatTimezoneString(offset) {
  const sign = offset >= 0 ? "+" : "-";
  const absolute = Math.abs(offset);
  const hours = Math.floor(absolute);
  const minutes = Math.round((absolute - hours) * 60);
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (error) {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", reject);
  });
}

function respondJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function validateInput(body) {
  const required = [
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
    "latitude",
    "longitude",
  ];
  required.forEach((key) => {
    if (
      body[key] === undefined ||
      body[key] === null ||
      Number.isNaN(body[key])
    ) {
      throw new Error(`Missing required field: ${key}`);
    }
  });

  return {
    name: body.name || "Guest",
    gender: body.gender || "unspecified",
    year: Number(body.year),
    month: Number(body.month),
    day: Number(body.day),
    hour: Number(body.hour),
    minute: Number(body.minute),
    second: Number(body.second || 0),
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    timezone: parseTimezoneOffset(body.timezone),
    city: body.city || "Unknown",
  };
}

function formatDateParts(date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}

function calculateVimshottari(moonDegree, birthUtcDate) {
  const nakDetails = calculateNakshatra(moonDegree);
  const vimshottariSequence = [
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
  ];
  const durations = {
    Ketu: 7,
    Venus: 20,
    Sun: 6,
    Moon: 10,
    Mars: 7,
    Rahu: 18,
    Jupiter: 16,
    Saturn: 19,
    Mercury: 17,
  };

  const startingLord = NAKSHATRA_LORDS[nakDetails.index - 1];
  const startIndex = vimshottariSequence.indexOf(startingLord);
  const remainingFraction = 1 - nakDetails.fraction;
  const remainingYears = durations[startingLord] * remainingFraction;

  const dashas = [];
  console.log(
    "[astro-engine] birthUtcDate for Vimshottari:",
    birthUtcDate,
    typeof birthUtcDate
  );
  let cursor = new Date(birthUtcDate);
  console.log(
    "[astro-engine] cursor Date object:",
    cursor,
    "isValid:",
    !isNaN(cursor.getTime())
  );

  if (isNaN(cursor.getTime())) {
    throw new Error(
      `Invalid date passed to calculateVimshottari: ${birthUtcDate}`
    );
  }

  let currentIndex = startIndex;
  let spanYears = remainingYears;

  console.log(`[astro-engine] Starting loop for 12 mahadashas. remainingYears: ${remainingYears}`);

  for (let i = 0; i < 12; i += 1) {
    try {
      const lord = vimshottariSequence[currentIndex % vimshottariSequence.length];
      const startDate = new Date(cursor);
      const endDate = new Date(
        startDate.getTime() + spanYears * 365.2425 * 24 * 3600 * 1000
      );

      // Calculate Antardashas (Sub-periods)
      const antardashas = [];
      let adCursor = new Date(startDate);
      const mahadashaLordIndex = vimshottariSequence.indexOf(lord);

      for (let j = 0; j < 9; j++) {
        const adLord = vimshottariSequence[(mahadashaLordIndex + j) % 9];
        const adDurationYears = (durations[lord] * durations[adLord]) / 120;

        const adEndDate = new Date(
          adCursor.getTime() + adDurationYears * 365.2425 * 24 * 3600 * 1000
        );

        antardashas.push({
          planet: adLord,
          startDate: adCursor.toISOString().split("T")[0],
          endDate: adEndDate.toISOString().split("T")[0],
          years: Number(adDurationYears.toFixed(4))
        });

        adCursor = adEndDate;
      }

      dashas.push({
        planet: lord,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        years: Number(spanYears.toFixed(2)),
        antardashas: antardashas
      });
      cursor = endDate;
      currentIndex += 1;
      spanYears =
        durations[vimshottariSequence[currentIndex % vimshottariSequence.length]];
    } catch (e) {
      console.error(`[astro-engine] Error calculating mahadasha ${i}:`, e);
      // Don't break the whole process if one dasha fails (though it shouldn't)
      break;
    }
  }

  console.log(`[astro-engine] Calculated ${dashas.length} mahadashas.`);

  return {
    current: dashas[0],
    mahadashas: dashas,
  };
}

function computeKundali(payload) {
  const inputs = validateInput(payload);
  const localDate = {
    year: inputs.year,
    month: inputs.month,
    day: inputs.day,
    hour: inputs.hour,
    minute: inputs.minute,
    second: inputs.second,
  };

  const localTimeString = `${inputs.year}-${String(inputs.month).padStart(2, "0")}-${String(inputs.day).padStart(2, "0")}T${String(inputs.hour).padStart(2, "0")}:${String(inputs.minute).padStart(2, "0")}:${String(inputs.second).padStart(2, "0")}`;

  // AstroSage approach: Convert local time to UTC by subtracting timezone offset
  const utcDate = toUtcDate(localDate, inputs.timezone);
  const utcParts = utcDate; // Now returns object directly

  console.log("[astro-engine] --------------------------------------------");
  console.log("[astro-engine] Input local time:", localTimeString);
  console.log(
    "[astro-engine] Parsed timezone:",
    formatTimezoneString(inputs.timezone)
  );
  console.log(
    "[astro-engine] UTC for Swiss Ephemeris:",
    `${utcParts.year}-${String(utcParts.month).padStart(2, "0")}-${String(utcParts.day).padStart(2, "0")}T${String(utcParts.hour).padStart(2, "0")}:${String(utcParts.minute).padStart(2, "0")}:${String(utcParts.second).padStart(2, "0")}Z`
  );
  console.log("[astro-engine] UTC parts object:", utcParts);
  console.log("[astro-engine] Ephemeris path:", EPHE_PATH);

  const jdResult = sweph.utc_to_jd(
    utcParts.year,
    utcParts.month,
    utcParts.day,
    utcParts.hour,
    utcParts.minute,
    utcParts.second,
    constants.SE_GREG_CAL
  );

  if (jdResult.flag !== constants.OK) {
    throw new Error(jdResult.error || "Unable to compute Julian Day");
  }

  const [jdEt, jdUt] = jdResult.data;
  const ayanamsaResult = sweph.get_ayanamsa_ex(jdEt, constants.SEFLG_SWIEPH);
  const ayanamsa = ayanamsaResult.data;

  console.log("[astro-engine] Ayanamsa (Lahiri):", ayanamsa.toFixed(8));

  const flags =
    constants.SEFLG_SWIEPH | constants.SEFLG_SPEED | constants.SEFLG_SIDEREAL;
  const planets = [];

  PLANET_CONFIG.forEach((config) => {
    const result = sweph.calc(jdEt, config.id, flags);
    if (result.flag < 0) {
      throw new Error(result.error || `Failed to calculate ${config.name}`);
    }
    const [longitude, latitudeValue, , speed] = result.data;
    const siderealLongitude = normalizeDegree(longitude); // already sidereal due to SEFLG_SIDEREAL
    const signIndex = getSignIndex(siderealLongitude);
    const nakshatra = calculateNakshatra(siderealLongitude);
    const degreeInSign = siderealLongitude % 30;
    const navamsaSign = getNavamsaSignIndex(siderealLongitude);
    const dashamsaSign = getDashamsaSignIndex(siderealLongitude);

    const planetData = {
      name: config.name,
      longitude: siderealLongitude,
      latitude: latitudeValue,
      degreeInSign,
      sign: RASHIS[signIndex],
      signIndex,
      nakshatra,
      isRetrograde: speed < 0,
      isBenefic: BENEFIC_PLANETS.has(config.name),
      navamsaSignIndex: navamsaSign,
      dashamsaSignIndex: dashamsaSign,
    };

    planets.push(planetData);
    console.log(
      `[astro-engine] ${config.name}: ${siderealLongitude.toFixed(6)}Â° ${planetData.sign} (${nakshatra.name} p${nakshatra.pada})`
    );
  });

  const rahu = planets.find((planet) => planet.name === "Rahu");
  if (rahu) {
    const ketuLongitude = normalizeDegree(rahu.longitude + 180);
    const ketuSignIndex = getSignIndex(ketuLongitude);
    const ketuNakshatra = calculateNakshatra(ketuLongitude);
    planets.push({
      name: "Ketu",
      longitude: ketuLongitude,
      latitude: rahu.latitude * -1,
      degreeInSign: ketuLongitude % 30,
      sign: RASHIS[ketuSignIndex],
      signIndex: ketuSignIndex,
      nakshatra: ketuNakshatra,
      isRetrograde: true,
      isBenefic: false,
      navamsaSignIndex: getNavamsaSignIndex(ketuLongitude),
      dashamsaSignIndex: getDashamsaSignIndex(ketuLongitude),
    });
    console.log(
      `[astro-engine] Ketu: ${ketuLongitude.toFixed(6)}Â° ${RASHIS[ketuSignIndex]} (${ketuNakshatra.name} p${ketuNakshatra.pada})`
    );
  }

  // Calculate ascendant using Jean Meeus formula (same as working TypeScript code)
  // Get sidereal time from Swiss Ephemeris
  const sidtimeResult = sweph.sidtime(jdUt);
  const gst = sidtimeResult * 15.0; // Convert hours to degrees (Greenwich Sidereal Time)
  const lst = (gst + inputs.longitude) % 360; // Local Sidereal Time
  const ramc = lst; // Right Ascension of Midheaven

  // Jean Meeus formula for ascendant
  const obliquity = 23.4397; // Obliquity of ecliptic
  const ramcRad = (ramc * Math.PI) / 180;
  const latRad = (inputs.latitude * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;

  const numerator = Math.cos(ramcRad);
  const denominator =
    -Math.sin(oblRad) * Math.tan(latRad) - Math.cos(oblRad) * Math.sin(ramcRad);

  let ascRad = Math.atan2(numerator, denominator);
  if (ascRad < 0) {
    ascRad += 2 * Math.PI;
  }

  // Tropical ascendant
  const ascTropical = ((ascRad * 180) / Math.PI) % 360;
  // Convert to sidereal
  const ascDegree = normalizeDegree(ascTropical - ayanamsa);
  const ascSignIndex = getSignIndex(ascDegree);
  const ascDegreeInSign = ascDegree % 30;
  const ascNakshatra = calculateNakshatra(ascDegree);

  console.log(
    `[astro-engine] ASCENDANT: ${ascDegree.toFixed(6)}Â° = ${RASHIS[ascSignIndex]} (sign index ${ascSignIndex}) [tropical: ${ascTropical.toFixed(2)}Â° - ayanamsa: ${ayanamsa.toFixed(2)}Â°]`
  );

  // Whole sign houses: each house is exactly 30Â° starting from ascendant sign
  const houses = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    cusp: normalizeDegree(ascDegree + index * 30),
    sign: RASHIS[(ascSignIndex + index) % 12],
  }));

  const enrichedPlanets = planets.map((planet) => ({
    ...planet,
    house: houseFromAscendant(planet.longitude, ascDegree),
  }));

  const moon = enrichedPlanets.find((p) => p.name === "Moon");
  const sun = enrichedPlanets.find((p) => p.name === "Sun");

  const navAscSignIndex = getNavamsaSignIndex(ascDegree);
  const dashAscSignIndex = getDashamsaSignIndex(ascDegree);

  const d1Placements = buildChartPlacements({
    baseSignIndex: ascSignIndex,
    ascLabel: "Asc",
    ascHouse: 1,
    planets: enrichedPlanets,
    houseResolver: (planet) => planet.house,
  });

  const chandraPlacements = buildChartPlacements({
    baseSignIndex: moon ? moon.signIndex : ascSignIndex,
    ascLabel: "Moon",
    ascHouse: 1,
    planets: enrichedPlanets,
    houseResolver: (planet) => {
      const base = moon ? moon.signIndex : 0;
      return ((planet.signIndex - base + 12) % 12) + 1;
    },
  });

  const d9Placements = buildChartPlacements({
    baseSignIndex: navAscSignIndex,
    ascLabel: "D9 Lagna",
    ascHouse: 1,
    planets: enrichedPlanets,
    houseResolver: (planet) =>
      ((planet.navamsaSignIndex - navAscSignIndex + 12) % 12) + 1,
  });

  const d10Placements = buildChartPlacements({
    baseSignIndex: dashAscSignIndex,
    ascLabel: "D10 Lagna",
    ascHouse: 1,
    planets: enrichedPlanets,
    houseResolver: (planet) =>
      ((planet.dashamsaSignIndex - dashAscSignIndex + 12) % 12) + 1,
  });

  // Convert UTC parts to ISO string for calculateVimshottari
  const utcIsoString = `${utcParts.year}-${String(utcParts.month).padStart(2, "0")}-${String(utcParts.day).padStart(2, "0")}T${String(utcParts.hour).padStart(2, "0")}:${String(utcParts.minute).padStart(2, "0")}:${String(utcParts.second).padStart(2, "0")}Z`;

  const vimshottariDasha = calculateVimshottari(
    moon ? moon.longitude : ascDegree,
    utcIsoString
  );

  return {
    basicDetails: {
      name: inputs.name,
      gender: inputs.gender,
      timezone: formatTimezoneString(inputs.timezone),
      birthDate: `${inputs.year}-${String(inputs.month).padStart(2, "0")}-${String(inputs.day).padStart(2, "0")}`,
      localTime: `${String(inputs.hour).padStart(2, "0")}:${String(inputs.minute).padStart(2, "0")}:${String(inputs.second).padStart(2, "0")}`,
      utc: utcIsoString,
      location: {
        city: inputs.city,
        latitude: inputs.latitude,
        longitude: inputs.longitude,
      },
    },
    ayanamsa: Number(ayanamsa.toFixed(8)),
    ascendant: {
      degree: ascDegree,
      sign: RASHIS[ascSignIndex],
      nakshatra: ascNakshatra,
    },
    sunSign: sun ? sun.sign : RASHIS[ascSignIndex],
    moonSign: moon ? moon.sign : RASHIS[ascSignIndex],
    planets: enrichedPlanets.map((planet) => ({
      name: planet.name,
      longitude: planet.longitude,
      degreeInSign: Number(planet.degreeInSign.toFixed(4)),
      sign: planet.sign,
      house: planet.house,
      isRetrograde: planet.isRetrograde,
      nakshatra: {
        name: planet.nakshatra.name,
        lord: planet.nakshatra.lord,
        pada: planet.nakshatra.pada,
      },
      navamsaSign: RASHIS[planet.navamsaSignIndex],
      dashamsaSign: RASHIS[planet.dashamsaSignIndex],
      benefic: planet.isBenefic,
    })),
    houses,
    charts: {
      d1: d1Placements,
      chandra: chandraPlacements,
      d9: d9Placements,
      d10: d10Placements,
    },
    nakshatras: {
      sun: sun
        ? {
          name: sun.nakshatra.name,
          pada: sun.nakshatra.pada,
          lord: sun.nakshatra.lord,
        }
        : null,
      moon: moon
        ? {
          name: moon.nakshatra.name,
          pada: moon.nakshatra.pada,
          lord: moon.nakshatra.lord,
        }
        : null,
      ascendant: {
        name: ascNakshatra.name,
        pada: ascNakshatra.pada,
        lord: ascNakshatra.lord,
      },
    },
    dashas: vimshottariDasha,
  };
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  // Health Check Endpoint (for pre-warming/cold-starts)
  if (req.method === "GET" && req.url === "/health") {
    respondJson(res, 200, {
      status: "ok",
      engine: "astro-engine",
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Kundali Matching Endpoint
  if (req.method === "POST" && req.url === "/api/kundali-matching") {
    try {
      const body = await readJsonBody(req);
      const { person1, person2 } = body;

      if (!person1 || !person2) {
        respondJson(res, 400, { error: "Both person1 and person2 are required" });
        return;
      }

      console.log("[Kundali Matching] Received request for:", person1.name, "and", person2.name);

      // Generate Kundalis for both
      const kundali1 = computeKundali({
        name: person1.name,
        gender: person1.gender || "male",
        year: new Date(person1.dateOfBirth).getFullYear(),
        month: new Date(person1.dateOfBirth).getMonth() + 1,
        day: new Date(person1.dateOfBirth).getDate(),
        hour: parseInt(person1.timeOfBirth.split(":")[0]) || 12,
        minute: parseInt(person1.timeOfBirth.split(":")[1]) || 0,
        second: parseInt(person1.timeOfBirth.split(":")[2]) || 0,
        latitude: person1.placeOfBirth.latitude,
        longitude: person1.placeOfBirth.longitude,
        timezone: 5.5,
      });

      const kundali2 = computeKundali({
        name: person2.name,
        gender: person2.gender || "female",
        year: new Date(person2.dateOfBirth).getFullYear(),
        month: new Date(person2.dateOfBirth).getMonth() + 1,
        day: new Date(person2.dateOfBirth).getDate(),
        hour: parseInt(person2.timeOfBirth.split(":")[0]) || 12,
        minute: parseInt(person2.timeOfBirth.split(":")[1]) || 0,
        second: parseInt(person2.timeOfBirth.split(":")[2]) || 0,
        latitude: person2.placeOfBirth.latitude,
        longitude: person2.placeOfBirth.longitude,
        timezone: 5.5,
      });

      // Calculate Guna Milan (Ashtakoot)
      const moon1 = kundali1.planets.find(p => p.name === "Moon");
      const moon2 = kundali2.planets.find(p => p.name === "Moon");

      // Helper functions for Guna calculations
      const getVarna = (moonSign) => {
        const varnas = {
          "Cancer": "Brahmin", "Scorpio": "Brahmin", "Pisces": "Brahmin",
          "Aries": "Kshatriya", "Leo": "Kshatriya", "Sagittarius": "Kshatriya",
          "Taurus": "Vaisya", "Virgo": "Vaisya", "Capricorn": "Vaisya",
          "Gemini": "Shudra", "Libra": "Shudra", "Aquarius": "Shudra"
        };
        return varnas[moonSign] || "Unknown";
      };

      const getVashya = (moonSign) => {
        const vashyas = {
          "Aries": "Quadruped", "Taurus": "Quadruped", "Leo": "Quadruped",
          "Sagittarius": "Manav", "Gemini": "Manav", "Virgo": "Manav",
          "Libra": "Manav", "Aquarius": "Manav",
          "Cancer": "Jalchar", "Pisces": "Jalchar", "Capricorn": "Jalchar",
          "Scorpio": "Keeta"
        };
        return vashyas[moonSign] || "Unknown";
      };

      const getTara = (nakIndex1, nakIndex2) => {
        const diff = ((nakIndex2 - nakIndex1 + 27) % 27);
        const taraGroup = diff % 9;
        const taras = ["Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhak", "Vadha", "Mitra", "Param Mitra"];
        return taras[taraGroup];
      };

      const getYoni = (nakIndex) => {
        const yonis = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow",
          "Buffalo", "Tiger", "Hare", "Monkey", "Lion", "Mongoose"];
        const yoniMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        return yonis[yoniMap[nakIndex - 1]];
      };

      const getGana = (nakIndex) => {
        const ganaMap = [0, 0, 1, 1, 0, 2, 0, 2, 2, 2, 0, 0, 1, 1, 2, 0, 0, 2, 2, 0, 0, 1, 1, 2, 0, 0, 0];
        const ganas = ["Deva", "Manushya", "Rakshasa"];
        return ganas[ganaMap[nakIndex - 1]];
      };

      const getNadi = (nakIndex) => {
        const nadis = ["Adi", "Madhya", "Antya"];
        return nadis[(nakIndex - 1) % 3];
      };

      const getRasiLord = (moonSign) => {
        const lords = {
          "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
          "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
          "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter",
          "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
        };
        return lords[moonSign] || "Unknown";
      };

      // Calculate each Guna with AstroSage-compatible scoring
      const varna1 = getVarna(moon1.sign);
      const varna2 = getVarna(moon2.sign);
      const varnaOrder = { "Brahmin": 4, "Kshatriya": 3, "Vaisya": 2, "Shudra": 1 };
      const varnaScore = (varnaOrder[varna1] >= varnaOrder[varna2]) ? 1 : 0;

      const vashya1 = getVashya(moon1.sign);
      const vashya2 = getVashya(moon2.sign);
      let vashyaScore = 0;
      if (vashya1 === vashya2) vashyaScore = 2;
      else if ((vashya1 === "Manav" && vashya2 === "Jalchar") || (vashya1 === "Jalchar" && vashya2 === "Manav")) vashyaScore = 0.5;
      else if ((vashya1 === "Quadruped" && vashya2 === "Manav") || (vashya1 === "Manav" && vashya2 === "Quadruped")) vashyaScore = 1;
      else vashyaScore = 0;

      const tara1 = getTara(moon1.nakshatra.index, moon2.nakshatra.index);
      const tara2 = getTara(moon2.nakshatra.index, moon1.nakshatra.index);
      const goodTaras = ["Sadhak", "Mitra", "Param Mitra", "Sampat", "Kshema"];
      const taraScore = (goodTaras.includes(tara1) && goodTaras.includes(tara2)) ? 3 : 1.5;

      const yoni1 = getYoni(moon1.nakshatra.index);
      const yoni2 = getYoni(moon2.nakshatra.index);
      let yoniScore = 0;
      if (yoni1 === yoni2) yoniScore = 4;
      else if ((yoni1 === "Horse" && yoni2 === "Horse") || (yoni1 === "Elephant" && yoni2 === "Elephant")) yoniScore = 4;
      else if ((yoni1 === "Buffalo" && yoni2 === "Cow") || (yoni1 === "Cow" && yoni2 === "Buffalo")) yoniScore = 3;
      else yoniScore = 2;

      const lord1 = getRasiLord(moon1.sign);
      const lord2 = getRasiLord(moon2.sign);
      let grahaMaitriScore = 0;
      if (lord1 === lord2) grahaMaitriScore = 5;
      else {
        const friendships = {
          "Sun": ["Moon", "Mars", "Jupiter"],
          "Moon": ["Sun", "Mercury"],
          "Mars": ["Sun", "Moon", "Jupiter"],
          "Mercury": ["Sun", "Venus"],
          "Jupiter": ["Sun", "Moon", "Mars"],
          "Venus": ["Mercury", "Saturn"],
          "Saturn": ["Mercury", "Venus"]
        };
        if (friendships[lord1] && friendships[lord1].includes(lord2)) grahaMaitriScore = 4;
        else grahaMaitriScore = 0.5;
      }

      const gana1 = getGana(moon1.nakshatra.index);
      const gana2 = getGana(moon2.nakshatra.index);
      let ganaScore = 0;
      if (gana1 === gana2) ganaScore = 6;
      else if ((gana1 === "Deva" && gana2 === "Manushya") || (gana1 === "Manushya" && gana2 === "Deva")) ganaScore = 6;
      else if ((gana1 === "Manushya" && gana2 === "Rakshasa") || (gana1 === "Rakshasa" && gana2 === "Manushya")) ganaScore = 0;
      else ganaScore = 0;

      // Bhakoot - sign compatibility
      const getSignIndex = (sign) => RASHIS.indexOf(sign);
      const sign1Index = getSignIndex(moon1.sign);
      const sign2Index = getSignIndex(moon2.sign);
      const signDiff = Math.abs(sign1Index - sign2Index);
      const bhakootScore = (signDiff === 6 || signDiff === 8 || signDiff === 2 || signDiff === 12) ? 0 : 7;

      const nadi1 = getNadi(moon1.nakshatra.index);
      const nadi2 = getNadi(moon2.nakshatra.index);
      const nadiScore = nadi1 !== nadi2 ? 8 : 0;

      const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaMaitriScore + ganaScore + bhakootScore + nadiScore;

      // Mangal Dosha calculation
      const calculateMangalDosha = (kundali) => {
        const mars = kundali.planets.find(p => p.name === "Mars");
        if (!mars) return "No Mangal Dosha";
        const house = mars.house;
        if ([1, 4, 7, 8, 12].includes(house)) return "High Mangal Dosha";
        if ([2].includes(house)) return "Low Mangal Dosha";
        return "No Mangal Dosha";
      };

      const mangalDosha1 = calculateMangalDosha(kundali1);
      const mangalDosha2 = calculateMangalDosha(kundali2);

      console.log("[Kundali Matching] Total Score:", totalScore, "/36");

      const matchingResult = {
        totalScore: Math.round(totalScore * 10) / 10,
        maxScore: 36,
        percentage: Math.round((totalScore / 36) * 100),
        compatibility: totalScore >= 28 ? "Excellent" : totalScore >= 24 ? "Very Good" : totalScore >= 18 ? "Good" : "Average",
        details: [
          { name: "Varna (à¤µà¤°à¥à¤£)", boyValue: varna1, girlValue: varna2, score: varnaScore, maxScore: 1, areaOfLife: "Work", description: "Spiritual compatibility and ego levels" },
          { name: "Vashya (à¤µà¤¶à¥à¤¯)", boyValue: vashya1, girlValue: vashya2, score: vashyaScore, maxScore: 2, areaOfLife: "Dominance", description: "Mutual attraction and control" },
          { name: "Tara (à¤¤à¤¾à¤°à¤¾)", boyValue: tara1, girlValue: tara2, score: taraScore, maxScore: 3, areaOfLife: "Destiny", description: "Birth star compatibility and health" },
          { name: "Yoni (à¤¯à¥‹à¤¨à¤¿)", boyValue: yoni1, girlValue: yoni2, score: yoniScore, maxScore: 4, areaOfLife: "Mentality", description: "Sexual compatibility and intimacy" },
          { name: "Graha Maitri (à¤—à¥à¤°à¤¹ à¤®à¥ˆà¤¤à¥à¤°à¥€)", boyValue: lord1, girlValue: lord2, score: grahaMaitriScore, maxScore: 5, areaOfLife: "Compatibility", description: "Mental compatibility and friendship" },
          { name: "Gana (à¤—à¤£)", boyValue: gana1, girlValue: gana2, score: ganaScore, maxScore: 6, areaOfLife: "Guna Level", description: "Temperament and behavior compatibility" },
          { name: "Bhakoot (à¤­à¤•à¥‚à¤Ÿ)", boyValue: moon1.sign, girlValue: moon2.sign, score: bhakootScore, maxScore: 7, areaOfLife: "Love", description: "Love and prosperity" },
          { name: "Nadi (à¤¨à¤¾à¤¡à¥€)", boyValue: nadi1, girlValue: nadi2, score: nadiScore, maxScore: 8, areaOfLife: "Health", description: "Health and progeny" }
        ],
        mangalDosha: {
          boy: mangalDosha1,
          girl: mangalDosha2,
          compatible: mangalDosha1 === mangalDosha2 || (mangalDosha1 === "No Mangal Dosha" && mangalDosha2 === "No Mangal Dosha")
        },
        boyDetails: {
          varna: varna1,
          vashya: vashya1,
          tara: tara1,
          yoni: yoni1,
          gana: gana1,
          nadi: nadi1,
          rasiLord: lord1,
          moonSign: moon1.sign
        },
        girlDetails: {
          varna: varna2,
          vashya: vashya2,
          tara: tara2,
          yoni: yoni2,
          gana: gana2,
          nadi: nadi2,
          rasiLord: lord2,
          moonSign: moon2.sign
        },
        recommendation: totalScore >= 28
          ? "Excellent match! This union is highly auspicious according to Vedic astrology. The couple is likely to have a harmonious and prosperous married life."
          : totalScore >= 24
            ? "Very good compatibility! This match shows strong potential for a happy marriage. Minor differences can be resolved with understanding and mutual respect."
            : totalScore >= 18
              ? "Good compatibility. The match is favorable for marriage. Consult an astrologer for remedies to strengthen weaker areas."
              : "Average compatibility. Marriage is possible but may require effort and understanding. Recommended to consult an expert astrologer for detailed analysis and remedies."
      };

      respondJson(res, 200, matchingResult);
    } catch (error) {
      console.error("[astro-engine] Kundali matching error:", error);
      respondJson(res, 400, { error: error.message || "Unable to match kundalis" });
    }
    return;
  }

  // WhatsApp Status Endpoint
  if (req.method === "GET" && req.url === "/whatsapp/status") {
    respondJson(res, 200, {
      status: connectionStatus,
      qr: currentQR,
      connected: connectionStatus === "CONNECTED",
    });
    return;
  }

  // WhatsApp Send Message Endpoint
  if (req.method === "POST" && req.url === "/whatsapp/send") {
    try {
      const body = await readJsonBody(req);
      const { phoneNumber, message } = body;

      console.log("[WhatsApp] Send request received");
      console.log("[WhatsApp] Original phone number:", phoneNumber);

      if (!phoneNumber || !message) {
        respondJson(res, 400, { error: "Phone number and message required" });
        return;
      }

      if (connectionStatus !== "CONNECTED" || !whatsappSocket) {
        console.log("[WhatsApp] Not connected, status:", connectionStatus);
        respondJson(res, 503, {
          error: "WhatsApp not connected",
          status: connectionStatus,
        });
        return;
      }

      const formattedNumber = phoneNumber.replace(/[+\s-]/g, "") + "@s.whatsapp.net";
      console.log("[WhatsApp] Formatted number for sending:", formattedNumber);
      console.log("[WhatsApp] Message length:", message.length);

      await whatsappSocket.sendMessage(formattedNumber, { text: message });
      console.log("[WhatsApp] Message sent successfully to:", formattedNumber);

      respondJson(res, 200, { success: true, sent: true });
    } catch (error) {
      console.error("[WhatsApp] Send error:", error);
      respondJson(res, 500, {
        error: "Failed to send message",
        details: error.message,
      });
    }
    return;
  }

  // WhatsApp Disconnect Endpoint
  if (req.method === "POST" && req.url === "/whatsapp/disconnect") {
    try {
      // Only try to logout if actually connected
      if (whatsappSocket && connectionStatus === "CONNECTED") {
        try {
          await whatsappSocket.logout();
        } catch (logoutError) {
          console.log("[WhatsApp] Logout failed (connection already closed):", logoutError.message);
        }
      }

      whatsappSocket = null;
      connectionStatus = "DISCONNECTED";
      currentQR = null;

      const authPath = path.resolve(__dirname, "whatsapp-auth");
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
      }

      respondJson(res, 200, { success: true, disconnected: true });
    } catch (error) {
      console.error("[WhatsApp] Disconnect error:", error);
      // Still return success even if there was an error, as we're disconnecting anyway
      connectionStatus = "DISCONNECTED";
      whatsappSocket = null;
      respondJson(res, 200, { success: true, disconnected: true });
    }
    return;
  }

  // WhatsApp Reconnect Endpoint
  if (req.method === "POST" && req.url === "/whatsapp/reconnect") {
    connectionStatus = "CONNECTING";
    currentQR = null;
    startWhatsAppConnection();
    respondJson(res, 200, { success: true, reconnecting: true });
    return;
  }

  // Kundali Endpoint
  if (req.method !== "POST" || req.url !== "/kundali") {
    respondJson(res, 404, { error: "Not found" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const kundali = computeKundali(body);
    respondJson(res, 200, kundali);
  } catch (error) {
    console.error("[astro-engine] Error:", error);
    respondJson(res, 400, {
      error: error.message || "Unable to generate kundali",
    });
  }
});

// ============================================================================
// BAILEYS WHATSAPP INTEGRATION
// ============================================================================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

let whatsappSocket = null;
let currentQR = null;
let connectionStatus = "DISCONNECTED"; // DISCONNECTED, CONNECTING, SCAN_QR, CONNECTED

async function startWhatsAppConnection() {
  try {
    const authPath = path.resolve(__dirname, "whatsapp-auth");

    // Create auth directory if it doesn't exist
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: P({ level: "silent" }), // Silent logging
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQR = qr;
        connectionStatus = "SCAN_QR";
        console.log("[WhatsApp] QR Code generated - scan to connect");
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(
          "[WhatsApp] Connection closed. Reconnecting:",
          shouldReconnect
        );
        if (shouldReconnect) {
          connectionStatus = "CONNECTING";
          setTimeout(startWhatsAppConnection, 3000);
        } else {
          connectionStatus = "DISCONNECTED";
          currentQR = null;
        }
      } else if (connection === "open") {
        console.log("[WhatsApp] âœ… Connected successfully!");
        connectionStatus = "CONNECTED";
        currentQR = null;
      } else if (connection === "connecting") {
        connectionStatus = "CONNECTING";
      }
    });

    whatsappSocket = sock;
  } catch (error) {
    console.error("[WhatsApp] Connection error:", error);
    connectionStatus = "DISCONNECTED";
    setTimeout(startWhatsAppConnection, 5000);
  }
}

// Start WhatsApp connection on server start
startWhatsAppConnection();

server.listen(PORT, () => {
  console.log(`[astro-engine] Listening on http://localhost:${PORT}/kundali`);
  console.log(`[astro-engine] WhatsApp endpoints available:`);
  console.log(`  - GET  /whatsapp/status`);
  console.log(`  - POST /whatsapp/send`);
  console.log(`  - POST /whatsapp/disconnect`);
  console.log(`  - POST /whatsapp/reconnect`);
});
