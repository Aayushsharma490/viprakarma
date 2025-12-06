'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import { MessageCircle, CheckCircle, User, Mail, Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

function ConsultationPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    timeOfBirth: '',
    placeOfBirth: '',
    concerns: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Pre-fill user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleBookConsultation = async () => {
    if (!user) {
      toast.error('Please login to book a consultation');
      router.push('/login');
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.dob || !formData.timeOfBirth || !formData.placeOfBirth || !formData.concerns) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Open payment modal directly with consultation details
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentComplete(true);
    setPaymentModalOpen(false);
    toast.success('Payment details submitted successfully! Admin will verify your payment and activate your consultation.');

    // Show waiting message
    setTimeout(() => {
      toast.info('Please wait for admin approval. You will be notified once your consultation is approved.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 golden-text">
              Book Your Consultation
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Get personalized astrological guidance from expert astrologers
            </p>
          </motion.div>
        </div>
      </section>

      {/* Consultation Form */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center golden-text">
                Consultation Details
              </h2>
              <p className="text-gray-600 mb-8 text-center">
                Please provide your details for accurate astrological guidance
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeOfBirth">Time of Birth *</Label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="timeOfBirth"
                        type="time"
                        value={formData.timeOfBirth}
                        onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="placeOfBirth">Place of Birth *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                        placeholder="City, State, Country"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="concerns">Your Concerns/Questions *</Label>
                  <Textarea
                    id="concerns"
                    value={formData.concerns}
                    onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                    placeholder="Please describe your concerns, questions, or what you'd like guidance on..."
                    rows={4}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleBookConsultation}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating Request...' : 'Book Now - ₹299'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        amount={299}
        title="Chat Consultation"
        description="30 minutes chat consultation session"
        onSuccess={handlePaymentSuccess}
        userId={user?.id}
        consultationMode="chat"
        consultationDetails={formData}
      />

      <Footer />
    </div>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultationPageContent />
    </Suspense>
  );
}
