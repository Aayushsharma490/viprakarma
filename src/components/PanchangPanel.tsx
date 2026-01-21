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
            value: enhancedDetails.masa || 'N/A'
        },
        {
            label: language === 'en' ? 'Paksha (Fortnight)' : 'पक्ष',
            value: enhancedDetails.paksha || 'N/A'
        },
        {
            label: language === 'en' ? 'Tithi (Lunar Day)' : 'तिथि',
            value: enhancedDetails.tithi ? `${enhancedDetails.tithi.name} (${enhancedDetails.tithi.number})` : 'N/A'
        },
        {
            label: language === 'en' ? 'Nakshatra' : 'नक्षत्र',
            value: enhancedDetails.nakshatraSwami || 'N/A'
        },
        {
            label: language === 'en' ? 'Yoga' : 'योग',
            value: enhancedDetails.yoga || 'N/A'
        },
        {
            label: language === 'en' ? 'Karana' : 'करण',
            value: enhancedDetails.karana || 'N/A'
        },
        {
            label: language === 'en' ? 'Day (Var)' : 'दिन (वार)',
            value: enhancedDetails.dayOfWeek || 'N/A'
        },
        {
            label: language === 'en' ? 'Ritu (Season)' : 'ऋतू',
            value: ritu
        },
        {
            label: language === 'en' ? 'Ayana' : 'आयन',
            value: ayana
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
