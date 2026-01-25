'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Heart, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import DetailedMatchingResults from '@/components/DetailedMatchingResults';
import { toast } from 'sonner';

export default function KundaliMatchingPage() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [matchResult, setMatchResult] = useState<any>(null);
    const [boyData, setBoyData] = useState<any>(null);
    const [girlData, setGirlData] = useState<any>(null);

    const [boy, setBoy] = useState({
        name: '',
        day: '',
        month: '',
        year: '',
        hour: '',
        minute: '',
        second: '',
        city: '',
        latitude: '',
        longitude: ''
    });

    const [girl, setGirl] = useState({
        name: '',
        day: '',
        month: '',
        year: '',
        hour: '',
        minute: '',
        second: '',
        city: '',
        latitude: '',
        longitude: ''
    });

    const formatCoordinate = (value: number, isLat: boolean) => {
        const abs = Math.abs(value);
        const degrees = Math.floor(abs);
        const minutes = Math.round((abs - degrees) * 60);
        const direction = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
        return `${degrees}${direction}${minutes}`;
    };

    const handleMatch = async () => {
        if (!boy.name || !girl.name) {
            toast.error(language === 'en' ? 'Please enter both names' : 'कृपया दोनों नाम दर्ज करें');
            return;
        }

        if (!boy.day || !boy.month || !boy.year || !boy.hour || !boy.minute || !boy.second ||
            !girl.day || !girl.month || !girl.year || !girl.hour || !girl.minute || !girl.second) {
            toast.error(language === 'en' ? 'Please enter complete birth dates and times' : 'कृपया पूर्ण जन्म तिथियां और समय दर्ज करें');
            return;
        }

        setLoading(true);
        try {
            const boyDob = `${boy.year}-${boy.month.padStart(2, '0')}-${boy.day.padStart(2, '0')}`;
            const girlDob = `${girl.year}-${girl.month.padStart(2, '0')}-${girl.day.padStart(2, '0')}`;
            const boyTime = `${boy.hour || '12'}:${boy.minute || '00'}:${boy.second || '00'}`;
            const girlTime = `${girl.hour || '12'}:${girl.minute || '00'}:${girl.second || '00'}`;

            // Generate full kundalis for both persons to get charts
            const [matchResponse, boyKundaliResponse, girlKundaliResponse] = await Promise.all([
                fetch('/api/kundali/match', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        person1: {
                            name: boy.name,
                            gender: 'male',
                            dob: boyDob,
                            time: boyTime,
                            latitude: parseFloat(boy.latitude) || 26.4499,
                            longitude: parseFloat(boy.longitude) || 74.6399
                        },
                        person2: {
                            name: girl.name,
                            gender: 'female',
                            dob: girlDob,
                            time: girlTime,
                            latitude: parseFloat(girl.latitude) || 24.5854,
                            longitude: parseFloat(girl.longitude) || 73.7125
                        }
                    })
                }),
                fetch('/api/kundali/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: boy.name,
                        day: parseInt(boy.day),
                        month: parseInt(boy.month),
                        year: parseInt(boy.year),
                        hour: parseInt(boy.hour) || 12,
                        minute: parseInt(boy.minute) || 0,
                        second: parseInt(boy.second) || 0,
                        latitude: parseFloat(boy.latitude) || 26.4499,
                        longitude: parseFloat(boy.longitude) || 74.6399
                    })
                }),
                fetch('/api/kundali/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: girl.name,
                        day: parseInt(girl.day),
                        month: parseInt(girl.month),
                        year: parseInt(girl.year),
                        hour: parseInt(girl.hour) || 12,
                        minute: parseInt(girl.minute) || 0,
                        second: parseInt(girl.second) || 0,
                        latitude: parseFloat(girl.latitude) || 24.5854,
                        longitude: parseFloat(girl.longitude) || 73.7125
                    })
                })
            ]);

            const data = await matchResponse.json();
            const boyKundali = await boyKundaliResponse.json();
            const girlKundali = await girlKundaliResponse.json();

            if (matchResponse.ok) {
                // Use data as-is from server - no client-side corrections
                setMatchResult(data);

                // Prepare display data with full kundali
                setBoyData({
                    name: boy.name,
                    date: `${boy.day}/${boy.month}/${boy.year}`,
                    time: boyTime,
                    place: boy.city || 'Ajmer',
                    longitudeStr: formatCoordinate(parseFloat(boy.longitude) || 74.6399, false),
                    latitudeStr: formatCoordinate(parseFloat(boy.latitude) || 26.4499, true),
                    ...data.boyDetails,
                    kundali: boyKundali
                });

                setGirlData({
                    name: girl.name,
                    date: `${girl.day}/${girl.month}/${girl.year}`,
                    time: girlTime,
                    place: girl.city || 'Udaipur',
                    longitudeStr: formatCoordinate(parseFloat(girl.longitude) || 73.7125, false),
                    latitudeStr: formatCoordinate(parseFloat(girl.latitude) || 24.5854, true),
                    ...data.girlDetails,
                    kundali: girlKundali
                });

                toast.success(language === 'en' ? 'Matching completed!' : 'मिलान पूर्ण!');
            } else {
                toast.error(data.error || (language === 'en' ? 'Matching failed' : 'मिलान विफल'));
            }
        } catch (error) {
            console.error('Matching error:', error);
            toast.error(language === 'en' ? 'Something went wrong' : 'कुछ गलत हो गया');
        } finally {
            setLoading(false);
        }
    };

    const renderPersonForm = (person: any, setPerson: any, label: string) => (
        <Card className="p-8 celestial-card border-border bg-card/40 backdrop-blur-2xl rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">
                    {label}
                </h3>
            </div>

            <div className="space-y-6">
                <div>
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        {language === 'en' ? 'Full Name' : 'पूरा नाम'} *
                    </Label>
                    <Input
                        value={person.name}
                        onChange={(e) => setPerson({ ...person, name: e.target.value })}
                        placeholder={language === 'en' ? 'Enter full name' : 'पूरा नाम दर्ज करें'}
                        className="h-14 bg-background/50 border-border rounded-2xl mt-2"
                    />
                </div>

                <div>
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        {language === 'en' ? 'Date of Birth' : 'जन्म तिथि'} *
                    </Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={language === 'en' ? 'DD' : 'दिन'}
                            value={person.day}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31 && value.length <= 2)) {
                                    setPerson({ ...person, day: value });
                                }
                            }}
                            onBlur={(e) => {
                                const val = e.target.value;
                                if (val && val.length === 1) {
                                    setPerson({ ...person, day: val.padStart(2, '0') });
                                }
                            }}
                            maxLength={2}
                            className="h-14 bg-background/50 border-border rounded-2xl"
                        />
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={language === 'en' ? 'MM' : 'महीना'}
                            value={person.month}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12 && value.length <= 2)) {
                                    setPerson({ ...person, month: value });
                                }
                            }}
                            onBlur={(e) => {
                                const val = e.target.value;
                                if (val && val.length === 1) {
                                    setPerson({ ...person, month: val.padStart(2, '0') });
                                }
                            }}
                            maxLength={2}
                            className="h-14 bg-background/50 border-border rounded-2xl"
                        />
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={language === 'en' ? 'YYYY' : 'वर्ष'}
                            value={person.year}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value === '' || value.length <= 4) {
                                    setPerson({ ...person, year: value });
                                }
                            }}
                            onBlur={(e) => {
                                const value = parseInt(e.target.value);
                                const currentYear = new Date().getFullYear();
                                if (value && (value < 1900 || value > currentYear)) {
                                    alert(`Year must be between 1900 and ${currentYear}`);
                                }
                            }}
                            maxLength={4}
                            className="h-14 bg-background/50 border-border rounded-2xl"
                        />
                    </div>
                </div>

                <div>
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        {language === 'en' ? 'Time of Birth' : 'जन्म समय'} *
                    </Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={language === 'en' ? 'HH' : 'घंटा'}
                            value={person.hour}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23 && value.length <= 2)) {
                                    setPerson({ ...person, hour: value });
                                }
                            }}
                            onBlur={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    setPerson({ ...person, hour: val.padStart(2, '0') });
                                }
                            }}
                            maxLength={2}
                            className="h-14 bg-background/50 border-border rounded-2xl"
                        />
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={language === 'en' ? 'MM' : 'मिनट'}
                            value={person.minute}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59 && value.length <= 2)) {
                                    setPerson({ ...person, minute: value });
                                }
                            }}
                            onBlur={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    setPerson({ ...person, minute: val.padStart(2, '0') });
                                }
                            }}
                            maxLength={2}
                            className="h-14 bg-background/50 border-border rounded-2xl"
                        />
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={language === 'en' ? 'SS' : 'सेकंड'}
                            value={person.second}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59 && value.length <= 2)) {
                                    setPerson({ ...person, second: value });
                                }
                            }}
                            onBlur={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    setPerson({ ...person, second: val.padStart(2, '0') });
                                }
                            }}
                            maxLength={2}
                            className="h-14 bg-background/50 border-border rounded-2xl"
                        />
                    </div>
                </div>

                <div>
                    <LocationAutocomplete
                        value={person.city}
                        onChange={(location) => setPerson({
                            ...person,
                            city: location.city,
                            latitude: location.latitude.toString(),
                            longitude: location.longitude.toString()
                        })}
                        label={language === 'en' ? 'Place of Birth (Optional)' : 'जन्म स्थान (वैकल्पिक)'}
                        placeholder={language === 'en' ? 'Type city name...' : 'शहर का नाम टाइप करें...'}
                    />
                </div>
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen bg-transparent">
            <Navbar />
            <div className="container mx-auto px-4 py-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-primary/20 rounded-full mb-6"
                        >
                            <Heart className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                {language === 'en' ? 'Kundali Matching' : 'कुंडली मिलान'}
                            </span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tighter uppercase leading-none">
                            <span className="block mb-4">{language === 'en' ? 'Find Your' : 'अपना'}</span>
                            <span className="golden-text">{language === 'en' ? 'Perfect Match' : 'सही मिलान'}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                            {language === 'en'
                                ? 'Discover compatibility through ancient Vedic astrology'
                                : 'प्राचीन वैदिक ज्योतिष के माध्यम से अनुकूलता की खोज करें'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {renderPersonForm(boy, setBoy, language === 'en' ? 'Var (Groom)' : 'वर')}
                        {renderPersonForm(girl, setGirl, language === 'en' ? 'Vadhu (Bride)' : 'वधू')}
                    </div>

                    <div className="text-center mb-16">
                        <Button
                            onClick={handleMatch}
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 px-12 rounded-[1.25rem] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {language === 'en' ? 'Matching...' : 'मिलान हो रहा है...'}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5" />
                                    {language === 'en' ? 'Match Kundali' : 'कुंडली मिलाएं'}
                                </div>
                            )}
                        </Button>
                    </div>

                    {matchResult && boyData && girlData && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <DetailedMatchingResults
                                boyData={boyData}
                                girlData={girlData}
                                matchResult={matchResult}
                            />
                        </motion.div>
                    )}
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}
