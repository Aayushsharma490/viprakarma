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
                            {t("about.title")}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground">
                            {t("about.subtitle")}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <Card className="glass-effect p-8 md:p-12">
                            <div className="flex items-center justify-center mb-6">
                                <Sparkles className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-cosmic">
                                {t("about.missionTitle")}
                            </h2>
                            <p className="text-lg text-muted-foreground text-center leading-relaxed">
                                {t("about.ourMission")}
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="glass-effect p-6 text-center hover:glow-purple transition-all duration-300">
                                    <div className="text-4xl md:text-5xl font-bold text-cosmic mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-muted-foreground">{stat.label}</div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-cosmic">
                            {t("about.valuesTitle")}
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            {t("about.valuesSubtitle")}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="glass-effect p-6 h-full hover:glow-purple transition-all duration-300">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                        style={{
                                            background: "linear-gradient(135deg, #6d28d9, #a855f7)",
                                        }}
                                    >
                                        <value.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                                        {value.title}
                                    </h3>
                                    <p className="text-muted-foreground">{value.description}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <Card className="glass-effect p-8 md:p-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-cosmic">
                                {t("about.storyTitle")}
                            </h2>
                            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
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
