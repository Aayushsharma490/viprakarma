// Test script to verify astronomy-engine library integration
const { DateTime } = require('luxon');
const Astronomy = require('astronomy-engine');

console.log('🧪 Testing Astronomy-Engine Library Integration\n');

// Test basic date handling
const date = new Date(1990, 0, 1, 12, 0, 0); // January 1, 1990, 12:00 PM
console.log('Test Date:', date.toISOString());

// Test Luxon integration
const luxonDate = DateTime.fromJSDate(date);
console.log('Luxon Date:', luxonDate.toISO());

// Test basic astronomical calculations
try {
  // Calculate Julian Day
  const jd = Astronomy.MakeTime(date).ut;
  console.log('Julian Day:', jd);

  // Test solar position
  const solar = Astronomy.Equator(Astronomy.Body.Sun, Astronomy.MakeTime(date), new Astronomy.Observer(0, 0, 0), true, true);
  console.log('Solar Position (RA, Dec):', solar.ra, solar.dec);

  console.log('\n✅ Astronomy-engine library is working correctly!');
} catch (error) {
  console.error('❌ Error with Astronomy-engine:', error.message);
}

// Test planetary positions for Mahesh's birth details
console.log('\n🔮 Testing Mahesh Kundali Calculations\n');

const maheshBirth = {
  year: 1990,
  month: 3, // March (1-indexed)
  day: 15,
  hour: 14,
  minute: 30,
  latitude: 28.6139, // Delhi
  longitude: 77.2090
};

try {
  // Create date object
  const birthDate = new Date(maheshBirth.year, maheshBirth.month - 1, maheshBirth.day, maheshBirth.hour, maheshBirth.minute);
  console.log('Mahesh Birth Date:', birthDate.toISOString());

  // Calculate planetary positions using the correct API
  const observer = new Astronomy.Observer(maheshBirth.latitude, maheshBirth.longitude, 0);
  const time = Astronomy.MakeTime(birthDate);

  const planets = {
    sun: Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true),
    moon: Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true),
    mercury: Astronomy.Equator(Astronomy.Body.Mercury, time, observer, true, true),
    venus: Astronomy.Equator(Astronomy.Body.Venus, time, observer, true, true),
    mars: Astronomy.Equator(Astronomy.Body.Mars, time, observer, true, true),
    jupiter: Astronomy.Equator(Astronomy.Body.Jupiter, time, observer, true, true),
    saturn: Astronomy.Equator(Astronomy.Body.Saturn, time, observer, true, true)
  };

  console.log('\n🌟 Planetary Positions for Mahesh:');
  Object.entries(planets).forEach(([planet, position]) => {
    try {
      const longitude = position.ra * 15; // Convert RA to longitude (approximate)
      const latitude = position.dec;

      // Convert to zodiac sign
      const signIndex = Math.floor(longitude / 30);
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const sign = signs[signIndex % 12];
      const degree = longitude % 30;

      console.log(`${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${sign} ${degree.toFixed(2)}°`);
    } catch (error) {
      console.log(`${planet.charAt(0).toUpperCase() + planet.slice(1)}: Error calculating position`);
    }
  });

  // Calculate ascendant
  const siderealTime = Astronomy.SiderealTime(time);
  const ramc = siderealTime * 15; // Convert to degrees

  // Simple ascendant calculation
  const ascendantLon = (ramc + 90) % 360;
  const ascSignIndex = Math.floor(ascendantLon / 30);
  const ascSign = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][ascSignIndex % 12];

  console.log(`\n🔺 Ascendant: ${ascSign}`);

  console.log('\n✅ Astronomical calculations completed successfully!');

} catch (error) {
  console.error('❌ Error in astronomical calculations:', error.message);
  console.error('Stack:', error.stack);
}
