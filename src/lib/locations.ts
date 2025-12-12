export interface IndianCity {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  // Optional: keep flexible to avoid breaking existing imports; can be filled in where needed
  timezone?: string; // e.g., 'Asia/Kolkata'
}

// Utility to deeply freeze an array of objects for runtime immutability
function freezeArrayOfObjects<T extends Record<string, any>>(
  arr: T[],
): ReadonlyArray<Readonly<T>> {
  arr.forEach(Object.freeze);
  return Object.freeze(arr);
}

// Source data (unsorted). Keep small and composable; expand as needed.
const baseCities: IndianCity[] = [
  // Metro and major cities
  { city: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { city: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
  { city: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { city: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { city: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { city: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { city: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  { city: 'Kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { city: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { city: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { city: 'Thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781 },
  { city: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185 },
  { city: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
  { city: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6692, longitude: 77.4538 },
  { city: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
  { city: 'Agra', state: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
  { city: 'Nashik', state: 'Maharashtra', latitude: 20.0112, longitude: 73.7909 },
  { city: 'Faridabad', state: 'Haryana', latitude: 28.4089, longitude: 77.3178 },
  { city: 'Meerut', state: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064 },
  { city: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
  { city: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  { city: 'Srinagar', state: 'Jammu and Kashmir', latitude: 34.0837, longitude: 74.7973 },
  { city: 'Aurangabad', state: 'Maharashtra', latitude: 19.8762, longitude: 75.3433 },
  { city: 'Dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304 },
  { city: 'Amritsar', state: 'Punjab', latitude: 31.6340, longitude: 74.8723 },
  { city: 'Allahabad', state: 'Uttar Pradesh', latitude: 25.4358, longitude: 81.8463 }, // a.k.a. Prayagraj
  { city: 'Ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096 },
  { city: 'Howrah', state: 'West Bengal', latitude: 22.5958, longitude: 88.3104 },
  { city: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  { city: 'Jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },
  { city: 'Gwalior', state: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480 },
  { city: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
  { city: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { city: 'Raipur', state: 'Chhattisgarh', latitude: 21.2514, longitude: 81.6296 },
  { city: 'Kota', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648 },
  { city: 'Guwahati', state: 'Assam', latitude: 26.1445, longitude: 91.7362 },
  { city: 'Chandigarh', state: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },
  { city: 'Udaipur', state: 'Rajasthan', latitude: 24.5854, longitude: 73.7125 },

  // Rajasthan - expanded coverage
  { city: 'Ajmer', state: 'Rajasthan', latitude: 26.4499, longitude: 74.6399 },
  { city: 'Alwar', state: 'Rajasthan', latitude: 27.5529, longitude: 76.6346 },
  { city: 'Bikaner', state: 'Rajasthan', latitude: 28.0220, longitude: 73.3119 },
  { city: 'Bharatpur', state: 'Rajasthan', latitude: 27.2173, longitude: 77.4901 },
  { city: 'Bhilwara', state: 'Rajasthan', latitude: 25.3463, longitude: 74.6364 },
  { city: 'Banswara', state: 'Rajasthan', latitude: 23.5461, longitude: 74.4349 },
  { city: 'Baran', state: 'Rajasthan', latitude: 25.1011, longitude: 76.5130 },
  { city: 'Barmer', state: 'Rajasthan', latitude: 25.7520, longitude: 71.3980 },
  { city: 'Bundi', state: 'Rajasthan', latitude: 25.4305, longitude: 75.6499 },
  { city: 'Chittorgarh', state: 'Rajasthan', latitude: 24.8887, longitude: 74.6269 },
  { city: 'Churu', state: 'Rajasthan', latitude: 28.2920, longitude: 74.9672 },
  { city: 'Dausa', state: 'Rajasthan', latitude: 26.8933, longitude: 76.3375 },
  { city: 'Dholpur', state: 'Rajasthan', latitude: 26.7025, longitude: 77.8937 },
  { city: 'Dungarpur', state: 'Rajasthan', latitude: 23.8430, longitude: 73.7147 },
  { city: 'Hanumangarh', state: 'Rajasthan', latitude: 29.5818, longitude: 74.3294 },
  { city: 'Jaisalmer', state: 'Rajasthan', latitude: 26.9157, longitude: 70.9083 },
  { city: 'Jalore', state: 'Rajasthan', latitude: 25.3513, longitude: 72.2400 },
  { city: 'Jhalawar', state: 'Rajasthan', latitude: 24.5966, longitude: 76.1656 },
  { city: 'Jhunjhunu', state: 'Rajasthan', latitude: 28.1289, longitude: 75.3995 },
  { city: 'Karauli', state: 'Rajasthan', latitude: 26.4989, longitude: 77.0270 },
  { city: 'Nagaur', state: 'Rajasthan', latitude: 27.1991, longitude: 73.7409 },
  { city: 'Pali', state: 'Rajasthan', latitude: 25.7711, longitude: 73.3234 },
  { city: 'Pratapgarh', state: 'Rajasthan', latitude: 24.0327, longitude: 74.7787 },
  { city: 'Rajsamand', state: 'Rajasthan', latitude: 25.0714, longitude: 73.8830 },
  { city: 'Sawai Madhopur', state: 'Rajasthan', latitude: 26.0237, longitude: 76.3441 },
  { city: 'Sikar', state: 'Rajasthan', latitude: 27.6094, longitude: 75.1399 },
  { city: 'Sirohi', state: 'Rajasthan', latitude: 24.8853, longitude: 72.8590 },
  { city: 'Sri Ganganagar', state: 'Rajasthan', latitude: 29.9038, longitude: 73.8772 },
  { city: 'Tonk', state: 'Rajasthan', latitude: 26.1667, longitude: 75.7833 },
  { city: 'Beawar', state: 'Rajasthan', latitude: 26.1012, longitude: 74.3203 },
];

// Stable, locale-aware sorting without in-place mutation. Then deep-freeze for safety.
const sortedFrozenCities = freezeArrayOfObjects(
  [...baseCities].sort((a, b) =>
    a.city.localeCompare(b.city, 'en-IN', { sensitivity: 'base' }),
  ),
);

// Public export, read-only at type-level and runtime
export const indianCities: ReadonlyArray<IndianCity> = sortedFrozenCities;

// --- Helper utilities to support UI/feature needs ---

export function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getCities(): ReadonlyArray<IndianCity> {
  return indianCities; // already frozen
}

export function getCitiesByState(state: string): ReadonlyArray<IndianCity> {
  const target = state.trim().toLowerCase();
  return indianCities.filter((c) => c.state.toLowerCase() === target);
}

export function searchCities(query: string): ReadonlyArray<IndianCity> {
  const q = query.trim().toLowerCase();
  if (!q) return indianCities;
  return indianCities.filter(
    (c) => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q),
  );
}

export function findCity(
  cityName: string,
  state?: string,
): IndianCity | undefined {
  const cn = cityName.trim().toLowerCase();
  const st = state?.trim().toLowerCase();
  return indianCities.find(
    (c) =>
      c.city.toLowerCase() === cn && (st ? c.state.toLowerCase() === st : true),
  );
}

// For manual location entry validation. You can use this to accept free-form input
// and still maintain a consistent shape for downstream astro calculations.
export function createManualLocation(input: {
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}): IndianCity {
  const { city, state, latitude, longitude, timezone } = input;
  if (!city || typeof city !== 'string') throw new Error('Invalid city');
  if (state && typeof state !== 'string') throw new Error('Invalid state');
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
    throw new Error('Invalid coordinates');
  if (latitude < -90 || latitude > 90) throw new Error('Latitude out of range');
  if (longitude < -180 || longitude > 180)
    throw new Error('Longitude out of range');

  return {
    city: city.trim(),
    state: state?.trim() || '—',
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    timezone,
  };
}
