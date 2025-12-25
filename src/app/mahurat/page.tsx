'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Sparkles, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import type { MahuratResult } from '@/lib/mahuratUtils';
import Link from 'next/link';

const purposeKeys = [
    'marriage',
    'businessOpening',
    'houseWarming',
    'vehiclePurchase',
    'travel',
    'education',
    'propertyPurchase',
    'nameCeremony',
    'threadCeremony',
    'other'
];

const rashiKeys = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces'
];

export default function MahuratPage() {
    const { user, refreshUser } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MahuratResult[]>([]);
    const [formData, setFormData] = useState({
        purpose: '',
        rashi: '',
        phoneNumber: '',
        startDate: '',
        endDate: '',
        location: '',
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const isSubscribed = user?.isMahuratSubscribed || false;
    const subscriptionExpiry = user?.mahuratSubscriptionExpiry;
    const isExpired = subscriptionExpiry ? new Date(subscriptionExpiry) < new Date() : true;
    const hasAccess = isSubscribed && !isExpired;

    const handleGenerate = async () => {
        if (!hasAccess) {
            toast.error(t('mahurat.error.subscriptionRequired'));
            return;
        }

        if (!formData.purpose || !formData.startDate || !formData.endDate) {
            toast.error(t('mahurat.error.fillAllFields'));
            return;
        }

        if (!formData.rashi) {
            toast.error(t('mahurat.error.rashiRequired'));
            return;
        }

        if (!formData.phoneNumber) {
            toast.error(t('mahurat.error.phoneRequired'));
            return;
        }

        // Validate phone number format
        const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/mahurat/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    purpose: formData.purpose,
                    rashi: formData.rashi,
                    phoneNumber: formData.phoneNumber,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    location: {
                        lat: parseFloat(formData.latitude) || 28.6139, // Default to Delhi
                        lon: parseFloat(formData.longitude) || 77.2090
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                setResults(data.mahurats);
                toast.success(t('mahurat.success.calculated'));

                // Show WhatsApp delivery status
                if (data.whatsappSent) {
                    toast.success('📱 WhatsApp message sent successfully! (Hindi & English)', {
                        duration: 5000
                    });
                } else if (data.whatsappError) {
                    toast.warning(`⚠️ Results calculated but WhatsApp failed: ${data.whatsappError}`, {
                        duration: 7000
                    });
                } else {
                    toast.info('Results calculated. WhatsApp message may be delayed.', {
                        duration: 5000
                    });
                }
            } else {
                toast.error(data.error || t('mahurat.error.failed'));
            }
        } catch (error) {
            console.error('Mahurat generation error:', error);
            toast.error(t('mahurat.error.failed'));
        } finally {
            setLoading(false);
        }
    };

    const getAuspiciousnessColor = (level: string) => {
        switch (level) {
            case 'Highly Auspicious': return 'text-green-600 bg-green-50';
            case 'Auspicious': return 'text-blue-600 bg-blue-50';
            case 'Moderate': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-red-600 bg-red-50';
        }
    };

    const translateAuspiciousness = (level: string) => {
        switch (level) {
            case 'Highly Auspicious': return t('mahurat.highlyAuspicious');
            case 'Auspicious': return t('mahurat.auspicious');
            case 'Moderate': return t('mahurat.moderate');
            case 'Inauspicious': return t('mahurat.inauspicious');
            default: return level;
        }
    };

    return (
        <div className="min-h-screen bg-transparent">
            <Navbar />
            <div className="container mx-auto px-4 py-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-primary/20 rounded-full mb-6"
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('mahurat.title')}</span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tighter uppercase font-sans leading-none">
                            Auspicious <span className="golden-text">Timing</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                            {t('mahurat.subtitle')}
                        </p>
                    </div>

                    {!hasAccess && (
                        <Card className="p-12 celestial-card border-border bg-card/60 backdrop-blur-3xl rounded-[2.5rem] mb-12 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="text-center relative z-10">
                                <div className="w-20 h-20 rounded-3xl bg-accent/20 border border-border flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                    <Lock className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter font-sans">{t('mahurat.subscriptionRequired')}</h2>
                                <p className="text-muted-foreground mb-10 text-lg font-medium leading-relaxed max-w-lg mx-auto">
                                    {t('mahurat.subscriptionMessage')}
                                </p>
                                <Link href="/subscription">
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-12 h-14 rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-sm">
                                        {t('mahurat.subscribeButton')}
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    )}

                    <Card className={`p-10 celestial-card border-border bg-card/40 backdrop-blur-2xl rounded-[2.5rem] relative overflow-hidden ${!hasAccess ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                        <div className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="purpose" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('mahurat.purpose')} *</Label>
                                    <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                                        <SelectTrigger className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm hover:border-primary/50 transition-colors">
                                            <SelectValue placeholder={t('mahurat.purposePlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border rounded-2xl">
                                            {purposeKeys.map(key => (
                                                <SelectItem key={key} value={key} className="focus:bg-primary/10 rounded-xl m-1 transition-colors">
                                                    {t(`mahurat.purpose.${key}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="rashi" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('mahurat.rashi')} *</Label>
                                    <Select value={formData.rashi} onValueChange={(value) => setFormData({ ...formData, rashi: value })}>
                                        <SelectTrigger className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm hover:border-primary/50 transition-colors">
                                            <SelectValue placeholder={t('mahurat.rashiPlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border rounded-2xl">
                                            {rashiKeys.map(key => (
                                                <SelectItem key={key} value={key} className="focus:bg-primary/10 rounded-xl m-1 transition-colors">
                                                    {t(`mahurat.rashi.${key}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="phoneNumber" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('mahurat.phoneNumber')} *</Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder={t('mahurat.phoneNumberPlaceholder')}
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                />
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest ml-1 opacity-70">
                                    📱 RESULTS VIA WHATSAPP IN ENGLISH & HINDI
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('mahurat.startDate')} *</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('mahurat.endDate')} *</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('mahurat.location')}</Label>
                                <Input
                                    id="location"
                                    placeholder={t('mahurat.locationPlaceholder')}
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={loading || !hasAccess}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 rounded-[1.25rem] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t('mahurat.calculating')}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5" />
                                            {t('mahurat.generateButton')}
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-20 space-y-8"
                        >
                            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-8 font-sans">{t('mahurat.auspiciousTimings')}</h2>
                            <div className="grid grid-cols-1 gap-6">
                                {results.map((result, index) => (
                                    <Card key={index} className="celestial-card border-border bg-card/40 backdrop-blur-xl rounded-3xl p-8 group hover:border-primary/30 transition-all duration-500">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-border flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground font-black uppercase tracking-widest text-sm leading-none mb-1">{result.date}</p>
                                                        <p className="text-primary font-black uppercase tracking-widest text-[10px]">{result.time}</p>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl backdrop-blur-md transition-colors ${result.auspiciousness === 'Highly Auspicious' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/30' :
                                                        result.auspiciousness === 'Auspicious' ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/30' :
                                                            'bg-amber-950/30 text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                        {translateAuspiciousness(result.auspiciousness)}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground mb-3 font-sans">{result.recommendation}</h3>
                                                <p className="text-muted-foreground font-medium leading-relaxed">{result.details}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}
