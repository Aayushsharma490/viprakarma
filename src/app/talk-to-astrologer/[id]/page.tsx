'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import PaymentModal from '@/components/PaymentModal';
import NorthIndianKundali from '@/components/NorthIndianKundali';
import { Send, Loader2, Phone, Video, MessageCircle, Lock, Calendar, MapPin, User, ChevronRight, ChevronLeft, X, Star } from 'lucide-react';

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
  const [kundaliData, setKundaliData] = useState<any>(null);
  const [showKundali, setShowKundali] = useState(false);
  const [isGeneratingKundali, setIsGeneratingKundali] = useState(false);
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

    // Generate Kundali
    generateKundali();
  };

  const generateKundali = async () => {
    if (!consultationData.dob || !consultationData.place) return;

    setIsGeneratingKundali(true);
    try {
      const [year, month, day] = consultationData.dob.split('-').map(Number);
      const [hour, minute] = (consultationData.time || '12:00').split(':').map(Number);

      const payload = {
        name: consultationData.name,
        gender: 'male', // Default or add to form
        year,
        month,
        day,
        hour,
        minute,
        second: 0,
        latitude: 26.9124, // Fallback or geocode place
        longitude: 75.7873, // Fallback or geocode place
        timezone: '+05:30',
        city: consultationData.place,
      };

      const response = await fetch('/api/kundali/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setKundaliData(data);
        setShowKundali(true);
      }
    } catch (error) {
      console.error('Failed to generate kundali:', error);
    } finally {
      setIsGeneratingKundali(false);
    }
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
    <div className="min-h-screen bg-transparent flex flex-col pt-16">
      <Navbar />

      <div className="fixed inset-0 stars-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 flex-grow container mx-auto px-4 py-8 flex flex-col overflow-hidden max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="celestial-card p-4 bg-card/40 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xl font-black text-primary-foreground shadow-lg">
                  {astrologer?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-foreground leading-tight">
                    {astrologer?.name || 'Astrologer'}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {astrologer?.specialization || 'Vedic Astrology Expert'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">₹{astrologer?.pricePerMinute || 0}/min</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Live Consultation</span>
                </div>
                <Button
                  onClick={() => setShowKundali(!showKundali)}
                  variant="outline"
                  size="sm"
                  className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl"
                >
                  {showKundali ? 'Hide Kundali' : 'Show Kundali'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-grow flex gap-4 overflow-hidden relative">
          {/* Chat Column */}
          <div className={`flex-grow flex flex-col transition-all duration-500 ${showKundali ? 'lg:w-1/2' : 'w-full'}`}>
            <Card className="celestial-card flex-grow flex flex-col overflow-hidden bg-card/40 border-border rounded-[2rem]">
              <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: message.senderId === userId ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-[1.5rem] px-5 py-3 shadow-xl ${message.senderId === userId
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-card/80 text-foreground border border-border rounded-tl-none'
                          }`}
                      >
                        <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                        <p className="text-[10px] font-bold opacity-60 mt-2 uppercase tracking-widest">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-card/80 border border-border rounded-2xl rounded-tl-none px-5 py-3 shadow-xl">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-background/20 backdrop-blur-md border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-grow bg-background/50 border-border focus:ring-primary h-14 rounded-2xl placeholder:text-muted-foreground/50"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90 w-14 h-14 rounded-2xl shadow-xl shadow-primary/20"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Kundali Column (Desktop Only or via Toggle) */}
          <AnimatePresence>
            {showKundali && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={`fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-0 lg:w-1/2 bg-background lg:bg-transparent p-4 lg:p-0 transition-all duration-500`}
              >
                <Card className="celestial-card h-full flex flex-col overflow-hidden bg-card/60 backdrop-blur-3xl border-border rounded-[2.5rem] p-6 lg:p-8 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKundali(false)}
                    className="lg:hidden absolute top-6 right-6 h-10 w-10 rounded-full hover:bg-accent/10"
                  >
                    <X className="w-6 h-6" />
                  </Button>

                  <div className="mb-6">
                    <h3 className="text-xl font-black uppercase tracking-tighter golden-text">Birth Chart</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visualization for {consultationData.name}</p>
                  </div>

                  <div className="flex-grow flex items-center justify-center overflow-auto min-h-0 bg-white/5 rounded-3xl p-4 border border-border/50 shadow-inner">
                    {isGeneratingKundali ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Calculating Alignment...</p>
                      </div>
                    ) : kundaliData ? (
                      <div className="transform scale-[0.7] sm:scale-75 md:scale-90 lg:scale-100 origin-center text-black">
                        <NorthIndianKundali
                          planets={Object.values(kundaliData.charts?.d1 || {}).flatMap((h: any) => h.planets.map((p: any) => ({ ...p, house: h.house })))}
                          houses={Object.values(kundaliData.charts?.d1 || {}).map((h: any) => ({ rashi: h.sign }))}
                        />
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">No Chart Data Available</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => router.push('/talk-to-astrologer')}
            variant="ghost"
            className="text-red-500/60 hover:text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest h-10 px-8 rounded-xl transition-all"
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