'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, MessageCircle, Video, Phone, Award, Clock, Languages } from 'lucide-react';

interface Astrologer {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  languages: string[];
  rating: number;
  totalConsultations: number;
  pricePerMinute: number;
  available: boolean;
  image?: string;
}

export default function TalkToAstrologerPage() {
  const router = useRouter();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available'>('all');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/talk-to-astrologer');
      return;
    }

    fetchAstrologers();
  }, [router]);

  const fetchAstrologers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/astrologers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAstrologers(data.astrologers || []);
      }
    } catch (error) {
      console.error('Failed to fetch astrologers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (astrologerId: number, type: 'chat' | 'call' | 'video') => {
    router.push(`/talk-to-astrologer/${astrologerId}?type=${type}`);
  };

  const filteredAstrologers = filter === 'available' 
    ? astrologers.filter(a => a.available)
    : astrologers;

  return (
    <div className="min-h-screen cosmic-gradient">
      <Navbar />
      
      <div className="fixed inset-0 stars-bg opacity-30 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-cosmic mb-4">
            Talk to Astrologers
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with verified expert astrologers for personalized guidance
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-primary' : ''}
          >
            All Astrologers
          </Button>
          <Button
            onClick={() => setFilter('available')}
            variant={filter === 'available' ? 'default' : 'outline'}
            className={filter === 'available' ? 'bg-primary' : ''}
          >
            Available Now
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredAstrologers.map((astrologer, index) => (
              <motion.div
                key={astrologer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="glass-effect p-6 h-full flex flex-col relative overflow-hidden">
                  {astrologer.available && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Online
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-center mb-4">
                    <Avatar className="w-24 h-24 mb-3 ring-2 ring-primary">
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white">
                        {astrologer.name.charAt(0)}
                      </div>
                    </Avatar>
                    
                    <h3 className="text-xl font-bold text-center">{astrologer.name}</h3>
                    <p className="text-sm text-muted-foreground">{astrologer.specialization}</p>
                  </div>

                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-primary" />
                      <span>{astrologer.experience} years experience</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Languages className="w-4 h-4 text-primary" />
                      <span>{astrologer.languages.join(', ')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{astrologer.rating} ({astrologer.totalConsultations} consultations)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-semibold">₹{astrologer.pricePerMinute}/min</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleConnect(astrologer.id, 'chat')}
                      variant="outline"
                      size="sm"
                      disabled={!astrologer.available}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">Chat</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleConnect(astrologer.id, 'call')}
                      variant="outline"
                      size="sm"
                      disabled={!astrologer.available}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-xs">Call</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleConnect(astrologer.id, 'video')}
                      variant="outline"
                      size="sm"
                      disabled={!astrologer.available}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                    >
                      <Video className="w-4 h-4" />
                      <span className="text-xs">Video</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredAstrologers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {filter === 'available' 
                ? 'No astrologers are currently available. Please check back later.'
                : 'No astrologers found.'}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}