// Minimal tests for kundali helpers (accuracy vs AstroSage)
const { getRashiFromDegree, mapPlanetToHouse, createHouses } = require('./kundaliCalc');

test('getRashiFromDegree returns correct rashi', () => {
  expect(getRashiFromDegree(0)).toBe('Aries');
  expect(getRashiFromDegree(30)).toBe('Taurus');
  expect(getRashiFromDegree(359)).toBe('Pisces');
});

test('mapPlanetToHouse returns correct house', () => {
  // Lagna at 0°, planet at 30° → house 2
  expect(mapPlanetToHouse(0, 30)).toBe(2);
  // Lagna at 90°, planet at 120° → house 2
  expect(mapPlanetToHouse(90, 120)).toBe(2);
});

test('createHouses returns correct sequence', () => {
  // Lagna at 0°: houses start with Aries
  const houses = createHouses(0);
  expect(houses[0].rashi).toBe('Aries');
  expect(houses[11].rashi).toBe('Pisces');
  // Lagna at 90°: houses start with Cancer
  const houses2 = createHouses(90);
  expect(houses2[0].rashi).toBe('Cancer');
  expect(houses2[3].rashi).toBe('Libra');
});
