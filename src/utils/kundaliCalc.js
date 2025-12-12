// Accurate rashi and house mapping helpers (Viprakarma.kundali.fixes.docx)

const RASHIS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
  'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function getRashiFromDegree(deg) {
  const idx = Math.floor(((deg % 360) + 360) % 360 / 30);
  return RASHIS[idx];
}

function mapPlanetToHouse(lagnaDeg, planetDeg) {
  const diff = (planetDeg - lagnaDeg + 360) % 360;
  return Math.floor(diff / 30) + 1; // 1..12 (Whole Sign)
}

function createHouses(lagnaDeg) {
  const lagnaIdx = Math.floor(((lagnaDeg % 360) + 360) % 360 / 30);
  return Array.from({ length: 12 }, (_, i) => ({
    houseNumber: i + 1,
    rashi: RASHIS[(lagnaIdx + i) % 12]
  }));
}

// utils/kundaliCalc.js
import { julian, solar, moonposition, planetposition } from "astronomia";
import planetdata from "astronomia/data";

/*
  Helper functions:
  - getJDFromDate: returns JDE (julian Date epoch) from JS Date + timezone offset (hours)
  - getPlanetLongitudes: returns ecliptic longitudes (degrees 0..360) for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu/Ketu (approx)
  - getAscendant: compute ascendant (Lagna) degree using sidereal/local sidereal time approximate method
  - getRashi, getNakshatra etc.
  - computeVimshottari: compute mahadasha sequence with start/end years based on moon nakshatra fractional progress
*/

const toDegrees = rad => (rad * 180) / Math.PI;
const normalize360 = d => ((d % 360) + 360) % 360;

// Lahiri Ayanamsa calculation for Vedic astrology (sidereal zodiac)
// Reference epoch: 1900-01-01, Ayanamsa = 22.46°
// Rate: approximately 50.27" per year (0.01397° per year)
export function getLahiriAyanamsa(jde) {
  // JDE for 1900-01-01 is approximately 2415020.5
  const jde1900 = 2415020.5;
  const ayanamsa1900 = 22.46; // degrees
  const yearsSince1900 = (jde - jde1900) / 365.25;
  const ayanamsa = ayanamsa1900 + (yearsSince1900 * 50.27 / 3600); // 50.27 arcseconds per year
  return ayanamsa;
}

// Convert tropical longitude to sidereal (Vedic) longitude
export function tropicalToSidereal(tropicalLon, jde) {
  const ayanamsa = getLahiriAyanamsa(jde);
  return normalize360(tropicalLon - ayanamsa);
}

// Julian / JDE conversion using astronomia
export function getJDEFromDate(date /* JS Date in UTC */) {
  // astronomia expects a JS Date (UTC) -> DateToJDE handles it
  return julian.DateToJDE(date);
}

// Planet longitudes (geocentric ecliptic longitude) - SIDEREAL (Vedic)
export function getPlanetLongitudes(date /* JS Date UTC */) {
  const jde = getJDEFromDate(date);

  // Earth used for apparent Sun
  const earth = new planetposition.Planet(planetdata.earth);

  // Sun (tropical)
  const sunPos = solar.apparentVSOP87(earth, jde);
  const sunLonTropical = normalize360(sunPos.lon * 180 / Math.PI);

  // Moon (tropical)
  const moonPos = moonposition.position(jde);
  const moonLonTropical = normalize360(moonPos.lon * 180 / Math.PI);

  // Planets via planetposition (tropical)
  const merc = new planetposition.Planet(planetdata.mercury);
  const venus = new planetposition.Planet(planetdata.venus);
  const mars = new planetposition.Planet(planetdata.mars);
  const jup = new planetposition.Planet(planetdata.jupiter);
  const sat = new planetposition.Planet(planetdata.saturn);

  const mercPos = merc.position(jde);
  const venusPos = venus.position(jde);
  const marsPos = mars.position(jde);
  const jupPos = jup.position(jde);
  const satPos = sat.position(jde);

  const mercLonTropical = normalize360(mercPos.lon * 180 / Math.PI);
  const venusLonTropical = normalize360(venusPos.lon * 180 / Math.PI);
  const marsLonTropical = normalize360(marsPos.lon * 180 / Math.PI);
  const jupLonTropical = normalize360(jupPos.lon * 180 / Math.PI);
  const satLonTropical = normalize360(satPos.lon * 180 / Math.PI);

  // Convert all to sidereal (Vedic) using Lahiri Ayanamsa
  const sunLon = tropicalToSidereal(sunLonTropical, jde);
  const moonLon = tropicalToSidereal(moonLonTropical, jde);
  const mercLon = tropicalToSidereal(mercLonTropical, jde);
  const venusLon = tropicalToSidereal(venusLonTropical, jde);
  const marsLon = tropicalToSidereal(marsLonTropical, jde);
  const jupLon = tropicalToSidereal(jupLonTropical, jde);
  const satLon = tropicalToSidereal(satLonTropical, jde);

  // Rahu & Ketu (mean lunar nodes) - already sidereal
  // True node calculation: Rahu is the ascending node
  const nodeLon = moonPos.node ? normalize360(moonPos.node * 180 / Math.PI) : normalize360(moonLon + 180);
  const nodeLonSidereal = tropicalToSidereal(nodeLon, jde);
  const rahuLon = normalize360(nodeLonSidereal); // Rahu is the ascending node
  const ketuLon = normalize360(nodeLonSidereal + 180); // Ketu is opposite to Rahu

  return {
    Sun: sunLon,
    Moon: moonLon,
    Mercury: mercLon,
    Venus: venusLon,
    Mars: marsLon,
    Jupiter: jupLon,
    Saturn: satLon,
    Rahu: rahuLon,
    Ketu: ketuLon,
  };
}

// Compute Greenwich Mean Sidereal Time (in hours) from JDE
// Using astronomia sidereal module
import * as sid from "astronomia/sidereal";
export function getGMSTHours(date /* JS Date UTC */) {
  const jde = getJDEFromDate(date);
  // astronomia sidereal.mean returns seconds (0-86400)
  const gmstSeconds = sid.mean(jde);
  const gmstHours = gmstSeconds / 3600; // convert to hours
  return ((gmstHours % 24) + 24) % 24;
}

// Compute Ascendant (Lagna) in ecliptic longitude degrees - SIDEREAL (Vedic)
// Parameters: date (JS Date UTC), latitude (degrees), longitude (degrees)
export function getAscendant(date, latitude, longitude) {
  const jde = getJDEFromDate(date);

  // Steps:
  // - compute Local Sidereal Time (hours)
  const gmst = getGMSTHours(date);
  const lstHours = gmst + longitude / 15; // local sidereal time in hours
  const lst = (lstHours % 24 + 24) % 24; // 0..24

  // convert to radians
  const lstRad = (lst * 15) * Math.PI / 180; // hour angle in deg->rad
  const latRad = latitude * Math.PI / 180;
  const eps = 23.439291111 * Math.PI / 180; // obliquity rad

  // Formula from spherical trig for ecliptic ascendant:
  // asc = atan2( sin(LST) * cos(eps) - tan(lat) * sin(eps), cos(LST) )
  const x = Math.sin(lstRad) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);
  const y = Math.cos(lstRad);
  const ascRad = Math.atan2(x, y); // in radians (ecliptic longitude of ascendant)
  let ascDegTropical = normalize360(toDegrees(ascRad));
  // astronomia variations may differ sign — ensure correct quadrant:
  if (ascDegTropical < 0) ascDegTropical += 360;

  // Convert to sidereal (Vedic) using Lahiri Ayanamsa
  const ascDegSidereal = tropicalToSidereal(ascDegTropical, jde);
  return ascDegSidereal;
}

// Rashi (zodiac) and house methods
export const rashiNames = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
export function getRashi(deg) {
  return rashiNames[Math.floor(normalize360(deg) / 30)];
}

// Nakshatra list and index
export const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
export function getNakshatra(deg) {
  const index = Math.floor(normalize360(deg) / (360 / 27));
  const fraction = (normalize360(deg) % (360 / 27)) / (360 / 27); // 0..1 within nakshatra
  return { name: nakshatras[index], index, fraction };
}

// Houses: map planet deg to house number (1..12) with first house = ascendant
export function getHouseForDegree(planetDeg, ascDeg) {
  const diff = normalize360(planetDeg - ascDeg);
  const houseIndex = Math.floor(diff / 30); // 0..11
  return houseIndex + 1;
}

/* ==== Vimshottari Mahadasha ==== */

// Standard sequence of lords starting from Ketu — but start depends on Moon's nakshatra lord
export const vimshottariSequence = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];
export const vimshottariYears = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17
};

// mapping nakshatra index -> lord (0..26)
const nakshatraLords = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
  "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury"
];

// Utility to add years (fractional) to a JS Date
function addYearsToDate(date, years) {
  const ms = years * 365.2425 * 24 * 3600 * 1000;
  return new Date(date.getTime() + ms);
}

export function computeVimshottari(dobUtcDate /* JS Date UTC */, moonDeg) {
  // Determine current nakshatra and fraction progressed
  const { index: nakIndex, fraction } = getNakshatra(moonDeg);
  const startingLord = nakshatraLords[nakIndex]; // e.g. "Venus" etc.

  // Find index of startingLord in vimshottariSequence
  const seq = vimshottariSequence;
  const startIdx = seq.indexOf(startingLord);

  // The mahadasha at birth starts with that planet but only leftover portion:
  // remaining fraction in that nakshatra = 1 - fraction
  const remainingFraction = 1 - fraction;

  // compute remaining years of starting dasha
  const startLordYears = vimshottariYears[startingLord];
  const startRemainingYears = remainingFraction * startLordYears;

  const result = [];
  // push starting partial dasha
  let runningYears = 0;
  const startDate = dobUtcDate;

  // Build sequence from startIdx for full cycle until maybe 120 years (sum ~120)
  const cycleOrder = [];
  for (let i = 0; i < 9; i++) cycleOrder.push(seq[(startIdx + i) % 9]);

  // Starting dasha
  let curStart = startDate;
  let curYears = startRemainingYears;
  let curEnd = addYearsToDate(curStart, curYears);
  result.push({
    lord: cycleOrder[0],
    years: +curYears.toFixed(6),
    start: new Date(curStart),
    end: new Date(curEnd),
    partial: true
  });

  // subsequent full dashas
  curStart = curEnd;
  for (let j = 1; j < 50; j++) { // limit to 50 segments (overkill)
    const lord = cycleOrder[j % cycleOrder.length];
    const years = vimshottariYears[lord];
    const nextEnd = addYearsToDate(curStart, years);
    // stop if beyond ~120 years from birth (practical)
    if (nextEnd.getFullYear() - dobUtcDate.getFullYear() > 120) break;
    result.push({
      lord,
      years,
      start: new Date(curStart),
      end: new Date(curEnd),
      partial: false
    });
    curStart = nextEnd;
  }

  return result;
}

/* Single generate function that returns full object */
export function generateKundali(dobLocal /* object with fields or JS Date */, lat, lon, tzOffsetHours = 0) {
  // Accurate time conversion: local → UTC (before sweph)
  // dobLocal is JS Date in local time; convert to UTC
  // If dobLocal is already UTC, skip conversion. Otherwise, apply tzOffsetHours
  let dateUtc = dobLocal;
  if (tzOffsetHours) {
    dateUtc = new Date(dobLocal.getTime() - tzOffsetHours * 60 * 60 * 1000);
  }
  const planets = getPlanetLongitudes(dateUtc);
  const lagnaDegree = getAscendant(dateUtc, lat, lon);

  // Get Sun and Moon signs
  const sunSign = getRashiFromDegree(planets.Sun);
  const moonSign = getRashiFromDegree(planets.Moon);
  const ascendantSign = getRashiFromDegree(lagnaDegree);

  // Use new helpers for rashi/house mapping
  const planetEntries = Object.entries(planets).map(([name, degree]) => ({
    name,
    degree: +degree,
    rashi: getRashiFromDegree(degree),
    house: mapPlanetToHouse(lagnaDegree, degree)
  }));
  const houses = createHouses(lagnaDegree);

  // Format dates for display
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Return in format expected by the page (matching astro-engine API)
  return {
    sunSign,
    moonSign,
    ascendant: {
      sign: ascendantSign,
      degree: lagnaDegree
    },
    basicDetails: {
      birthDate: dobLocal.toISOString().split('T')[0], // YYYY-MM-DD format
      localTime: formatTime(dobLocal),
      utcTime: formatTime(dateUtc),
      location: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
      latitude: lat,
      longitude: lon
    },
    planets: planetEntries,
    houses,
    // Additional fields for compatibility
    lagnaDegree,
    charts: {
      d1: {}, // Placeholder for now
      chandra: {},
      d9: {},
      d10: {}
    }
  };
}

