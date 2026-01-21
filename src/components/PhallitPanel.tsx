'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PhallitPanelProps {
    phallit: {
        // कुंडली फलित - Personality
        lagnaPersonality: { en: string; hi: string };
        moonEmotions: { en: string; hi: string };

        // भाव फल - 12 Houses
        bhavPhal?: {
            house1: { en: string; hi: string };
            house2: { en: string; hi: string };
            house3: { en: string; hi: string };
            house4: { en: string; hi: string };
            house5: { en: string; hi: string };
            house6: { en: string; hi: string };
            house7: { en: string; hi: string };
            house8: { en: string; hi: string };
            house9: { en: string; hi: string };
            house10: { en: string; hi: string };
            house11: { en: string; hi: string };
            house12: { en: string; hi: string };
        };

        // वर्ष फल - Yearly
        yearlyPrediction?: { en: string; hi: string };

        // महादशा फल - Mahadasha
        mahadashaPhal?: { en: string; hi: string };

        // शुभ सुझाव - Auspicious Suggestions
        auspiciousSuggestions?: {
            gemstone: { en: string; hi: string };
            colors: { en: string; hi: string };
            days: { en: string; hi: string };
            numbers: { en: string; hi: string };
        };

        // Existing fields
        education: { en: string; hi: string };
        career: { en: string; hi: string };
        wealth: { en: string; hi: string };
        relationships: { en: string; hi: string };
        health: { en: string; hi: string };
        doshasYogas: { en: string; hi: string };
        dashaPredictions: { en: string; hi: string };
        remedies: { en: string; hi: string };
    };
}

export default function PhallitPanel({ phallit }: PhallitPanelProps) {
    const { language } = useLanguage();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['career', 'dashaPredictions']));

    if (!phallit) {
        return null;
    }

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const sections = [
        // कुंडली फलित - Personality Section
        {
            id: 'personality',
            title: language === 'en' ? '🧘 Personality Analysis (Kundali Phallit)' : '🧘 कुंडली फलित - स्वभाव एवं गुण',
            icon: '✨',
            subsections: [
                { id: 'lagnaPersonality', title: language === 'en' ? 'Lagna Personality' : 'लग्न व्यक्तित्व', data: phallit.lagnaPersonality },
                { id: 'moonEmotions', title: language === 'en' ? 'Moon & Emotions' : 'चंद्र और भावनाएं', data: phallit.moonEmotions },
            ]
        },

        // भाव फल - 12 Houses
        ...(phallit.bhavPhal ? [{
            id: 'bhavPhal',
            title: language === 'en' ? '🏛️ House Predictions (Bhav Phal)' : '🏛️ भाव फल - 12 भावों का विश्लेषण',
            icon: '🏛️',
            subsections: [
                { id: 'house1', title: language === 'en' ? 'House 1: Self & Personality' : 'प्रथम भाव: स्वयं और व्यक्तित्व', data: phallit.bhavPhal.house1 },
                { id: 'house2', title: language === 'en' ? 'House 2: Wealth & Family' : 'द्वितीय भाव: धन और परिवार', data: phallit.bhavPhal.house2 },
                { id: 'house3', title: language === 'en' ? 'House 3: Siblings & Courage' : 'तृतीय भाव: भाई-बहन और साहस', data: phallit.bhavPhal.house3 },
                { id: 'house4', title: language === 'en' ? 'House 4: Mother & Home' : 'चतुर्थ भाव: माता और घर', data: phallit.bhavPhal.house4 },
                { id: 'house5', title: language === 'en' ? 'House 5: Children & Education' : 'पंचम भाव: संतान और शिक्षा', data: phallit.bhavPhal.house5 },
                { id: 'house6', title: language === 'en' ? 'House 6: Enemies & Health' : 'षष्ठ भाव: शत्रु और स्वास्थ्य', data: phallit.bhavPhal.house6 },
                { id: 'house7', title: language === 'en' ? 'House 7: Marriage & Partnership' : 'सप्तम भाव: विवाह और साझेदारी', data: phallit.bhavPhal.house7 },
                { id: 'house8', title: language === 'en' ? 'House 8: Longevity & Transformation' : 'अष्टम भाव: आयु और परिवर्तन', data: phallit.bhavPhal.house8 },
                { id: 'house9', title: language === 'en' ? 'House 9: Fortune & Father' : 'नवम भाव: भाग्य और पिता', data: phallit.bhavPhal.house9 },
                { id: 'house10', title: language === 'en' ? 'House 10: Career & Status' : 'दशम भाव: करियर और प्रतिष्ठा', data: phallit.bhavPhal.house10 },
                { id: 'house11', title: language === 'en' ? 'House 11: Gains & Friends' : 'एकादश भाव: लाभ और मित्र', data: phallit.bhavPhal.house11 },
                { id: 'house12', title: language === 'en' ? 'House 12: Losses & Spirituality' : 'द्वादश भाव: व्यय और आध्यात्मिकता', data: phallit.bhavPhal.house12 },
            ]
        }] : []),

        // वर्ष फल - Yearly Prediction
        ...(phallit.yearlyPrediction ? [{
            id: 'yearlyPrediction',
            title: language === 'en' ? '📅 Yearly Prediction (Varsh Phal)' : '📅 वर्ष फल - वार्षिक भविष्यवाणी',
            icon: '📅',
            data: phallit.yearlyPrediction
        }] : []),

        // महादशा फल - Mahadasha
        ...(phallit.mahadashaPhal ? [{
            id: 'mahadashaPhal',
            title: language === 'en' ? '⏳ Mahadasha Prediction' : '⏳ महादशा फल',
            icon: '⏳',
            data: phallit.mahadashaPhal
        }] : []),

        // शुभ सुझाव - Auspicious Suggestions
        ...(phallit.auspiciousSuggestions ? [{
            id: 'auspiciousSuggestions',
            title: language === 'en' ? '💎 Auspicious Suggestions (Shubh Sujhav)' : '💎 शुभ सुझाव',
            icon: '💎',
            subsections: [
                { id: 'gemstone', title: language === 'en' ? 'Lucky Gemstone' : 'शुभ रत्न', data: phallit.auspiciousSuggestions.gemstone },
                { id: 'colors', title: language === 'en' ? 'Favorable Colors' : 'अनुकूल रंग', data: phallit.auspiciousSuggestions.colors },
                { id: 'days', title: language === 'en' ? 'Auspicious Days' : 'शुभ दिन', data: phallit.auspiciousSuggestions.days },
                { id: 'numbers', title: language === 'en' ? 'Lucky Numbers' : 'शुभ अंक', data: phallit.auspiciousSuggestions.numbers },
            ]
        }] : []),

        // Existing detailed sections
        { id: 'education', title: language === 'en' ? 'Education' : 'शिक्षा', icon: '📚', data: phallit.education },
        { id: 'career', title: language === 'en' ? 'Career Analysis' : 'करियर विश्लेषण', icon: '💼', data: phallit.career },
        { id: 'wealth', title: language === 'en' ? 'Wealth & Finance' : 'धन और वित्त', icon: '💰', data: phallit.wealth },
        { id: 'relationships', title: language === 'en' ? 'Marriage & Relationships' : 'विवाह और संबंध', icon: '💑', data: phallit.relationships },
        { id: 'health', title: language === 'en' ? 'Health' : 'स्वास्थ्य', icon: '🏥', data: phallit.health },
        { id: 'doshasYogas', title: language === 'en' ? 'Doshas & Yogas' : 'दोष और योग', icon: '🔮', data: phallit.doshasYogas },
        { id: 'dashaPredictions', title: language === 'en' ? 'Dasha Timeline (5-10 Years)' : 'दशा समयरेखा (5-10 वर्ष)', icon: '⏳', data: phallit.dashaPredictions },
        { id: 'remedies', title: language === 'en' ? 'Remedies' : 'उपाय', icon: '🙏', data: phallit.remedies },
    ];

    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 shadow-2xl border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">✨</span>
                <h2 className="text-2xl font-bold text-white">
                    {language === 'en' ? 'Phallit (Predictions)' : 'फलित (भविष्यवाणी)'}
                </h2>
            </div>

            <div className="space-y-3">
                {sections.map((section: any) => (
                    <div key={section.id} className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800/50">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{section.icon}</span>
                                <span className="font-semibold text-white text-left">{section.title}</span>
                            </div>
                            {expandedSections.has(section.id) ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {expandedSections.has(section.id) && (
                            <div className="px-4 py-4 bg-gray-900/70 border-t border-gray-700">
                                {section.subsections ? (
                                    // Render subsections
                                    <div className="space-y-3">
                                        {section.subsections.map((subsection: any) => (
                                            <div key={subsection.id} className="border-l-2 border-purple-500 pl-4">
                                                <h4 className="font-semibold text-purple-300 mb-2">{subsection.title}</h4>
                                                <p className="text-gray-200 leading-relaxed whitespace-pre-line text-base">
                                                    {subsection.data[language]}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Render simple section
                                    <p className="text-gray-200 leading-relaxed whitespace-pre-line font-medium text-base">
                                        {section.data?.[language]}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-700/50">
                <p className="text-sm text-gray-300 text-center">
                    {language === 'en'
                        ? '⭐ Predictions are based on planetary positions and Vedic astrology principles'
                        : '⭐ भविष्यवाणियां ग्रहों की स्थिति और वैदिक ज्योतिष सिद्धांतों पर आधारित हैं'}
                </p>
            </div>
        </div>
    );
}
