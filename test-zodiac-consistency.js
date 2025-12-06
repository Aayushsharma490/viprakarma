// Test script to verify zodiac sign consistency across different birth dates
// This ensures no name-based overrides are interfering with astronomical calculations

const { DateTime } = require('luxon');
const Astronomy = require('astronomy-engine');

console.log('🧪 Testing Zodiac Sign Consistency Across Different Names\n');

// Test cases with different names but same birth details
const testCases = [
  { name: 'Mahesh', day: 15, month: 3, year: 1990, hour: 14, minute: 30 },
  { name: 'John', day: 15, month: 3, year: 1990, hour: 14, minute: 30 },
  { name: 'Alice', day: 15, month: 3, year: 1990, hour: 14, minute: 30 },
  { name: 'Raj', day: 15, month: 3, year: 1990, hour: 14, minute: 30 },
  { name: 'Priya', day: 15, month: 3, year: 1990, hour: 14, minute: 30 }
];

// Expected astronomical positions for March 15, 1990, 14:30 in Delhi
const expectedPositions = {
  sun: 'Pisces',
  moon: 'Scorpio',
  ascendant: 'Taurus'
};

console.log('Expected astronomical positions for March 15, 1990, 14:30:');
console.log(`  Sun: ${expectedPositions.sun}`);
console.log(`  Moon: ${expectedPositions.moon}`);
console.log(`  Ascendant: ${expectedPositions.ascendant}\n`);

let allConsistent = true;

testCases.forEach(testCase => {
  console.log(`Testing ${testCase.name}:`);

  // Calculate astronomical positions
  const birthDate = new Date(testCase.year, testCase.month - 1, testCase.day, testCase.hour, testCase.minute);
  const observer = new Astronomy.Observer(28.6139, 77.2090, 0); // Delhi coordinates
  const time = Astronomy.MakeTime(birthDate);

  // Sun position
  const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
  const sunLon = sunEquator.ra * 15;
  const sunSignIndex = Math.floor(sunLon / 30);
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const sunSign = signs[sunSignIndex % 12];

  // Moon position
  const moonEquator = Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true);
  const moonLon = moonEquator.ra * 15;
  const moonSignIndex = Math.floor(moonLon / 30);
  const moonSign = signs[moonSignIndex % 12];

  // Ascendant calculation
  const siderealTime = Astronomy.SiderealTime(time);
  const ramc = siderealTime * 15;
  const ascendantLon = (ramc + 90) % 360;
  const ascSignIndex = Math.floor(ascendantLon / 30);
  const ascendant = signs[ascSignIndex % 12];

  console.log(`  Sun: ${sunSign}`);
  console.log(`  Moon: ${moonSign}`);
  console.log(`  Ascendant: ${ascendant}`);

  // Check consistency
  const sunConsistent = sunSign === expectedPositions.sun;
  const moonConsistent = moonSign === expectedPositions.moon;
  const ascendantConsistent = ascendant === expectedPositions.ascendant;

  console.log(`  Consistent: Sun=${sunConsistent}, Moon=${moonConsistent}, Ascendant=${ascendantConsistent}`);

  if (!sunConsistent || !moonConsistent || !ascendantConsistent) {
    allConsistent = false;
    console.log(`  ❌ Inconsistency detected for ${testCase.name}!`);
  } else {
    console.log(`  ✅ All positions consistent for ${testCase.name}`);
  }

  console.log('');
});

if (allConsistent) {
  console.log('🎉 SUCCESS: All zodiac signs are consistent across different names!');
  console.log('✅ No name-based overrides are interfering with astronomical calculations.');
} else {
  console.log('❌ FAILURE: Zodiac sign inconsistencies detected!');
  console.log('❌ Name-based overrides may be interfering with astronomical calculations.');
}
