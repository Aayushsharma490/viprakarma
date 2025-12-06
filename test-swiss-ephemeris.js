// Test Swiss Ephemeris integration
// Test with Aayush Sharma's birth data: Nov 27, 2005, 7:30 AM, Jaipur (26.45°N, 74.64°E)

const { vedicAstrology } = require('./src/lib/vedicAstrology.ts');

async function testSwissEphemeris() {
  console.log('🧪 Testing Swiss Ephemeris Integration\n');

  try {
    // Aayush Sharma's birth data
    const birthData = {
      year: 2005,
      month: 11,
      day: 27,
      hour: 7,
      minute: 30,
      second: 0,
      latitude: 26.45,  // Jaipur latitude
      longitude: 74.64, // Jaipur longitude
      timezone: 5.5     // IST
    };

    console.log('📅 Birth Data:', birthData);
    console.log('📍 Location: Jaipur, India\n');

    // Calculate Vedic chart
    const chart = await vedicAstrology.calculateVedicChart(birthData);

    console.log('🌟 AYANAMSA:', chart.ayanamsa.toFixed(4), 'degrees');
    console.log('📈 ASCENDANT:', chart.ascendant.sign, `(${chart.ascendant.signNumber})`, chart.ascendant.degree.toFixed(2) + '°');
    console.log('');

    // Display planets
    console.log('🪐 PLANET POSITIONS:');
    console.log('─'.repeat(80));
    console.log('Planet     | Tropical | Sidereal | Sign       | House | Nakshatra     | Pada | Retro');
    console.log('─'.repeat(80));

    chart.planets.forEach(planet => {
      const retro = planet.isRetrograde ? 'R' : ' ';
      console.log(
        `${planet.name.padEnd(10)} | ${planet.tropicalLongitude.toFixed(2).padStart(8)} | ${planet.siderealLongitude.toFixed(2).padStart(8)} | ${planet.sign.padEnd(10)} | ${planet.house.toString().padStart(5)} | ${planet.nakshatra.padEnd(13)} | ${planet.pada.toString().padStart(4)} | ${retro}`
      );
    });

    console.log('');

    // Display houses
    console.log('🏠 HOUSES:');
    console.log('─'.repeat(50));
    console.log('House | Sign       | Planets');
    console.log('─'.repeat(50));

    chart.houses.forEach(house => {
      const planetNames = house.planets.map(p => p.name).join(', ') || 'Empty';
      console.log(`${house.number.toString().padStart(5)} | ${house.sign.padEnd(10)} | ${planetNames}`);
    });

    console.log('');

    // Expected values for verification (from reliable sources)
    const expected = {
      sunSign: 'Scorpio',
      moonSign: 'Gemini',
      ascendant: 'Sagittarius',
      sunNakshatra: 'Anuradha',
      moonNakshatra: 'Ardra'
    };

    console.log('🎯 VERIFICATION AGAINST EXPECTED VALUES:');
    console.log('─'.repeat(60));

    const sun = chart.planets.find(p => p.name === 'Sun');
    const moon = chart.planets.find(p => p.name === 'Moon');

    if (sun) {
      const sunCorrect = sun.sign === expected.sunSign;
      console.log(`☀️  Sun Sign: ${sun.sign} (${sunCorrect ? '✅' : '❌'} Expected: ${expected.sunSign})`);
      console.log(`   Sun Nakshatra: ${sun.nakshatra} (${sun.nakshatra === expected.sunNakshatra ? '✅' : '❌'} Expected: ${expected.sunNakshatra})`);
    }

    if (moon) {
      const moonCorrect = moon.sign === expected.moonSign;
      console.log(`🌙 Moon Sign: ${moon.sign} (${moonCorrect ? '✅' : '❌'} Expected: ${expected.moonSign})`);
      console.log(`   Moon Nakshatra: ${moon.nakshatra} (${moon.nakshatra === expected.moonNakshatra ? '✅' : '❌'} Expected: ${expected.moonNakshatra})`);
    }

    const ascendantCorrect = chart.ascendant.sign === expected.ascendant;
    console.log(`🔺 Ascendant: ${chart.ascendant.sign} (${ascendantCorrect ? '✅' : '❌'} Expected: ${expected.ascendant})`);

    console.log('');
    console.log('📊 ACCURACY SUMMARY:');
    const totalChecks = 5;
    let correctChecks = 0;

    if (sun?.sign === expected.sunSign) correctChecks++;
    if (sun?.nakshatra === expected.sunNakshatra) correctChecks++;
    if (moon?.sign === expected.moonSign) correctChecks++;
    if (moon?.nakshatra === expected.moonNakshatra) correctChecks++;
    if (chart.ascendant.sign === expected.ascendant) correctChecks++;

    const accuracy = (correctChecks / totalChecks) * 100;
    console.log(`Accuracy: ${correctChecks}/${totalChecks} (${accuracy.toFixed(1)}%)`);

    if (accuracy >= 80) {
      console.log('🎉 HIGH ACCURACY! Swiss Ephemeris integration successful.');
    } else {
      console.log('⚠️  LOW ACCURACY! Need to debug calculations.');
    }

  } catch (error) {
    console.error('❌ Error testing Swiss Ephemeris:', error);
  }
}

// Run the test
testSwissEphemeris();
