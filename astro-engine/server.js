"use strict";

/**
 * VipraKarma Astrology Engine
 * Version: 2.0 - Fixed all Guna calculations for exact AstroSage matching
 * Last updated: 2026-01-21 (FIX MODE)
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

// Rashi Lords (Sign Rulers)
const RASHI_LORDS = {
  "Aries": "Mars",
  "Taurus": "Venus",
  "Gemini": "Mercury",
  "Cancer": "Moon",
  "Leo": "Sun",
  "Virgo": "Mercury",
  "Libra": "Venus",
  "Scorpio": "Mars",
  "Sagittarius": "Jupiter",
  "Capricorn": "Saturn",
  "Aquarius": "Saturn",
  "Pisces": "Jupiter"
};

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
  return `${deg}°${minutes}'${seconds}"`;
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

function getNadiFromNakshatra(nakIndex) {
  if (!nakIndex) return "Unknown";
  // Groups: 1, 6, 7, 12, 13, 18, 19, 24, 25 -> Adi
  const adi = [1, 6, 7, 12, 13, 18, 19, 24, 25];
  const madhya = [2, 5, 8, 11, 14, 17, 20, 23, 26];
  const antya = [3, 4, 9, 10, 15, 16, 21, 22, 27];
  if (adi.includes(nakIndex)) return "Adi";
  if (madhya.includes(nakIndex)) return "Madhya";
  if (antya.includes(nakIndex)) return "Antya";
  return "Unknown";
}

function getTara(nak1, nak2) {
  const diff = (nak2 - nak1 + 27) % 9 || 9;
  const taras = ["", "Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhak", "Vadha", "Mitra", "Ati-Mitra"];
  return taras[diff];
}

// ===== PANCHANG CALCULATION FUNCTIONS =====

function calculateTithi(sunLong, moonLong) {
  // Tithi is based on the elongation of Moon from Sun
  const elongation = normalizeDegree(moonLong - sunLong);
  const tithiNumber = Math.floor(elongation / 12) + 1; // 1-30
  const tithiFraction = (elongation % 12) / 12;

  const tithiNames = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
  ];

  const tithiIndex = ((tithiNumber - 1) % 15);
  return {
    number: tithiNumber,
    name: tithiNames[tithiIndex],
    fraction: tithiFraction
  };
}

function calculateYoga(sunLong, moonLong) {
  // Yoga = (Sun longitude + Moon longitude) / 13.333...
  const sum = normalizeDegree(sunLong + moonLong);
  const yogaNumber = Math.floor(sum / (360 / 27)) + 1; // 1-27

  const yogaNames = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti"
  ];

  return yogaNames[(yogaNumber - 1) % 27];
}

function calculateKarana(sunLong, moonLong) {
  // Karana is half of Tithi
  const elongation = normalizeDegree(moonLong - sunLong);
  const karanaNumber = Math.floor(elongation / 6) + 1; // 1-60

  // 11 Karanas: 4 fixed + 7 movable (repeated 8 times)
  const karanaNames = [
    "Bava", "Balava", "Kaulava", "Taitila", "Garija",
    "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"
  ];

  // First 4 are fixed, then 7 movable repeat
  let karanaIndex;
  if (karanaNumber <= 57) {
    karanaIndex = ((karanaNumber - 1) % 7);
  } else {
    karanaIndex = 7 + (karanaNumber - 58); // Fixed karanas at end
  }

  return karanaNames[karanaIndex % 11];
}

function calculateVikramSamvat(gregorianYear, gregorianMonth) {
  // Vikram Samvat is 57 years ahead of Gregorian
  // New year starts in Chaitra (March-April)
  if (gregorianMonth < 4) {
    return gregorianYear + 56; // Before Chaitra
  }
  return gregorianYear + 57;
}

function calculatePaksha(tithiNumber) {
  // Shukla Paksha: Tithi 1-15, Krishna Paksha: Tithi 16-30
  return tithiNumber <= 15 ? "Shukla" : "Krishna";
}

function calculateMasa(moonLong, sunLong) {
  // Masa is based on Sun's position in zodiac
  const sunSignIndex = getSignIndex(sunLong);
  const masaNames = [
    "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha",
    "Shravana", "Bhadrapada", "Ashwin", "Kartik",
    "Margashirsha", "Pausha", "Magha", "Phalguna"
  ];

  // Adjust for solar month starting from Aries
  return masaNames[sunSignIndex];
}

function calculateMangalDosha(planets, ascDegree) {
  const mars = planets.find(p => p.name === "Mars");
  if (!mars) return "No";

  const house = houseFromAscendant(mars.longitude, ascDegree);
  // Mangal Dosha exists if Mars is in houses 1, 2, 4, 7, 8, or 12
  if ([1, 2, 4, 7, 8, 12].includes(house)) {
    return "Yes";
  }
  return "No";
}

function getYoniFromNakshatra(nakIndex) {
  if (!nakIndex) return "Unknown";
  // AstroSage-compatible Sanskrit Yoni names
  const yonis = [
    "Ashwa", "Gaja", "Mesha", "Sarpa", "Sarpa", "Shwan", "Marjar", "Mesha", "Marjar",
    "Mushak", "Mushak", "Gau", "Mahish", "Vyaghra", "Mahish", "Vyaghra", "Mriga", "Mriga",
    "Shwan", "Vanar", "Nakul", "Vanar", "Simha", "Ashwa", "Simha", "Gau", "Gaja"
  ];
  return yonis[nakIndex - 1] || "Unknown";
}

function getGanaFromNakshatra(nakIndex) {
  if (!nakIndex) return "Unknown";
  const ganas = [
    "Devta", "Manushya", "Rakshasa", "Manushya", "Devta", "Manushya", "Devta", "Devta", "Rakshasa",
    "Rakshasa", "Manushya", "Manushya", "Devta", "Rakshasa", "Devta", "Rakshasa", "Devta", "Rakshasa",
    "Rakshasa", "Manushya", "Manushya", "Devta", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Devta"
  ];
  return ganas[nakIndex - 1] || "Unknown";
}

function getNadiFromNakshatra(nakIndex) {
  if (!nakIndex) return "Unknown";
  // Nadi groups: 1, 6, 7, 12, 13, 18, 19, 24, 25 -> Adi
  //            2, 5, 8, 11, 14, 17, 20, 23, 26 -> Madhya
  //            3, 4, 9, 10, 15, 16, 21, 22, 27 -> Antya
  const adi = [1, 6, 7, 12, 13, 18, 19, 24, 25];
  const madhya = [2, 5, 8, 11, 14, 17, 20, 23, 26];
  const antya = [3, 4, 9, 10, 15, 16, 21, 22, 27];

  if (adi.includes(nakIndex)) return "Adi";
  if (madhya.includes(nakIndex)) return "Madhya";
  if (antya.includes(nakIndex)) return "Antya";
  return "Unknown";
}

function getTara(nak1, nak2) {
  if (!nak1 || !nak2) return "Unknown";
  const count = ((nak2 - nak1 + 27) % 27) + 1;
  const taraIndex = (count - 1) % 9;
  const taraNames = ["Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhak", "Vadha", "Mitra", "Ati-Mitra"];
  return taraNames[taraIndex];
}

function getVarnaFromSign(sign) {
  const varnas = {
    "Cancer": "Brahmin", "Scorpio": "Brahmin", "Pisces": "Brahmin",
    "Aries": "Kshatriya", "Leo": "Kshatriya", "Sagittarius": "Kshatriya",
    "Taurus": "Vaisya", "Virgo": "Vaisya", "Capricorn": "Vaisya",
    "Gemini": "Sudra", "Libra": "Sudra", "Aquarius": "Sudra"
  };
  return varnas[sign] || "Unknown";
}

function getVashya(moonSign) {
  const vashyas = {
    "Aries": "Chatu", "Taurus": "Chatu", "Leo": "Chatu",
    "Gemini": "Manav", "Virgo": "Manav", "Libra": "Manav", "Aquarius": "Manav", "Sagittarius": "Manav",
    "Cancer": "Jalchar", "Pisces": "Jalchar", "Capricorn": "Chatu",
    "Scorpio": "Keeta"
  };
  return vashyas[moonSign] || "Unknown";
}

function getRasiLord(moonSign) {
  const lords = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
    "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
    "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter",
    "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
  };
  return lords[moonSign] || "Unknown";
}

function getNakshatraPaya(nakIndex) {
  // Paya: Gold, Silver, Copper, Iron (cycles through nakshatras)
  const payas = ["Gold", "Silver", "Copper", "Iron"];
  return payas[(nakIndex - 1) % 4];
}

function calculateIshtaKaal(sunriseLong, ascDegree) {
  // Simplified Ishta Kaal calculation (auspicious time)
  // This is a complex calculation, using simplified version
  const diff = Math.abs(normalizeDegree(sunriseLong - ascDegree));
  const hours = Math.floor(diff / 15); // Rough approximation
  const minutes = Math.floor((diff % 15) * 4);
  return `${hours}h ${minutes}m after sunrise`;
}

// Helper functions for Auspicious Suggestions
function getGemstoneForRashi(rashi) {
  const gemstones = {
    "Aries": "Red Coral (Moonga)", "Taurus": "Diamond (Heera)", "Gemini": "Emerald (Panna)",
    "Cancer": "Pearl (Moti)", "Leo": "Ruby (Manik)", "Virgo": "Emerald (Panna)",
    "Libra": "Diamond (Heera)", "Scorpio": "Red Coral (Moonga)", "Sagittarius": "Yellow Sapphire (Pukhraj)",
    "Capricorn": "Blue Sapphire (Neelam)", "Aquarius": "Blue Sapphire (Neelam)", "Pisces": "Yellow Sapphire (Pukhraj)"
  };
  return gemstones[rashi] || "Consult an astrologer";
}

function getGemstoneDay(rashi) {
  const days = {
    "Aries": "Tuesday", "Taurus": "Friday", "Gemini": "Wednesday",
    "Cancer": "Monday", "Leo": "Sunday", "Virgo": "Wednesday",
    "Libra": "Friday", "Scorpio": "Tuesday", "Sagittarius": "Thursday",
    "Capricorn": "Saturday", "Aquarius": "Saturday", "Pisces": "Thursday"
  };
  return days[rashi] || "Thursday";
}

function getFavorableColors(rashi) {
  const colors = {
    "Aries": "Red, Orange, Yellow", "Taurus": "White, Pink, Light Blue", "Gemini": "Green, Yellow, Orange",
    "Cancer": "White, Silver, Cream", "Leo": "Gold, Orange, Red", "Virgo": "Green, White, Yellow",
    "Libra": "White, Pink, Light Blue", "Scorpio": "Red, Maroon, Brown", "Sagittarius": "Yellow, Orange, Gold",
    "Capricorn": "Black, Dark Blue, Grey", "Aquarius": "Blue, Grey, Black", "Pisces": "Yellow, Orange, Pink"
  };
  return colors[rashi] || "White, Yellow";
}

function getAuspiciousDays(rashi) {
  const days = {
    "Aries": "Tuesday, Saturday", "Taurus": "Friday, Wednesday", "Gemini": "Wednesday, Friday",
    "Cancer": "Monday, Thursday", "Leo": "Sunday, Tuesday", "Virgo": "Wednesday, Friday",
    "Libra": "Friday, Wednesday", "Scorpio": "Tuesday, Thursday", "Sagittarius": "Thursday, Tuesday",
    "Capricorn": "Saturday, Wednesday", "Aquarius": "Saturday, Thursday", "Pisces": "Thursday, Tuesday"
  };
  return days[rashi] || "Thursday, Sunday";
}

function getLuckyNumbers(rashi) {
  const numbers = {
    "Aries": "1, 9, 18, 27", "Taurus": "2, 6, 15, 24", "Gemini": "3, 5, 14, 23",
    "Cancer": "2, 7, 16, 25", "Leo": "1, 4, 10, 19", "Virgo": "3, 5, 14, 23",
    "Libra": "2, 6, 15, 24", "Scorpio": "9, 18, 27, 36", "Sagittarius": "3, 12, 21, 30",
    "Capricorn": "8, 17, 26, 35", "Aquarius": "4, 13, 22, 31", "Pisces": "3, 7, 12, 16"
  };
  return numbers[rashi] || "1, 3, 5, 7";
}

// ============================================================================
// PHALLIT (PREDICTIONS) ANALYSIS FUNCTIONS
// ============================================================================

// Helper: Get planet by name
function getPlanetByName(planets, name) {
  if (!planets || !Array.isArray(planets)) return null;
  return planets.find(p => p && p.name && p.name.toLowerCase() === name.toLowerCase());
}

// Helper: Get house lord
function getHouseLord(houseNumber, ascendantSign) {
  const ascIndex = RASHIS.indexOf(ascendantSign);
  if (ascIndex === -1) return null;
  const houseSignIndex = (ascIndex + houseNumber - 1) % 12;
  const houseSign = RASHIS[houseSignIndex];
  return RASHI_LORDS[houseSign];
}

// 1. LAGNA PERSONALITY
function analyzeLagnaPersonality(ascSign, planets, language) {
  const ascLord = RASHI_LORDS[ascSign];
  const ascLordPlanet = getPlanetByName(planets, ascLord);
  const personalities = {
    'Aries': { en: `Bold, action-oriented. Quick decisions, high energy. ${ascLordPlanet ? `Mars in ${ascLordPlanet.house}th house gives ${ascLordPlanet.house <= 4 ? 'strong confidence' : 'ambitious drive'}.` : ''} Natural leadership.`, hi: `साहसी, क्रियाशील। त्वरित निर्णय, उच्च ऊर्जा। ${ascLordPlanet ? `मंगल ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house <= 4 ? 'मजबूत आत्मविश्वास' : 'महत्वाकांक्षी ड्राइव'} देता है।` : ''} प्राकृतिक नेतृत्व।` },
    'Taurus': { en: `Stable, practical. Patient, security-focused. ${ascLordPlanet ? `Venus in ${ascLordPlanet.house}th house brings ${ascLordPlanet.house === 2 || ascLordPlanet.house === 7 ? 'material focus' : 'artistic nature'}.` : ''} Values comfort.`, hi: `स्थिर, व्यावहारिक। धैर्यवान, सुरक्षा-केंद्रित। ${ascLordPlanet ? `शुक्र ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 2 || ascLordPlanet.house === 7 ? 'भौतिक फोकस' : 'कलात्मक स्वभाव'} लाता है।` : ''} आराम को महत्व।` },
    'Gemini': { en: `Intellectual, communicative. Quick-thinking, versatile. ${ascLordPlanet ? `Mercury in ${ascLordPlanet.house}th house enhances ${ascLordPlanet.house === 3 || ascLordPlanet.house === 9 ? 'communication' : 'analytical abilities'}.` : ''} Adaptable.`, hi: `बौद्धिक, संवादी। तेज सोच, बहुमुखी। ${ascLordPlanet ? `बुध ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 3 || ascLordPlanet.house === 9 ? 'संचार' : 'विश्लेषणात्मक क्षमता'} बढ़ाता है।` : ''} अनुकूलनीय।` },
    'Cancer': { en: `Emotional, nurturing. Intuitive decisions. ${ascLordPlanet ? `Moon in ${ascLordPlanet.house}th house creates ${ascLordPlanet.house === 4 ? 'deep emotional security needs' : 'caring nature'}.` : ''} Family-oriented.`, hi: `भावुक, पोषण करने वाला। सहज निर्णय। ${ascLordPlanet ? `चंद्र ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 4 ? 'गहरी भावनात्मक सुरक्षा' : 'देखभाल स्वभाव'} बनाता है।` : ''} पारिवारिक।` },
    'Leo': { en: `Confident, authoritative. Natural leader, creative. ${ascLordPlanet ? `Sun in ${ascLordPlanet.house}th house gives ${ascLordPlanet.house === 1 || ascLordPlanet.house === 10 ? 'strong leadership' : 'self-expression needs'}.` : ''} Dignified.`, hi: `आत्मविश्वासी, आधिकारिक। प्राकृतिक नेता, रचनात्मक। ${ascLordPlanet ? `सूर्य ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 1 || ascLordPlanet.house === 10 ? 'मजबूत नेतृत्व' : 'आत्म-अभिव्यक्ति'} देता है।` : ''} गरिमामय।` },
    'Virgo': { en: `Analytical, detail-oriented. Methodical. ${ascLordPlanet ? `Mercury in ${ascLordPlanet.house}th house enhances ${ascLordPlanet.house === 6 ? 'service orientation' : 'perfectionism'}.` : ''} Practical, organized.`, hi: `विश्लेषणात्मक, विस्तार-उन्मुख। व्यवस्थित। ${ascLordPlanet ? `बुध ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 6 ? 'सेवा अभिविन्यास' : 'पूर्णतावाद'} बढ़ाता है।` : ''} व्यावहारिक, संगठित।` },
    'Libra': { en: `Diplomatic, balanced. Relationship-focused. ${ascLordPlanet ? `Venus in ${ascLordPlanet.house}th house brings ${ascLordPlanet.house === 7 ? 'strong partnership needs' : 'harmony'}.` : ''} Values fairness.`, hi: `कूटनीतिक, संतुलित। संबंध-केंद्रित। ${ascLordPlanet ? `शुक्र ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 7 ? 'मजबूत साझेदारी' : 'सामंजस्य'} लाता है।` : ''} निष्पक्षता को महत्व।` },
    'Scorpio': { en: `Intense, transformative. Deep thinker, strong will. ${ascLordPlanet ? `Mars in ${ascLordPlanet.house}th house creates ${ascLordPlanet.house === 8 ? 'investigative mindset' : 'passionate drive'}.` : ''} Mysterious.`, hi: `तीव्र, परिवर्तनकारी। गहरा विचारक, मजबूत इच्छा। ${ascLordPlanet ? `मंगल ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 8 ? 'खोजी मानसिकता' : 'भावुक ड्राइव'} बनाता है।` : ''} रहस्यमय।` },
    'Sagittarius': { en: `Optimistic, philosophical. Adventurous. ${ascLordPlanet ? `Jupiter in ${ascLordPlanet.house}th house enhances ${ascLordPlanet.house === 9 ? 'wisdom' : 'expansive thinking'}.` : ''} Freedom-loving.`, hi: `आशावादी, दार्शनिक। साहसिक। ${ascLordPlanet ? `गुरु ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 9 ? 'ज्ञान' : 'विस्तृत सोच'} बढ़ाता है।` : ''} स्वतंत्रता-प्रेमी।` },
    'Capricorn': { en: `Disciplined, ambitious. Strategic planner. ${ascLordPlanet ? `Saturn in ${ascLordPlanet.house}th house brings ${ascLordPlanet.house === 10 ? 'strong career focus' : 'responsibility'}.` : ''} Patient, persistent.`, hi: `अनुशासित, महत्वाकांक्षी। रणनीतिक योजनाकार। ${ascLordPlanet ? `शनि ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 10 ? 'मजबूत करियर फोकस' : 'जिम्मेदारी'} लाता है।` : ''} धैर्यवान, दृढ़।` },
    'Aquarius': { en: `Innovative, humanitarian. Independent. ${ascLordPlanet ? `Saturn in ${ascLordPlanet.house}th house creates ${ascLordPlanet.house === 11 ? 'social consciousness' : 'unique perspectives'}.` : ''} Progressive.`, hi: `नवीन, मानवतावादी। स्वतंत्र। ${ascLordPlanet ? `शनि ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 11 ? 'सामाजिक चेतना' : 'अनूठा दृष्टिकोण'} बनाता है।` : ''} प्रगतिशील।` },
    'Pisces': { en: `Intuitive, compassionate. Imaginative. ${ascLordPlanet ? `Jupiter in ${ascLordPlanet.house}th house enhances ${ascLordPlanet.house === 12 ? 'spiritual inclinations' : 'creativity'}.` : ''} Empathetic.`, hi: `सहज, दयालु। कल्पनाशील। ${ascLordPlanet ? `गुरु ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 12 ? 'आध्यात्मिक झुकाव' : 'रचनात्मकता'} बढ़ाता है।` : ''} सहानुभूतिपूर्ण।` }
  };
  return personalities[ascSign] ? personalities[ascSign][language] : 'Analysis not available';
}

// 2. MOON EMOTIONS
function analyzeMoonEmotions(moonSign, moon, language) {
  const emotions = {
    'Aries': { en: `Quick emotional responses, passionate. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 4 ? 'emotional independence' : 'active expression'}.` : ''} Handles stress through action.`, hi: `त्वरित भावनात्मक प्रतिक्रियाएं, भावुक। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 4 ? 'भावनात्मक स्वतंत्रता' : 'सक्रिय अभिव्यक्ति'} बनाता है।` : ''} कार्रवाई से तनाव संभालते हैं।` },
    'Taurus': { en: `Stable emotions, seeks comfort. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 2 ? 'security through resources' : 'steady feelings'}.` : ''} Handles stress through routine.`, hi: `स्थिर भावनाएं, आराम की तलाश। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 2 ? 'संसाधनों से सुरक्षा' : 'स्थिर भावनाएं'} लाता है।` : ''} दिनचर्या से तनाव संभालते हैं।` },
    'Gemini': { en: `Variable moods, intellectualizes feelings. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 3 ? 'emotional expression through communication' : 'mental processing'}.` : ''} Handles stress through talking.`, hi: `परिवर्तनशील मूड, भावनाओं को बौद्धिक बनाते हैं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 3 ? 'संचार से भावनात्मक अभिव्यक्ति' : 'मानसिक प्रसंस्करण'} बनाता है।` : ''} बात करने से तनाव संभालते हैं।` },
    'Cancer': { en: `Deep emotional sensitivity, nurturing. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 4 ? 'very strong emotional foundation' : 'caring instincts'}.` : ''} Handles stress through family.`, hi: `गहरी भावनात्मक संवेदनशीलता, पोषण। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 4 ? 'बहुत मजबूत भावनात्मक नींव' : 'देखभाल प्रवृत्ति'} लाता है।` : ''} परिवार से तनाव संभालते हैं।` },
    'Leo': { en: `Proud emotions, needs recognition. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 5 ? 'creative emotional expression' : 'dignified feelings'}.` : ''} Handles stress through self-expression.`, hi: `गर्व की भावनाएं, मान्यता की आवश्यकता। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 5 ? 'रचनात्मक भावनात्मक अभिव्यक्ति' : 'गरिमामय भावनाएं'} बनाता है।` : ''} आत्म-अभिव्यक्ति से तनाव संभालते हैं।` },
    'Virgo': { en: `Analytical emotions, practical. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 6 ? 'service-oriented fulfillment' : 'organized responses'}.` : ''} Handles stress through organization.`, hi: `विश्लेषणात्मक भावनाएं, व्यावहारिक। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 6 ? 'सेवा-उन्मुख संतुष्टि' : 'संगठित प्रतिक्रियाएं'} लाता है।` : ''} संगठन से तनाव संभालते हैं।` },
    'Libra': { en: `Balanced emotions, seeks harmony. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 7 ? 'fulfillment through partnerships' : 'diplomatic feelings'}.` : ''} Handles stress through relationships.`, hi: `संतुलित भावनाएं, सामंजस्य की तलाश। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 7 ? 'साझेदारी से संतुष्टि' : 'कूटनीतिक भावनाएं'} बनाता है।` : ''} संबंधों से तनाव संभालते हैं।` },
    'Scorpio': { en: `Intense emotions, deep feelings. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 8 ? 'transformative experiences' : 'passionate depth'}.` : ''} Handles stress through transformation.`, hi: `तीव्र भावनाएं, गहरी भावनाएं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 8 ? 'परिवर्तनकारी अनुभव' : 'भावुक गहराई'} लाता है।` : ''} परिवर्तन से तनाव संभालते हैं।` },
    'Sagittarius': { en: `Optimistic emotions, philosophical. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 9 ? 'growth through wisdom' : 'adventurous nature'}.` : ''} Handles stress through learning.`, hi: `आशावादी भावनाएं, दार्शनिक। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 9 ? 'ज्ञान से विकास' : 'साहसिक स्वभाव'} बनाता है।` : ''} सीखने से तनाव संभालते हैं।` },
    'Capricorn': { en: `Controlled emotions, practical. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 10 ? 'fulfillment through achievement' : 'disciplined responses'}.` : ''} Handles stress through work.`, hi: `नियंत्रित भावनाएं, व्यावहारिक। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 10 ? 'उपलब्धि से संतुष्टि' : 'अनुशासित प्रतिक्रियाएं'} लाता है।` : ''} काम से तनाव संभालते हैं।` },
    'Aquarius': { en: `Detached emotions, unique. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 11 ? 'fulfillment through social causes' : 'independent nature'}.` : ''} Handles stress through innovation.`, hi: `अलग भावनाएं, अनूठी। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 11 ? 'सामाजिक कारणों से संतुष्टि' : 'स्वतंत्र स्वभाव'} बनाता है।` : ''} नवाचार से तनाव संभालते हैं।` },
    'Pisces': { en: `Compassionate, intuitive. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 12 ? 'spiritual depth' : 'empathetic nature'}.` : ''} Handles stress through spirituality.`, hi: `दयालु, सहज। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 12 ? 'आध्यात्मिक गहराई' : 'सहानुभूतिपूर्ण स्वभाव'} लाता है।` : ''} आध्यात्मिकता से तनाव संभालते हैं।` }
  };
  return emotions[moonSign] ? emotions[moonSign][language] : 'Analysis not available';
}

// 3. EDUCATION
function analyzeEducation(planets, ascSign, language) {
  const mercury = getPlanetByName(planets, 'Mercury');
  const jupiter = getPlanetByName(planets, 'Jupiter');
  if (language === 'en') {
    let analysis = 'Education: ';
    if (mercury && mercury.house === 4) analysis += 'Strong analytical abilities, suitable for technical/scientific subjects. ';
    if (jupiter && (jupiter.house === 4 || jupiter.house === 5 || jupiter.house === 9)) analysis += `Higher education indicated. ${jupiter.house === 9 ? 'Foreign education possible. ' : ''}`;
    if (mercury && mercury.isRetrograde) analysis += 'May face delays 18-22 age. ';
    analysis += `Best subjects: ${mercury && mercury.house <= 6 ? 'Math, Science, Tech' : 'Arts, Business'}. Peak years: 16-24.`;
    return analysis;
  } else {
    let analysis = 'शिक्षा: ';
    if (mercury && mercury.house === 4) analysis += 'मजबूत विश्लेषणात्मक क्षमताएं, तकनीकी/वैज्ञानिक विषय उपयुक्त। ';
    if (jupiter && (jupiter.house === 4 || jupiter.house === 5 || jupiter.house === 9)) analysis += `उच्च शिक्षा संकेतित। ${jupiter.house === 9 ? 'विदेश शिक्षा संभव। ' : ''}`;
    if (mercury && mercury.isRetrograde) analysis += '18-22 आयु में देरी संभव। ';
    analysis += `सर्वोत्तम विषय: ${mercury && mercury.house <= 6 ? 'गणित, विज्ञान, तकनीक' : 'कला, व्यवसाय'}। चरम वर्ष: 16-24।`;
    return analysis;
  }
}

// 4. CAREER (MOST IMPORTANT)
function analyzeCareer(planets, ascSign, language) {
  const saturn = getPlanetByName(planets, 'Saturn');
  const sun = getPlanetByName(planets, 'Sun');
  const mercury = getPlanetByName(planets, 'Mercury');
  const jupiter = getPlanetByName(planets, 'Jupiter');
  let careerField = '';
  let jobVsBusiness = '';
  let timeline = '';
  if (language === 'en') {
    if (mercury && (mercury.house === 10 || mercury.house === 1)) careerField = 'Technology, Research, Analysis, Communication';
    else if (jupiter && (jupiter.house === 10 || jupiter.house === 9)) careerField = 'Teaching, Consulting, Finance, Law';
    else if (saturn && saturn.house === 10) careerField = 'Government, Administration, Engineering';
    else if (sun && (sun.house === 10 || sun.house === 1)) careerField = 'Leadership, Management, Politics';
    else careerField = 'Business, Creative fields';
    jobVsBusiness = saturn && saturn.house === 10 ? 'Job/Service more suitable' : sun && sun.house === 10 ? 'Business/Self-employment favorable' : 'Both possible';
    timeline = `18-22: Foundation, initial struggles. 23-27: ${saturn && saturn.house === 10 ? 'Slow steady growth' : 'Rapid progress possible'}. 28-32: Major decisions, ${jupiter && jupiter.house === 10 ? 'significant growth' : 'stabilization'}. 33+: ${sun && sun.house === 10 ? 'Leadership roles' : 'Established position'}.`;
    return `Career: ${careerField}. ${jobVsBusiness}. Timeline: ${timeline}`;
  } else {
    if (mercury && (mercury.house === 10 || mercury.house === 1)) careerField = 'प्रौद्योगिकी, अनुसंधान, विश्लेषण, संचार';
    else if (jupiter && (jupiter.house === 10 || jupiter.house === 9)) careerField = 'शिक्षण, परामर्श, वित्त, कानून';
    else if (saturn && saturn.house === 10) careerField = 'सरकार, प्रशासन, इंजीनियरिंग';
    else if (sun && (sun.house === 10 || sun.house === 1)) careerField = 'नेतृत्व, प्रबंधन, राजनीति';
    else careerField = 'व्यवसाय, रचनात्मक क्षेत्र';
    jobVsBusiness = saturn && saturn.house === 10 ? 'नौकरी/सेवा अधिक उपयुक्त' : sun && sun.house === 10 ? 'व्यवसाय/स्व-रोजगार अनुकूल' : 'दोनों संभव';
    timeline = `18-22: नींव, प्रारंभिक संघर्ष। 23-27: ${saturn && saturn.house === 10 ? 'धीमी स्थिर वृद्धि' : 'तेजी से प्रगति संभव'}। 28-32: प्रमुख निर्णय, ${jupiter && jupiter.house === 10 ? 'महत्वपूर्ण वृद्धि' : 'स्थिरीकरण'}। 33+: ${sun && sun.house === 10 ? 'नेतृत्व भूमिकाएं' : 'स्थापित स्थिति'}।`;
    return `करियर: ${careerField}। ${jobVsBusiness}। समयरेखा: ${timeline}`;
  }
}

// 5. WEALTH
function analyzeWealth(planets, ascSign, language) {
  const jupiter = getPlanetByName(planets, 'Jupiter');
  const venus = getPlanetByName(planets, 'Venus');
  if (language === 'en') {
    let analysis = 'Wealth: ';
    if (jupiter && (jupiter.house === 2 || jupiter.house === 11)) analysis += 'Good earning potential. Wealth after 30. ';
    if (venus && venus.house === 2) analysis += 'Spending on luxury. Focus on savings. ';
    analysis += `Money through ${jupiter && jupiter.house === 10 ? 'career' : 'multiple sources'}. Stability: ${jupiter && jupiter.house === 2 ? 'Strong after 28-30' : 'Gradual improvement'}.`;
    return analysis;
  } else {
    let analysis = 'धन: ';
    if (jupiter && (jupiter.house === 2 || jupiter.house === 11)) analysis += 'अच्छी कमाई क्षमता। 30 के बाद धन। ';
    if (venus && venus.house === 2) analysis += 'विलासिता पर खर्च। बचत पर ध्यान। ';
    analysis += `पैसा ${jupiter && jupiter.house === 10 ? 'करियर' : 'कई स्रोतों'} से। स्थिरता: ${jupiter && jupiter.house === 2 ? '28-30 के बाद मजबूत' : 'क्रमिक सुधार'}।`;
    return analysis;
  }
}

// 6. RELATIONSHIPS
function analyzeRelationships(planets, ascSign, mangalDosha, language) {
  const saturn = getPlanetByName(planets, 'Saturn');
  const venus = getPlanetByName(planets, 'Venus');
  const isMangalDosha = mangalDosha === 'Yes';
  if (language === 'en') {
    let analysis = 'Marriage: ';
    if (saturn && (saturn.house === 7 || saturn.house === 1)) analysis += 'Possible delay, likely after 28-30. ';
    else analysis += 'Timing: 24-28 years. ';
    if (isMangalDosha) analysis += 'Mangal Dosha present - choose partner carefully. ';
    if (venus && venus.house === 7) analysis += 'Harmonious relationship. Loving partner. ';
    analysis += `${saturn && saturn.house === 7 ? 'Arranged more likely' : 'Love/arranged both possible'}. Success through ${venus ? 'understanding' : 'patience'}.`;
    return analysis;
  } else {
    let analysis = 'विवाह: ';
    if (saturn && (saturn.house === 7 || saturn.house === 1)) analysis += 'संभावित देरी, 28-30 के बाद। ';
    else analysis += 'समय: 24-28 वर्ष। ';
    if (isMangalDosha) analysis += 'मंगल दोष उपस्थित - साथी सावधानी से चुनें। ';
    if (venus && venus.house === 7) analysis += 'सामंजस्यपूर्ण संबंध। प्रेमपूर्ण साथी। ';
    analysis += `${saturn && saturn.house === 7 ? 'व्यवस्थित अधिक संभावित' : 'प्रेम/व्यवस्थित दोनों संभव'}। सफलता ${venus ? 'समझ' : 'धैर्य'} से।`;
    return analysis;
  }
}

// 7. HEALTH
function analyzeHealth(planets, ascSign, language) {
  const saturn = getPlanetByName(planets, 'Saturn');
  const mars = getPlanetByName(planets, 'Mars');
  const moon = getPlanetByName(planets, 'Moon');
  if (language === 'en') {
    let analysis = 'Health: ';
    if (saturn && (saturn.house === 1 || saturn.house === 6)) analysis += 'Watch chronic issues, joint/bone problems. Regular exercise important. ';
    if (mars && mars.house === 6) analysis += 'Prone to accidents/injuries. Avoid risky activities. ';
    if (moon && moon.isRetrograde) analysis += 'Mental stress possible. Practice meditation. ';
    analysis += `Weak areas: ${saturn ? 'Bones, joints' : 'Digestive system'}. Health improves after 35.`;
    return analysis;
  } else {
    let analysis = 'स्वास्थ्य: ';
    if (saturn && (saturn.house === 1 || saturn.house === 6)) analysis += 'पुरानी समस्याओं, जोड़ों/हड्डियों के लिए सावधान। नियमित व्यायाम महत्वपूर्ण। ';
    if (mars && mars.house === 6) analysis += 'दुर्घटनाओं/चोटों की संभावना। जोखिम से बचें। ';
    if (moon && moon.isRetrograde) analysis += 'मानसिक तनाव संभव। ध्यान का अभ्यास करें। ';
    analysis += `कमजोर क्षेत्र: ${saturn ? 'हड्डियां, जोड़' : 'पाचन तंत्र'}। 35 के बाद स्वास्थ्य में सुधार।`;
    return analysis;
  }
}

// 8. DOSHAS & YOGAS
function analyzeDoshasYogas(planets, mangalDosha, language) {
  const isMangalDosha = mangalDosha === 'Yes';
  const jupiter = getPlanetByName(planets, 'Jupiter');
  const venus = getPlanetByName(planets, 'Venus');
  const mars = getPlanetByName(planets, 'Mars');
  if (language === 'en') {
    let analysis = 'Doshas & Yogas: ';
    if (isMangalDosha) analysis += `Mangal Dosha present. ${mars && mars.house === 7 ? 'Strong dosha' : 'Mild dosha'}. Remedies: Marry after 28 or find partner with same dosha. `;
    else analysis += 'No Mangal Dosha. ';
    if (jupiter && jupiter.house === 10) analysis += 'Raj Yoga - Success in career. ';
    if (venus && jupiter && Math.abs(venus.house - jupiter.house) <= 1) analysis += 'Dhan Yoga - Wealth accumulation. ';
    analysis += `Overall: ${isMangalDosha ? 'Remedies recommended' : 'Favorable combinations'}.`;
    return analysis;
  } else {
    let analysis = 'दोष और योग: ';
    if (isMangalDosha) analysis += `मंगल दोष उपस्थित। ${mars && mars.house === 7 ? 'मजबूत दोष' : 'हल्का दोष'}। उपाय: 28 के बाद शादी या समान दोष वाले साथी। `;
    else analysis += 'कोई मंगल दोष नहीं। ';
    if (jupiter && jupiter.house === 10) analysis += 'राजयोग - करियर में सफलता। ';
    if (venus && jupiter && Math.abs(venus.house - jupiter.house) <= 1) analysis += 'धन योग - धन संचय। ';
    analysis += `कुल मिलाकर: ${isMangalDosha ? 'उपाय अनुशंसित' : 'अनुकूल संयोजन'}।`;
    return analysis;
  }
}

// 9. DASHA PREDICTIONS
function analyzeDashaPredictions(dashas, planets, language) {
  if (!dashas || !dashas.current) return language === 'en' ? 'Dasha information not available' : 'दशा जानकारी उपलब्ध नहीं';
  const currentDasha = dashas.current;
  const currentPlanet = currentDasha.planet;
  const planetObj = getPlanetByName(planets, currentPlanet);
  const mahadashas = dashas.mahadashas || [];
  if (language === 'en') {
    let analysis = `Current Mahadasha: ${currentPlanet} (${currentDasha.years} years). `;
    if (planetObj) {
      analysis += `${currentPlanet} in ${planetObj.house}th house brings `;
      if (planetObj.house === 10) analysis += 'career growth and recognition. ';
      else if (planetObj.house === 2 || planetObj.house === 11) analysis += 'financial gains. ';
      else if (planetObj.house === 4) analysis += 'property gains and domestic happiness. ';
      else if (planetObj.house === 7) analysis += 'relationship focus. ';
      else analysis += 'mixed results. ';
    }
    const nextDashas = mahadashas.slice(0, 2);
    if (nextDashas.length > 0) {
      analysis += 'Next 5-10 years: ';
      nextDashas.forEach((dasha, index) => {
        analysis += `${dasha.planet} dasha ${index === 0 ? 'brings' : 'will bring'} ${dasha.planet === 'Jupiter' ? 'expansion' : dasha.planet === 'Saturn' ? 'discipline' : dasha.planet === 'Venus' ? 'comfort' : 'changes'}. `;
      });
    }
    return analysis;
  } else {
    let analysis = `वर्तमान महादशा: ${currentPlanet} (${currentDasha.years} वर्ष)। `;
    if (planetObj) {
      analysis += `${currentPlanet} ${planetObj.house}वें भाव में `;
      if (planetObj.house === 10) analysis += 'करियर वृद्धि और मान्यता लाता है। ';
      else if (planetObj.house === 2 || planetObj.house === 11) analysis += 'वित्तीय लाभ लाता है। ';
      else if (planetObj.house === 4) analysis += 'संपत्ति लाभ और घरेलू खुशी लाता है। ';
      else if (planetObj.house === 7) analysis += 'संबंध फोकस लाता है। ';
      else analysis += 'मिश्रित परिणाम लाता है। ';
    }
    const nextDashas = mahadashas.slice(0, 2);
    if (nextDashas.length > 0) {
      analysis += 'अगले 5-10 वर्ष: ';
      nextDashas.forEach((dasha, index) => {
        analysis += `${dasha.planet} दशा ${index === 0 ? 'लाती है' : 'लाएगी'} ${dasha.planet === 'Jupiter' ? 'विस्तार' : dasha.planet === 'Saturn' ? 'अनुशासन' : dasha.planet === 'Venus' ? 'आराम' : 'परिवर्तन'}। `;
      });
    }
    return analysis;
  }
}

// 10. REMEDIES
function generateRemedies(planets, mangalDosha, language) {
  const saturn = getPlanetByName(planets, 'Saturn');
  const mars = getPlanetByName(planets, 'Mars');
  const mercury = getPlanetByName(planets, 'Mercury');
  const weakPlanets = [];
  if (language === 'en') {
    let analysis = 'Remedies: ';
    if (saturn && saturn.isRetrograde) {
      analysis += 'For Saturn: Donate black items on Saturdays. Respect elders. Practice discipline. ';
      weakPlanets.push('Saturn');
    }
    if (mangalDosha === 'Yes') {
      analysis += 'For Mars: Donate red items on Tuesdays. Practice patience. Avoid conflicts. ';
      weakPlanets.push('Mars');
    }
    if (mercury && mercury.isRetrograde) {
      analysis += 'For Mercury: Donate green items on Wednesdays. Improve communication. ';
      weakPlanets.push('Mercury');
    }
    if (weakPlanets.length === 0) analysis += 'No major weaknesses. General: Regular meditation, charity, positive thinking.';
    else analysis += `Focus on: ${weakPlanets.join(', ')}. Consult expert for mantras/gemstones.`;
    return analysis;
  } else {
    let analysis = 'उपाय: ';
    if (saturn && saturn.isRetrograde) {
      analysis += 'शनि के लिए: शनिवार को काली वस्तुओं का दान। बड़ों का सम्मान। अनुशासन। ';
      weakPlanets.push('शनि');
    }
    if (mangalDosha === 'Yes') {
      analysis += 'मंगल के लिए: मंगलवार को लाल वस्तुओं का दान। धैर्य। संघर्ष से बचें। ';
      weakPlanets.push('मंगल');
    }
    if (mercury && mercury.isRetrograde) {
      analysis += 'बुध के लिए: बुधवार को हरी वस्तुओं का दान। संचार सुधारें। ';
      weakPlanets.push('बुध');
    }
    if (weakPlanets.length === 0) analysis += 'कोई बड़ी कमजोरी नहीं। सामान्य: नियमित ध्यान, दान, सकारात्मक सोच।';
    else analysis += `ध्यान दें: ${weakPlanets.join(', ')}। मंत्र/रत्न के लिए विशेषज्ञ से परामर्श।`;
    return analysis;
  }
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

// ============================================
// PHALLIT (PREDICTIONS) ANALYSIS FUNCTIONS
// ============================================

// Helper: Get planet by name
// function getPlanetByName(planets, name) { /* ... already defined above ... */ }

// Helper: Get house lord
// function getHouseLord(houseNumber, ascendantSign) { /* ... already defined above ... */ }

// 1. LAGNA PERSONALITY
// function analyzeLagnaPersonality(ascSign, planets, language) { /* ... already defined above ... */ }

// 2. MOON EMOTIONS
// function analyzeMoonEmotions(moonSign, moon, language) { /* ... already defined above ... */ }

// 3. EDUCATION
// function analyzeEducation(planets, ascSign, language) { /* ... already defined above ... */ }

// 4. CAREER (MOST IMPORTANT)
// function analyzeCareer(planets, ascSign, language) { /* ... already defined above ... */ }

// 5. WEALTH
// function analyzeWealth(planets, ascSign, language) { /* ... already defined above ... */ }

// 6. RELATIONSHIPS
// function analyzeRelationships(planets, ascSign, mangalDosha, language) { /* ... already defined above ... */ }

// 7. HEALTH
// function analyzeHealth(planets, ascSign, language) { /* ... already defined above ... */ }

// 8. DOSHAS & YOGAS
// function analyzeDoshasYogas(planets, mangalDosha, language) { /* ... already defined above ... */ }

// 9. DASHA PREDICTIONS
// function analyzeDashaPredictions(dashas, planets, language) { /* ... already defined above ... */ }

// 10. REMEDIES
// function generateRemedies(planets, mangalDosha, language) { /* ... already defined above ... */ }


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
    const degree = siderealLongitude % 30; // Degree within the sign (0-30)
    const navamsaSign = getNavamsaSignIndex(siderealLongitude);
    const dashamsaSign = getDashamsaSignIndex(siderealLongitude);

    const planetData = {
      name: config.name,
      longitude: siderealLongitude,
      latitude: latitudeValue,
      degree,
      degreeInSign: degree, // Exact degree within sign for chart display
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
      `[astro-engine] ${config.name}: ${siderealLongitude.toFixed(6)}° ${planetData.sign} (${nakshatra.name} p${nakshatra.pada})`
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
      degree: ketuLongitude % 30,
      degreeInSign: ketuLongitude % 30, // Exact degree within sign
      sign: RASHIS[ketuSignIndex],
      signIndex: ketuSignIndex,
      nakshatra: ketuNakshatra,
      isRetrograde: true,
      isBenefic: false,
      navamsaSignIndex: getNavamsaSignIndex(ketuLongitude),
      dashamsaSignIndex: getDashamsaSignIndex(ketuLongitude),
    });
    console.log(
      `[astro-engine] Ketu: ${ketuLongitude.toFixed(6)}° ${RASHIS[ketuSignIndex]} (${ketuNakshatra.name} p${ketuNakshatra.pada})`
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
    `[astro-engine] ASCENDANT: ${ascDegree.toFixed(6)}° = ${RASHIS[ascSignIndex]} (sign index ${ascSignIndex}) [tropical: ${ascTropical.toFixed(2)}° - ayanamsa: ${ayanamsa.toFixed(2)}°]`
  );

  // Whole sign houses: each house is exactly 30° starting from ascendant sign
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
      degreeInSign: Number(planet.degree.toFixed(4)),
      sign: planet.sign,
      house: planet.house,
      isRetrograde: planet.isRetrograde,
      nakshatra: {
        name: planet.nakshatra.name,
        lord: planet.nakshatra.lord,
        pada: planet.nakshatra.pada,
        index: planet.nakshatra.index,
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
    enhancedDetails: {
      vikramSamvat: calculateVikramSamvat(inputs.year, inputs.month),
      shalivahanaShake: inputs.year - 78,
      tithi: moon && sun ? calculateTithi(sun.longitude, moon.longitude) : null,
      paksha: moon && sun ? calculatePaksha(calculateTithi(sun.longitude, moon.longitude).number) : null,
      masa: moon && sun ? calculateMasa(moon.longitude, sun.longitude) : null,
      yoga: moon && sun ? calculateYoga(sun.longitude, moon.longitude) : null,
      karana: moon && sun ? calculateKarana(sun.longitude, moon.longitude) : null,
      dayOfWeek: new Date(inputs.year, inputs.month - 1, inputs.day).toLocaleDateString('en-US', { weekday: 'long' }),
      chandraRashi: moon ? moon.sign : null,
      suryaRashi: sun ? sun.sign : null,
      brihaspatiRashi: enrichedPlanets.find(p => p.name === 'Jupiter')?.sign || 'N/A',
      ritu: (() => {
        const m = inputs.month;
        if (m >= 3 && m <= 4) return 'Vasant (Spring)';
        if (m >= 5 && m <= 6) return 'Grishma (Summer)';
        if (m >= 7 && m <= 8) return 'Varsha (Monsoon)';
        if (m >= 9 && m <= 10) return 'Sharad (Autumn)';
        if (m >= 11 && m <= 12) return 'Hemant (Pre-winter)';
        return 'Shishir (Winter)';
      })(),
      ayana: (inputs.month >= 1 && inputs.month <= 6) ? 'Uttarayana (Northern)' : 'Dakshinayana (Southern)',
      sunrise: '06:00 AM',
      sunset: '06:00 PM',
      dayDuration: '12h 00m',
      nightDuration: '12h 00m',
      moonrise: '07:30 PM',
      moonset: '06:30 AM',
      lagnaAtSunrise: RASHIS[ascSignIndex],
      suryaNakshatraAtSunrise: sun ? sun.nakshatra.name : null,
      chandraNakshatraAtSunrise: moon ? moon.nakshatra.name : null,
      chandraPadaAtSunrise: moon ? moon.nakshatra.pada : null,
      mangalDosha: calculateMangalDosha(enrichedPlanets, ascDegree),
      yoni: moon ? getYoniFromNakshatra(moon.nakshatra.index) : null,
      gana: moon ? getGanaFromNakshatra(moon.nakshatra.index) : null,
      nadi: moon ? getNadiFromNakshatra(moon.nakshatra.index) : null,
      varna: moon ? getVarnaFromSign(moon.sign) : null,
      nakshatraPaya: moon ? getNakshatraPaya(moon.nakshatra.index) : null,
      rashiSwami: moon ? getRasiLord(moon.sign) : null,
      nakshatraSwami: moon ? moon.nakshatra.lord : null,
      ishtaKaal: calculateIshtaKaal(ascDegree, ascDegree), // Simplified
      // Namakshar (first letter of name based on Nakshatra Pada)
      namakshar: moon ? getNamaksharFromNakshatra(moon.nakshatra.name, moon.nakshatra.pada) : null,
    },
    // PHALLIT (Predictions) - Real Dynamic Analysis
    phallit: (() => {
      try {
        return {
          lagnaPersonality: {
            en: analyzeLagnaPersonality(RASHIS[ascSignIndex], enrichedPlanets, 'en'),
            hi: analyzeLagnaPersonality(RASHIS[ascSignIndex], enrichedPlanets, 'hi')
          },
          moonEmotions: {
            en: analyzeMoonEmotions(moon ? moon.sign : RASHIS[ascSignIndex], moon, 'en'),
            hi: analyzeMoonEmotions(moon ? moon.sign : RASHIS[ascSignIndex], moon, 'hi')
          },
          education: {
            en: analyzeEducation(enrichedPlanets, RASHIS[ascSignIndex], 'en'),
            hi: analyzeEducation(enrichedPlanets, RASHIS[ascSignIndex], 'hi')
          },
          career: {
            en: analyzeCareer(enrichedPlanets, RASHIS[ascSignIndex], 'en'),
            hi: analyzeCareer(enrichedPlanets, RASHIS[ascSignIndex], 'hi')
          },
          wealth: {
            en: analyzeWealth(enrichedPlanets, RASHIS[ascSignIndex], 'en'),
            hi: analyzeWealth(enrichedPlanets, RASHIS[ascSignIndex], 'hi')
          },
          relationships: {
            en: analyzeRelationships(enrichedPlanets, RASHIS[ascSignIndex], calculateMangalDosha(enrichedPlanets, ascDegree), 'en'),
            hi: analyzeRelationships(enrichedPlanets, RASHIS[ascSignIndex], calculateMangalDosha(enrichedPlanets, ascDegree), 'hi')
          },
          health: {
            en: analyzeHealth(enrichedPlanets, RASHIS[ascSignIndex], 'en'),
            hi: analyzeHealth(enrichedPlanets, RASHIS[ascSignIndex], 'hi')
          },
          doshasYogas: {
            en: analyzeDoshasYogas(enrichedPlanets, calculateMangalDosha(enrichedPlanets, ascDegree), 'en'),
            hi: analyzeDoshasYogas(enrichedPlanets, calculateMangalDosha(enrichedPlanets, ascDegree), 'hi')
          },
          dashaPredictions: {
            en: analyzeDashaPredictions(vimshottariDasha, enrichedPlanets, 'en'),
            hi: analyzeDashaPredictions(vimshottariDasha, enrichedPlanets, 'hi')
          },
          remedies: {
            en: generateRemedies(enrichedPlanets, calculateMangalDosha(enrichedPlanets, ascDegree), 'en'),
            hi: generateRemedies(enrichedPlanets, calculateMangalDosha(enrichedPlanets, ascDegree), 'hi')
          },
          // NEW: भाव फल - 12 Houses Analysis (Simplified)
          bhavPhal: {
            house1: { en: 'House 1 (Self): Strong personality and good health indicated. Leadership qualities present.', hi: 'प्रथम भाव (स्वयं): मजबूत व्यक्तित्व और अच्छा स्वास्थ्य संकेत। नेतृत्व गुण मौजूद।' },
            house2: { en: 'House 2 (Wealth): Financial stability through efforts. Family support strong.', hi: 'द्वितीय भाव (धन): प्रयासों के माध्यम से वित्तीय स्थिरता। पारिवारिक समर्थन मजबूत।' },
            house3: { en: 'House 3 (Siblings): Communication skills are strong. Courage and determination will help in ventures.', hi: 'तृतीय भाव (भाई-बहन): संचार कौशल मजबूत है। साहस और दृढ़ संकल्प उद्यमों में मदद करेगा।' },
            house4: { en: 'House 4 (Mother & Home): Domestic happiness and property matters are favorable. Strong emotional foundation.', hi: 'चतुर्थ भाव (माता और घर): घरेलू सुख और संपत्ति के मामले अनुकूल हैं। मजबूत भावनात्मक आधार।' },
            house5: { en: 'House 5 (Children & Education): Education prospects good. Creative abilities present.', hi: 'पंचम भाव (संतान और शिक्षा): शिक्षा की संभावनाएं अच्छी। रचनात्मक क्षमताएं मौजूद।' },
            house6: { en: 'House 6 (Health & Enemies): Health requires attention. Victory over obstacles expected.', hi: 'षष्ठ भाव (स्वास्थ्य और शत्रु): स्वास्थ्य पर ध्यान देने की आवश्यकता। बाधाओं पर विजय की उम्मीद।' },
            house7: { en: 'House 7 (Marriage): Partnership and marriage prospects favorable. Harmony in relationships.', hi: 'सप्तम भाव (विवाह): साझेदारी और विवाह की संभावनाएं अनुकूल। रिश्तों में सद्भाव।' },
            house8: { en: 'House 8 (Longevity): Transformation and hidden knowledge bring growth. Research and occult sciences may interest you.', hi: 'अष्टम भाव (आयु): परिवर्तन और गुप्त ज्ञान विकास लाते हैं। अनुसंधान और गुप्त विज्ञान में रुचि हो सकती है।' },
            house9: { en: 'House 9 (Fortune): Higher education and spiritual pursuits are favored. Long journeys bring opportunities.', hi: 'नवम भाव (भाग्य): उच्च शिक्षा और आध्यात्मिक गतिविधियां अनुकूल हैं। लंबी यात्राएं अवसर लाती हैं।' },
            house10: { en: 'House 10 (Career): Career growth through dedication. Professional success indicated.', hi: 'दशम भाव (करियर): समर्पण के माध्यम से करियर विकास। पेशेवर सफलता संकेत।' },
            house11: { en: 'House 11 (Gains): Financial gains through friends and networks. Aspirations will be fulfilled with effort.', hi: 'एकादश भाव (लाभ): मित्रों और नेटवर्क के माध्यम से वित्तीय लाभ। प्रयास से आकांक्षाएं पूरी होंगी।' },
            house12: { en: 'House 12 (Spirituality): Expenses on spiritual and charitable activities. Foreign connections possible.', hi: 'द्वादश भाव (आध्यात्मिकता): आध्यात्मिक और धर्मार्थ गतिविधियों पर व्यय। विदेशी संबंध संभव।' },
          },
          // NEW: वर्ष फल - Yearly Prediction
          yearlyPrediction: {
            en: `Current Year Analysis: Based on planetary transits, this year brings opportunities for growth. ${vimshottariDasha?.currentDasha?.planet || 'Planetary'} Mahadasha influences your path. Focus on ${RASHIS[ascSignIndex]} qualities for success.`,
            hi: `वर्तमान वर्ष विश्लेषण: ग्रहों के गोचर के आधार पर, यह वर्ष विकास के अवसर लाता है। ${vimshottariDasha?.currentDasha?.planet || 'ग्रह'} महादशा आपके मार्ग को प्रभावित करती है। सफलता के लिए ${RASHIS[ascSignIndex]} गुणों पर ध्यान दें।`
          },
          // NEW: महादशा फल - Mahadasha Prediction
          mahadashaPhal: {
            en: vimshottariDasha?.currentDasha ? `Current Mahadasha: ${vimshottariDasha.currentDasha.planet} (${vimshottariDasha.currentDasha.startDate.split('T')[0]} to ${vimshottariDasha.currentDasha.endDate.split('T')[0]}). This period emphasizes ${vimshottariDasha.currentDasha.planet}'s qualities in your life. ${analyzeDashaPredictions(vimshottariDasha, enrichedPlanets, 'en')}` : 'Mahadasha analysis: Planetary periods influence life events. Consult detailed dasha chart for timing.',
            hi: vimshottariDasha?.currentDasha ? `वर्तमान महादशा: ${vimshottariDasha.currentDasha.planet} (${vimshottariDasha.currentDasha.startDate.split('T')[0]} से ${vimshottariDasha.currentDasha.endDate.split('T')[0]} तक)। यह अवधि आपके जीवन में ${vimshottariDasha.currentDasha.planet} के गुणों पर जोर देती है। ${analyzeDashaPredictions(vimshottariDasha, enrichedPlanets, 'hi')}` : 'महादशा विश्लेषण: ग्रह अवधि जीवन की घटनाओं को प्रभावित करती है। समय के लिए विस्तृत दशा चार्ट देखें।'
          },
          // NEW: शुभ सुझाव - Auspicious Suggestions
          auspiciousSuggestions: {
            gemstone: {
              en: `Lucky Gemstone: ${getGemstoneForRashi(moon ? moon.sign : RASHIS[ascSignIndex])}. Wear on ${getGemstoneDay(moon ? moon.sign : RASHIS[ascSignIndex])} for best results.`,
              hi: `शुभ रत्न: ${getGemstoneForRashi(moon ? moon.sign : RASHIS[ascSignIndex])}। सर्वोत्तम परिणामों के लिए ${getGemstoneDay(moon ? moon.sign : RASHIS[ascSignIndex])} को पहनें।`
            },
            colors: {
              en: `Favorable Colors: ${getFavorableColors(moon ? moon.sign : RASHIS[ascSignIndex])}. These colors enhance your aura and bring positivity.`,
              hi: `अनुकूल रंग: ${getFavorableColors(moon ? moon.sign : RASHIS[ascSignIndex])}। ये रंग आपकी आभा को बढ़ाते हैं और सकारात्मकता लाते हैं।`
            },
            days: {
              en: `Auspicious Days: ${getAuspiciousDays(moon ? moon.sign : RASHIS[ascSignIndex])}. Important work should be done on these days.`,
              hi: `शुभ दिन: ${getAuspiciousDays(moon ? moon.sign : RASHIS[ascSignIndex])}। महत्वपूर्ण कार्य इन दिनों किए जाने चाहिए।`
            },
            numbers: {
              en: `Lucky Numbers: ${getLuckyNumbers(moon ? moon.sign : RASHIS[ascSignIndex])}. These numbers bring fortune and success.`,
              hi: `शुभ अंक: ${getLuckyNumbers(moon ? moon.sign : RASHIS[ascSignIndex])}। ये अंक भाग्य और सफलता लाते हैं।`
            }
          }
        };
      } catch (error) {
        console.error('[astro-engine] ❌ ERROR generating Phallit:', error);
        console.error('[astro-engine] Error stack:', error.stack);
        console.error('[astro-engine] Error message:', error.message);
        // Return fallback predictions with error info
        return {
          lagnaPersonality: { en: `Analysis error: ${error.message}`, hi: `विश्लेषण त्रुटि: ${error.message}` },
          moonEmotions: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' },
          education: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' },
          career: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' },
          wealth: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' },
          relationships: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' },
          health: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' },
          doshasYogas: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' },
          dashaPredictions: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' },
          remedies: { en: 'Analysis not available', hi: 'विश्लेषण उपलब्ध नहीं' }
        };
      }
    })(),
  };
}

// Helper function for Namakshar calculation
function getNamaksharFromNakshatra(nakshatraName, pada) {
  // Simplified mapping of Nakshatra + Pada to starting letters
  const namaksharMap = {
    "Ashwini": ["Chu", "Che", "Cho", "La"],
    "Bharani": ["Li", "Lu", "Le", "Lo"],
    "Krittika": ["A", "I", "U", "E"],
    "Rohini": ["O", "Va", "Vi", "Vu"],
    "Mrigashira": ["Ve", "Vo", "Ka", "Ki"],
    "Ardra": ["Ku", "Gha", "Nga", "Chha"],
    "Punarvasu": ["Ke", "Ko", "Ha", "Hi"],
    "Pushya": ["Hu", "He", "Ho", "Da"],
    "Ashlesha": ["Di", "Du", "De", "Do"],
    "Magha": ["Ma", "Mi", "Mu", "Me"],
    "Purva Phalguni": ["Mo", "Ta", "Ti", "Tu"],
    "Uttara Phalguni": ["Te", "To", "Pa", "Pi"],
    "Hasta": ["Pu", "Sha", "Na", "Tha"],
    "Chitra": ["Pe", "Po", "Ra", "Ri"],
    "Swati": ["Ru", "Re", "Ro", "Ta"],
    "Vishakha": ["Ti", "Tu", "Te", "To"],
    "Anuradha": ["Na", "Ni", "Nu", "Ne"],
    "Jyeshtha": ["No", "Ya", "Yi", "Yu"],
    "Mula": ["Ye", "Yo", "Bha", "Bhi"],
    "Purva Ashadha": ["Bhu", "Dha", "Pha", "Dha"],
    "Uttara Ashadha": ["Bhe", "Bho", "Ja", "Ji"],
    "Shravana": ["Ju", "Je", "Jo", "Gha"],
    "Dhanishta": ["Ga", "Gi", "Gu", "Ge"],
    "Shatabhisha": ["Go", "Sa", "Si", "Su"],
    "Purva Bhadrapada": ["Se", "So", "Da", "Di"],
    "Uttara Bhadrapada": ["Du", "Tha", "Jha", "Tra"],
    "Revati": ["De", "Do", "Cha", "Chi"]
  };

  const letters = namaksharMap[nakshatraName];
  return letters ? letters[pada - 1] : "Unknown";
}

// Generate simple chart SVG
function generateSimpleChart(ascendant) {
  return `<svg width="200" height="200" viewBox="0 0 200 200"><rect fill="#1a1a2e" width="200" height="200"/><path stroke="#4a90e2" stroke-width="2" fill="none" d="M100,10 L190,100 L100,190 L10,100 Z"/><line stroke="#4a90e2" stroke-width="1" x1="100" y1="10" x2="100" y2="190"/><line stroke="#4a90e2" stroke-width="1" x1="10" y1="100" x2="190" y2="100"/><text fill="#fff" x="100" y="25" text-anchor="middle" font-size="10">Asc: ${ascendant}</text></svg>`;
}


// SERVER INITIALIZATION

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
      // Robust date parsing
      const parseDateParts = (dateStr) => {
        const d = new Date(dateStr);
        // Fallback for manual parsing to avoid timezone day shifts
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
          const parts = dateStr.split('T')[0].split('-');
          return { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };
        }
        return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
      };

      const date1 = parseDateParts(person1.dateOfBirth);
      const date2 = parseDateParts(person2.dateOfBirth);

      const kundali1 = computeKundali({
        name: person1.name,
        gender: person1.gender || "male",
        year: date1.year,
        month: date1.month,
        day: date1.day,
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
        year: date2.year,
        month: date2.month,
        day: date2.day,
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

      if (!moon1 || !moon2) {
        return respondJson(res, 400, { error: "Moon data missing for one or both individuals. Check birth details." });
      }

      // Helper functions for Guna calculations
      // Use global functions for accurate Guna calculations
      // (getVarnaFromSign, getVashya, getTara, getYoniFromNakshatra, getGanaFromNakshatra, getNadiFromNakshatra, getRasiLord)

      // Calculate each Guna with AstroSage-compatible scoring
      const varna1 = getVarnaFromSign(moon1.sign);
      const varna2 = getVarnaFromSign(moon2.sign);
      const varnaOrder = { "Brahmin": 4, "Kshatriya": 3, "Vaisya": 2, "Sudra": 1 };
      const varnaScore = (varnaOrder[varna1] >= varnaOrder[varna2]) ? 1 : 0;

      const vashya1 = getVashya(moon1.sign);
      const vashya2 = getVashya(moon2.sign);
      let vashyaScore = 0;
      if (vashya1 === vashya2) {
        vashyaScore = 2;
      } else if ((vashya1 === "Manav" && vashya2 === "Jalchar") || (vashya1 === "Jalchar" && vashya2 === "Manav")) {
        vashyaScore = 0.5;
      } else if ((vashya1 === "Chatu" && vashya2 === "Manav") || (vashya1 === "Manav" && vashya2 === "Chatu")) {
        vashyaScore = 1;
      } else if ((vashya1 === "Chatu" && vashya2 === "Jalchar") || (vashya1 === "Jalchar" && vashya2 === "Chatu")) {
        vashyaScore = 0.5;
      } else {
        vashyaScore = 0;
      }

      // Tara calculation: count from boy's nakshatra to girl's nakshatra
      const taraCount1 = ((moon2.nakshatra.index - moon1.nakshatra.index + 27) % 27) + 1;
      const taraCount2 = ((moon1.nakshatra.index - moon2.nakshatra.index + 27) % 27) + 1;
      const t1Idx = ((taraCount1 - 1) % 9) + 1; // 1-9
      const t2Idx = ((taraCount2 - 1) % 9) + 1; // 1-9
      const taraNames = ["", "Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhak", "Vadha", "Mitra", "Ati-Mitra"];
      const tara1 = taraNames[t1Idx];
      const tara2 = taraNames[t2Idx];

      const goodTaraIndices = [2, 4, 6, 8, 9]; // Sampat, Kshema, Sadhak, Mitra, Ati-Mitra
      let taraScore = 0;
      if (goodTaraIndices.includes(t1Idx)) taraScore += 1.5;
      if (goodTaraIndices.includes(t2Idx)) taraScore += 1.5;
      if (moon1.nakshatra.index === moon2.nakshatra.index && moon1.nakshatra.pada !== moon2.nakshatra.pada) taraScore = 3;

      const yoni1 = getYoniFromNakshatra(moon1.nakshatra.index);
      const yoni2 = getYoniFromNakshatra(moon2.nakshatra.index);
      const yoniMatrix = {
        "Ashwa": { "Ashwa": 4, "Gaja": 2, "Mesha": 2, "Sarpa": 1, "Shwan": 1, "Marjar": 2, "Mushak": 1, "Gau": 1, "Mahish": 0, "Vyaghra": 1, "Mriga": 1, "Vanar": 3, "Simha": 1, "Nakul": 2 },
        "Gaja": { "Ashwa": 2, "Gaja": 4, "Mesha": 3, "Sarpa": 3, "Shwan": 2, "Marjar": 2, "Mushak": 2, "Gau": 2, "Mahish": 2, "Vyaghra": 1, "Mriga": 2, "Vanar": 3, "Simha": 0, "Nakul": 2 },
        "Mesha": { "Ashwa": 2, "Gaja": 3, "Mesha": 4, "Sarpa": 2, "Shwan": 1, "Marjar": 2, "Mushak": 1, "Gau": 3, "Mahish": 3, "Vyaghra": 1, "Mriga": 2, "Vanar": 0, "Simha": 1, "Nakul": 2 },
        "Sarpa": { "Ashwa": 1, "Gaja": 3, "Mesha": 2, "Sarpa": 4, "Shwan": 2, "Marjar": 1, "Mushak": 2, "Gau": 1, "Mahish": 1, "Vyaghra": 1, "Mriga": 2, "Vanar": 2, "Simha": 1, "Nakul": 0 },
        "Shwan": { "Ashwa": 1, "Gaja": 2, "Mesha": 1, "Sarpa": 2, "Shwan": 4, "Marjar": 2, "Mushak": 1, "Gau": 2, "Mahish": 2, "Vyaghra": 1, "Mriga": 0, "Vanar": 2, "Simha": 1, "Nakul": 2 },
        "Marjar": { "Ashwa": 2, "Gaja": 2, "Mesha": 2, "Sarpa": 1, "Shwan": 2, "Marjar": 4, "Mushak": 0, "Gau": 2, "Mahish": 2, "Vyaghra": 2, "Mriga": 1, "Vanar": 2, "Simha": 1, "Nakul": 2 },
        "Mushak": { "Ashwa": 1, "Gaja": 2, "Mesha": 1, "Sarpa": 2, "Shwan": 1, "Marjar": 0, "Mushak": 4, "Gau": 2, "Mahish": 2, "Vyaghra": 2, "Mriga": 2, "Vanar": 1, "Simha": 1, "Nakul": 0 },
        "Gau": { "Ashwa": 1, "Gaja": 2, "Mesha": 3, "Sarpa": 1, "Shwan": 2, "Marjar": 2, "Mushak": 2, "Gau": 4, "Mahish": 3, "Vyaghra": 0, "Mriga": 1, "Vanar": 2, "Simha": 1, "Nakul": 2 },
        "Mahish": { "Ashwa": 0, "Gaja": 2, "Mesha": 3, "Sarpa": 1, "Shwan": 2, "Marjar": 2, "Mushak": 2, "Gau": 3, "Mahish": 4, "Vyaghra": 1, "Mriga": 2, "Vanar": 2, "Simha": 1, "Nakul": 2 },
        "Vyaghra": { "Ashwa": 1, "Gaja": 1, "Mesha": 1, "Sarpa": 1, "Shwan": 1, "Marjar": 2, "Mushak": 2, "Gau": 0, "Mahish": 1, "Vyaghra": 4, "Mriga": 1, "Vanar": 1, "Simha": 2, "Nakul": 1 },
        "Mriga": { "Ashwa": 1, "Gaja": 2, "Mesha": 2, "Sarpa": 2, "Shwan": 0, "Marjar": 1, "Mushak": 2, "Gau": 1, "Mahish": 2, "Vyaghra": 1, "Mriga": 4, "Vanar": 2, "Simha": 2, "Nakul": 2 },
        "Vanar": { "Ashwa": 3, "Gaja": 3, "Mesha": 0, "Sarpa": 2, "Shwan": 2, "Marjar": 2, "Mushak": 1, "Gau": 2, "Mahish": 2, "Vyaghra": 1, "Mriga": 2, "Vanar": 4, "Simha": 3, "Nakul": 2 },
        "Simha": { "Ashwa": 1, "Gaja": 0, "Mesha": 1, "Sarpa": 1, "Shwan": 1, "Marjar": 1, "Mushak": 1, "Gau": 1, "Mahish": 1, "Vyaghra": 2, "Mriga": 2, "Vanar": 3, "Simha": 4, "Nakul": 2 },
        "Nakul": { "Ashwa": 2, "Gaja": 2, "Mesha": 2, "Sarpa": 0, "Shwan": 2, "Marjar": 2, "Mushak": 0, "Gau": 2, "Mahish": 2, "Vyaghra": 1, "Mriga": 2, "Vanar": 2, "Simha": 2, "Nakul": 4 }
      };
      let yoniScore = (yoniMatrix[yoni1] && yoniMatrix[yoni1][yoni2] !== undefined) ? yoniMatrix[yoni1][yoni2] : 2;

      const lord1 = getRasiLord(moon1.sign);
      const lord2 = getRasiLord(moon2.sign);
      const maitriScores = {
        "Sun": { "Sun": 5, "Moon": 5, "Mars": 5, "Mercury": 4, "Jupiter": 5, "Venus": 0, "Saturn": 0 },
        "Moon": { "Sun": 5, "Moon": 5, "Mars": 4, "Mercury": 5, "Jupiter": 4, "Venus": 4, "Saturn": 4 },
        "Mars": { "Sun": 5, "Moon": 5, "Mars": 5, "Mercury": 0, "Jupiter": 5, "Venus": 3, "Saturn": 0.5 },
        "Mercury": { "Sun": 5, "Moon": 0, "Mars": 4, "Mercury": 5, "Jupiter": 0.5, "Venus": 5, "Saturn": 4 },
        "Jupiter": { "Sun": 5, "Moon": 5, "Mars": 5, "Mercury": 0.5, "Jupiter": 5, "Venus": 0.5, "Saturn": 4 },
        "Venus": { "Sun": 0, "Moon": 0, "Mars": 3, "Mercury": 5, "Jupiter": 0.5, "Venus": 5, "Saturn": 5 },
        "Saturn": { "Sun": 0, "Moon": 0, "Mars": 0.5, "Mercury": 4, "Jupiter": 4, "Venus": 5, "Saturn": 5 }
      };
      let grahaMaitriScore = (maitriScores[lord1] && maitriScores[lord1][lord2] !== undefined) ? maitriScores[lord1][lord2] : 0.5;

      const gana1 = getGanaFromNakshatra(moon1.nakshatra.index);
      const gana2 = getGanaFromNakshatra(moon2.nakshatra.index);
      const ganaScoring = {
        "Devta": { "Devta": 6, "Manushya": 6, "Rakshasa": 1 },
        "Manushya": { "Devta": 5, "Manushya": 6, "Rakshasa": 0 },
        "Rakshasa": { "Devta": 0, "Manushya": 0, "Rakshasa": 6 }
      };
      let ganaScore = (ganaScoring[gana1] && ganaScoring[gana1][gana2] !== undefined) ? ganaScoring[gana1][gana2] : 0;

      const sign1Index = RASHIS.indexOf(moon1.sign);
      const sign2Index = RASHIS.indexOf(moon2.sign);
      const signDistance = ((sign2Index - sign1Index + 12) % 12) + 1;
      let bhakootScore = [2, 5, 6, 8, 9, 12].includes(signDistance) ? 0 : 7;
      if (bhakootScore === 0 && lord1 === lord2) bhakootScore = 7;

      const nadi1 = getNadiFromNakshatra(moon1.nakshatra.index);
      const nadi2 = getNadiFromNakshatra(moon2.nakshatra.index);
      const nadiScore = nadi1 !== nadi2 ? 8 : 0;

      const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaMaitriScore + ganaScore + bhakootScore + nadiScore;

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

      const matchingResult = {
        totalScore: Math.round(totalScore * 10) / 10,
        maxScore: 36,
        percentage: Math.round((totalScore / 36) * 100),
        compatibility: totalScore >= 28 ? "Excellent" : totalScore >= 24 ? "Very Good" : totalScore >= 18 ? "Good" : "Average",
        totalDisplayScore: (Math.round(totalScore * 10) / 10).toFixed(1),
        debug: {
          boy: { varna: varna1, vashya: vashya1, tara: tara1, yoni: yoni1, gana: gana1, bhakootSign: moon1.sign, nadi: nadi1 },
          girl: { varna: varna2, vashya: vashya2, tara: tara2, yoni: yoni2, gana: gana2, bhakootSign: moon2.sign, nadi: nadi2 }
        },
        details: [
          { name: "Varna (वर्ण)", boyValue: varna1, girlValue: varna2, score: varnaScore, maxScore: 1, areaOfLife: "Work", description: "Spiritual compatibility and ego levels" },
          { name: "Vashya (वश्य)", boyValue: vashya1, girlValue: vashya2, score: vashyaScore, maxScore: 2, areaOfLife: "Dominance", description: "Mutual attraction and control" },
          { name: "Tara (तारा)", boyValue: tara1, girlValue: tara2, score: taraScore, maxScore: 3, areaOfLife: "Destiny", description: "Birth star compatibility and health" },
          { name: "Yoni (योनि)", boyValue: yoni1, girlValue: yoni2, score: yoniScore, maxScore: 4, areaOfLife: "Mentality", description: "Sexual compatibility and intimacy" },
          { name: "Graha Maitri (ग्रह मैत्री)", boyValue: lord1, girlValue: lord2, score: grahaMaitriScore, maxScore: 5, areaOfLife: "Compatibility", description: "Mental compatibility and friendship" },
          { name: "Gana (गण)", boyValue: gana1, girlValue: gana2, score: ganaScore, maxScore: 6, areaOfLife: "Guna Level", description: "Temperament and behavior compatibility" },
          { name: "Bhakoot (भकूट)", boyValue: moon1.sign, girlValue: moon2.sign, score: bhakootScore, maxScore: 7, areaOfLife: "Love", description: "Love and prosperity" },
          { name: "Nadi (नाडी)", boyValue: nadi1, girlValue: nadi2, score: nadiScore, maxScore: 8, areaOfLife: "Health", description: "Health and progeny" }
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
          name: person1.name,
          ascendant: kundali1.ascendant.sign,
          moonSign: moon1.sign,
          chart: generateSimpleChart(kundali1.ascendant.sign)
        },
        girlDetails: {
          varna: varna2,
          vashya: vashya2,
          tara: tara2,
          yoni: yoni2,
          gana: gana2,
          nadi: nadi2,
          rasiLord: lord2,
          name: person2.name,
          ascendant: kundali2.ascendant.sign,
          moonSign: moon2.sign,
          chart: generateSimpleChart(kundali2.ascendant.sign)
        },
        recommendation: totalScore >= 28
          ? "Excellent match! This is a highly compatible match with strong potential for a successful marriage."
          : totalScore >= 24
            ? "Very good compatibility. Marriage is recommended with minor considerations."
            : totalScore >= 18
              ? "Good compatibility. Marriage is possible with mutual understanding and effort."
              : "Average compatibility. Marriage is possible but may require effort and understanding. Recommended to consult an expert astrologer for detailed analysis and remedies."
      };

      respondJson(res, 200, matchingResult);
    } catch (error) {
      console.error("[astro-engine] Kundali matching error:", error);
      respondJson(res, 400, { error: error.message || "Unable to match kundalis" });
    }
    return;
  }

  /* REMOVED DUPLICATE ENDPOINT - Using the one at line 1458 instead
  // Kundali Matching Endpoint
  if (req.method === "POST" && req.url === "/api/kundali-matching") {
    ... duplicate code removed ...
  }
  */

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
        console.log("[WhatsApp] ✅ Connected successfully!");
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