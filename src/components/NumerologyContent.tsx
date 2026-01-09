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
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                    style={{
                        backgroundImage: "url('/pattern-bg.png')", // Fallback or assume generic pattern
                        backgroundSize: "cover"
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-sm">
                            {t("numerology.title") || "Numerology Analysis"}
                        </h1>
                        <p className="text-xl text-gray-300 font-medium">
                            {t("numerology.subtitle") ||
                                "Discover the hidden meanings in your name and birth date with comprehensive insights"}
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
                        <Card className="classical-card p-8 mb-8 hover:shadow-2xl transition-shadow duration-300 border-2 border-amber-100/50">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                <Hash className="w-6 h-6 text-amber-600" />
                                {t("numerology.enterDetails") || "Enter Your Details"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name" className="text-gray-900">
                                        {t("numerology.fullName")}
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder={t("numerology.namePlaceholder")}
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                        className="mt-1 border-amber-200 focus:border-amber-600"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="dateOfBirth" className="text-gray-900">
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
                                        className="mt-1 border-amber-200 focus:border-amber-600"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white classical-shadow"
                                    disabled={isLoading}
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {t("numerology.calculating")}
                                        </>
                                    ) : (
                                        <>
                                            <Hash className="mr-2 h-5 w-5" />
                                            {t("numerology.calculateNumbers")}
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
                            className="space-y-6"
                        >
                            {/* Core Numbers Grid - Including Driver and Conductor */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Life Path */}
                                <Card className="classical-card p-6 classical-hover">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.lifePath}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold golden-text">
                                                {t("numerology.lifePath.title")}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {t("numerology.lifePath.subtitle")}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {numerologyData.insights.lifePathMeaning}
                                    </p>
                                </Card>

                                {/* Driver Number */}
                                <Card className="classical-card p-6 classical-hover">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.driverNumber}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-purple-900">
                                                {t("numerology.driver.title")}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {t("numerology.driver.subtitle")}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {t("numerology.driver.description")}
                                    </p>
                                </Card>

                                {/* Conductor Number */}
                                <Card className="classical-card p-6 classical-hover">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.conductorNumber}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-pink-900">
                                                {t("numerology.conductor.title")}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {t("numerology.conductor.subtitle")}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {t("numerology.conductor.description")}
                                    </p>
                                </Card>
                            </div>

                            {/* Secondary Numbers */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="classical-card p-6 classical-hover">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.destiny}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-blue-900">
                                                {t("numerology.destiny.title")}
                                            </h3>
                                            <p className="text-sm text-gray-600">{t("numerology.destiny.subtitle")}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {numerologyData.insights.destinyMeaning}
                                    </p>
                                </Card>

                                <Card className="classical-card p-6 classical-hover">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.soulUrge}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-red-900">
                                                {t("numerology.soulUrge.title")}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {t("numerology.soulUrge.subtitle")}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {numerologyData.insights.soulUrgeMeaning}
                                    </p>
                                </Card>

                                <Card className="classical-card p-6 classical-hover">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center classical-shadow">
                                            <span className="text-3xl font-bold text-white">
                                                {numerologyData.personality}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-green-900">
                                                {t("numerology.personality.title")}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {t("numerology.personality.subtitle")}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {numerologyData.insights.personalityMeaning}
                                    </p>
                                </Card>
                            </div>

                            {/* Complete Profile */}
                            <Card className="classical-card p-8 bg-gradient-to-br from-amber-50 to-amber-100 classical-shadow">
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="w-7 h-7 text-amber-600" />
                                    <h3 className="text-2xl font-semibold golden-text">
                                        {t("numerology.completeProfile")}
                                    </h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    {t("numerology.introText")}{" "}
                                    <strong className="text-amber-900">
                                        {numerologyData.lifePath}
                                    </strong>{" "}
                                    combined with Driver Number{" "}
                                    <strong className="text-amber-900">
                                        {numerologyData.driverNumber}
                                    </strong>{" "}
                                    and Conductor Number{" "}
                                    <strong className="text-amber-900">
                                        {numerologyData.conductorNumber}
                                    </strong>{" "}
                                    creates your unique energy signature. Your Destiny{" "}
                                    <strong className="text-amber-900">
                                        {numerologyData.destiny}
                                    </strong>{" "}
                                    guides your ultimate purpose, while Soul Urge{" "}
                                    <strong className="text-amber-900">
                                        {numerologyData.soulUrge}
                                    </strong>{" "}
                                    drives your deepest motivations.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                            <h4 className="font-semibold text-gray-900">{t("numerology.strengths")}</h4>
                                        </div>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            <li>{t("numerology.strength1")}</li>
                                            <li>{t("numerology.strength2")}</li>
                                            <li>{t("numerology.strength3")}</li>
                                            <li>{t("numerology.strength4")}</li>
                                            <li>{t("numerology.strength5")}</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-5 h-5 text-amber-600" />
                                            <h4 className="font-semibold text-gray-900">
                                                {t("numerology.lifeRecommendations")}
                                            </h4>
                                        </div>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            <li>{t("numerology.recommendation1")}</li>
                                            <li>{t("numerology.recommendation2")}</li>
                                            <li>{t("numerology.recommendation3")}</li>
                                            <li>{t("numerology.recommendation4")}</li>
                                            <li>{t("numerology.recommendation5")}</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-amber-600 text-white rounded-lg p-4 flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold mb-1">
                                            {t("numerology.expertGuidance")}
                                        </p>
                                        <p className="text-sm text-amber-50">
                                            {t("numerology.expertDescription")}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="classical-card p-4 text-center">
                                    <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                        {t("numerology.loveCompatibility")}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                        {t("numerology.bestMatches")}
                                    </p>
                                </Card>
                                <Card className="classical-card p-4 text-center">
                                    <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                        {t("numerology.luckyDays")}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                        {t("numerology.luckyDaysValue")}
                                    </p>
                                </Card>
                                <Card className="classical-card p-4 text-center">
                                    <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                        {t("numerology.luckyColors")}
                                    </h4>
                                    <p className="text-xs text-gray-600">{t("numerology.luckyColorsValue")}</p>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {numerologyData && (
                        <div className="mt-8">
                            <Card className="classical-card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                        <Hash className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-green-900">
                                            {t("numerology.mobileTitle") || "Lucky Mobile Number Suggestions"}
                                        </h3>
                                        <p className="text-sm text-green-700">
                                            {t("numerology.mobileSubtitle") || "Choose a number that resonates with your vibrations"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Star className="w-4 h-4 text-amber-500" />
                                            {t("numerology.luckyDigits") || "Your Lucky Digits"}
                                        </h4>
                                        <div className="flex gap-4 flex-wrap">
                                            {numerologyData.mobileSuggestions?.lucky.map((num) => (
                                                <div key={num} className="text-center">
                                                    <div className="w-12 h-12 rounded-lg bg-white border border-green-200 flex items-center justify-center text-2xl font-bold text-green-700 shadow-sm mx-auto mb-2 animate-bounce-slow">
                                                        {num}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600">
                                            {t("numerology.basedOn")} ({numerologyData.driverNumber}) & {t("numerology.conductor.title")} ({numerologyData.conductorNumber})
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-amber-500" />
                                            {t("numerology.suggestion") || "Suggested Totals"}
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {numerologyData.mobileSuggestions?.description}
                                        </p>

                                        {numerologyData.mobileSuggestions?.avoid && numerologyData.mobileSuggestions.avoid.length > 0 && (
                                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-800">
                                                <p className="font-medium mb-1">{t("numerology.avoidTotals")}</p>
                                                <p>{numerologyData.mobileSuggestions.avoid.join(", ")}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div >
    );
}
