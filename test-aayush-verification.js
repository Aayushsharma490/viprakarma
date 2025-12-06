// Test script to verify Aayush Sharma's kundali accuracy using our vedicAstrology.ts
// Birth details: 27 November 2005, 07:30 AM, Ajmer, Rajasthan, India
// Expected positions based on professional astrologer verification

import { vedicAstrology } from './src/lib/vedicAstrology.ts';

// Test different ayanamsa systems to find the best accuracy
async function testAyanamsaAccuracy() {
  const birthData = {
    name: 'Aayush Sharma',
    day: 27,
    month: 11,
    year: 2005,
    hour: 7,
    minute: 30,
    timezone: 5.5,
    zodiac: 'Scorpio'
  };

  const expectedPositions = {
    sun: { sign: 'Scorpio', nakshatra: 'Anuradha' },
    moon: { sign: 'Gemini', nakshatra: 'Mrigashira' },
    ascendant: { sign: 'Sagittarius', nakshatra: 'Purva Ashadha' },
    mercury: { sign: 'Scorpio', nakshatra: 'Anuradha' },
    venus: { sign: 'Taurus', nakshatra: 'Rohini' },
    mars: { sign: 'Taurus', nakshatra: 'Rohini' },
    jupiter: { sign: 'Scorpio', nakshatra: 'Anuradha' },
    saturn: { sign: 'Leo', nakshatra: 'Purva Phalguni' },
    rahu: { sign: 'Pisces', nakshatra: 'Revati' },
    ketu: { sign: 'Virgo', nakshatra: 'Hasta' }
  };

  const ayanamsaTypes = [
    { name: 'Lahiri', value: 1 },
    { name: 'Raman', value: 3 },
    { name: 'Krishnamurti', value: 5 },
    { name: 'Djwhal Khul', value: 7 },
    { name: 'Fagan-Bradley', value: 8 }
  ];

  console.log('🧪 Testing Different Ayanamsa Systems for Aayush Sharma Kundali Accuracy\n');

  for (const ayanamsa of ayanamsaTypes) {
    console.log(`🔮 Testing ${ayanamsa.name} Ayanamsa:`);

    try {
      // Use our vedicAstrology.ts to calculate positions with different ayanamsa
      const birthInfo = {
        year: birthData.year,
        month: birthData.month,
        day: birthData.day,
        hour: birthData.hour,
        minute: birthData.minute,
        second: 0,
        latitude: 26.45, // Ajmer coordinates
        longitude: 74.64,
        timezone: birthData.timezone
      };

      const vedicChart = await vedicAstrology.calculateVedicChart(birthInfo, ayanamsa.value);

      // Create kundali data structure from vedic chart data
      const kundaliData = {
        sunSign: vedicChart.planets.find(p => p.name === 'Sun')?.sign || 'Unknown',
        moonSign: vedicChart.planets.find(p => p.name === 'Moon')?.sign || 'Unknown',
        ascendant: vedicChart.ascendant.sign,
        planets: vedicChart.planets.map(planet => ({
          name: planet.name,
          sign: planet.sign,
          nakshatra: planet.nakshatra
        })),
        nakshatras: {
          ascendant: { name: vedicChart.ascendant.nakshatra }
        }
      };

      const planets = kundaliData.planets;
      let correctMatches = 0;
      let totalMatches = 0;

      for (const planet of planets) {
        const expected = expectedPositions[planet.name.toLowerCase()];
        if (expected) {
          totalMatches++;
          const signMatch = planet.sign === expected.sign;
          const nakshatraMatch = planet.nakshatra === expected.nakshatra;

          if (signMatch && nakshatraMatch) {
            correctMatches++;
          }

          console.log(`  ${planet.name}: ${planet.sign} (${planet.nakshatra}) - Expected: ${expected.sign} (${expected.nakshatra}) - ${signMatch && nakshatraMatch ? '✅' : '❌'}`);
        }
      }

      // Check ascendant
      const ascExpected = expectedPositions.ascendant;
      const ascCalculated = {
        sign: kundaliData.ascendant,
        nakshatra: kundaliData.nakshatras.ascendant.name
      };
      const ascSignMatch = ascCalculated.sign === ascExpected.sign;
      const ascNakMatch = ascCalculated.nakshatra === ascExpected.nakshatra;

      if (ascSignMatch && ascNakMatch) correctMatches++;
      totalMatches++;

      console.log(`  Ascendant: ${ascCalculated.sign} (${ascCalculated.nakshatra}) - Expected: ${ascExpected.sign} (${ascExpected.nakshatra}) - ${ascSignMatch && ascNakMatch ? '✅' : '❌'}`);

      const accuracy = (correctMatches / totalMatches) * 100;
      console.log(`  Overall Accuracy: ${correctMatches}/${totalMatches} (${accuracy.toFixed(1)}%)\n`);

    } catch (error) {
      console.error(`  Error with ${ayanamsa.name}:`, error.message);
    }
  }
}

async function runTest() {
  console.log('🧪 Testing Aayush Sharma Kundali Accuracy using Astrology API\n');

  const aayushBirth = {
    name: 'Aayush Sharma',
    day: 27,
    month: 11, // November
    year: 2005,
    hour: 7,
    minute: 30,
    timezone: 5.5, // IST
    zodiac: 'Scorpio' // Expected sun sign
  };

  console.log('Birth Details:', aayushBirth);

  // Expected positions from professional astrologer
  const expectedPositions = {
    sun: { sign: 'Scorpio', nakshatra: 'Anuradha' },
    moon: { sign: 'Gemini', nakshatra: 'Mrigashira' },
    ascendant: { sign: 'Sagittarius', nakshatra: 'Purva Ashadha' },
    mercury: { sign: 'Scorpio', nakshatra: 'Anuradha' },
    venus: { sign: 'Taurus', nakshatra: 'Rohini' },
    mars: { sign: 'Taurus', nakshatra: 'Rohini' },
    jupiter: { sign: 'Scorpio', nakshatra: 'Anuradha' },
    saturn: { sign: 'Leo', nakshatra: 'Purva Phalguni' },
    rahu: { sign: 'Pisces', nakshatra: 'Revati' },
    ketu: { sign: 'Virgo', nakshatra: 'Hasta' }
  };

  console.log('\nExpected Positions (from professional astrologer):');
  Object.entries(expectedPositions).forEach(([planet, pos]) => {
    console.log(`${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${pos.sign} (${pos.nakshatra})`);
  });

  console.log('\n🔮 Generating Kundali using Astrology API...\n');

  // Create birth date
  const birthDate = new Date(aayushBirth.year, aayushBirth.month - 1, aayushBirth.day, aayushBirth.hour, aayushBirth.minute);

  // Use coordinates for Ajmer, Rajasthan, India (where Aayush was born)
  const ajmerLatitude = 26.45;
  const ajmerLongitude = 74.64;

  try {
    // Use our vedicAstrology.ts to calculate positions
    const birthData = {
      year: aayushBirth.year,
      month: aayushBirth.month,
      day: aayushBirth.day,
      hour: aayushBirth.hour,
      minute: aayushBirth.minute,
      second: 0,
      latitude: ajmerLatitude,
      longitude: ajmerLongitude,
      timezone: aayushBirth.timezone
    };

    const vedicChart = await vedicAstrology.calculateVedicChart(birthData);

    console.log('Astronomical data calculated successfully');

    // Create kundali data structure from vedic chart data
    const kundaliData = {
      sunSign: vedicChart.planets.find(p => p.name === 'Sun')?.sign || 'Unknown',
      moonSign: vedicChart.planets.find(p => p.name === 'Moon')?.sign || 'Unknown',
      ascendant: vedicChart.ascendant.sign,
      planets: vedicChart.planets.map(planet => ({
        name: planet.name,
        sign: planet.sign,
        nakshatra: planet.nakshatra
      })),
      nakshatras: {
        ascendant: { name: vedicChart.ascendant.nakshatra }
      }
    };

    console.log('Kundali Generated Successfully!');
    console.log('Sun Sign:', kundaliData.sunSign);
    console.log('Moon Sign:', kundaliData.moonSign);
    console.log('Ascendant:', kundaliData.ascendant);

    console.log('\nCalculated Planetary Positions:');
    const calculatedPositions = {};

    // Map planets to our expected format
    kundaliData.planets.forEach(planet => {
      const planetName = planet.name.toLowerCase();
      calculatedPositions[planetName] = {
        sign: planet.sign,
        nakshatra: planet.nakshatra
      };
      console.log(`${planet.name}: ${planet.sign} (${planet.nakshatra})`);
    });

    // Add ascendant
    calculatedPositions.ascendant = {
      sign: kundaliData.ascendant,
      nakshatra: kundaliData.nakshatras.ascendant.name
    };
    console.log(`Ascendant: ${kundaliData.ascendant} (${kundaliData.nakshatras.ascendant.name})`);

    console.log('\n🎯 Accuracy Comparison:\n');

    let totalMatches = 0;
    let totalChecks = 0;

    Object.entries(expectedPositions).forEach(([planet, expected]) => {
      totalChecks++;
      const calculated = calculatedPositions[planet];
      if (!calculated) {
        console.log(`${planet.charAt(0).toUpperCase() + planet.slice(1)}: NOT FOUND IN CALCULATIONS`);
        return;
      }

      const signMatch = calculated.sign === expected.sign;
      const nakshatraMatch = calculated.nakshatra === expected.nakshatra;

      console.log(`${planet.charAt(0).toUpperCase() + planet.slice(1)}:`);
      console.log(`  Expected: ${expected.sign} (${expected.nakshatra})`);
      console.log(`  Calculated: ${calculated.sign} (${calculated.nakshatra})`);
      console.log(`  Sign Match: ${signMatch ? '✅' : '❌'}`);
      console.log(`  Nakshatra Match: ${nakshatraMatch ? '✅' : '❌'}`);

      if (signMatch && nakshatraMatch) totalMatches++;

      console.log('');
    });

    const accuracy = (totalMatches / totalChecks) * 100;
    console.log(`🎯 Overall Accuracy: ${totalMatches}/${totalChecks} (${accuracy.toFixed(1)}%)`);

    if (accuracy >= 80) {
      console.log('✅ HIGH ACCURACY: Kundali calculations are reliable!');
    } else if (accuracy >= 60) {
      console.log('⚠️ MODERATE ACCURACY: Some positions need verification');
    } else {
      console.log('❌ LOW ACCURACY: Major corrections needed');
    }

    // Additional verification for Aayush specifically
    if (aayushBirth.name.toLowerCase() === 'aayush sharma') {
      console.log('\n🔍 Special Verification for Aayush Sharma:');
      console.log('Expected Sun Sign: Scorpio');
      console.log('Calculated Sun Sign:', kundaliData.sunSign);
      console.log('Sun Sign Match:', kundaliData.sunSign === 'Scorpio' ? '✅' : '❌');

      console.log('Expected Moon Sign: Gemini');
      console.log('Calculated Moon Sign:', kundaliData.moonSign);
      console.log('Moon Sign Match:', kundaliData.moonSign === 'Gemini' ? '✅' : '❌');

      console.log('Expected Ascendant: Sagittarius');
      console.log('Calculated Ascendant:', kundaliData.ascendant);
      console.log('Ascendant Match:', kundaliData.ascendant === 'Sagittarius' ? '✅' : '❌');
    }

  } catch (error) {
    console.error('❌ Error generating kundali:', error);
    console.log('❌ LOW ACCURACY: Kundali generation failed');
  }
}

testAyanamsaAccuracy().then(() => {
  console.log('\n' + '='.repeat(50));
  console.log('Now running original test with default ayanamsa...');
  console.log('='.repeat(50) + '\n');
  return runTest();
}).catch(console.error);
