'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Upload, Camera, MessageCircle, Phone, Video } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Pandit {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  languages: string;
  rating: number;
  pricePerHour: number;
  location: string;
  description: string;
  imageUrl?: string;
  available: boolean;
  createdAt: string;
}

export default function TalkToAstrologerPage() {
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    fetchPandits();
  }, []);

  const fetchPandits = async () => {
    try {
      const response = await fetch('/api/pandits');
      if (!response.ok) {
        throw new Error('Failed to fetch pandits');
      }
      const data = await response.json();
      setPandits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load pandits');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (panditId: number, type: 'chat' | 'call' | 'video') => {
    if (!token) {
      toast.error('Please login to connect with a pandit');
      router.push('/login');
      return;
    }

    // Navigate to the specific pandit page with the connection type
    router.push(`/talk-to-astrologer/${panditId}?type=${type}`);
  };

  if (loading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading pandits...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchPandits} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('consultation.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('consultation.subtitle')}
            </p>
          </div>

          {/* Pandits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pandits.map((pandit) => (
              <Card key={pandit.id} className="bg-white/80 backdrop-blur-sm border-amber-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={pandit.imageUrl} alt={pandit.name} />
                    <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
                      {pandit.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl text-gray-900">{pandit.name}</CardTitle>
                  <CardDescription className="text-amber-700 font-medium">
                    {pandit.specialization}
                  </CardDescription>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium">{pandit.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="ml-1 text-sm">{pandit.experience} years</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {pandit.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {pandit.languages.split(',').map((lang, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {lang.trim()}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">₹{pandit.pricePerHour}</span>/hour
                      </div>
                      <Badge variant={pandit.available ? "default" : "secondary"}>
                        {pandit.available ? "Available" : "Busy"}
                      </Badge>
                    </div>



                    {/* Payment Integration */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => router.push('/payment?service=consultation&panditId=' + pandit.id)}
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        size="sm"
                      >
                        Book Consultation (₹{pandit.pricePerHour}/hour)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pandits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No pandits available at the moment.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
