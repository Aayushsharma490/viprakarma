"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import {
    Loader2,
    Hash,
    Sparkles,
    TrendingUp,
    Heart,
    Brain,
    Star,
    CheckCircle,
} from "lucide-react";
import { calculateNumerology, type NumerologyData } from "@/lib/astrologyApi";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NumerologyContent() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        dateOfBirth: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [numerologyData, setNumerologyData] = useState<NumerologyData | null>(
        null
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = calculateNumerology(formData.name, formData.dateOfBirth);
            setNumerologyData(data);
        } catch (error) {
            console.error("Numerology calculation error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <ChatBot />

            {/* Hero Section */}
            <section className="relative py-20 pt-32 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-sm text-foreground">
                            <span>{t("numerology.title")?.split(' ')[0] || "Numerology"}</span>{' '}
                            <span className="golden-text">{t("numerology.title")?.split(' ').slice(1).join(' ') || "Analysis"}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            {t("numerology.subtitle") ||
                                "Discover the hidden meanings in your name and birth date"}
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="celestial-card border-border bg-card/30 backdrop-blur-xl p-8 mb-8 rounded-3xl relative overflow-hidden">
                            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                                <Hash className="w-6 h-6 text-amber-500" />
                                {t("numerology.enterDetails") || "Enter Your Details"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name" className="text-foreground/80 mb-2 block font-medium">
                                        {t("numerology.fullName")}
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder={t("numerology.namePlaceholder") || "Enter your full name"}
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                        className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="dateOfBirth" className="text-foreground/80 mb-2 block font-medium">
                                        {t("numerology.dateOfBirth")}
                                    </Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dateOfBirth: e.target.value })
                                        }
                                        required
                                        className="capitalize bg-background/50 border-border text-foreground inverse-date-picker"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-12 text-lg font-bold classical-shadow"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {t("numerology.calculating") || "Calculating..."}
                                        </>
                                    ) : (
                                        <>
                                            <Hash className="mr-2 h-5 w-5" />
                                            {t("numerology.calculateNumbers") || "Calculate Numbers"}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Card>
                    </motion.div>

                    {numerologyData && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-12"
                        >
                            {/* Core Numbers Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Life Path */}
                                <Card className="celestial-card p-6 bg-card/30 backdrop-blur-xl border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.lifePath}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold golden-text">
                                                {t("numerology.lifePath.title") || "Life Path"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {t("numerology.lifePath.subtitle") || "Core Identity"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {numerologyData.insights.lifePathMeaning}
                                    </p>
                                </Card>

                                {/* Driver Number */}
                                <Card className="celestial-card p-6 bg-card/30 backdrop-blur-xl border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.driverNumber}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-purple-400">
                                                {t("numerology.driver.title") || "Driver"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {t("numerology.driver.subtitle") || "Inner Self"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {t("numerology.driver.description") || "Your driver number controls your actions and mental thoughts."}
                                    </p>
                                </Card>

                                {/* Conductor Number */}
                                <Card className="celestial-card p-6 bg-card/30 backdrop-blur-xl border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.conductorNumber}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-pink-400">
                                                {t("numerology.conductor.title") || "Conductor"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {t("numerology.conductor.subtitle") || "External Fate"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {t("numerology.conductor.description") || "Your conductor number determines your destiny and external environment."}
                                    </p>
                                </Card>
                            </div>

                            {/* Secondary Numbers Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="celestial-card p-6 bg-card/30 backdrop-blur-xl border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.destiny}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-blue-400">
                                                {t("numerology.destiny.title") || "Destiny"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">{t("numerology.destiny.subtitle") || "Purpose"}</p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {numerologyData.insights.destinyMeaning}
                                    </p>
                                </Card>

                                <Card className="celestial-card p-6 bg-card/30 backdrop-blur-xl border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.soulUrge}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-red-400">
                                                {t("numerology.soulUrge.title") || "Soul Urge"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {t("numerology.soulUrge.subtitle") || "Deep Desires"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {numerologyData.insights.soulUrgeMeaning}
                                    </p>
                                </Card>

                                <Card className="celestial-card p-6 bg-card/30 backdrop-blur-xl border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.personality}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-green-400">
                                                {t("numerology.personality.title") || "Personality"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {t("numerology.personality.subtitle") || "Outer Image"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {numerologyData.insights.personalityMeaning}
                                    </p>
                                </Card>
                            </div>

                            {/* Mobile Number Suggestion */}
                            <div className="mt-8">
                                <Card className="celestial-card p-8 bg-card/30 backdrop-blur-xl border-border">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                            <Hash className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                {t("numerology.mobileTitle") || "Lucky Mobile Number Suggestions"}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {t("numerology.mobileSubtitle") || "Choose a number that resonates with your vibrations"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <Star className="w-4 h-4 text-amber-500" />
                                                {t("numerology.luckyDigits") || "Your Lucky Digits"}
                                            </h4>
                                            <div className="flex gap-4 flex-wrap">
                                                {numerologyData.mobileSuggestions?.lucky.map((num) => (
                                                    <div key={num} className="text-center">
                                                        <div className="w-12 h-12 rounded-lg bg-background/50 border border-border flex items-center justify-center text-2xl font-bold text-amber-500 shadow-sm mx-auto mb-2">
                                                            {num}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-400">
                                                {t("numerology.basedOn") || "Based on Driver"} ({numerologyData.driverNumber}) & {t("numerology.conductor.title") || "Conductor"} ({numerologyData.conductorNumber})
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-amber-500" />
                                                {t("numerology.suggestion") || "Suggested Totals"}
                                            </h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {numerologyData.mobileSuggestions?.description}
                                            </p>

                                            {numerologyData.mobileSuggestions?.avoid && numerologyData.mobileSuggestions.avoid.length > 0 && (
                                                <div className="mt-3 p-3 bg-red-900/20 rounded-lg border border-red-900/40 text-sm text-red-200">
                                                    <p className="font-medium mb-1">{t("numerology.avoidTotals") || "Avoid these totals:"}</p>
                                                    <p>{numerologyData.mobileSuggestions.avoid.join(", ")}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Complete Profile */}
                            <Card className="celestial-card p-8 bg-card/30 backdrop-blur-xl border-border">
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="w-7 h-7 text-amber-500" />
                                    <h3 className="text-2xl font-semibold golden-text">
                                        {t("numerology.completeProfile") || "Your Complete Profile"}
                                    </h3>
                                </div>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    {t("numerology.introText") || "Your numbers reveal a unique cosmic blueprint."}{" "}
                                    <strong className="text-amber-500">
                                        {numerologyData.lifePath}
                                    </strong>{" "}
                                    {t("numerology.combinedWith") || "combined with Driver Number"}{" "}
                                    <strong className="text-amber-500">
                                        {numerologyData.driverNumber}
                                    </strong>{" "}
                                    {t("numerology.andConductor") || "and Conductor Number"}{" "}
                                    <strong className="text-amber-500">
                                        {numerologyData.conductorNumber}
                                    </strong>{" "}
                                    {t("numerology.createsSignature") || "creates your unique energy signature."}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-background/40 rounded-lg p-4 border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-green-400" />
                                            <h4 className="font-semibold text-foreground">{t("numerology.strengths") || "Strengths"}</h4>
                                        </div>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>{t("numerology.strength1") || "• Natural leadership"}</li>
                                            <li>{t("numerology.strength2") || "• Determination"}</li>
                                            <li>{t("numerology.strength3") || "• Creativity"}</li>
                                            <li>{t("numerology.strength4") || "• Communication"}</li>
                                            <li>{t("numerology.strength5") || "• Balance"}</li>
                                        </ul>
                                    </div>

                                    <div className="bg-background/40 rounded-lg p-4 border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-5 h-5 text-amber-400" />
                                            <h4 className="font-semibold text-foreground">
                                                {t("numerology.lifeRecommendations") || "Recommendations"}
                                            </h4>
                                        </div>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>{t("numerology.recommendation1") || "• Pursue goals"}</li>
                                            <li>{t("numerology.recommendation2") || "• Stay creative"}</li>
                                            <li>{t("numerology.recommendation3") || "• Build bonds"}</li>
                                            <li>{t("numerology.recommendation4") || "• Trust self"}</li>
                                            <li>{t("numerology.recommendation5") || "• Balance life"}</li>
                                        </ul>
                                    </div>
                                </div>
                            </Card>

                            {/* Additional Insights Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
                                <Card className="celestial-card p-4 text-center bg-card/30 backdrop-blur-xl border-border">
                                    <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <h4 className="font-semibold text-foreground mb-1">
                                        {t("numerology.loveCompatibility") || "Love Match"}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {t("numerology.bestMatches") || "Check compatibility"}
                                    </p>
                                </Card>
                                <Card className="celestial-card p-4 text-center bg-card/30 backdrop-blur-xl border-border">
                                    <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                    <h4 className="font-semibold text-foreground mb-1">
                                        {t("numerology.luckyDays") || "Lucky Days"}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {t("numerology.luckyDaysValue") || "Mon, Wed, Fri"}
                                    </p>
                                </Card>
                                <Card className="celestial-card p-4 text-center bg-card/30 backdrop-blur-xl border-border">
                                    <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                    <h4 className="font-semibold text-foreground mb-1">
                                        {t("numerology.luckyColors") || "Lucky Colors"}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">{t("numerology.luckyColorsValue") || "Yellow, Gold"}</p>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
