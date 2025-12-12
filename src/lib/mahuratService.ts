import { calculateMahurat } from './mahuratUtils';

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

export async function generateMahurat(
    purpose: string,
    startDate: Date,
    endDate: Date,
    location: { lat: number; lon: number }
): Promise<MahuratResult[]> {
    // Use the mahurat calculation utility
    return calculateMahurat(purpose, startDate, endDate, location);
}
