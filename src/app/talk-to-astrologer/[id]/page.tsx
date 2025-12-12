'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import PaymentModal from '@/components/PaymentModal';
import { Send, Loader2, Phone, Video, MessageCircle, Lock, Calendar, MapPin, User } from 'lucide-react';

interface Message {
  id: string;
  senderId: number;
  content: string;
  timestamp: Date;
}

function AstrologerChatContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const astrologerId = params?.id;
  const chatType = searchParams?.get('type') || 'chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [astrologer, setAstrologer] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [showConsultationForm, setShowConsultationForm] = useState(true);
  const [consultationData, setConsultationData] = useState({
    name: '',
    dob: '',
    time: '',
    place: '',
    question: ''
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login?redirect=/talk-to-astrologer');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUserId(userData.id);
      fetchAstrologer();
    } catch (e) {
      router.push('/login');
    }
  }, [router, astrologerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAstrologer = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/astrologers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const found = data.astrologers?.find((a: any) => a.id === parseInt(astrologerId as string));
        setAstrologer(found);
      }
    } catch (error) {
      console.error('Failed to fetch astrologer:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !userId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      senderId: userId,
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate astrologer response (in production, this would use Socket.io)
    setTimeout(() => {
      const responses = [
        "Thank you for your question. Based on your chart, I can see significant planetary influences at play.",
        "That's an interesting observation. Let me analyze the current transits affecting your situation.",
        "According to Vedic astrology principles, this period indicates important changes ahead.",
        "I understand your concern. The planetary positions suggest you should consider these remedies.",
        "Your query relates to the 7th house in your chart. Let me explain what this means for you."
      ];

      const astrologerMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: parseInt(astrologerId as string),
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, astrologerMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getIcon = () => {
    switch (chatType) {
      case 'call': return <Phone className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      default: return <MessageCircle className="w-5 h-5" />;
    }
  };

  const handleConsultationSubmit = () => {
    // Validate form
    if (!consultationData.name || !consultationData.dob || !consultationData.question) {
      return;
    }

    // Show payment modal
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentModalOpen(false);
    setShowConsultationForm(false);

    // Start the consultation
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      senderId: parseInt(astrologerId as string),
      content: `Namaste ${consultationData.name}! I have received your birth details and question. Let me analyze your chart and provide you with insights. Please give me a moment to prepare your personalized reading.`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  if (showConsultationForm) {
    return (
      <div className="min-h-screen cosmic-gradient flex flex-col">
        <Navbar />

        <div className="fixed inset-0 stars-bg opacity-30 pointer-events-none" />

        <div className="relative z-10 flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl"
          >
            <Card className="glass-effect p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white">
                  {astrologer?.name?.charAt(0) || 'A'}
                </div>
                <h1 className="text-3xl font-bold text-cosmic mb-2">
                  Consultation with {astrologer?.name}
                </h1>
                <p className="text-muted-foreground">
                  Please provide your birth details for accurate predictions
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        value={consultationData.name}
                        onChange={(e) => setConsultationData({ ...consultationData, name: e.target.value })}
                        className="pl-10"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="dob"
                        type="date"
                        value={consultationData.dob}
                        onChange={(e) => setConsultationData({ ...consultationData, dob: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="time">Time of Birth</Label>
                    <Input
                      id="time"
                      type="time"
                      value={consultationData.time}
                      onChange={(e) => setConsultationData({ ...consultationData, time: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="place">Place of Birth</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="place"
                        value={consultationData.place}
                        onChange={(e) => setConsultationData({ ...consultationData, place: e.target.value })}
                        className="pl-10"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="question">Your Question *</Label>
                  <Textarea
                    id="question"
                    value={consultationData.question}
                    onChange={(e) => setConsultationData({ ...consultationData, question: e.target.value })}
                    placeholder="Please describe your question or concern in detail..."
                    className="mt-1 min-h-[100px]"
                    required
                  />
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Consultation Details
                  </h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>• Type: {chatType.charAt(0).toUpperCase() + chatType.slice(1)}</p>
                    <p>• Duration: Minimum 15 minutes</p>
                    <p>• Rate: ₹{astrologer?.pricePerMinute || 0}/minute</p>
                    <p>• Payment: Required before consultation begins</p>
                  </div>
                </div>

                <Button
                  onClick={handleConsultationSubmit}
                  className="w-full bg-primary hover:bg-primary/90 glow-purple"
                  size="lg"
                >
                  Start Consultation (₹{astrologer?.pricePerMinute || 0}/min)
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          amount={astrologer?.pricePerMinute * 15 || 0} // Minimum 15 minutes
          title={`Consultation with ${astrologer?.name}`}
          description={`15-minute minimum consultation via ${chatType}`}
          onSuccess={handlePaymentSuccess}
          userId={userId || undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-gradient flex flex-col">
      <Navbar />

      <div className="fixed inset-0 stars-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 flex-grow container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-effect p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white">
                  {astrologer?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{astrologer?.name || 'Astrologer'}</h2>
                  <p className="text-sm text-muted-foreground">{astrologer?.specialization || 'Vedic Astrology'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getIcon()}
                <span className="text-sm capitalize">{chatType}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <Card className="glass-effect flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.senderId === userId
                    ? 'bg-primary text-white'
                    : 'bg-muted/50 text-foreground'
                    }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted/50 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your question...`}
                className="flex-grow"
                disabled={isLoading}
              />

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Consultation in progress • ₹{astrologer?.pricePerMinute || 0}/minute
            </p>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <Button
            onClick={() => router.push('/talk-to-astrologer')}
            variant="outline"
          >
            End Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AstrologerChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <AstrologerChatContent />
    </Suspense>
  );
}