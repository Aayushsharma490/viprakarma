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
        <div className="min-h-screen cosmic-gradient">
            <Navbar />
            <ChatBot />

            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="fixed inset-0 stars-bg opacity-30 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-cosmic">
                            {t("contact.subtitle")}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground">
                            {t("contact.description")}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactInfo.map((info, index) => (
                            <motion.div
                                key={info.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="glass-effect p-6 text-center h-full hover:glow-purple transition-all duration-300">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                                        style={{
                                            background: 'linear-gradient(135deg, #6d28d9, #a855f7)',
                                        }}
                                    >
                                        <info.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                                        {info.title === 'Email Us' ? t('contact.info.email.title') :
                                            info.title === 'Call Us' ? t('contact.info.phone.title') :
                                                info.title === 'Visit Us' ? t('contact.info.visit.title') :
                                                    t('contact.info.hours.title')}
                                    </h3>
                                    <p className="text-primary font-medium mb-1">{info.content}</p>
                                    <p className="text-sm text-muted-foreground">{info.subContent}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card className="glass-effect p-8">
                                <h2 className="text-3xl font-bold text-center mb-6 text-cosmic">
                                    {t("contact.form.title")}
                                </h2>

                                {submitted && (
                                    <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg mb-6 text-center">
                                        {t("contact.form.success")}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="name">{t("contact.form.name")} *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">{t("contact.form.email")} *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="subject">{t("contact.form.subject")} *</Label>
                                            <Input
                                                id="subject"
                                                type="text"
                                                placeholder="How can we help?"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="message">{t("contact.form.message")} *</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us more about your inquiry..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            className="mt-1 min-h-[150px]"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 glow-purple"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t("contact.form.sending")}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                {t("contact.form.send")}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-cosmic">
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-4">
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
                                <Card key={index} className="glass-effect p-6">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {faq.q}
                                    </h3>
                                    <p className="text-muted-foreground">{faq.a}</p>
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
