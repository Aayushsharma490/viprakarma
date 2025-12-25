'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactContent() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setSubmitted(true);
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        });

        setTimeout(() => setSubmitted(false), 5000);
    };

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email Us',
            content: 'support@kundali.com',
            subContent: 'We reply within 24 hours',
        },
        {
            icon: Phone,
            title: 'Call Us',
            content: '+91 98765 43210',
            subContent: 'Mon-Sat, 9 AM - 9 PM IST',
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            content: '#22/23 16th Main Road, Near Old Konica Garments',
            subContent: 'Srigandha Nagar Peenya 2nd Stage, Hegganahalli, Bengaluru 560 091',
        },
        {
            icon: Clock,
            title: 'Business Hours',
            content: '9:00 AM - 9:00 PM',
            subContent: 'Monday to Saturday',
        },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <Navbar />
            <ChatBot />

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-primary/20 rounded-full mb-6"
                        >
                            <Send className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Get in Touch</span>
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-black text-foreground mb-8 tracking-tighter uppercase font-sans leading-none">
                            Contact <span className="golden-text">Us</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                            {t("contact.description")}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {contactInfo.map((info, index) => (
                            <motion.div
                                key={info.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="celestial-card p-8 text-center h-full bg-card/40 border-border rounded-[2rem] hover:border-primary/30 transition-all duration-500 group">
                                    <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-border flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                                        <info.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black mb-3 text-foreground uppercase tracking-tighter font-sans">
                                        {info.title === 'Email Us' ? t('contact.info.email.title') :
                                            info.title === 'Call Us' ? t('contact.info.phone.title') :
                                                info.title === 'Visit Us' ? t('contact.info.visit.title') :
                                                    t('contact.info.hours.title')}
                                    </h3>
                                    <p className="text-primary font-black uppercase tracking-tight mb-2 text-sm">{info.content}</p>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{info.subContent}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card className="celestial-card border-border bg-card/60 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 -ml-32 -mt-32 rounded-full blur-[80px]"></div>
                                <h2 className="text-4xl font-black text-center mb-10 text-foreground uppercase tracking-tighter font-sans relative z-10">
                                    {t("contact.form.title")}
                                </h2>

                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-2xl mb-10 text-center font-black uppercase tracking-tight text-sm flex items-center justify-center gap-3 relative z-10"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                        {t("contact.form.success")}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t("contact.form.name")} *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm hover:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t("contact.form.email")} *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm hover:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t("contact.form.phone")}</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm hover:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t("contact.form.subject")} *</Label>
                                            <Input
                                                id="subject"
                                                type="text"
                                                placeholder="How can we help?"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                                className="h-14 bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm hover:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t("contact.form.message")} *</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us more about your inquiry..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            className="min-h-[180px] bg-background/50 border-border rounded-2xl focus:ring-primary shadow-sm hover:border-primary/50 transition-colors py-4 px-5"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 rounded-[1.25rem] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {t("contact.form.sending")}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Send className="w-5 h-5" />
                                                {t("contact.form.send")}
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 pb-48">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-4xl font-black text-center mb-16 text-foreground uppercase tracking-tighter font-sans">
                            Frequently Asked <span className="golden-text">Questions</span>
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                {
                                    q: 'How accurate are the kundali predictions?',
                                    a: 'Our kundalis are generated using precise astronomical calculations based on Vedic astrology principles. The accuracy depends on the correctness of birth details provided.',
                                },
                                {
                                    q: 'Can I consult with astrologers directly?',
                                    a: 'Yes! You can book one-on-one consultations with our expert astrologers via chat, voice call, or video call.',
                                },
                                {
                                    q: 'Is my personal information secure?',
                                    a: 'Absolutely. We use industry-standard encryption and security measures to protect your personal and birth details.',
                                },
                                {
                                    q: 'What payment methods do you accept?',
                                    a: 'We accept all major credit/debit cards, UPI, net banking, and mobile wallets through our secure Razorpay integration.',
                                },
                            ].map((faq, index) => (
                                <Card key={index} className="celestial-card border-border bg-card/40 backdrop-blur-xl rounded-3xl p-8 hover:border-primary/20 transition-all duration-300">
                                    <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-tight font-sans">
                                        {faq.q}
                                    </h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed">{faq.a}</p>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
