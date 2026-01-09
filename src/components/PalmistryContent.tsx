'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Upload, Loader2, Hand, CheckCircle, Image as ImageIcon, Star, Heart, Brain, TrendingUp, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
                    overall: `Your palm reveals a ${seed % 2 === 0 ? 'dynamic and ambitious' : 'balanced and harmonious'} personality with ${(seed * 2) % 2 === 0 ? 'strong leadership potential' : 'excellent creative abilities'}.`,
                    recommendations: [
                        seed % 4 === 0 ? 'Focus on career development' : 'Nurture relationships',
                        'Practice meditation',
                        'Trust your intuition'
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
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-sm">
                            <span className="text-white">{t('palmistry.title')?.split(' ')[0] || 'Palmistry'}</span>{' '}
                            <span className="golden-text">{t('palmistry.title')?.split(' ').slice(1).join(' ') || 'Analysis'}</span>
                        </h1>
                        <p className="text-xl text-gray-300 font-medium">
                            {t('palmistry.subtitle') || 'Upload your palm image for comprehensive AI-powered insights and predictions'}
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="celestial-card border-border bg-card/30 backdrop-blur-xl p-8 mb-8 rounded-3xl relative overflow-hidden">
                            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                                <Hand className="w-6 h-6 text-amber-500" />
                                {t('palmistry.uploadTitle') || 'Upload Your Palm'}
                            </h2>

                            <div className="space-y-6">
                                {/* Location Input */}
                                <div className="space-y-2 relative">
                                    <Label className="text-gray-100 flex items-center gap-2 mb-2 block">
                                        <MapPin className="w-4 h-4 text-amber-500" />
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
                                        className="bg-background/50 border-border text-white placeholder:text-muted-foreground"
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <ul className="absolute z-50 w-full bg-card border border-border rounded-xl shadow-2xl mt-1 max-h-60 overflow-y-auto backdrop-blur-xl">
                                            {suggestions.map((city, idx) => (
                                                <li
                                                    key={idx}
                                                    onClick={() => {
                                                        setLocation(city.city);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="px-4 py-2 hover:bg-accent cursor-pointer text-sm text-white border-b border-border/50 last:border-0"
                                                >
                                                    {city.city}, {city.state}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-amber-500/50 transition-colors bg-background/30">
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
                                                    className="max-w-full h-64 object-contain mx-auto rounded-xl"
                                                />
                                                <p className="text-sm text-gray-400">{t('palmistry.changeImage') || 'Click to change image'}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 bg-amber-600/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
                                                    <Upload className="w-8 h-8 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{t('palmistry.uploadText') || 'Click to upload'}</p>
                                                    <p className="text-sm text-gray-400">{t('palmistry.uploadHint') || 'PNG, JPG up to 10MB'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <div className="bg-background/40 rounded-xl p-6 border border-border">
                                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-amber-500" />
                                        {t('palmistry.tipsTitle') || 'Tips for best results:'}
                                    </h3>
                                    <ul className="text-sm text-gray-300 space-y-2">
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
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 rounded-xl font-bold text-lg classical-shadow"
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
                    </motion.div>

                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <Card className="celestial-card p-8 bg-card/30 backdrop-blur-xl border-border">
                                <h3 className="text-2xl font-semibold mb-6 golden-text flex items-center gap-2">
                                    <CheckCircle className="w-7 h-7" />
                                    {t('palmistry.overallAnalysis') || 'Overall Analysis'}
                                </h3>
                                <p className="text-gray-300 leading-relaxed text-lg">{analysis.overall}</p>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Major Lines */}
                                {[
                                    { title: t('palmistry.lifeLine') || 'Life Line', icon: Star, data: analysis.lifeLine, color: 'amber' },
                                    { title: t('palmistry.heartLine') || 'Heart Line', icon: Heart, data: analysis.heartLine, color: 'red' },
                                    { title: t('palmistry.headLine') || 'Head Line', icon: Brain, data: analysis.headLine, color: 'purple' },
                                    { title: t('palmistry.fateLine') || 'Fate Line', icon: TrendingUp, data: analysis.fateLine, color: 'blue' }
                                ].map((line, idx) => (
                                    <Card key={idx} className="celestial-card p-6 bg-card/30 backdrop-blur-xl border-border">
                                        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                                            <line.icon className={`w-5 h-5 text-${line.color}-500`} />
                                            {line.title}
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-y-2 text-sm border-b border-border/50 pb-4">
                                                <span className="text-gray-400">Meaning:</span>
                                                <span className="text-white font-medium">{line.data.meaning}</span>
                                            </div>
                                            <div className="bg-accent/20 rounded-lg p-4">
                                                <p className="text-xs font-semibold text-amber-500 mb-2 uppercase tracking-wider">Predictions:</p>
                                                <ul className="text-xs text-gray-300 space-y-2">
                                                    {line.data.predictions.map((pred: string, pIdx: number) => (
                                                        <li key={pIdx} className="flex items-start gap-2">
                                                            <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                                                            {pred}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <Card className="celestial-card p-8 bg-card/30 backdrop-blur-xl border-border">
                                <h3 className="text-xl font-semibold mb-6 text-white">{t('palmistry.recommendations') || 'Expert Recommendations'}</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {analysis.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-4 p-4 bg-background/40 rounded-xl border border-border">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-gray-300">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
