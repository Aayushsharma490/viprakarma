// Swiss Ephemeris WASM Kundali Engine (AstroSage/JHora-accurate)
// Only backend logic, no frontend or UI code

export function generateKundali(dobLocal, lat, lon, tzOffsetHours = 0) {
  const swe = require('./swisseph/swisseph.js');
  const gender = dobLocal.gender || null;
  // Manual IST → UTC conversion
  const localHour = dobLocal.hour ?? dobLocal.getHours?.() ?? 0;
  const localMinute = dobLocal.minute ?? dobLocal.getMinutes?.() ?? 0;
  const localSecond = dobLocal.second ?? dobLocal.getSeconds?.() ?? 0;
  const utcHour = localHour + localMinute / 60 + localSecond / 3600 - 5.5;
  // Julian Day
  const year = dobLocal.year ?? dobLocal.getFullYear?.() ?? 0;
  const month = dobLocal.month ?? (dobLocal.getMonth?.() ?? 0) + 1;
  const day = dobLocal.day ?? dobLocal.getDate?.() ?? 0;
  const jd_ut = swe.julday(year, month, day, utcHour, 1);
  // Sidereal + Lahiri
  swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0);
  const FLAGS = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL;
  // Planets
  const planetIds = [swe.SUN, swe.MOON, swe.MARS, swe.MERCURY, swe.JUPITER, swe.VENUS, swe.SATURN, swe.MEAN_NODE];
  const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  let planetDegrees = [];
  for (let i = 0; i < planetIds.length; i++) {
    const res = swe.calc_ut(jd_ut, planetIds[i], FLAGS);
    planetDegrees.push(res.longitude);
  }
  planetDegrees.push((planetDegrees[7] + 180) % 360); // Ketu
  // Lagna (Ascendant)
  const houses = swe.houses(jd_ut, lat, lon, "W");
  const lagnaDegree = houses.ascmc[0];
  // Whole Sign House Mapping
  function getHouse(degree, lagnaDegree) {
    const diff = (degree - lagnaDegree + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }
  // Rashi Mapping
  const rashiNames = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];
  function getRashi(degree) {
    return rashiNames[Math.floor(degree / 30)];
  }
  // Nakshatra & Pada
  const nakshatraNames = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  function getNakshatra(degree) {
    const idx = Math.floor(degree / (360 / 27));
    return nakshatraNames[idx];
  }
  function getPada(degree) {
    return Math.floor((degree % (360 / 27)) / (360 / 108)) + 1;
  }
  // Navamsa (D9)
  function getNavamsaRashi(degree) {
    const rashiIdx = Math.floor(degree / 30);
    const d9Idx = Math.floor((degree % 30) / (30 / 9));
    return rashiNames[(rashiIdx * 9 + d9Idx) % 12];
  }
  // Planets output
  const planets = planetNames.map((name, i) => {
    const degree = planetDegrees[i];
    return {
      name,
      degree,
      rashi: getRashi(degree),
      house: getHouse(degree, lagnaDegree),
      nakshatra: getNakshatra(degree),
      pada: getPada(degree),
      navamsaRashi: getNavamsaRashi(degree)
    };
  });
  // Houses output
  const housesArr = [];
  for (let i = 0; i < 12; i++) {
    housesArr.push({ house: i + 1, rashi: rashiNames[(Math.floor(lagnaDegree / 30) + i) % 12] });
  }
  // Placeholder predictions using gender
  const predictions = {
    personality: gender ? `Personality predictions for ${gender}` : "Personality predictions",
    career: gender ? `Career predictions for ${gender}` : "Career predictions",
    marriage: gender ? `Marriage predictions for ${gender}` : "Marriage predictions",
    health: gender ? `Health predictions for ${gender}` : "Health predictions"
  };
  return {
    lagnaDegree,
    houses: housesArr,
    planets,
    gender,
    predictions
  };
}

// Helper to get nakshatra name for a given degree
export function getNakshatraName(degree) {
  const nakshatraNames = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  const idx = Math.floor(degree / (360 / 27));
  return nakshatraNames[idx];
}