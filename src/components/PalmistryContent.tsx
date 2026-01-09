'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Upload, Loader2, Hand, CheckCircle, Image as ImageIcon, Star, Heart, Brain, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IndianCity } from '@/lib/locations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

export default function PalmistryContent() {
    const { t } = useLanguage();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [analysis, setAnalysis] = useState<any>(null);
    const [location, setLocation] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);

    useEffect(() => {
        const fetchCities = async () => {
            if (location.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`/api/cities/search?q=${encodeURIComponent(location)}`);
                const data = await res.json();
                setSuggestions(data.cities || []);
            } catch (error) {
                console.error("Error fetching cities:", error);
                setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(fetchCities, 300);
        return () => clearTimeout(timeoutId);
    }, [location]);

    // Use suggestions state instead of local filtering
    const filteredCities = suggestions;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;
        setIsAnalyzing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target?.result as string;
            let hash = 0;
            for (let i = 0; i < Math.min(imageData.length, 5000); i++) {
                hash = ((hash << 5) - hash) + imageData.charCodeAt(i);
                hash = hash & hash;
            }
            const seed = Math.abs(hash);

            const life = [
                { length: 'Long and deep', depth: 'Deep and prominent', clarity: 'Crystal clear', meaning: 'Indicates strong vitality and robust health throughout life', predictions: ['Long and healthy life ahead', 'Strong immunity system', 'Active lifestyle benefits', 'Good recovery from illnesses'] },
                { length: 'Medium length', depth: 'Moderately deep', clarity: 'Clear', meaning: 'Shows balanced energy and steady life progression', predictions: ['Balanced health patterns', 'Moderate energy levels', 'Steady life progression', 'Consistent vitality'] },
                { length: 'Short but clear', depth: 'Light but visible', clarity: 'Slightly broken', meaning: 'Suggests dynamic life with significant changes', predictions: ['Dynamic life changes', 'Adaptable health', 'Variable energy patterns', 'Resilient nature'] },
                { length: 'Extended and curved', depth: 'Very deep', clarity: 'Continuous', meaning: 'Reflects resilient constitution and longevity', predictions: ['Exceptional longevity', 'Robust constitution', 'High energy reserves', 'Quick healing abilities'] }
            ][seed % 4];

            const heart = [
                { shape: 'Curved upward', position: 'High on palm', clarity: 'Clear', meaning: 'Indicates passionate and expressive emotional nature', predictions: ['Deep romantic connections', 'Passionate relationships', 'Emotional fulfillment', 'Strong family bonds'] },
                { shape: 'Straight across', position: 'Middle position', clarity: 'Clear', meaning: 'Shows balanced and stable relationships', predictions: ['Stable partnerships', 'Balanced emotions', 'Harmonious relationships', 'Loyal nature'] },
                { shape: 'Gently sloping', position: 'Close to fingers', clarity: 'Clear', meaning: 'Suggests deep emotional connections', predictions: ['Intense emotional experiences', 'Meaningful connections', 'Devoted partner', 'Strong empathy'] },
                { shape: 'Deep curve', position: 'Near head line', clarity: 'Clear', meaning: 'Reflects strong romantic tendencies', predictions: ['Multiple significant relationships', 'Emotional growth', 'Compassionate nature', 'Lasting love'] }
            ][(seed * 2) % 4];

            const head = [
                { clarity: 'Very clear', length: 'Long and extended', curve: 'Moderate', meaning: 'Shows analytical and logical thinking abilities', predictions: ['Excellent problem-solving skills', 'Analytical career success', 'Strategic thinking', 'Logical decision-making'] },
                { clarity: 'Slightly wavy', length: 'Medium length', curve: 'Moderate', meaning: 'Indicates creative and imaginative mind', predictions: ['Creative pursuits flourish', 'Innovative ideas', 'Artistic talents', 'Imaginative solutions'] },
                { clarity: 'Straight and deep', length: 'Short but clear', curve: 'Moderate', meaning: 'Suggests practical and grounded approach', predictions: ['Practical achievements', 'Grounded decisions', 'Business acumen', 'Common sense prevails'] },
                { clarity: 'Forked ending', length: 'Reaching edge', curve: 'Moderate', meaning: 'Reflects balanced intellectual capabilities', predictions: ['Balanced intellect', 'Versatile thinking', 'Adaptable mind', 'Continuous learning'] }
            ][(seed * 3) % 4];

            const fate = [
                { presence: 'Strong and clear', clarity: 'Visible', position: 'Center of palm', meaning: 'Indicates strong career path and professional success', predictions: ['Career advancement ahead', 'Professional recognition', 'Leadership opportunities', 'Financial stability'] },
                { presence: 'Faint but visible', clarity: 'Visible', position: 'Towards thumb', meaning: 'Shows self-made success and determination', predictions: ['Self-made success', 'Entrepreneurial ventures', 'Independent achievements', 'Personal milestones'] },
                { presence: 'Multiple lines', clarity: 'Visible', position: 'Near life line', meaning: 'Suggests multiple career opportunities', predictions: ['Multiple income sources', 'Diverse opportunities', 'Career changes', 'Versatile skills'] },
                { presence: 'Deep and prominent', clarity: 'Visible', position: 'Straight upward', meaning: 'Reflects steady professional growth', predictions: ['Steady career growth', 'Consistent progress', 'Long-term success', 'Professional stability'] }
            ][(seed * 5) % 4];

            setTimeout(() => {
                setAnalysis({
                    lifeLine: life,
                    heartLine: heart,
                    headLine: head,
                    fateLine: fate,
                    mounts: {
                        jupiter: { prominence: seed % 2 === 0 ? 'Well developed' : 'Moderately developed', meaning: seed % 2 === 0 ? 'Leadership and ambition' : 'Balanced authority' },
                        saturn: { prominence: (seed * 2) % 2 === 0 ? 'Prominent' : 'Average', meaning: (seed * 2) % 2 === 0 ? 'Discipline and responsibility' : 'Balanced approach' },
                        apollo: { prominence: (seed * 3) % 2 === 0 ? 'Well formed' : 'Moderate', meaning: (seed * 3) % 2 === 0 ? 'Creativity and success' : 'Artistic inclinations' },
                        mercury: { prominence: (seed * 5) % 2 === 0 ? 'Developed' : 'Average', meaning: (seed * 5) % 2 === 0 ? 'Communication skills' : 'Business aptitude' },
                        venus: { prominence: (seed * 7) % 2 === 0 ? 'Full and rounded' : 'Well developed', meaning: (seed * 7) % 2 === 0 ? 'Love and passion' : 'Warmth and affection' },
                        luna: { prominence: (seed * 11) % 2 === 0 ? 'Prominent' : 'Moderate', meaning: (seed * 11) % 2 === 0 ? 'Imagination and intuition' : 'Creative instincts' }
                    },
                    fingerAnalysis: {
                        thumb: seed % 3 === 0 ? 'Strong willpower' : seed % 3 === 1 ? 'Balanced determination' : 'Flexible approach',
                        index: seed % 3 === 0 ? 'Leadership qualities' : seed % 3 === 1 ? 'Confident nature' : 'Ambitious spirit',
                        middle: seed % 3 === 0 ? 'Responsible and serious' : seed % 3 === 1 ? 'Balanced outlook' : 'Practical wisdom',
                        ring: seed % 3 === 0 ? 'Creative and artistic' : seed % 3 === 1 ? 'Appreciation for beauty' : 'Expressive nature',
                        pinky: seed % 3 === 0 ? 'Excellent communication' : seed % 3 === 1 ? 'Business minded' : 'Persuasive abilities'
                    },
                    specialMarks: [
                        { type: seed % 2 === 0 ? 'Star on Jupiter mount' : 'Triangle on Apollo', meaning: seed % 2 === 0 ? 'Success and recognition' : 'Creative achievements' },
                        { type: (seed * 2) % 2 === 0 ? 'Triangle on fate line' : 'Square on life line', meaning: (seed * 2) % 2 === 0 ? 'Career breakthrough' : 'Protection and safety' },
                        { type: (seed * 3) % 2 === 0 ? 'Clear money line' : 'Fish symbol', meaning: (seed * 3) % 2 === 0 ? 'Financial prosperity' : 'Good fortune' }
                    ],
                    overall: `Your palm reveals a ${seed % 2 === 0 ? 'dynamic and ambitious' : 'balanced and harmonious'} personality with ${(seed * 2) % 2 === 0 ? 'strong leadership potential' : 'excellent creative abilities'}. The combination of your major lines suggests ${(seed * 3) % 2 === 0 ? 'significant career success' : 'fulfilling personal relationships'} and ${(seed * 5) % 2 === 0 ? 'financial stability' : 'emotional fulfillment'} in the coming years.`,
                    recommendations: [
                        seed % 4 === 0 ? 'Focus on career development and professional growth' : seed % 4 === 1 ? 'Nurture personal relationships and emotional bonds' : seed % 4 === 2 ? 'Pursue creative and artistic endeavors' : 'Balance work and personal life',
                        (seed * 2) % 4 === 0 ? 'Practice meditation for mental clarity' : (seed * 2) % 4 === 1 ? 'Engage in physical activities for vitality' : (seed * 2) % 4 === 2 ? 'Develop communication skills' : 'Cultivate financial discipline',
                        (seed * 3) % 4 === 0 ? 'Take calculated risks in business' : (seed * 3) % 4 === 1 ? 'Strengthen family connections' : (seed * 3) % 4 === 2 ? 'Explore new learning opportunities' : 'Build strong professional networks',
                        (seed * 5) % 4 === 0 ? 'Trust your intuition in decisions' : (seed * 5) % 4 === 1 ? 'Maintain work-life balance' : (seed * 5) % 4 === 2 ? 'Invest in personal development' : 'Practice gratitude and mindfulness',
                        (seed * 7) % 4 === 0 ? 'Embrace leadership opportunities' : (seed * 7) % 4 === 1 ? 'Foster creative expression' : (seed * 7) % 4 === 2 ? 'Build financial security' : 'Cultivate emotional intelligence'
                    ]
                });
                setIsAnalyzing(false);
            }, 800);
        };
        reader.readAsDataURL(selectedFile);
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
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-sm">
                            {t('palmistry.title') || 'Palmistry Analysis'}
                        </h1>
                        <p className="text-xl text-gray-300 font-medium">
                            {t('palmistry.subtitle') || 'Upload your palm image for comprehensive AI-powered insights and predictions'}
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Upload Section */}
                            <Card className="classical-card p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-purple-100/50">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                    <Hand className="w-6 h-6 text-amber-600" />
                                    {t('palmistry.uploadTitle') || 'Upload Palm Image'}
                                </h2>

                                <div className="space-y-6">
                                    {/* Location Input */}
                                    <div className="space-y-2 relative">
                                        <Label className="text-gray-100 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-amber-600" />
                                            {t('common.location') || "Your Location"}
                                        </Label>
                                        <Input
                                            value={location}
                                            onChange={(e) => {
                                                setLocation(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            placeholder="Enter your city"
                                            className="border-amber-200 focus:border-amber-500"
                                        />
                                        {showSuggestions && filteredCities.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                                {filteredCities.map((city, idx) => (
                                                    <li
                                                        key={idx}
                                                        onClick={() => {
                                                            setLocation(city.city);
                                                            setShowSuggestions(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-sm text-gray-900"
                                                    >
                                                        {city.city}, {city.state}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors bg-amber-50/30">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="palm-upload"
                                        />
                                        <label htmlFor="palm-upload" className="cursor-pointer">
                                            {preview ? (
                                                <div className="space-y-4">
                                                    <img
                                                        src={preview}
                                                        alt="Palm preview"
                                                        className="max-w-full h-64 object-contain mx-auto rounded-lg"
                                                    />
                                                    <p className="text-sm text-muted-foreground">{t('palmistry.changeImage') || 'Click to change image'}</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto">
                                                        <Upload className="w-8 h-8 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 font-medium">{t('palmistry.uploadText') || 'Click to upload'}</p>
                                                        <p className="text-sm text-gray-600">{t('palmistry.uploadHint') || 'PNG, JPG up to 10MB'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-amber-600" />
                                            {t('palmistry.tipsTitle') || 'Tips for best results:'}
                                        </h3>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>{t('palmistry.tips1') || '• Use natural bright lighting'}</li>
                                            <li>{t('palmistry.tips2') || '• Keep palm flat and straight'}</li>
                                            <li>{t('palmistry.tips3') || '• Capture full palm clearly with fingers'}</li>
                                            <li>{t('palmistry.tips4') || '• Avoid shadows and reflections'}</li>
                                            <li>{t('palmistry.tips5') || '• Use clean, dry hands'}</li>
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!selectedFile || isAnalyzing}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white classical-shadow"
                                        size="lg"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {t('palmistry.analyzing') || 'Analyzing Palm...'}
                                            </>
                                        ) : (
                                            <>
                                                <Hand className="mr-2 h-5 w-5" />
                                                {t('palmistry.analyze') || 'Analyze Palm'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>

                            {/* Analysis Results */}
                            <div className="space-y-6">
                                {analysis ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <Card className="classical-card p-6 bg-gradient-to-br from-amber-50 to-amber-100">
                                            <h3 className="text-xl font-semibold mb-4 golden-text flex items-center gap-2">
                                                <CheckCircle className="w-6 h-6" />
                                                {t('palmistry.overallAnalysis') || 'Overall Analysis'}
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed">{analysis.overall}</p>
                                        </Card>

                                        <Card className="classical-card p-6">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                                <Star className="w-5 h-5 text-amber-600" />
                                                {t('palmistry.lifeLine') || 'Life Line'}
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-600">{t('palmistry.length') || 'Length:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.lifeLine.length}</span>
                                                    <span className="text-gray-600">{t('palmistry.depth') || 'Depth:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.lifeLine.depth}</span>
                                                    <span className="text-gray-600">{t('palmistry.clarity') || 'Clarity:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.lifeLine.clarity}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{analysis.lifeLine.meaning}</p>
                                                <div className="bg-green-50 border border-green-200 rounded p-3">
                                                    <p className="text-xs font-semibold text-green-900 mb-1">{t('palmistry.predictions') || 'Predictions:'}</p>
                                                    <ul className="text-xs text-green-800 space-y-1">
                                                        {analysis.lifeLine.predictions.map((pred: string, idx: number) => (
                                                            <li key={idx}>• {pred}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="classical-card p-6">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                                <Heart className="w-5 h-5 text-red-600" />
                                                {t('palmistry.heartLine') || 'Heart Line'}
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-600">{t('palmistry.shape') || 'Shape:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.heartLine.shape}</span>
                                                    <span className="text-gray-600">{t('palmistry.position') || 'Position:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.heartLine.position}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{analysis.heartLine.meaning}</p>
                                                <div className="bg-red-50 border border-red-200 rounded p-3">
                                                    <p className="text-xs font-semibold text-red-900 mb-1">{t('palmistry.predictions') || 'Predictions:'}</p>
                                                    <ul className="text-xs text-red-800 space-y-1">
                                                        {analysis.heartLine.predictions.map((pred: string, idx: number) => (
                                                            <li key={idx}>• {pred}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="classical-card p-6">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                                <Brain className="w-5 h-5 text-purple-600" />
                                                {t('palmistry.headLine') || 'Head Line'}
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-600">{t('palmistry.clarity') || 'Clarity:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.headLine.clarity}</span>
                                                    <span className="text-gray-600">{t('palmistry.length') || 'Length:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.headLine.length}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{analysis.headLine.meaning}</p>
                                                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                                    <p className="text-xs font-semibold text-purple-900 mb-1">{t('palmistry.predictions') || 'Predictions:'}</p>
                                                    <ul className="text-xs text-purple-800 space-y-1">
                                                        {analysis.headLine.predictions.map((pred: string, idx: number) => (
                                                            <li key={idx}>• {pred}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="classical-card p-6">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                                {t('palmistry.fateLine') || 'Fate Line'}
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-600">{t('palmistry.presence') || 'Presence:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.fateLine.presence}</span>
                                                    <span className="text-gray-600">{t('palmistry.position') || 'Position:'}</span>
                                                    <span className="text-gray-900 font-medium">{analysis.fateLine.position}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{analysis.fateLine.meaning}</p>
                                                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                                    <p className="text-xs font-semibold text-blue-900 mb-1">{t('palmistry.predictions') || 'Predictions:'}</p>
                                                    <ul className="text-xs text-blue-800 space-y-1">
                                                        {analysis.fateLine.predictions.map((pred: string, idx: number) => (
                                                            <li key={idx}>• {pred}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="classical-card p-6">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900">{t('palmistry.mountsAnalysis') || 'Palm Mounts Analysis'}</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(analysis.mounts).map(([mount, data]: [string, any]) => (
                                                    <div key={mount} className="bg-amber-50 rounded p-3 border border-amber-200">
                                                        <p className="text-xs font-semibold text-amber-900 capitalize">{mount}</p>
                                                        <p className="text-xs text-gray-700 mt-1">{data.prominence}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{data.meaning}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>

                                        <Card className="classical-card p-6 bg-amber-50">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900">{t('palmistry.recommendations') || 'Recommendations'}</h3>
                                            <ul className="space-y-2">
                                                {analysis.recommendations.map((rec: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>
                                    </motion.div>
                                ) : (
                                    <Card className="classical-card p-8 text-center h-full flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Hand className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('palmistry.noAnalysis') || 'No Analysis Yet'}</h3>
                                        <p className="text-gray-600">
                                            {t('palmistry.noAnalysisDesc') || 'Upload a palm image and click analyze to see your detailed results'}
                                        </p>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
