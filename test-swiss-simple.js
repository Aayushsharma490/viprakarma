// Simple test for Swiss Ephemeris basic functionality
// Test basic planet calculation without complex Vedic logic

import { swissEphemeris } from './src/lib/swissEphemeris.ts';

async function testBasicSwissEphemeris() {
  console.log('Testing Swiss Ephemeris basic functionality...');

  try {
    // Test data for a known date
    const birthData = {
      year: 2000,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
      latitude: 28.6139, // Delhi
      longitude: 77.2090,
      timezone: 5.5
    };

    console.log('Calculating for:', birthData);

    const result = await swissEphemeris.calculate(birthData);

    console.log('Swiss Ephemeris calculation successful!');
    console.log('Julian Day:', result.julianDay);
    console.log('Ayanamsa:', result.ayanamsa.toFixed(4));
    console.log('Ascendant:', result.ascendant.toFixed(4));
    console.log('MC:', result.mc.toFixed(4));

    console.log('\nPlanets:');
    result.planets.forEach(planet => {
      console.log(`${planet.name}: ${planet.longitude.toFixed(4)}° (Speed: ${planet.speed.toFixed(4)})`);
    });

    console.log('\nHouses:');
    result.houses.forEach(house => {
      console.log(`House ${house.house}: ${house.cusp.toFixed(4)}°`);
    });

    return true;
  } catch (error) {
    console.error('Swiss Ephemeris test failed:', error);
    return false;
  }
}

testBasicSwissEphemeris().then(success => {
  if (success) {
    console.log('\n✅ Swiss Ephemeris basic test passed!');
  } else {
    console.log('\n❌ Swiss Ephemeris basic test failed!');
  }
  process.exit(success ? 0 : 1);
});
