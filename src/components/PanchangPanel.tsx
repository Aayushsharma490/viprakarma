'use client';

import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PanchangPanelProps {
    enhancedDetails: any;
    birthDate: Date;
    location: string;
}

export default function PanchangPanel({ enhancedDetails, birthDate, location }: PanchangPanelProps) {
    const { language } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    if (!enhancedDetails) return null;

    // Calculate Shalivahan Shake (Vikram Samvat - 135)
    const shalivahanaShake = enhancedDetails.vikramSamvat ? enhancedDetails.vikramSamvat - 135 : null;

    // Determine Ritu (Season) based on month
    const getRitu = (month: number) => {
        if (month >= 3 && month <= 4) return language === 'en' ? 'Vasant (Spring)' : 'वसंत (Spring)';
        if (month >= 5 && month <= 6) return language === 'en' ? 'Grishma (Summer)' : 'ग्रीष्म (Summer)';
        if (month >= 7 && month <= 8) return language === 'en' ? 'Varsha (Monsoon)' : 'वर्षा (Monsoon)';
        if (month >= 9 && month <= 10) return language === 'en' ? 'Sharad (Autumn)' : 'शरद (Autumn)';
        if (month >= 11 && month <= 12) return language === 'en' ? 'Hemant (Pre-winter)' : 'हेमंत (Pre-winter)';
        return language === 'en' ? 'Shishir (Winter)' : 'शिशिर (Winter)';
    };

    // Determine Ayana based on month (simplified)
    const getAyana = (month: number) => {
        if (month >= 1 && month <= 6) {
            return language === 'en' ? 'Uttarayana (Northward)' : 'उत्तरायण (Northward)';
        }
        return language === 'en' ? 'Dakshinayana (Southward)' : 'दक्षिणायन (Southward)';
    };

    const month = birthDate.getMonth() + 1;
    const ritu = getRitu(month);
    const ayana = getAyana(month);

    // Hindi translations for Panchang values
    const translateValue = (value: string | null | undefined): string => {
        if (!value || language === 'en') return value || 'N/A';

        const translations: Record<string, string> = {
            // Masa (Months)
            'Chaitra': 'चैत्र', 'Vaishakha': 'वैशाख', 'Jyeshtha': 'ज्येष्ठ',
            'Ashadha': 'आषाढ़', 'Shravana': 'श्रावण', 'Bhadrapada': 'भाद्रपद',
            'Ashwin': 'आश्विन', 'Kartik': 'कार्तिक', 'Margashirsha': 'मार्गशीर्ष',
            'Pausha': 'पौष', 'Magha': 'माघ', 'Phalguna': 'फाल्गुन',

            // Paksha
            'Shukla': 'शुक्ल', 'Krishna': 'कृष्ण',

            // Tithi
            'Pratipada': 'प्रतिपदा', 'Dwitiya': 'द्वितीया', 'Tritiya': 'तृतीया',
            'Chaturthi': 'चतुर्थी', 'Panchami': 'पंचमी', 'Shashthi': 'षष्ठी',
            'Saptami': 'सप्तमी', 'Ashtami': 'अष्टमी', 'Navami': 'नवमी',
            'Dashami': 'दशमी', 'Ekadashi': 'एकादशी', 'Dwadashi': 'द्वादशी',
            'Trayodashi': 'त्रयोदशी', 'Chaturdashi': 'चतुर्दशी',
            'Purnima': 'पूर्णिमा', 'Amavasya': 'अमावस्या',

            // Nakshatra
            'Ashwini': 'अश्विनी', 'Bharani': 'भरणी', 'Krittika': 'कृत्तिका',
            'Rohini': 'रोहिणी', 'Mrigashira': 'मृगशिरा', 'Ardra': 'आर्द्रा',
            'Punarvasu': 'पुनर्वसु', 'Pushya': 'पुष्य', 'Ashlesha': 'आश्लेषा',
            'Purva Phalguni': 'पूर्व फाल्गुनी', 'Uttara Phalguni': 'उत्तर फाल्गुनी',
            'Hasta': 'हस्त', 'Chitra': 'चित्रा', 'Swati': 'स्वाति',
            'Vishakha': 'विशाखा', 'Anuradha': 'अनुराधा',
            'Mula': 'मूल', 'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा',
            'Dhanishta': 'धनिष्ठा', 'Shatabhisha': 'शतभिषा',
            'Purva Bhadrapada': 'पूर्वभाद्रपदा', 'Uttara Bhadrapada': 'उत्तरभाद्रपदा', 'Revati': 'रेवती',
            'Moon': 'चंद्र', 'Sun': 'सूर्य', 'Mars': 'मंगल', 'Mercury': 'बुध',
            'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि',

            // Yoga
            'Vishkambha': 'विष्कम्भ', 'Priti': 'प्रीति', 'Ayushman': 'आयुष्मान',
            'Saubhagya': 'सौभाग्य', 'Shobhana': 'शोभन', 'Atiganda': 'अतिगण्ड',
            'Sukarma': 'सुकर्मा', 'Dhriti': 'धृति', 'Shula': 'शूल',
            'Ganda': 'गण्ड', 'Vriddhi': 'वृद्धि', 'Dhruva': 'ध्रुव',
            'Vyaghata': 'व्याघात', 'Harshana': 'हर्षण', 'Vajra': 'वज्र',
            'Siddhi': 'सिद्धि', 'Vyatipata': 'व्यतीपात', 'Variyan': 'वरीयान',
            'Parigha': 'परिघ', 'Shiva': 'शिव', 'Siddha': 'सिद्ध',
            'Sadhya': 'साध्य', 'Shubha': 'शुभ',
            'Brahma': 'ब्रह्म', 'Indra': 'इन्द्र', 'Vaidhriti': 'वैधृति',

            // Karana
            'Bava': 'बव', 'Balava': 'बालव', 'Kaulava': 'कौलव',
            'Taitila': 'तैतिल', 'Garaja': 'गरज', 'Vanija': 'वणिज',
            'Vishti': 'विष्टि', 'Shakuni': 'शकुनि', 'Chatushpada': 'चतुष्पद',
            'Naga': 'नाग', 'Kimstughna': 'किंस्तुघ्न',

            // Days
            'Sunday': 'रविवार', 'Monday': 'सोमवार', 'Tuesday': 'मंगलवार',
            'Wednesday': 'बुधवार', 'Thursday': 'गुरुवार', 'Friday': 'शुक्रवार',
            'Saturday': 'शनिवार',
        };

        return translations[value] || value;
    };

    const panchangData = [
        {
            label: language === 'en' ? 'Vikram Samvat' : 'विक्रम संवत',
            value: enhancedDetails.vikramSamvat || 'N/A'
        },
        {
            label: language === 'en' ? 'Shalivahan Shake' : 'शालिवाहन शाके',
            value: shalivahanaShake || 'N/A'
        },
        {
            label: language === 'en' ? 'Masa (Month)' : 'मास',
            value: translateValue(enhancedDetails.masa)
        },
        {
            label: language === 'en' ? 'Paksha (Fortnight)' : 'पक्ष',
            value: translateValue(enhancedDetails.paksha)
        },
        {
            label: language === 'en' ? 'Tithi (Lunar Day)' : 'तिथि',
            value: enhancedDetails.tithi ? `${translateValue(enhancedDetails.tithi.name)} (${enhancedDetails.tithi.number})` : 'N/A'
        },
        {
            label: language === 'en' ? 'Nakshatra' : 'नक्षत्र',
            value: translateValue(enhancedDetails.nakshatraSwami)
        },
        {
            label: language === 'en' ? 'Yoga' : 'योग',
            value: translateValue(enhancedDetails.yoga)
        },
        {
            label: language === 'en' ? 'Karana' : 'करण',
            value: translateValue(enhancedDetails.karana)
        },
        {
            label: language === 'en' ? 'Day (Var)' : 'दिन (वार)',
            value: translateValue(enhancedDetails.dayOfWeek)
        },
        {
            label: language === 'en' ? 'Ritu (Season)' : 'ऋतू',
            value: ritu
        },
        {
            label: language === 'en' ? 'Ayana' : 'आयन',
            value: ayana
        },
        {
            label: language === 'en' ? 'Nakshatra Paya' : 'नक्षत्र पाया',
            value: enhancedDetails.nakshatraPaya || 'N/A'
        },
        {
            label: language === 'en' ? 'Rahu Kaal (Inauspicious Time)' : 'राहु काल',
            value: enhancedDetails.rahuKaal || 'N/A'
        },
        {
            label: language === 'en' ? 'Sunrise Time' : 'सूर्योदय समय',
            value: enhancedDetails.sunriseTime || 'N/A'
        },
    ];

    return (
        <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-xl border-border rounded-[2.5rem] mb-8">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tighter">
                    {language === 'en' ? 'Panchang Details' : 'पंचांग विवरण'}
                </h2>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-6 space-y-6">
                    {/* Basic Panchang Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {panchangData.map((item, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-2xl border bg-background/50 border-border"
                            >
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
                                    {item.label}
                                </div>
                                <div className="text-base font-bold text-foreground">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Location Info */}
                    <div className="p-4 rounded-2xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
                            {language === 'en' ? 'Location' : 'स्थान'}
                        </div>
                        <div className="text-base font-bold text-blue-900 dark:text-blue-100">
                            {location || 'N/A'}
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                            {language === 'en'
                                ? '* Sunrise/Sunset times are location-specific'
                                : '* सूर्योदय/सूर्यास्त समय स्थान-विशिष्ट हैं'}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="p-4 rounded-2xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">ℹ️</div>
                            <div className="text-sm text-amber-900 dark:text-amber-100">
                                {language === 'en'
                                    ? 'Panchang calculations are based on your birth date, time, and location. For daily Panchang, please consult our Mahurat section.'
                                    : 'पंचांग गणना आपकी जन्म तिथि, समय और स्थान पर आधारित है। दैनिक पंचांग के लिए, कृपया हमारे महूर्त अनुभाग से परामर्श करें।'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
