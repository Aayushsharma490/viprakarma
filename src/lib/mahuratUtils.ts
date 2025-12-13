// Mahurat calculation utilities using astro-engine
// Integrates with Swiss Ephemeris via astro-engine microservice

export interface MahuratResult {
    date: string;
    time: string;
    nakshatra: string;
    tithi: string;
    yoga: string;
    karana: string;
    auspiciousness: 'Highly Auspicious' | 'Auspicious' | 'Moderate' | 'Inauspicious';
    recommendation: string;
    details: string;
}

const ASTRO_ENGINE_URL = process.env.NEXT_PUBLIC_ASTRO_ENGINE_URL || 'https://astro-engine-c5xk.onrender.com';

// Auspicious nakshatras for different purposes
const auspiciousNakshatras = ['Rohini', 'Pushya', 'Hasta', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati', 'Ashwini', 'Mrigashira', 'Punarvasu', 'Swati'];

// Auspicious tithis
const auspiciousTithis = ['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi'];

// Auspicious yogas
const auspiciousYogas = ['Siddhi', 'Saubhagya', 'Shobhana', 'Ayushman', 'Dhruva', 'Harshana', 'Vajra', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma'];

// Tithi names
const tithiNames = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
    'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
    'Trayodashi', 'Chaturdashi', 'Purnima'
];

// Yoga names
const yogaNames = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
    'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
    'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
    'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
    'Brahma', 'Indra', 'Vaidhriti'
];

// Karana names
const karanaNames = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];

async function getPanchangData(date: Date, location: { lat: number; lon: number }) {
    try {
        const response = await fetch(`${ASTRO_ENGINE_URL}/kundali`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                hour: date.getHours(),
                minute: date.getMinutes(),
                second: 0,
                latitude: location.lat,
                longitude: location.lon,
                timezone: 5.5, // IST
                city: 'Location'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch panchang data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching panchang data:', error);
        return null;
    }
}

function calculateTithi(moonLongitude: number, sunLongitude: number): string {
    // Tithi is based on the angular difference between Moon and Sun
    let diff = moonLongitude - sunLongitude;
    if (diff < 0) diff += 360;

    const tithiIndex = Math.floor(diff / 12); // Each tithi is 12 degrees
    return tithiNames[Math.min(tithiIndex, 14)];
}

function calculateYoga(moonLongitude: number, sunLongitude: number): string {
    // Yoga is based on the sum of Moon and Sun longitudes
    const sum = (moonLongitude + sunLongitude) % 360;
    const yogaIndex = Math.floor(sum / 13.333333); // Each yoga is 13°20'
    return yogaNames[Math.min(yogaIndex, 26)];
}

function calculateKarana(moonLongitude: number, sunLongitude: number): string {
    // Karana is half of Tithi
    let diff = moonLongitude - sunLongitude;
    if (diff < 0) diff += 360;

    const karanaIndex = Math.floor(diff / 6) % 11; // Each karana is 6 degrees
    return karanaNames[karanaIndex];
}

function getRecommendation(auspiciousness: string, purpose: string): string {
    if (auspiciousness === 'Highly Auspicious') {
        return `Excellent time for ${purpose}. All planetary positions are favorable.`;
    } else if (auspiciousness === 'Auspicious') {
        return `Good time for ${purpose}. Most planetary positions are favorable.`;
    } else if (auspiciousness === 'Moderate') {
        return `Acceptable time for ${purpose}. Consider consulting an astrologer for personalized advice.`;
    } else {
        return `Not recommended for ${purpose}. Consider choosing a different time.`;
    }
}

export async function calculateMahurat(
    purpose: string,
    startDate: Date,
    endDate: Date,
    location: { lat: number; lon: number },
    rashi?: string // Optional Rashi for filtering
): Promise<MahuratResult[]> {
    const results: MahuratResult[] = [];
    const currentDate = new Date(startDate);

    // Rashi to Nakshatra mapping for compatibility
    const rashiNakshatras: Record<string, string[]> = {
        'aries': ['Ashwini', 'Bharani', 'Krittika'],
        'taurus': ['Krittika', 'Rohini', 'Mrigashira'],
        'gemini': ['Mrigashira', 'Ardra', 'Punarvasu'],
        'cancer': ['Punarvasu', 'Pushya', 'Ashlesha'],
        'leo': ['Magha', 'Purva Phalguni', 'Uttara Phalguni'],
        'virgo': ['Uttara Phalguni', 'Hasta', 'Chitra'],
        'libra': ['Chitra', 'Swati', 'Vishakha'],
        'scorpio': ['Vishakha', 'Anuradha', 'Jyeshtha'],
        'sagittarius': ['Mula', 'Purva Ashadha', 'Uttara Ashadha'],
        'capricorn': ['Uttara Ashadha', 'Shravana', 'Dhanishta'],
        'aquarius': ['Dhanishta', 'Shatabhisha', 'Purva Bhadrapada'],
        'pisces': ['Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati']
    };

    // Generate mahurats for each day in the range
    while (currentDate <= endDate) {
        // Check multiple times per day (morning, afternoon, evening)
        // Check multiple time slots for ranges
        const timesToCheck = [
            { hour: 6, minute: 0, label: "06:00 AM to 08:00 AM" },
            { hour: 8, minute: 30, label: "08:30 AM to 10:30 AM" },
            { hour: 11, minute: 0, label: "11:00 AM to 01:00 PM" },
            { hour: 14, minute: 0, label: "02:00 PM to 04:00 PM" },
            { hour: 17, minute: 0, label: "05:00 PM to 07:00 PM" },
            { hour: 19, minute: 30, label: "07:30 PM to 09:30 PM" }
        ];

        for (const timeSlot of timesToCheck) {
            const checkDate = new Date(currentDate);
            checkDate.setHours(timeSlot.hour, timeSlot.minute, 0, 0);

            // Get panchang data from astro-engine
            const panchangData = await getPanchangData(checkDate, location);

            if (panchangData && panchangData.planets) {
                const moon = panchangData.planets.find((p: any) => p.name === 'Moon');
                const sun = panchangData.planets.find((p: any) => p.name === 'Sun');

                if (moon && sun) {
                    const nakshatra = moon.nakshatra.name;
                    const tithi = calculateTithi(moon.longitude, sun.longitude);
                    const yoga = calculateYoga(moon.longitude, sun.longitude);
                    const karana = calculateKarana(moon.longitude, sun.longitude);

                    // Check Rashi compatibility if provided
                    let rashiCompatible = true;
                    if (rashi && rashiNakshatras[rashi]) {
                        // Boost score if Nakshatra is in user's Rashi
                        rashiCompatible = rashiNakshatras[rashi].includes(nakshatra);
                    }

                    const auspiciousness = calculateAuspiciousness(nakshatra, tithi, yoga, rashiCompatible);

                    results.push({
                        date: currentDate.toISOString().split('T')[0],
                        time: timeSlot.label, // Use range label
                        nakshatra,
                        tithi,
                        yoga,
                        karana,
                        auspiciousness,
                        recommendation: getRecommendation(auspiciousness, purpose),
                        details: `Nakshatra: ${nakshatra} (Pada ${moon.nakshatra.pada}) | Tithi: ${tithi} | Yoga: ${yoga} | Karana: ${karana}`
                    });
                }
            }
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sort by auspiciousness
    const auspiciousnessOrder = {
        'Highly Auspicious': 0,
        'Auspicious': 1,
        'Moderate': 2,
        'Inauspicious': 3
    };

    return results
        .sort((a, b) => auspiciousnessOrder[a.auspiciousness] - auspiciousnessOrder[b.auspiciousness])
        .slice(0, 10); // Return top 10 mahurats
}

function calculateAuspiciousness(nakshatra: string, tithi: string, yoga: string, rashiCompatible: boolean = true): 'Highly Auspicious' | 'Auspicious' | 'Moderate' | 'Inauspicious' {
    const nakshatraScore = auspiciousNakshatras.includes(nakshatra) ? 1 : 0;
    const tithiScore = auspiciousTithis.includes(tithi) ? 1 : 0;
    const yogaScore = auspiciousYogas.includes(yoga) ? 1 : 0;
    const rashiScore = rashiCompatible ? 1 : 0; // Bonus for Rashi compatibility

    const totalScore = nakshatraScore + tithiScore + yogaScore + rashiScore;

    if (totalScore >= 4) return 'Highly Auspicious';
    if (totalScore === 3) return 'Auspicious';
    if (totalScore >= 1) return 'Moderate';
    return 'Inauspicious';
}
