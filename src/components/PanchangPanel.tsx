'use client';

import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PanchangPanelProps {
    enhancedDetails: any;
    birthDate: Date;
    location: string;
}

export default function PanchangPanel({ enhancedDetails, birthDate, location }: PanchangPanelProps) {
    const { language, t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    if (!enhancedDetails) return null;

    // Hindi translations for Panchang values
    const translateValue = (value: string | null | undefined): string => {
        if (!value) return 'N/A';
        if (language === 'en') return value;

        // Extract time if it looks like a time string (HH:MM AM/PM)
        const timeMatch = value.match(/(\d{1,2}:\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
            const timePart = timeMatch[1];
            const ampm = timeMatch[2].toUpperCase();
            return `${timePart} ${ampm === 'AM' ? 'पूर्वाहन' : 'अपराह्न'}`;
        }

        // Try to translate using context keys first
        const planetaryLordKey = `planet.Lord.${value}`;
        const payaKey = `paya.${value}`;

        const translatedLord = t(planetaryLordKey);
        if (translatedLord !== planetaryLordKey) return translatedLord;

        const translatedPaya = t(payaKey);
        if (translatedPaya !== payaKey) return translatedPaya;

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
            // Ayan
            'Uttarayana': 'उत्तरायण', 'Dakshinayana': 'दक्षिणायण',
            // Ritu
            'Vasanta': 'वसन्त', 'Grishma': 'ग्रीष्म', 'Varsha': 'वर्षा',
            'Sharad': 'शरद', 'Hemanta': 'हेमन्त', 'Shishira': 'शिशिर',
            'Hemant (Pre-winter)': 'हेमंत (शिशिर पूर्व)',
            // Signs
            'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क', 'Leo': 'सिंह', 'Virgo': 'कन्या',
            'Libra': 'तुला', 'Scorpio': 'वृश्चिक', 'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन',
            // Lords/Planets
            'Surya': 'सूर्य', 'Chandra': 'चंद्र', 'Mangal': 'मंगल', 'Budh': 'बुध', 'Guru': 'गुरु', 'Shukra': 'शुक्र', 'Shani': 'शनि', 'Rahu': 'राहु', 'Ketu': 'केतु',
            'Sun': 'सूर्य', 'Moon': 'चंद्र', 'Mars': 'मंगल', 'Mercury': 'बुध', 'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि',
            'Budha': 'बुध',
            // Yoni
            'Ashwa': 'अश्व', 'Gaja': 'गज', 'Mesha': 'मेष', 'Sarpa': 'सर्प', 'Shwan': 'श्वान', 'Marjar': 'मार्जार', 'Mushika': 'मूषिक',
            'Gau': 'गौ', 'Mahish': 'महिष', 'Vyaghra': 'व्याघ्र', 'Mriga': 'मृग', 'Vanar': 'वानर', 'Nakul': 'नकुल', 'Singha': 'सिंह',
            // Gana
            'Devta': 'देवता', 'Manushya': 'मनुष्य', 'Rakshas': 'राक्षस',
            'Deva': 'देवता', 'Rakshasa': 'राक्षस',
            // Nadi
            'Adi': 'आदि', 'Madhya': 'मध्य', 'Antya': 'अंत्य',
            // Varna
            'Brahmin': 'ब्राह्मण', 'Kshatriya': 'क्षत्रिय', 'Vaisya': 'वैश्य', 'Shudra': 'शूद्र',
            'Vaishya': 'वैश्य',
            // Paya
            'Loha': 'लोहा (Loha)', 'Rajat': 'रजत (Rajat)', 'Tamra': 'ताम्र (Tamra)', 'Suvarna': 'सुवर्ण (Suvarna)',
            'Iron': 'लोहा (Iron)', 'Silver': 'चांदी (Silver)', 'Copper': 'तांबा (Copper)', 'Gold': 'सोना (Gold)',
            'Rajat (Silver)': 'रजत (चांदी)', 'Tamra (Copper)': 'ताम्र (तांबा)', 'Swarna (Gold)': 'स्वर्ण (सोना)', 'Loha (Iron)': 'लोहा (लोहा)',
        };

        const trimmedValue = value.trim();
        return translations[trimmedValue] ||
            translations[trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1).toLowerCase()] ||
            value;
    };

    const panchangData = [
        { label: language === 'en' ? 'Rashi (Moon Sign)' : 'राशि (चंद्र राशि)', value: translateValue(enhancedDetails.moonSign || enhancedDetails.rashi || enhancedDetails.chandraRashi) },
        { label: t('panchang.rashiSwami') || 'Rashi Swami', value: translateValue(enhancedDetails.rashiSwami) },
        { label: language === 'en' ? 'Nakshatra (Charan)' : 'नक्षत्र (चरण)', value: `${translateValue(enhancedDetails.nakshatra)} (${enhancedDetails.nakshatraPada || '1'})` },
        { label: t('panchang.nakshatraSwami') || 'Nakshatra Swami', value: translateValue(enhancedDetails.nakshatraSwami) },
        { label: language === 'en' ? 'Namakshar' : 'नामाक्षर', value: enhancedDetails.namakshar || 'N/A' },
        { label: language === 'en' ? 'Lagna with Degree' : 'लग्न (डिग्री के साथ)', value: `${translateValue(enhancedDetails.lagna) || 'N/A'} (${enhancedDetails.lagnaDegree?.toFixed(2) || '0.00'}°)` },
        { label: language === 'en' ? 'Shalivahan Shake' : 'शालिवाहन शक', value: enhancedDetails.shalivahanShake || 'N/A' },
        { label: t('panchang.vikramSamvat') || 'Vikram Samvat', value: enhancedDetails.vikramSamvat || 'N/A' },
        { label: language === 'en' ? 'Masa (Month)' : 'मास', value: translateValue(enhancedDetails.masa) },
        { label: language === 'en' ? 'Paksha' : 'पक्ष', value: translateValue(enhancedDetails.paksha) },
        { label: language === 'en' ? 'Tithi (Lunar Day)' : 'तिथि', value: enhancedDetails.tithi ? `${translateValue(enhancedDetails.tithi.name || enhancedDetails.tithi)} (${enhancedDetails.tithi.number || ''})` : 'N/A' },
        { label: language === 'en' ? 'Day (Var)' : 'दिन (वार)', value: translateValue(enhancedDetails.day || enhancedDetails.dayOfWeek) },
        { label: language === 'en' ? 'Ritu (Season)' : 'ऋतु', value: translateValue(enhancedDetails.ritu) },
        { label: language === 'en' ? 'Ayan' : 'अयन', value: translateValue(enhancedDetails.ayan) },
        { label: language === 'en' ? 'Yoga' : 'योग', value: translateValue(enhancedDetails.yoga) },
        { label: language === 'en' ? 'Karana' : 'करण', value: translateValue(enhancedDetails.karana) },
        { label: language === 'en' ? 'Yoni' : 'योनी', value: translateValue(enhancedDetails.yoni) },
        { label: language === 'en' ? 'Gana' : 'गण', value: translateValue(enhancedDetails.gana) },
        { label: language === 'en' ? 'Nadi' : 'नाडी', value: translateValue(enhancedDetails.nadi) },
        { label: language === 'en' ? 'Varna' : 'वर्ण', value: translateValue(enhancedDetails.varna) },
        { label: language === 'en' ? 'Nakshatra Paya' : 'नक्षत्र पाया', value: translateValue(enhancedDetails.nakshatraPaya) },
        {
            label: language === 'en' ? 'Mangal Dosha' : 'मंगल दोष',
            value: enhancedDetails.mangalDosha === 'Yes' ? (language === 'en' ? 'Yes' : 'हाँ') : (language === 'en' ? 'No' : 'नहीं'),
            highlight: enhancedDetails.mangalDosha === 'Yes'
        },
        { label: language === 'en' ? 'Sunrise' : 'सूर्योदय', value: translateValue(enhancedDetails.sunrise) || 'N/A' },
        { label: language === 'en' ? 'Sunset' : 'सूर्यास्त', value: translateValue(enhancedDetails.sunset) || 'N/A' },
        { label: language === 'en' ? 'Ishta Kaal' : 'इष्ट काल', value: enhancedDetails.ishtaKaal || 'N/A' },
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

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 space-y-6 overflow-hidden"
                    >
                        {/* Basic Panchang Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {panchangData.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className={`p-4 rounded-2xl border bg-background/50 border-border ${item.highlight ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' : ''}`}
                                >
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
                                        {item.label}
                                    </div>
                                    <div className={`text-base font-bold ${item.highlight ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                        {item.value}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Location Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-2xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800"
                        >
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
                        </motion.div>

                        {/* Note */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">ℹ️</div>
                                <div className="text-sm text-amber-900 dark:text-amber-100">
                                    {language === 'en'
                                        ? 'Panchang calculations are based on your birth date, time, and location. For daily Panchang, please consult our Mahurat section.'
                                        : 'पंचांग गणना आपकी जन्म तिथि, समय और स्थान पर आधारित है। दैनिक पंचांग के लिए, कृपया हमारे मुहूर्त अनुभाग से परामर्श करें।'}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
