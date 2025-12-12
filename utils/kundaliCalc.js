// utils/kundaliCalc.js
import { julian, solar, moonposition, planetposition, sidereal } from "astronomia";
import vsop87Bearth from "../node_modules/astronomia/data/vsop87Bearth.js";
import vsop87Bmercury from "../node_modules/astronomia/data/vsop87Bmercury.js";
import vsop87Bvenus from "../node_modules/astronomia/data/vsop87Bvenus.js";
import vsop87Bmars from "../node_modules/astronomia/data/vsop87Bmars.js";
import vsop87Bjupiter from "../node_modules/astronomia/data/vsop87Bjupiter.js";
import vsop87Bsaturn from "../node_modules/astronomia/data/vsop87Bsaturn.js";

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

// Julian / JDE conversion using astronomia
export function getJDEFromDate(date /* JS Date in UTC */) {
  // astronomia expects a JS Date (UTC) -> DateToJDE handles it
  return julian.DateToJDE(date);
}

// Planet longitudes (geocentric ecliptic longitude)
export function getPlanetLongitudes(date /* JS Date UTC */) {
  const jde = getJDEFromDate(date);

  // Earth used for apparent Sun
  const earth = new planetposition.Planet(vsop87Bearth);

  // Sun
  const sunPos = solar.apparentVSOP87(earth, jde);
  const sunLon = normalize360(sunPos.lon * 180 / Math.PI);

  // Moon
  const moonPos = moonposition.position(jde);
  const moonLon = normalize360(moonPos.lon * 180 / Math.PI);

  // Planets via planetposition
  const merc = new planetposition.Planet(vsop87Bmercury);
  const venus = new planetposition.Planet(vsop87Bvenus);
  const mars = new planetposition.Planet(vsop87Bmars);
  const jup = new planetposition.Planet(vsop87Bjupiter);
  const sat = new planetposition.Planet(vsop87Bsaturn);

  const mercPos = merc.position(jde);
  const venusPos = venus.position(jde);
  const marsPos = mars.position(jde);
  const jupPos = jup.position(jde);
  const satPos = sat.position(jde);

  const mercLon = normalize360(mercPos.lon * 180 / Math.PI);
  const venusLon = normalize360(venusPos.lon * 180 / Math.PI);
  const marsLon = normalize360(marsPos.lon * 180 / Math.PI);
  const jupLon = normalize360(jupPos.lon * 180 / Math.PI);
  const satLon = normalize360(satPos.lon * 180 / Math.PI);

  // Rahu & Ketu approx (mean lunar nodes) - astronomia has node functions but simple approximation:
  // Use moon's mean ascending node = Ω (longitude of ascending node). Rahu = Ω + 180?
  // We'll use moon position and mean node from moonposition (if available), else compute approximate:
  const nodeLon = moonPos.node ? normalize360(moonPos.node * 180 / Math.PI) : normalize360(moonLon + 180);
  const rahuLon = normalize360(nodeLon + 180); // Rahu opposite Ketu depending on convention
  const ketuLon = normalize360(nodeLon);

  return {
    Sun: sunLon,
    Moon: moonLon,
    Mercury: mercLon,
    Venus: venusLon,
    Mars: marsLon,
    Jupiter: jupLon,
    Saturn: satLon,
    Rahu: normalize360(rahuLon),
    Ketu: normalize360(ketuLon),
  };
}

// Compute Greenwich Mean Sidereal Time (in hours) from JDE
// Using astronomia sidereal.mean
import { sidereal as sid } from "astronomia";
export function getGMSTHours(date /* JS Date UTC */) {
  const jde = getJDEFromDate(date);
  // astronomia provides sidereal.mean
  const gmst = sid.mean(jde); // returns hours (0-24)
  return ((gmst % 24) + 24) % 24;
}

// Compute Ascendant (Lagna) in ecliptic longitude degrees
export function getAscendant(date /* JS Date UTC */, latitude /* deg */, longitude /* deg */) {
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
  let ascDeg = normalize360(toDegrees(ascRad));
  // astronomia variations may differ sign — ensure correct quadrant:
  if (ascDeg < 0) ascDeg += 360;
  return ascDeg;
}

// Rashi (zodiac) and house methods
export const rashiNames = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];
export function getRashi(deg) {
  return rashiNames[Math.floor(normalize360(deg) / 30)];
}

// Nakshatra list and index
export const nakshatras = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
  "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha",
  "Purva Bhadrapada","Uttara Bhadrapada","Revati"
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
  "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"
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
  "Ketu","Venus","Sun","Moon","Mars","Rahu",
  "Jupiter","Saturn","Mercury","Ketu","Venus","Sun",
  "Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
  "Ketu","Venus","Sun","Moon","Mars","Rahu",
  "Jupiter","Saturn","Mercury"
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
      end: new Date(nextEnd),
      partial: false
    });
    curStart = nextEnd;
  }

  return result;
}

/* Single generate function that returns full object */
export function generateKundali(dobLocal /* object with fields or JS Date */, lat, lon, tzOffsetHours = 0) {
  // dobLocal may be JS Date in local time; user must pass UTC Date to avoid confusion.
  // For simplicity require JS Date in UTC (Date object)
  const dateUtc = dobLocal; // expecting JS Date (UTC)
  const planets = getPlanetLongitudes(dateUtc);
  const asc = getAscendant(dateUtc, lat, lon);

  // build result
  const planetEntries = Object.entries(planets).map(([p, deg]) => ({
    planet: p,
    degree: +deg.toFixed(6),
    rashi: getRashi(deg),
    nakshatra: getNakshatra(deg).name,
    nakIndex: getNakshatra(deg).index,
    nakFraction: +getNakshatra(deg).fraction.toFixed(6),
    house: getHouseForDegree(deg, asc)
  }));

  // dasha computed using Moon degree
  const dashas = computeVimshottari(dateUtc, planets.Moon);

  return {
    planets: planetEntries,
    ascendant: { degree: +asc.toFixed(6), rashi: getRashi(asc), house: 1 },
    dashas
  };
}
