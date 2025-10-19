'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import { Phone, Video, MessageCircle, Clock, Star, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const consultationTypes = [
  {
    id: 'chat',
    title: 'Chat Consultation',
    icon: MessageCircle,
    duration: '30 minutes',
    price: 299,
    features: [
      'Text-based consultation',
      'Instant responses',
      'Share charts and images',
      'Save chat history',
    ],
    color: '#d97706',
  },
  {
    id: 'call',
    title: 'Voice Call',
    icon: Phone,
    duration: '30 minutes',
    price: 499,
    features: [
      'Voice consultation',
      'Personal interaction',
      'Ask questions in real-time',
      'Call recording available',
    ],
    color: '#f59e0b',
  },
  {
    id: 'video',
    title: 'Video Call',
    icon: Video,
    duration: '30 minutes',
    price: 699,
    features: [
      'Face-to-face consultation',
      'Show your palm/face',
      'Visual demonstrations',
      'Recording included',
    ],
    color: '#fbbf24',
  },
];

export default function ConsultationPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  const handleBookConsultation = (typeId: string) => {
    setSelectedType(typeId);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentComplete(true);
    toast.success('Payment successful! Starting your consultation session...');
    
    // Simulate session activation
    setTimeout(() => {
      setSessionActive(true);
      toast.success('Consultation session is now active! Connecting you with an astrologer...');
    }, 2000);
  };

  const selectedConsultation = consultationTypes.find(t => t.id === selectedType);

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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 golden-text">
              Talk to Expert Astrologers
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Get personalized guidance from certified astrologers via chat, call, or video consultation
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-amber-900">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                <span className="font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span className="font-medium">50+ Expert Astrologers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Consultation Options */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {consultationTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="classical-card p-8 classical-hover h-full group">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto"
                    style={{
                      background: `linear-gradient(135deg, ${type.color}, ${type.color}dd)`,
                    }}
                  >
                    <type.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-2 text-center text-gray-900">
                    {type.title}
                  </h3>

                  <div className="flex items-center justify-center gap-2 mb-6 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{type.duration}</span>
                  </div>

                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-amber-900">₹{type.price}</span>
                    <span className="text-gray-600 text-sm ml-2">per session</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleBookConsultation(type.id)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    size="lg"
                  >
                    Book Now
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 golden-text">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to connect with expert astrologers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: '1', title: 'Choose Service', desc: 'Select chat, call, or video consultation' },
              { step: '2', title: 'Make Payment', desc: 'Secure payment via Razorpay or QR code' },
              { step: '3', title: 'Get Connected', desc: 'Instantly connect with an expert astrologer' },
              { step: '4', title: 'Receive Guidance', desc: 'Get personalized cosmic insights and remedies' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold classical-shadow">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Session */}
      {sessionActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <Card className="max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 golden-text">Session Active!</h3>
            <p className="text-gray-600 mb-6">
              Your {selectedConsultation?.title} session is now active. An astrologer will join shortly.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setSessionActive(false)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                Enter Session
              </Button>
              <Button
                onClick={() => {
                  setSessionActive(false);
                  setPaymentComplete(false);
                  setSelectedType(null);
                }}
                variant="outline"
                className="w-full border-amber-600 text-amber-900"
              >
                Close
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Payment Modal */}
      {selectedConsultation && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          amount={selectedConsultation.price}
          title={selectedConsultation.title}
          description={`${selectedConsultation.duration} consultation session`}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <Footer />
    </div>
  );
}