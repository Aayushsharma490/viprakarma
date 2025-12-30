'use client';

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Card } from "@/components/ui/card";
import {
    Star,
    Users,
    Award,
    Heart,
    Sparkles,
    Target,
    Shield,
    Loader2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutContent() {
    const { t } = useLanguage();

    const values = [
        {
            icon: Star,
            title: t("about.value1.title"),
            description: t("about.value1.desc"),
        },
        {
            icon: Users,
            title: t("about.value2.title"),
            description: t("about.value2.desc"),
        },
        {
            icon: Award,
            title: t("about.value3.title"),
            description: t("about.value3.desc"),
        },
        {
            icon: Heart,
            title: t("about.value4.title"),
            description: t("about.value4.desc"),
        },
        {
            icon: Shield,
            title: t("about.value5.title"),
            description: t("about.value5.desc"),
        },
        {
            icon: Target,
            title: t("about.value6.title"),
            description: t("about.value6.desc"),
        },
    ];

    const stats = [
        { number: "10,000+", label: t("about.stats1") },
        { number: "50+", label: t("about.stats2") },
        { number: "25,000+", label: t("about.stats3") },
        { number: "98%", label: t("about.stats4") },
    ];

    return (
        <div className="min-h-screen bg-background">
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
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Est. 2024</span>
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-black text-foreground mb-8 tracking-tighter uppercase font-sans leading-none">
                            Our <span className="golden-text">Mission</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                            {t("about.subtitle")}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-5xl mx-auto"
                    >
                        <Card className="celestial-card border-border bg-card/60 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -mr-32 -mt-32 rounded-full blur-[80px]"></div>
                            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                                <div className="w-24 h-24 rounded-3xl bg-accent/20 border border-border flex items-center justify-center shrink-0 shadow-2xl">
                                    <Sparkles className="w-12 h-12 text-primary" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6 uppercase tracking-tighter font-sans">
                                        {t("about.missionTitle")}
                                    </h2>
                                    <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                                        {t("about.ourMission")}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                                <Card className="celestial-card p-8 text-center bg-card/40 border-border rounded-3xl hover:border-primary/30 transition-all duration-500">
                                    <div className="text-4xl md:text-5xl font-black text-foreground font-sans tracking-tighter mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 uppercase tracking-tighter font-sans">
                            {t("about.valuesTitle")}
                        </h2>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                            {t("about.valuesSubtitle")}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="celestial-card p-8 h-full bg-card/40 border-border rounded-[2.5rem] hover:border-primary/30 transition-all duration-500 group">
                                    <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-border flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                                        <value.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-foreground uppercase tracking-tighter font-sans">
                                        {value.title}
                                    </h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed">{value.description}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24 pb-40">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <Card className="celestial-card border-border bg-card/60 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem]">
                            <h2 className="text-4xl font-black text-center mb-10 text-foreground uppercase tracking-tighter font-sans">
                                {t("about.storyTitle")}
                            </h2>
                            <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
                                {t("about.ourStory").split('\n\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
