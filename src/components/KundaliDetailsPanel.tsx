'use client';

import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface KundaliDetailsPanelProps {
    enhancedDetails: any;
    moonSign: string;
    ascendant: any;
}

export default function KundaliDetailsPanel({ enhancedDetails, moonSign, ascendant }: KundaliDetailsPanelProps) {
    const { language } = useLanguage();

    // Translation mappings
    const translations: Record<string, string> = {
        // Zodiac Signs
        'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
        'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
        'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन',
        // Nakshatras
        'Ashwini': 'अश्विनी', 'Bharani': 'भरणी', 'Krittika': 'कृत्तिका', 'Rohini': 'रोहिणी',
        'Mrigashira': 'मृगशिरा', 'Ardra': 'आर्द्रा', 'Punarvasu': 'पुनर्वसु', 'Pushya': 'पुष्य',
        'Ashlesha': 'आश्लेषा', 'Magha': 'मघा', 'Purva Phalguni': 'पूर्वा फाल्गुनी', 'Uttara Phalguni': 'उत्तरा फाल्गुनी',
        'Hasta': 'हस्त', 'Chitra': 'चित्रा', 'Swati': 'स्वाति', 'Vishakha': 'विशाखा',
        'Anuradha': 'अनुराधा', 'Jyeshtha': 'ज्येष्ठा', 'Mula': 'मूल', 'Purva Ashadha': 'पूर्वाषाढ़ा',
        'Uttara Ashadha': 'उत्तराषाढ़ा', 'Shravana': 'श्रवण', 'Dhanishta': 'धनिष्ठा', 'Shatabhisha': 'शतभिषा',
        'Purva Bhadrapada': 'पूर्वा भाद्रपद', 'Uttara Bhadrapada': 'उत्तरा भाद्रपद', 'Revati': 'रेवती',
        // Days
        'Sunday': 'रविवार', 'Monday': 'सोमवार', 'Tuesday': 'मंगलवार', 'Wednesday': 'बुधवार',
        'Thursday': 'गुरुवार', 'Friday': 'शुक्रवार', 'Saturday': 'शनिवार',
        // Gana
        'Deva': 'देव', 'Devta': 'देव', 'Manushya': 'मनुष्य', 'Manav': 'मनुष्य', 'Rakshasa': 'राक्षस',
        // Nadi
        'Adi': 'आदि', 'Madhya': 'मध्य', 'Antya': 'अंत्य',
        // Varna
        'Brahmin': 'ब्राह्मण', 'Kshatriya': 'क्षत्रिय', 'Vaishya': 'वैश्य', 'Shudra': 'शूद्र',
        // Yoni
        'Horse': 'घोड़ा', 'Elephant': 'हाथी', 'Sheep': 'भेड़', 'Snake': 'सर्प',
        'Dog': 'कुत्ता', 'Cat': 'बिल्ली', 'Rat': 'चूहा', 'Cow': 'गाय',
        'Buffalo': 'भैंस', 'Tiger': 'बाघ', 'Deer': 'हिरण', 'Monkey': 'बंदर',
        'Lion': 'सिंह', 'Mongoose': 'नेवला',
        // Paya
        'Gold': 'स्वर्ण', 'Silver': 'रजत', 'Copper': 'ताम्र', 'Iron': 'लोहा',
        // Planets
        'Sun': 'सूर्य', 'Moon': 'चंद्र', 'Mars': 'मंगल', 'Mercury': 'बुध',
        'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि', 'Rahu': 'राहु', 'Ketu': 'केतु',
        // Masa
        'Chaitra': 'चैत्र', 'Vaishakha': 'वैशाख', 'Jyeshtha': 'ज्येष्ठ', 'Ashadha': 'आषाढ़',
        'Shravana': 'श्रावण', 'Bhadrapada': 'भाद्रपद', 'Ashwin': 'आश्विन', 'Kartik': 'कार्तिक',
        'Margashirsha': 'मार्गशीर्ष', 'Pausha': 'पौष', 'Magha': 'माघ', 'Phalguna': 'फाल्गुन',
        // Paksha
        'Shukla': 'शुक्ल', 'Krishna': 'कृष्ण',
        // Tithi
        'Pratipada': 'प्रतिपदा', 'Dwitiya': 'द्वितीया', 'Tritiya': 'तृतीया', 'Chaturthi': 'चतुर्थी',
        'Panchami': 'पंचमी', 'Shashthi': 'षष्ठी', 'Saptami': 'सप्तमी', 'Ashtami': 'अष्टमी',
        'Navami': 'नवमी', 'Dashami': 'दशमी', 'Ekadashi': 'एकादशी', 'Dwadashi': 'द्वादशी',
        'Trayodashi': 'त्रयोदशी', 'Chaturdashi': 'चतुर्दशी', 'Purnima': 'पूर्णिमा', 'Amavasya': 'अमावस्या',
        // Yoga
        'Vishkambha': 'विष्कम्भ', 'Priti': 'प्रीति', 'Ayushman': 'आयुष्मान', 'Saubhagya': 'सौभाग्य',
        'Shobhana': 'शोभन', 'Atiganda': 'अतिगण्ड', 'Sukarma': 'सुकर्म', 'Dhriti': 'धृति',
        'Shula': 'शूल', 'Ganda': 'गण्ड', 'Vriddhi': 'वृद्धि', 'Dhruva': 'ध्रुव',
        'Vyaghata': 'व्याघात', 'Harshana': 'हर्षण', 'Vajra': 'वज्र', 'Siddhi': 'सिद्धि',
        'Vyatipata': 'व्यतीपात', 'Variyan': 'वरीयान', 'Parigha': 'परिघ', 'Shiva': 'शिव',
        'Siddha': 'सिद्ध', 'Sadhya': 'साध्य', 'Shubha': 'शुभ', 'Brahma': 'ब्रह्म', 'Indra': 'इंद्र', 'Vaidhriti': 'वैधृति',
        // Karana
        'Bava': 'बव', 'Balava': 'बालव', 'Kaulava': 'कौलव', 'Taitila': 'तैतिल',
        'Gara': 'गर', 'Vanija': 'वणिज', 'Vishti': 'विष्टि', 'Shakuni': 'शकुनि',
        'Chatushpada': 'चतुष्पद', 'Naga': 'नाग', 'Kimstughna': 'किंस्तुघ्न'
    };

    const translate = (value: string | undefined): string => {
        if (!value || value === 'N/A') return value || 'N/A';
        if (language === 'en') return value;
        return translations[value] || value;
    };

    if (!enhancedDetails) return null;

    const detailsData = [
        {
            label: language === 'en' ? 'Rashi (Moon Sign)' : 'राशि (चंद्र राशि)',
            value: translate(moonSign)
        },
        {
            label: language === 'en' ? 'Namakshar (Name Initial)' : 'नामाक्षर',
            value: enhancedDetails.namakshar || 'N/A'
        },
        {
            label: language === 'en' ? 'Lagna (Ascendant)' : 'लग्न',
            value: `${translate(ascendant.sign)} (${ascendant.degree.toFixed(2)}°)`
        },
        {
            label: language === 'en' ? 'Vikram Samvat' : 'विक्रम संवत',
            value: enhancedDetails.vikramSamvat
        },
        {
            label: language === 'en' ? 'Masa (Month)' : 'मास',
            value: translate(enhancedDetails.masa)
        },
        {
            label: language === 'en' ? 'Paksha (Fortnight)' : 'पक्ष',
            value: translate(enhancedDetails.paksha)
        },
        {
            label: language === 'en' ? 'Tithi (Lunar Day)' : 'तिथि',
            value: enhancedDetails.tithi ? `${translate(enhancedDetails.tithi.name)} (${enhancedDetails.tithi.number})` : 'N/A'
        },
        {
            label: language === 'en' ? 'Day (Var)' : 'दिन (वार)',
            value: translate(enhancedDetails.dayOfWeek)
        },
        {
            label: language === 'en' ? 'Nakshatra' : 'नक्षत्र',
            value: translate(ascendant.nakshatra?.name)
        },
        {
            label: language === 'en' ? 'Pada (Quarter)' : 'पद',
            value: ascendant.nakshatra?.pada || 'N/A'
        },
        {
            label: language === 'en' ? 'Mangal Dosha' : 'मंगल दोष',
            value: enhancedDetails.mangalDosha === 'Yes'
                ? (language === 'en' ? 'Yes' : 'हाँ')
                : (language === 'en' ? 'No' : 'नहीं'),
            highlight: enhancedDetails.mangalDosha === 'Yes'
        },
        {
            label: language === 'en' ? 'Yoga' : 'योग',
            value: translate(enhancedDetails.yoga)
        },
        {
            label: language === 'en' ? 'Karana' : 'करण',
            value: translate(enhancedDetails.karana)
        },
        {
            label: language === 'en' ? 'Rashi Swami (Sign Lord)' : 'राशि स्वामी',
            value: translate(enhancedDetails.rashiSwami)
        },
        {
            label: language === 'en' ? 'Nakshatra Swami (Star Lord)' : 'नक्षत्र स्वामी',
            value: translate(enhancedDetails.nakshatraSwami)
        },
        {
            label: language === 'en' ? 'Nakshatra Paya' : 'नक्षत्र पाया',
            value: translate(enhancedDetails.nakshatraPaya)
        },
        {
            label: language === 'en' ? 'Yoni' : 'योनी',
            value: translate(enhancedDetails.yoni)
        },
        {
            label: language === 'en' ? 'Gana' : 'गण',
            value: translate(enhancedDetails.gana)
        },
        {
            label: language === 'en' ? 'Nadi' : 'नाडी',
            value: translate(enhancedDetails.nadi)
        },
        {
            label: language === 'en' ? 'Varna' : 'वर्ण',
            value: translate(enhancedDetails.varna)
        },
    ];

    return (
        <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-xl border-border rounded-[2.5rem] mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6 uppercase tracking-tighter">
                {language === 'en' ? 'Kundali Details' : 'कुंडली विवरण'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {detailsData.map((item, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-2xl border ${item.highlight
                            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                            : 'bg-background/50 border-border'
                            }`}
                    >
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
                            {item.label}
                        </div>
                        <div className={`text-base font-bold ${item.highlight ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                            }`}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
