'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import PoojaRatingModal from '@/components/PoojaRatingModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Clock, MapPin, Phone, Mail, FileText, Send, Loader2, Star } from 'lucide-react';

export default function PoojaBookingPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [showRatingModal, setShowRatingModal] = useState(false);

    const [formData, setFormData] = useState({
        poojaName: '',
        date: '',
        time: '',
        location: '',
        purpose: '',
        phone: '',
        email: '',
        occasion: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Get user ID from localStorage (assuming simplified auth for now)
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error('Please login to book a pooja');
            }
            const user = JSON.parse(userStr);

            const res = await fetch('/api/pooja-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, userId: user.id }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit booking');
            }

            setSuccess(t('pooja.success') || 'Pooja booking request submitted successfully! We will contact you shortly.');
            setFormData({
                poojaName: '',
                date: '',
                time: '',
                location: '',
                purpose: '',
                phone: '',
                email: '',
                occasion: '',
                description: ''
            });

            // Optional: Show rating modal after success (if we considered it "completed" instantly, but technically it is just booked)
            // setShowRatingModal(true); 

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-primary/20 rounded-full mb-6"
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("pooja.sacredService") || "Sacred Service"}</span>
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-black text-foreground mb-6 tracking-tighter uppercase font-sans leading-none">
                            {t("pooja.bookTitle1")} <span className="golden-text">{t("pooja.bookTitle2")}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                            {t("pooja.description") || "Experience the divine power through our sacred rituals performed by expert Ved Pathi Pandits."}
                        </p>
                    </div>

                    <Card className="celestial-card border-border bg-card/60 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -mr-32 -mt-32 rounded-full blur-[80px]"></div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-8 font-black uppercase tracking-tight text-xs text-center flex items-center justify-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl mb-8 font-black uppercase tracking-tight text-xs text-center flex items-center justify-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                                    <Label htmlFor="poojaName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('pooja.name')} *</Label>
                                    <Select
                                        value={formData.poojaName}
                                        onValueChange={(value) => setFormData({ ...formData, poojaName: value })}
                                    >
                                        <SelectTrigger className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm hover:border-primary/50 transition-colors">
                                            <SelectValue placeholder={t('pooja.selectPlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border rounded-2xl">
                                            {[
                                                "Satyanarayan Pooja", "Ganesh Puja", "Lakshmi Puja", "Rudrabhishek",
                                                "Griha Pravesh", "Mahamrityunjaya Jaap", "Navagraha Shanti", "Vastu Shanti",
                                                "Kalsarp Dosh Nivas", "Mangal Dosh Nivas", "Vivah Sanskar", "Engagement Ceremony",
                                                "Namkaran Sanskar", "Mundan", "Shradh / Pitru Paksha", "Sunderkand",
                                                "Durga Path", "Saraswati Puja"
                                            ].map((pooja) => (
                                                <SelectItem key={pooja} value={pooja} className="focus:bg-primary/10 rounded-xl m-1 transition-colors">
                                                    {pooja}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
                                    <Label htmlFor="occasion" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('pooja.occasion')}</Label>
                                    <Input
                                        type="text"
                                        name="occasion"
                                        value={formData.occasion}
                                        onChange={handleChange}
                                        placeholder="e.g. Anniversary"
                                        className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                    />
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
                                    <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('pooja.date')} *</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                            className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                        />
                                    </div>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
                                    <Label htmlFor="time" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('pooja.time')} *</Label>
                                    <Input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                        className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                    />
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3">
                                <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('pooja.location')} *</Label>
                                <Textarea
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    placeholder="Full address where pooja will be performed"
                                    className="bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm py-4 px-5 min-h-[120px]"
                                />
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="space-y-3">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('pooja.phone')} *</Label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+91..."
                                        className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                    />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="space-y-3">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('pooja.email')} *</Label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your@email.com"
                                        className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm"
                                    />
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="space-y-3">
                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('pooja.notes')}</Label>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Any specific requirements or purpose..."
                                    className="bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm py-4 px-5 min-h-[150px]"
                                />
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-20 rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.3em] text-lg"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            {t('pooja.submitting')}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Send className="w-6 h-6" />
                                            {t('pooja.bookButton')}
                                        </div>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Rate Us Section */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="mt-16 pt-10 border-t border-border/50 text-center relative z-10"
                        >
                            <p className="text-muted-foreground font-medium mb-4">{t('pooja.ratePrompt')}</p>
                            <Button
                                variant="outline"
                                onClick={() => setShowRatingModal(true)}
                                className="border-primary/30 text-primary hover:bg-primary/10 rounded-2xl font-black uppercase tracking-widest text-xs px-8 h-12 transition-all hover:scale-110 active:scale-95 flex items-center gap-2 mx-auto"
                            >
                                <Star className="w-4 h-4 fill-primary" />
                                {t('pooja.rateButton')}
                            </Button>
                        </motion.div>
                    </Card>
                </motion.div>

                <PoojaRatingModal
                    isOpen={showRatingModal}
                    onClose={() => setShowRatingModal(false)}
                    poojaName={formData.poojaName || "Pooja"}
                />
            </main>
            <Footer />
        </div>
    );
}
