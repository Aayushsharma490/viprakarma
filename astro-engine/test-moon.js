// Quick test to check moon position for 12/12/2012, 05:12:34, Ajmer
const sweph = require('sweph');
const { constants } = sweph;

// Set ephemeris path
sweph.set_ephe_path(__dirname + '/swisseph-master/ephe');

// Convert to UTC: 05:12:34 IST - 5:30 = 23:42:34 previous day (11th)
const jdResult = sweph.utc_to_jd(2012, 12, 11, 23, 42, 34, constants.SE_GREG_CAL);
const [jdEt, jdUt] = jdResult.data;

console.log('Julian Day:', jdUt);

// Set Lahiri ayanamsa
sweph.set_sid_mode(constants.SE_SIDM_LAHIRI, 0, 0);

// Get ayanamsa
const ayanamsaResult = sweph.get_ayanamsa_ex(jdEt, constants.SEFLG_SWIEPH);
const ayanamsa = ayanamsaResult.data;
console.log('Ayanamsa:', ayanamsa);

// Calculate Moon position
const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED | constants.SEFLG_SIDEREAL;
const moonResult = sweph.calc_ut(jdUt, constants.SE_MOON, flags);

if (moonResult.flag < 0) {
    console.error('Error calculating moon:', moonResult.error);
    process.exit(1);
}

const [moonLongitude] = moonResult.data;
console.log('Moon Sidereal Longitude:', moonLongitude);

// Calculate nakshatra
const span = 360 / 27;
const index = Math.floor(moonLongitude / span);
const withinNak = moonLongitude % span;
const padaSpan = span / 4;

console.log('\nNakshatra Index:', index + 1);
console.log('Degrees within nakshatra:', withinNak);
console.log('Pada span:', padaSpan);

// Test different pada formulas
const pada1 = Math.floor(withinNak / padaSpan) + 1;
const pada2 = Math.ceil((withinNak + 0.0001) / padaSpan);
const pada3 = Math.ceil(withinNak / padaSpan) || 1;

console.log('\nPada (floor + 1):', pada1);
console.log('Pada (ceil + epsilon):', pada2);
console.log('Pada (ceil || 1):', pada3);

const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

console.log('\nNakshatra:', nakshatras[index]);
console.log('Expected: Anuradha (index 17), Pada 2');
