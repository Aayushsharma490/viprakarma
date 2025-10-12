'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Upload, Loader2, Hand, CheckCircle, Image as ImageIcon, Star, Heart, Brain, TrendingUp } from 'lucide-react';

export default function PalmistryPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

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

    // Mock AI analysis with FASTER response
    setTimeout(() => {
      setAnalysis({
        lifeLine: {
          length: 'Long (extends to wrist)',
          depth: 'Deep and well-marked',
          clarity: 'Clear with no breaks',
          meaning: 'Indicates exceptional vitality, robust health, and strong life force. You possess remarkable resilience and will likely enjoy a long, healthy life. The depth suggests physical stamina and endurance.',
          predictions: ['Good health throughout life', 'Strong immune system', 'Quick recovery from illnesses', 'High energy levels'],
        },
        heartLine: {
          shape: 'Curved upward toward fingers',
          position: 'High on palm',
          clarity: 'Clear and unbroken',
          meaning: 'Shows profound emotional depth, strong romantic inclinations, and passionate nature. You value relationships deeply and express emotions freely. High position indicates idealistic love approach.',
          predictions: ['Deep, meaningful relationships', 'Strong emotional bonds', 'Romantic and passionate nature', 'Loyalty in partnerships'],
        },
        headLine: {
          clarity: 'Clear and well-defined',
          length: 'Long, extending across palm',
          curve: 'Slightly curved',
          meaning: 'Indicates sharp intellect, analytical thinking abilities, and strong decision-making skills. The length suggests comprehensive thinking and attention to detail. Slight curve shows balance between logic and creativity.',
          predictions: ['Excellent problem-solving abilities', 'Success in intellectual pursuits', 'Strategic thinking', 'Leadership potential'],
        },
        fateLine: {
          presence: 'Present and strong',
          clarity: 'Well-defined',
          position: 'Runs from wrist to middle finger',
          meaning: 'Suggests clear life direction, career success, and strong sense of purpose. Your path is well-defined and you have natural ability to achieve goals. Strong fate line indicates self-made success.',
          predictions: ['Career advancement', 'Financial stability', 'Achievement of goals', 'Recognition in profession'],
        },
        mounts: {
          jupiter: { prominence: 'Well-developed', meaning: 'Leadership, ambition, confidence' },
          saturn: { prominence: 'Balanced', meaning: 'Wisdom, discipline, responsibility' },
          apollo: { prominence: 'Prominent', meaning: 'Creativity, success, artistic talents' },
          mercury: { prominence: 'Moderate', meaning: 'Communication, business acumen' },
          venus: { prominence: 'Full', meaning: 'Love, passion, vitality' },
          luna: { prominence: 'Developed', meaning: 'Imagination, intuition, sensitivity' },
        },
        fingerAnalysis: {
          thumb: 'Strong and well-proportioned - indicates willpower and determination',
          index: 'Long - shows leadership and ambition',
          middle: 'Balanced - suggests stability and responsibility',
          ring: 'Prominent - indicates creativity and desire for recognition',
          pinky: 'Good length - shows communication skills',
        },
        specialMarks: [
          { type: 'Star on Jupiter mount', meaning: 'Sudden success and recognition' },
          { type: 'Triangle on fate line', meaning: 'Exceptional career achievement' },
          { type: 'Clear money line', meaning: 'Financial prosperity' },
        ],
        overall: 'Your palm reading reveals an exceptionally balanced and fortunate personality. Strong life force combined with emotional depth and intellectual capabilities create a powerful foundation for success. The well-defined fate line and prominent mounts indicate clear life direction and multiple talents. You are naturally equipped for leadership, creative pursuits, and forming deep relationships. Your palm suggests a life of achievement, good health, and emotional fulfillment.',
        recommendations: [
          'Focus on leadership roles in your career',
          'Develop your creative talents further',
          'Maintain work-life balance for optimal health',
          'Nurture your emotional connections',
          'Trust your intuition in decision-making',
        ],
      });
      setIsAnalyzing(false);
    }, 800); // Reduced from 3000ms to 800ms
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ChatBot />

      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 golden-text">
              Palmistry Analysis
            </h1>
            <p className="text-xl text-gray-700">
              Upload your palm image for comprehensive AI-powered insights and predictions
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="classical-card p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                <Hand className="w-6 h-6 text-amber-600" />
                Upload Palm Image
              </h2>

              <div className="space-y-6">
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
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">Click to upload</p>
                          <p className="text-sm text-gray-600">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    Tips for best results:
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Use natural bright lighting</li>
                    <li>• Keep palm flat and straight</li>
                    <li>• Capture full palm clearly with fingers</li>
                    <li>• Avoid shadows and reflections</li>
                    <li>• Use clean, dry hands</li>
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
                      Analyzing Palm...
                    </>
                  ) : (
                    <>
                      <Hand className="mr-2 h-5 w-5" />
                      Analyze Palm
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
                      Overall Analysis
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{analysis.overall}</p>
                  </Card>

                  <Card className="classical-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-600" />
                      Life Line
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-600">Length:</span>
                        <span className="text-gray-900 font-medium">{analysis.lifeLine.length}</span>
                        <span className="text-gray-600">Depth:</span>
                        <span className="text-gray-900 font-medium">{analysis.lifeLine.depth}</span>
                        <span className="text-gray-600">Clarity:</span>
                        <span className="text-gray-900 font-medium">{analysis.lifeLine.clarity}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.lifeLine.meaning}</p>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-xs font-semibold text-green-900 mb-1">Predictions:</p>
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
                      Heart Line
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-600">Shape:</span>
                        <span className="text-gray-900 font-medium">{analysis.heartLine.shape}</span>
                        <span className="text-gray-600">Position:</span>
                        <span className="text-gray-900 font-medium">{analysis.heartLine.position}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.heartLine.meaning}</p>
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-xs font-semibold text-red-900 mb-1">Predictions:</p>
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
                      Head Line
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-600">Clarity:</span>
                        <span className="text-gray-900 font-medium">{analysis.headLine.clarity}</span>
                        <span className="text-gray-600">Length:</span>
                        <span className="text-gray-900 font-medium">{analysis.headLine.length}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.headLine.meaning}</p>
                      <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <p className="text-xs font-semibold text-purple-900 mb-1">Predictions:</p>
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
                      Fate Line
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-600">Presence:</span>
                        <span className="text-gray-900 font-medium">{analysis.fateLine.presence}</span>
                        <span className="text-gray-600">Position:</span>
                        <span className="text-gray-900 font-medium">{analysis.fateLine.position}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.fateLine.meaning}</p>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Predictions:</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          {analysis.fateLine.predictions.map((pred: string, idx: number) => (
                            <li key={idx}>• {pred}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="classical-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Palm Mounts Analysis</h3>
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
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Recommendations</h3>
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
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">No Analysis Yet</h3>
                  <p className="text-gray-600">
                    Upload a palm image and click analyze to see your detailed results
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}