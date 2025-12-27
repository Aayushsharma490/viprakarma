'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, Star, Hash } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import NorthIndianKundali from '@/components/NorthIndianKundali';

interface UserAstroDataPanelProps {
    userId: number;
}

export default function UserAstroDataPanel({ userId }: UserAstroDataPanelProps) {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [kundaliData, setKundaliData] = useState<any>(null);
    const [numerologyData, setNumerologyData] = useState<any>(null);

    useEffect(() => {
        fetchUserAstroData();
    }, [userId]);

    const fetchUserAstroData = async () => {
        setLoading(true);
        try {
            // Fetch user's saved Kundali data
            const kundaliResponse = await fetch(`/api/user/kundali?userId=${userId}`);
            if (kundaliResponse.ok) {
                const data = await kundaliResponse.json();
                setKundaliData(data);
            }

            // Fetch user's numerology data
            const numerologyResponse = await fetch(`/api/user/numerology?userId=${userId}`);
            if (numerologyResponse.ok) {
                const data = await numerologyResponse.json();
                setNumerologyData(data);
            }
        } catch (error) {
            console.error('Error fetching astro data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="p-6 bg-card/40 backdrop-blur-xl border-border">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-card/40 backdrop-blur-xl border-border">
            <Tabs defaultValue="kundali" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="kundali" className="text-xs">
                        <Sparkles className="w-4 h-4 mr-1" />
                        {language === 'en' ? 'Kundali' : 'कुंडली'}
                    </TabsTrigger>
                    <TabsTrigger value="mahadasha" className="text-xs">
                        <Star className="w-4 h-4 mr-1" />
                        {language === 'en' ? 'Mahadasha' : 'महादशा'}
                    </TabsTrigger>
                    <TabsTrigger value="numerology" className="text-xs">
                        <Hash className="w-4 h-4 mr-1" />
                        {language === 'en' ? 'Numerology' : 'अंकशास्त्र'}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="kundali" className="space-y-4">
                    {kundaliData ? (
                        <>
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold text-foreground">
                                    {kundaliData.name || (language === 'en' ? 'User Kundali' : 'उपयोगकर्ता कुंडली')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'en' ? 'Birth Chart' : 'जन्म कुंडली'}
                                </p>
                            </div>
                            <div className="bg-background/50 rounded-2xl p-4">
                                <NorthIndianKundali
                                    planets={kundaliData.planets || []}
                                    houses={kundaliData.houses || []}
                                    ascendant={kundaliData.ascendant || 1}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-3 bg-background/50 rounded-xl">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        {language === 'en' ? 'Sun Sign' : 'सूर्य राशि'}
                                    </p>
                                    <p className="font-bold text-foreground">{kundaliData.sunSign || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-background/50 rounded-xl">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        {language === 'en' ? 'Moon Sign' : 'चंद्र राशि'}
                                    </p>
                                    <p className="font-bold text-foreground">{kundaliData.moonSign || 'N/A'}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                {language === 'en' ? 'No Kundali data available' : 'कोई कुंडली डेटा उपलब्ध नहीं'}
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="mahadasha" className="space-y-4">
                    {kundaliData?.mahadasha ? (
                        <>
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                                <h4 className="text-sm font-black uppercase tracking-wider text-primary mb-2">
                                    {language === 'en' ? 'Current Mahadasha' : 'वर्तमान महादशा'}
                                </h4>
                                <p className="text-2xl font-bold text-foreground">
                                    {kundaliData.mahadasha.current?.planet || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {kundaliData.mahadasha.current?.startDate} - {kundaliData.mahadasha.current?.endDate}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">
                                    {language === 'en' ? 'Upcoming Periods' : 'आगामी अवधि'}
                                </h4>
                                {kundaliData.mahadasha.upcoming?.map((period: any, index: number) => (
                                    <div key={index} className="p-3 bg-background/50 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-foreground">{period.planet}</span>
                                            <span className="text-xs text-muted-foreground">{period.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                {language === 'en' ? 'No Mahadasha data available' : 'कोई महादशा डेटा उपलब्ध नहीं'}
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="numerology" className="space-y-4">
                    {numerologyData ? (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-background/50 rounded-xl text-center">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {language === 'en' ? 'Life Path' : 'जीवन पथ'}
                                    </p>
                                    <p className="text-3xl font-black text-primary">{numerologyData.lifePath || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded-xl text-center">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {language === 'en' ? 'Driver' : 'चालक'}
                                    </p>
                                    <p className="text-3xl font-black text-primary">{numerologyData.driver || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded-xl text-center">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {language === 'en' ? 'Destiny' : 'भाग्य'}
                                    </p>
                                    <p className="text-3xl font-black text-primary">{numerologyData.destiny || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-background/50 rounded-xl text-center">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {language === 'en' ? 'Soul Urge' : 'आत्मा'}
                                    </p>
                                    <p className="text-3xl font-black text-primary">{numerologyData.soulUrge || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-accent/10 border border-primary/20 rounded-2xl">
                                <h4 className="text-sm font-bold text-foreground mb-2">
                                    {language === 'en' ? 'Lucky Colors' : 'भाग्यशाली रंग'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {numerologyData.luckyColors?.join(', ') || 'N/A'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                {language === 'en' ? 'No Numerology data available' : 'कोई अंकशास्त्र डेटा उपलब्ध नहीं'}
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </Card>
    );
}
