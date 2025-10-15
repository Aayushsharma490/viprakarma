'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Loader2, Hash, Sparkles, TrendingUp, Heart, Brain, Star, CheckCircle, Car, Users } from 'lucide-react';
import { calculateNumerology, type NumerologyData } from '@/lib/astrologyApi';

export default function NumerologyPage() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [numerologyData, setNumerologyData] = useState<NumerologyData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = calculateNumerology(formData.name, formData.dateOfBirth);
      setNumerologyData(data);
    } catch (error) {
      console.error('Numerology calculation error:', error);
      alert('Error calculating numerology. Please check your details.');
    } finally {
      setIsLoading(false);
    }
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
              Numerology Calculator
            </h1>
            <p className="text-xl text-gray-700">
              Discover the hidden meanings in your name and birth date with comprehensive insights
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Card className="classical-card p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <Hash className="w-6 h-6 text-amber-600" />
              Enter Your Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-900">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 border-amber-200 focus:border-amber-600"
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-gray-900">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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
                    Calculating...
                  </>
                ) : (
                  <>
                    <Hash className="mr-2 h-5 w-5" />
                    Calculate Numbers
                  </>
                )}
              </Button>
            </form>
          </Card>

          {numerologyData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Core Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="classical-card p-6 classical-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center classical-shadow">
                      <span className="text-3xl font-bold text-white">{numerologyData.lifePath}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold golden-text">Life Path Number</h3>
                      <p className="text-sm text-gray-600">Your life's journey and purpose</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{numerologyData.insights.lifePathMeaning}</p>
                  <div className="bg-amber-50 border border-amber-200 rounded p-3">
                    <p className="text-xs font-semibold text-amber-900 mb-2">Key Traits:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Natural leadership abilities</li>
                      <li>• Strong willpower and determination</li>
                      <li>• Independent and self-motivated</li>
                      <li>• Goal-oriented mindset</li>
                    </ul>
                  </div>
                </Card>

                <Card className="classical-card p-6 classical-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center classical-shadow">
                      <span className="text-3xl font-bold text-white">{numerologyData.destiny}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-900">Destiny Number</h3>
                      <p className="text-sm text-gray-600">Your ultimate life purpose</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{numerologyData.insights.destinyMeaning}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs font-semibold text-blue-900 mb-2">Career Paths:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Business and entrepreneurship</li>
                      <li>• Management and leadership roles</li>
                      <li>• Creative and artistic fields</li>
                      <li>• Professional services</li>
                    </ul>
                  </div>
                </Card>

                <Card className="classical-card p-6 classical-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center classical-shadow">
                      <span className="text-3xl font-bold text-white">{numerologyData.soulUrge}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-red-900">Soul Urge Number</h3>
                      <p className="text-sm text-gray-600">Your inner desires and motivation</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{numerologyData.insights.soulUrgeMeaning}</p>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-xs font-semibold text-red-900 mb-2">Inner Desires:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Personal freedom and independence</li>
                      <li>• Creative self-expression</li>
                      <li>• Meaningful relationships</li>
                      <li>• Spiritual growth and understanding</li>
                    </ul>
                  </div>
                </Card>

                <Card className="classical-card p-6 classical-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center classical-shadow">
                      <span className="text-3xl font-bold text-white">{numerologyData.personality}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-900">Personality Number</h3>
                      <p className="text-sm text-gray-600">How others perceive you</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{numerologyData.insights.personalityMeaning}</p>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-xs font-semibold text-green-900 mb-2">Public Image:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Confident and charismatic presence</li>
                      <li>• Natural social skills</li>
                      <li>• Positive first impressions</li>
                      <li>• Authentic self-expression</li>
                    </ul>
                  </div>
                </Card>

                {/* Driver Number */}
                <Card className="classical-card p-6 classical-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center classical-shadow">
                      <span className="text-3xl font-bold text-white">{numerologyData.driverNumber}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-purple-900">Driver Number</h3>
                      <p className="text-sm text-gray-600">Your driving force in life</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{numerologyData.insights.driverNumberMeaning}</p>
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <p className="text-xs font-semibold text-purple-900 mb-2">Life Approach:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Determined and focused approach</li>
                      <li>• Strong sense of direction</li>
                      <li>• Clear life objectives</li>
                      <li>• Persistent in achieving goals</li>
                    </ul>
                  </div>
                </Card>

                {/* Conductor Number */}
                <Card className="classical-card p-6 classical-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center classical-shadow">
                      <span className="text-3xl font-bold text-white">{numerologyData.conductorNumber}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-indigo-900">Conductor Number</h3>
                      <p className="text-sm text-gray-600">How you conduct your life journey</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{numerologyData.insights.conductorNumberMeaning}</p>
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
                    <p className="text-xs font-semibold text-indigo-900 mb-2">Life Management:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Excellent organizational skills</li>
                      <li>• Natural ability to guide others</li>
                      <li>• Strategic life planning</li>
                      <li>• Effective decision-making</li>
                    </ul>
                  </div>
                </Card>
              </div>

              {/* Complete Profile */}
              <Card className="classical-card p-8 bg-gradient-to-br from-amber-50 to-amber-100 classical-shadow">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-7 h-7 text-amber-600" />
                  <h3 className="text-2xl font-semibold golden-text">Your Complete Numerological Profile</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Your numbers reveal a unique cosmic blueprint that shapes your personality, life path, and destiny. 
                  Life Path <strong className="text-amber-900">{numerologyData.lifePath}</strong> combined with 
                  Destiny <strong className="text-amber-900">{numerologyData.destiny}</strong> suggests a powerful journey 
                  of self-discovery, achievement, and fulfillment. Your Soul Urge <strong className="text-amber-900">{numerologyData.soulUrge}</strong> drives 
                  your deepest motivations and desires, while Personality <strong className="text-amber-900">{numerologyData.personality}</strong> shapes 
                  how the world perceives and responds to you.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Strengths</h4>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Natural leadership and confidence</li>
                      <li>• Strong determination and willpower</li>
                      <li>• Creative problem-solving abilities</li>
                      <li>• Excellent communication skills</li>
                      <li>• Balanced emotional intelligence</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-gray-900">Life Recommendations</h4>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Pursue leadership opportunities</li>
                      <li>• Develop creative talents</li>
                      <li>• Build meaningful connections</li>
                      <li>• Trust your intuition</li>
                      <li>• Maintain work-life balance</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-600 text-white rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">💫 Expert Guidance Available</p>
                    <p className="text-sm text-amber-50">
                      Book a consultation with our expert numerologists for a personalized deep-dive reading 
                      and detailed guidance tailored to your unique numbers. Get specific career advice, 
                      relationship insights, and life path recommendations.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Additional Insights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="classical-card p-4 text-center">
                  <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Love Compatibility</h4>
                  <p className="text-xs text-gray-600">Best matches: Numbers 2, 6, 9</p>
                </Card>
                <Card className="classical-card p-4 text-center">
                  <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Lucky Days</h4>
                  <p className="text-xs text-gray-600">Sunday, Tuesday, Thursday</p>
                </Card>
                <Card className="classical-card p-4 text-center">
                  <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Driver Energy</h4>
                  <p className="text-xs text-gray-600">Strong, focused, determined</p>
                </Card>
                <Card className="classical-card p-4 text-center">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Conductor Style</h4>
                  <p className="text-xs text-gray-600">Organized, guiding, strategic</p>
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