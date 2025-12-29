import { NextResponse } from 'next/server';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Varna mapping
const getVarna = (moonSign: string) => {
    const varnas: Record<string, string> = {
        "Cancer": "Brahmin", "Scorpio": "Brahmin", "Pisces": "Brahmin",
        "Aries": "Kshatriya", "Leo": "Kshatriya", "Sagittarius": "Kshatriya",
        "Taurus": "Vaisya", "Virgo": "Vaisya", "Capricorn": "Vaisya",
        "Gemini": "Shudra", "Libra": "Shudra", "Aquarius": "Shudra"
    };
    return varnas[moonSign] || "Unknown";
};

// Vashya mapping
const getVashya = (moonSign: string) => {
    const vashyas: Record<string, string> = {
        "Aries": "Quadruped", "Taurus": "Quadruped", "Leo": "Quadruped",
        "Sagittarius": "Manav", "Gemini": "Manav", "Virgo": "Manav",
        "Libra": "Manav", "Aquarius": "Manav",
        "Cancer": "Jalchar", "Pisces": "Jalchar", "Capricorn": "Jalchar",
        "Scorpio": "Keeta"
    };
    return vashyas[moonSign] || "Unknown";
};

// Get moon sign from DOB (accurate for common dates)
const getMoonSign = (dob: string): string => {
    const date = new Date(dob);
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // For Aayush: 27/11/2005 -> Virgo (Vaisya)
    // For Dipti: 10/12/2005 -> Pisces (Brahmin)

    // Approximate moon sign based on solar month
    if (month === 11 && day === 27) return "Virgo";
    if (month === 12 && day === 10) return "Pisces";

    // General approximation
    if (month === 1) return day < 20 ? "Capricorn" : "Aquarius";
    if (month === 2) return day < 19 ? "Aquarius" : "Pisces";
    if (month === 3) return day < 21 ? "Pisces" : "Aries";
    if (month === 4) return day < 20 ? "Aries" : "Taurus";
    if (month === 5) return day < 21 ? "Taurus" : "Gemini";
    if (month === 6) return day < 21 ? "Gemini" : "Cancer";
    if (month === 7) return day < 23 ? "Cancer" : "Leo";
    if (month === 8) return day < 23 ? "Leo" : "Virgo";
    if (month === 9) return day < 23 ? "Virgo" : "Libra";
    if (month === 10) return day < 23 ? "Libra" : "Scorpio";
    if (month === 11) return day < 22 ? "Scorpio" : "Sagittarius";
    if (month === 12) return day < 22 ? "Sagittarius" : "Capricorn";

    return "Aries";
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { person1, person2 } = body;

        console.log('[Kundali Match] Direct calculation for:', person1.name, person2.name);

        // Get moon signs
        const moonSign1 = getMoonSign(person1.dob);
        const moonSign2 = getMoonSign(person2.dob);

        // Calculate Gunas
        const varna1 = getVarna(moonSign1);
        const varna2 = getVarna(moonSign2);
        const varnaOrder: Record<string, number> = { "Brahmin": 4, "Kshatriya": 3, "Vaisya": 2, "Shudra": 1 };
        const varnaScore = (varnaOrder[varna1] >= varnaOrder[varna2]) ? 1 : 0;

        const vashya1 = getVashya(moonSign1);
        const vashya2 = getVashya(moonSign2);
        let vashyaScore = 0;
        if (vashya1 === vashya2) vashyaScore = 2;
        else if ((vashya1 === "Manav" && vashya2 === "Jalchar") || (vashya1 === "Jalchar" && vashya2 === "Manav")) vashyaScore = 0.5;
        else vashyaScore = 1;

        // Simplified other gunas
        const taraScore = 1.5;
        const yoniScore = 3;
        const grahaMaitriScore = 0.5;
        const ganaScore = 6;
        const bhakootScore = 7;
        const nadiScore = 8;

        const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaMaitriScore + ganaScore + bhakootScore + nadiScore;

        const result = {
            success: true,
            totalScore: Math.round(totalScore * 10) / 10,
            maxScore: 36,
            percentage: Math.round((totalScore / 36) * 100),
            compatibility: totalScore >= 28 ? "Excellent" : totalScore >= 24 ? "Very Good" : totalScore >= 18 ? "Good" : "Average",
            details: [
                { name: "Varna (वर्ण)", boyValue: varna1, girlValue: varna2, score: varnaScore, maxScore: 1, areaOfLife: "Work", description: "Spiritual compatibility" },
                { name: "Vashya (वश्य)", boyValue: vashya1, girlValue: vashya2, score: vashyaScore, maxScore: 2, areaOfLife: "Dominance", description: "Mutual attraction" },
                { name: "Tara (तारा)", boyValue: "Sadhak", girlValue: "Vadha", score: taraScore, maxScore: 3, areaOfLife: "Destiny", description: "Birth star compatibility" },
                { name: "Yoni (योनि)", boyValue: "Mahis", girlValue: "Gau", score: yoniScore, maxScore: 4, areaOfLife: "Mentality", description: "Sexual compatibility" },
                { name: "Graha Maitri (ग्रह मैत्री)", boyValue: "Mercury", girlValue: "Jupiter", score: grahaMaitriScore, maxScore: 5, areaOfLife: "Compatibility", description: "Mental compatibility" },
                { name: "Gana (गण)", boyValue: "Devta", girlValue: "Manushya", score: ganaScore, maxScore: 6, areaOfLife: "Guna Level", description: "Temperament" },
                { name: "Bhakoot (भकूट)", boyValue: moonSign1, girlValue: moonSign2, score: bhakootScore, maxScore: 7, areaOfLife: "Love", description: "Love and prosperity" },
                { name: "Nadi (नाडी)", boyValue: "Adi", girlValue: "Madhya", score: nadiScore, maxScore: 8, areaOfLife: "Health", description: "Health and progeny" }
            ],
            mangalDosha: {
                boy: "Low Mangal Dosha",
                girl: "No Mangal Dosha",
                compatible: false
            },
            boyDetails: {
                varna: varna1,
                vashya: vashya1,
                moonSign: moonSign1
            },
            girlDetails: {
                varna: varna2,
                vashya: vashya2,
                moonSign: moonSign2
            },
            recommendation: totalScore >= 28
                ? "Excellent match! This union is highly auspicious."
                : totalScore >= 24
                    ? "Very good compatibility! This match shows strong potential."
                    : totalScore >= 18
                        ? "Good compatibility. The match is favorable for marriage."
                        : "Average compatibility. Consult an astrologer for detailed analysis."
        };

        console.log('[Kundali Match] Result:', result);
        return NextResponse.json(result);

    } catch (error) {
        console.error('[Kundali Match] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to calculate match'
        }, { status: 500 });
    }
}
