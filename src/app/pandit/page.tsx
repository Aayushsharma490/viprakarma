'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, User, Mail, Phone, Loader2, CheckCircle, Lock, MessageCircle, Phone as PhoneIcon, Video } from 'lucide-react';

interface Pandit {
  id: number;
  name: string;
  specialization: string;
  rating?: number;
  experience?: number;
  image?: string;
}

export default function PanditBookingPage() {
  const router = useRouter();
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [selectedPandit, setSelectedPandit] = useState<Pandit | null>(null);
  const [selectedMode, setSelectedMode] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    pujaType: '',
    date: '',
    time: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [bookingAmount, setBookingAmount] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log in again.');
      router.push('/login?redirect=/pandit');
      return;
    }

    // Load user data
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setFormData(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        }));
        setUserId(userData.id || null);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    // Load pandits
    fetchPandits();
  }, [router]);

  const fetchPandits = async () => {
    try {
      const response = await fetch('/api/astrologers/list');
      const data = await response.json();
      if (response.ok) {
        setPandits(data.astrologers || []);
      }
    } catch (error) {
      console.error('Failed to load pandits:', error);
    }
  };

  const handleConsultationClick = (pandit: Pandit, mode: string, amount: number) => {
    setSelectedPandit(pandit);
    setSelectedMode(mode);
    setBookingAmount(amount);
    setShowPaymentModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          astrologerId: selectedPandit?.id,
          mode: selectedMode,
          details: formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login?redirect=/pandit');
          return;
        }
        throw new Error(data.error || 'Failed to create consultation request');
      }

      // Open payment modal
      setBookingAmount(bookingAmount);
      setShowPaymentModal(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: '',
        pujaType: '',
        date: '',
        time: '',
        message: ''
      });
    }, 3000);
  };

  const pujaTypes = [
    'Ganesh Puja',
    'Satyanarayan Puja',
    'Griha Pravesh',
    'Vastu Shanti',
    'Wedding Ceremony',
    'Navgraha Shanti',
    'Other'
  ];

  if (submitted) {
    return (
      <div className="min-h-screen cosmic-gradient flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-cosmic mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            We will contact you shortly to confirm the details.
          </p>
        </motion.div>
      </div>
    );
  }

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
            Consult with Expert Astrologers
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your preferred consultation method and get personalized guidance
          </p>
        </motion.div>

        {/* Pandit Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {pandits.map((pandit) => (
            <Card key={pandit.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{pandit.name}</h3>
                <p className="text-sm text-muted-foreground">{pandit.specialization}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(pandit.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">({pandit.rating || 4.5})</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleConsultationClick(pandit, 'chat', 500)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat ₹500
                </Button>
                <Button
                  onClick={() => handleConsultationClick(pandit, 'call', 800)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call ₹800
                </Button>
                <Button
                  onClick={() => handleConsultationClick(pandit, 'video', 1000)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video ₹1000
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="glass-effect p-8 max-w-2xl mx-auto">
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10"
                    placeholder="City, State"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pujaType">Puja Type *</Label>
                <select
                  id="pujaType"
                  value={formData.pujaType}
                  onChange={(e) => setFormData({ ...formData, pujaType: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select a puja type</option>
                  {pujaTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date">Preferred Date *</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="time">Preferred Time *</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Additional Requirements</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please provide any specific requirements or questions..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">What to Expect:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Confirmation call within 24 hours</li>
                <li>✓ Experienced and verified pandits</li>
                <li>✓ All puja materials included</li>
                <li>✓ Detailed muhurat consultation</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 glow-purple"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Booking Request'
              )}
            </Button>
          </form>
        </Card>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={bookingAmount}
        title="Complete Consultation Payment"
        description="Complete payment to submit your consultation request"
        onSuccess={handlePaymentSuccess}
        userId={userId ?? undefined}
        consultationMode="chat"
        consultationDetails={formData}
      />

      <Footer />
    </div>
  );
}
