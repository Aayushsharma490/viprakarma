'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Sparkles, Calendar } from 'lucide-react';
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
    const { user } = useAuth();
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
        <div className="min-h-screen cosmic-gradient">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-cosmic mb-4 flex items-center justify-center gap-3">
                            <Sparkles className="w-10 h-10 text-purple-600" />
                            {t('mahurat.title')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {t('mahurat.subtitle')}
                        </p>
                    </div>

                    {!hasAccess && (
                        <Card className="p-8 glass-effect mb-8 border-2 border-purple-200">
                            <div className="text-center">
                                <Lock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-4">{t('mahurat.subscriptionRequired')}</h2>
                                <p className="text-gray-600 mb-6">
                                    {t('mahurat.subscriptionMessage')}
                                </p>
                                <Link href="/subscription">
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                        {t('mahurat.subscribeButton')}
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    )}

                    <Card className={`p-8 glass-effect ${!hasAccess ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="purpose">{t('mahurat.purpose')} *</Label>
                                <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('mahurat.purposePlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {purposeKeys.map(key => (
                                            <SelectItem key={key} value={key}>
                                                {t(`mahurat.purpose.${key}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="rashi">{t('mahurat.rashi')} *</Label>
                                <Select value={formData.rashi} onValueChange={(value) => setFormData({ ...formData, rashi: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('mahurat.rashiPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rashiKeys.map(key => (
                                            <SelectItem key={key} value={key}>
                                                {t(`mahurat.rashi.${key}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="phoneNumber">{t('mahurat.phoneNumber')} *</Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder={t('mahurat.phoneNumberPlaceholder')}
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    📱 Enter 10-digit mobile number. Results will be sent via WhatsApp in Hindi & English.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">{t('mahurat.startDate')} *</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endDate">{t('mahurat.endDate')} *</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="location">{t('mahurat.location')}</Label>
                                <Input
                                    id="location"
                                    placeholder={t('mahurat.locationPlaceholder')}
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={loading || !hasAccess}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {loading ? t('mahurat.calculating') : t('mahurat.generateButton')}
                            </Button>
                        </div>
                    </Card>

                    {results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-8 space-y-4"
                        >
                            <h2 className="text-2xl font-bold mb-4">{t('mahurat.auspiciousTimings')}</h2>
                            {results.map((result, index) => (
                                <Card key={index} className="p-6 glass-effect">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-5 h-5 text-purple-600" />
                                                <span className="font-semibold text-lg">
                                                    {result.date}
                                                </span>
                                                <span className="text-purple-600 font-bold">
                                                    {result.time}
                                                </span>
                                            </div>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAuspiciousnessColor(result.auspiciousness)}`}>
                                                {translateAuspiciousness(result.auspiciousness)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mb-3">{result.recommendation}</p>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {result.details}
                                    </div>
                                </Card>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}
