// Test script for dynamic kundali generation
// Note: This is a simplified test since we can't directly import TypeScript in Node.js
// We'll create a mock test that demonstrates the uniqueness logic

function seededChoice(options, seed) {
  const combinedSeed = (seed % 1000);
  const index = combinedSeed % options.length;
  return options[index];
}

function calculateUserSeed(name, day, month, year, hour, minute) {
  const nameSeed = name.toLowerCase().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return nameSeed + day + month + year + hour + minute;
}

function generateMockPrediction(name, day, month, year, hour, minute, category) {
  const userSeed = calculateUserSeed(name, day, month, year, hour, minute);
  const seedFromNumerology = (userSeed + category.charCodeAt(0)) % 1000;

  const careerOptions = ['leadership', 'business', 'teaching', 'engineering', 'arts'];
  const financeOptions = ['investments', 'trading', 'real estate', 'service income'];
  const healthOptions = ['general wellness', 'stress management', 'balanced diet'];

  switch(category) {
    case 'career':
      return `Career potential in ${seededChoice(careerOptions, seedFromNumerology)}`;
    case 'finance':
      return `Financial success through ${seededChoice(financeOptions, seedFromNumerology)}`;
    case 'health':
      return `Health focus on ${seededChoice(healthOptions, seedFromNumerology)}`;
    default:
      return 'General prediction';
  }
}

function testKundaliUniqueness() {
  console.log('🧪 Testing Kundali Dynamic Data Generation\n');

  // Test Case 1: Same birth details, different names
  console.log('Test 1: Same birth details, different names');
  const user1 = {
    name: 'Rahul Sharma',
    day: 15,
    month: 6,
    year: 1995,
    hour: 14,
    minute: 30
  };

  const user2 = {
    name: 'Priya Patel',
    day: 15,
    month: 6,
    year: 1995,
    hour: 14,
    minute: 30
  };

  const pred1_career = generateMockPrediction(user1.name, user1.day, user1.month, user1.year, user1.hour, user1.minute, 'career');
  const pred2_career = generateMockPrediction(user2.name, user2.day, user2.month, user2.year, user2.hour, user2.minute, 'career');
  const pred1_finance = generateMockPrediction(user1.name, user1.day, user1.month, user1.year, user1.hour, user1.minute, 'finance');
  const pred2_finance = generateMockPrediction(user2.name, user2.day, user2.month, user2.year, user2.hour, user2.minute, 'finance');

  console.log('✅ User 1 predictions:');
  console.log('  Career:', pred1_career);
  console.log('  Finance:', pred1_finance);

  console.log('✅ User 2 predictions:');
  console.log('  Career:', pred2_career);
  console.log('  Finance:', pred2_finance);

  const careerDifferent = pred1_career !== pred2_career;
  const financeDifferent = pred1_finance !== pred2_finance;

  console.log(`🎯 Career predictions different: ${careerDifferent}`);
  console.log(`🎯 Finance predictions different: ${financeDifferent}\n`);

  // Test Case 2: Same name, different birth times
  console.log('Test 2: Same name, different birth times');
  const user3 = {
    name: 'Amit Kumar',
    day: 10,
    month: 3,
    year: 1990,
    hour: 6,
    minute: 15
  };

  const user4 = {
    name: 'Amit Kumar',
    day: 10,
    month: 3,
    year: 1990,
    hour: 18,
    minute: 45
  };

  const pred3_finance = generateMockPrediction(user3.name, user3.day, user3.month, user3.year, user3.hour, user3.minute, 'finance');
  const pred4_finance = generateMockPrediction(user4.name, user4.day, user4.month, user4.year, user4.hour, user4.minute, 'finance');

  console.log('✅ Morning birth predictions:');
  console.log('  Finance:', pred3_finance);

  console.log('✅ Evening birth predictions:');
  console.log('  Finance:', pred4_finance);

  const financeTimeDifferent = pred3_finance !== pred4_finance;
  console.log(`🎯 Finance predictions different: ${financeTimeDifferent}\n`);

  // Test Case 3: Completely different users
  console.log('Test 3: Completely different users');
  const user5 = {
    name: 'Sneha Gupta',
    day: 22,
    month: 11,
    year: 1988,
    hour: 9,
    minute: 20
  };

  const user6 = {
    name: 'Vikram Singh',
    day: 5,
    month: 8,
    year: 1992,
    hour: 16,
    minute: 10
  };

  const pred5_health = generateMockPrediction(user5.name, user5.day, user5.month, user5.year, user5.hour, user5.minute, 'health');
  const pred6_health = generateMockPrediction(user6.name, user6.day, user6.month, user6.year, user6.hour, user6.minute, 'health');

  console.log('✅ User 5 (Female, South India):');
  console.log('  Health:', pred5_health);

  console.log('✅ User 6 (Male, East India):');
  console.log('  Health:', pred6_health);

  const healthDifferent = pred5_health !== pred6_health;
  console.log(`🎯 Health predictions different: ${healthDifferent}\n`);

  // Test Case 4: Verify seed calculation uniqueness
  console.log('Test 4: Verify seed calculation uniqueness');
  const seed1 = calculateUserSeed(user1.name, user1.day, user1.month, user1.year, user1.hour, user1.minute);
  const seed2 = calculateUserSeed(user2.name, user2.day, user2.month, user2.year, user2.hour, user2.minute);
  const seed3 = calculateUserSeed(user3.name, user3.day, user3.month, user3.year, user3.hour, user3.minute);

  console.log('✅ User seeds:');
  console.log('  Rahul Sharma:', seed1);
  console.log('  Priya Patel:', seed2);
  console.log('  Amit Kumar:', seed3);

  const seedsUnique = seed1 !== seed2 && seed1 !== seed3 && seed2 !== seed3;
  console.log(`🎯 All seeds are unique: ${seedsUnique}\n`);

  // Test Case 5: Test with user's example - Irf vs another name
  console.log('Test 5: Testing with user example - Irf vs another name');
  const userIrf = {
    name: 'Irf',
    day: 15,
    month: 6,
    year: 1995,
    hour: 14,
    minute: 30
  };

  const userAnother = {
    name: 'Another Name',
    day: 15,
    month: 6,
    year: 1995,
    hour: 14,
    minute: 30
  };

  const predIrf_career = generateMockPrediction(userIrf.name, userIrf.day, userIrf.month, userIrf.year, userIrf.hour, userIrf.minute, 'career');
  const predAnother_career = generateMockPrediction(userAnother.name, userAnother.day, userAnother.month, userAnother.year, userAnother.hour, userAnother.minute, 'career');
  const predIrf_personality = generateMockPrediction(userIrf.name, userIrf.day, userIrf.month, userIrf.year, userIrf.hour, userIrf.minute, 'personality');
  const predAnother_personality = generateMockPrediction(userAnother.name, userAnother.day, userAnother.month, userAnother.year, userAnother.hour, userAnother.minute, 'personality');

  console.log('✅ Irf predictions:');
  console.log('  Career:', predIrf_career);
  console.log('  Personality:', predIrf_personality);

  console.log('✅ Another Name predictions:');
  console.log('  Career:', predAnother_career);
  console.log('  Personality:', predAnother_personality);

  const irfCareerDifferent = predIrf_career !== predAnother_career;
  const irfPersonalityDifferent = predIrf_personality !== predAnother_personality;

  console.log(`🎯 Irf career predictions different: ${irfCareerDifferent}`);
  console.log(`🎯 Irf personality predictions different: ${irfPersonalityDifferent}\n`);

  console.log('\n🎉 Kundali testing completed!');
}

testKundaliUniqueness();
