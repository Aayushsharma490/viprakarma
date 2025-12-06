'use strict';

/**
 * Astro Engine (FIX MODE)
 * -----------------------
 * Dedicated Node.js microservice that performs all Swiss Ephemeris
 * calculations outside the Next.js serverless runtime.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const sweph = require('sweph');

const PORT = Number(process.env.ASTRO_ENGINE_PORT || 5005);
const EPHE_PATH =
  process.env.SWE_EPHE_PATH ||
  path.resolve(process.cwd(), 'public', 'swisseph-master', 'ephe');

const { constants } = sweph;

// --- FIX MODE: Swiss Ephemeris .se1 loading ---
console.log('[astro-engine][FIX MODE] EPHE_PATH resolved to:', EPHE_PATH);
let epheOk = false;
try {
  const stat = fs.statSync(EPHE_PATH);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(EPHE_PATH);
    const hasSe1 = files.some((f) => f.toLowerCase().endsWith('.se1'));
    if (!hasSe1) {
      console.error('[astro-engine][FIX MODE] No .se1 files found in EPHE_PATH');
    } else {
      epheOk = true;
    }
  } else {
    console.error('[astro-engine][FIX MODE] EPHE_PATH is not a directory');
  }
} catch (err) {
  console.error('[astro-engine][FIX MODE] Failed to inspect EPHE_PATH:', err);
}

if (!epheOk) {
  throw new Error('EPHE FILES NOT LOADED');
}

// Make sure Swiss Ephemeris always uses external ephemeris files with Lahiri
console.log('[astro-engine][FIX MODE] set_ephe_path + set_sid_mode(LAHIRI)');
sweph.set_ephe_path(EPHE_PATH);
sweph.set_sid_mode(constants.SE_SIDM_LAHIRI, 0, 0);

const RASHIS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const SIGN_TYPES = [
  'movable',
  'fixed',
  'dual',
  'movable',
  'fixed',
  'dual',
  'movable',
  'fixed',
  'dual',
  'movable',
  'fixed',
  'dual',
];

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

const NAKSHATRA_LORDS = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];

const BENEFIC_PLANETS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);

const PLANET_CONFIG = [
  { id: constants.SE_SUN, name: 'Sun' },
  { id: constants.SE_MOON, name: 'Moon' },
  { id: constants.SE_MARS, name: 'Mars' },
  { id: constants.SE_MERCURY, name: 'Mercury' },
  { id: constants.SE_JUPITER, name: 'Jupiter' },
  { id: constants.SE_VENUS, name: 'Venus' },
  { id: constants.SE_SATURN, name: 'Saturn' },
  { id: constants.SE_MEAN_NODE, name: 'Rahu' },
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
  return `${deg}°${minutes}'${seconds}"`;
}

function parseTimezoneOffset(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length) {
    const match = value.trim().match(/^([+-]?)(\d{1,2})(?::?(\d{2}))?$/);
    if (match) {
      const sign = match[1] === '-' ? -1 : 1;
      const hours = Number(match[2]);
      const minutes = match[3] ? Number(match[3]) : 0;
      return sign * (hours + minutes / 60);
    }
  }

  // Default to IST if nothing valid is provided.
  return 5.5;
}

function toUtcDate({ year, month, day, hour, minute, second }, timezone) {
  const localMillis = Date.UTC(year, month - 1, day, hour, minute, second);
  const utcMillis = localMillis - timezone * 3600 * 1000;
  return new Date(utcMillis);
}

function calculateNakshatra(degree) {
  const normalized = normalizeDegree(degree);
  // 27 nakshatras → 13°20' each = 13.333333... degrees
  const span = 360 / 27; // 13.333333...
  const index = Math.floor(normalized / span);
  const withinNak = normalized % span;
  // 4 padas per nakshatra → 3°20' each = 3.333333... degrees
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
  const d10Index = Math.floor(degInSign / 3); // 0..9  (10 parts of 3°)

  // Movable: start from same sign
  // Fixed: start from 9th sign from it
  // Dual: start from 5th sign from it
  const signType = SIGN_TYPES[signIndex]; // movable/fixed/dual
  let startSign = signIndex;
  if (signType === 'fixed') {
    startSign = (signIndex + 8) % 12; // 9th from it (offset 8 because 0-based)
  } else if (signType === 'dual') {
    startSign = (signIndex + 4) % 12; // 5th from it
  }

  return (startSign + d10Index) % 12;
}

function houseFromAscendant(planetDegree, ascDegree) {
  const diff = normalizeDegree(planetDegree - ascDegree);
  return Math.floor(diff / 30) + 1;
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

function buildChartPlacements({ baseSignIndex, ascLabel, ascHouse, planets, houseResolver }) {
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
  const sign = offset >= 0 ? '+' : '-';
  const absolute = Math.abs(offset);
  const hours = Math.floor(absolute);
  const minutes = Math.round((absolute - hours) * 60);
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function respondJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function validateInput(body) {
  const required = ['year', 'month', 'day', 'hour', 'minute', 'second', 'latitude', 'longitude'];
  required.forEach((key) => {
    if (body[key] === undefined || body[key] === null || Number.isNaN(body[key])) {
      throw new Error(`Missing required field: ${key}`);
    }
  });

  return {
    name: body.name || 'Guest',
    gender: body.gender || 'unspecified',
    year: Number(body.year),
    month: Number(body.month),
    day: Number(body.day),
    hour: Number(body.hour),
    minute: Number(body.minute),
    second: Number(body.second || 0),
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    timezone: parseTimezoneOffset(body.timezone),
    city: body.city || 'Unknown',
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
  const vimshottariSequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
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
  let cursor = new Date(birthUtcDate);
  let currentIndex = startIndex;
  let spanYears = remainingYears;

  for (let i = 0; i < 12; i += 1) {
    const lord = vimshottariSequence[currentIndex % vimshottariSequence.length];
    const startDate = new Date(cursor);
    const endDate = new Date(startDate.getTime() + spanYears * 365.2425 * 24 * 3600 * 1000);
    dashas.push({
      planet: lord,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      years: Number(spanYears.toFixed(2)),
    });
    cursor = endDate;
    currentIndex += 1;
    spanYears = durations[vimshottariSequence[currentIndex % vimshottariSequence.length]];
  }

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

  const localTimeString = `${inputs.year}-${String(inputs.month).padStart(2, '0')}-${String(inputs.day).padStart(2, '0')}T${String(inputs.hour).padStart(2, '0')}:${String(inputs.minute).padStart(2, '0')}:${String(inputs.second).padStart(2, '0')}`;

  const utcDate = toUtcDate(localDate, inputs.timezone);
  const utcParts = formatDateParts(utcDate);

  console.log('[astro-engine] --------------------------------------------');
  console.log('[astro-engine] Input local time:', localTimeString);
  console.log('[astro-engine] Parsed timezone:', formatTimezoneString(inputs.timezone));
  console.log(
    '[astro-engine] Normalized UTC:',
    `${utcParts.year}-${String(utcParts.month).padStart(2, '0')}-${String(utcParts.day).padStart(2, '0')}T${String(utcParts.hour).padStart(2, '0')}:${String(utcParts.minute).padStart(2, '0')}:${String(utcParts.second).padStart(2, '0')}Z`,
  );
  console.log('[astro-engine] Ephemeris path:', EPHE_PATH);

  const jdResult = sweph.utc_to_jd(
    utcParts.year,
    utcParts.month,
    utcParts.day,
    utcParts.hour,
    utcParts.minute,
    utcParts.second,
    constants.SE_GREG_CAL,
  );

  if (jdResult.flag !== constants.OK) {
    throw new Error(jdResult.error || 'Unable to compute Julian Day');
  }

  const [jdEt, jdUt] = jdResult.data;
  const ayanamsaResult = sweph.get_ayanamsa_ex(jdEt, constants.SEFLG_SWIEPH);
  const ayanamsa = ayanamsaResult.data;

  console.log('[astro-engine] Ayanamsa (Lahiri):', ayanamsa.toFixed(8));

  const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED | constants.SEFLG_SIDEREAL;
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
      `[astro-engine] ${config.name}: ${siderealLongitude.toFixed(6)}° ${planetData.sign} (${nakshatra.name} p${nakshatra.pada})`,
    );
  });

  const rahu = planets.find((planet) => planet.name === 'Rahu');
  if (rahu) {
    const ketuLongitude = normalizeDegree(rahu.longitude + 180);
    const ketuSignIndex = getSignIndex(ketuLongitude);
    const ketuNakshatra = calculateNakshatra(ketuLongitude);
    planets.push({
      name: 'Ketu',
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
      `[astro-engine] Ketu: ${ketuLongitude.toFixed(6)}° ${RASHIS[ketuSignIndex]} (${ketuNakshatra.name} p${ketuNakshatra.pada})`,
    );
  }

  // FIX MODE: use Placidus houses in sidereal mode to get precise Asc,
  // then build whole-sign houses from ascendant sign.
  const housesResult = sweph.houses_ex2(
    jdUt,
    constants.SEFLG_SIDEREAL,
    inputs.latitude,
    inputs.longitude,
    'P',
  );
  if (housesResult.flag !== constants.OK) {
    throw new Error(housesResult.error || 'Failed to compute houses');
  }

  const ascDegree = normalizeDegree(housesResult.data.points[0]);
  const ascSignIndex = getSignIndex(ascDegree);
  const ascDegreeInSign = ascDegree % 30;
  const ascNakshatra = calculateNakshatra(ascDegree);

  // exact Placidus cusps (tropical already converted to sidereal by SEFLG_SIDEREAL)
  const houses = housesResult.data.houses.map((cusp, index) => ({
    house: index + 1,
    cusp: normalizeDegree(cusp),
    // whole-sign label: starting from ascendant sign
    sign: RASHIS[(ascSignIndex + index) % 12],
  }));

  const enrichedPlanets = planets.map((planet) => ({
    ...planet,
    house: houseFromAscendant(planet.longitude, ascDegree),
  }));

  const moon = enrichedPlanets.find((p) => p.name === 'Moon');
  const sun = enrichedPlanets.find((p) => p.name === 'Sun');

  const navAscSignIndex = getNavamsaSignIndex(ascDegree);
  const dashAscSignIndex = getDashamsaSignIndex(ascDegree);

  const d1Placements = buildChartPlacements({
    baseSignIndex: ascSignIndex,
    ascLabel: 'Asc',
    ascHouse: 1,
    planets: enrichedPlanets,
    houseResolver: (planet) => planet.house,
  });

  const chandraPlacements = buildChartPlacements({
    baseSignIndex: moon ? moon.signIndex : ascSignIndex,
    ascLabel: 'Moon',
    ascHouse: 1,
    planets: enrichedPlanets,
    houseResolver: (planet) => {
      const base = moon ? moon.signIndex : 0;
      return ((planet.signIndex - base + 12) % 12) + 1;
    },
  });

  const d9Placements = buildChartPlacements({
    baseSignIndex: navAscSignIndex,
    ascLabel: 'D9 Lagna',
    ascHouse: 1,
    planets: enrichedPlanets,
    houseResolver: (planet) => ((planet.navamsaSignIndex - navAscSignIndex + 12) % 12) + 1,
  });

  const d10Placements = buildChartPlacements({
    baseSignIndex: dashAscSignIndex,
    ascLabel: 'D10 Lagna',
    ascHouse: 1,
    planets: enrichedPlanets,
    houseResolver: (planet) => ((planet.dashamsaSignIndex - dashAscSignIndex + 12) % 12) + 1,
  });

  const dashas = calculateVimshottari(moon ? moon.longitude : ascDegree, utcDate);

  return {
    basicDetails: {
      name: inputs.name,
      gender: inputs.gender,
      timezone: formatTimezoneString(inputs.timezone),
      birthDate: `${inputs.year}-${String(inputs.month).padStart(2, '0')}-${String(inputs.day).padStart(2, '0')}`,
      localTime: `${String(inputs.hour).padStart(2, '0')}:${String(inputs.minute).padStart(2, '0')}:${String(inputs.second).padStart(2, '0')}`,
      utc: utcDate.toISOString(),
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
    dashas,
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/kundali') {
    respondJson(res, 404, { error: 'Not found' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const kundali = computeKundali(body);
    respondJson(res, 200, kundali);
  } catch (error) {
    console.error('[astro-engine] Error:', error);
    respondJson(res, 400, { error: error.message || 'Unable to generate kundali' });
  }
});

server.listen(PORT, () => {
  console.log(`[astro-engine] Listening on http://localhost:${PORT}/kundali`);
});

