'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import { Send, Loader2, Phone, Video, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  senderId: number;
  content: string;
  timestamp: Date;
}

export default function AstrologerChatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const astrologerId = params.id;
  const chatType = searchParams.get('type') || 'chat';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [astrologer, setAstrologer] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);
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
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Start your consultation with {astrologer?.name}</p>
                <p className="text-sm mt-2">Rate: ₹{astrologer?.pricePerMinute || 0}/min</p>
              </div>
            )}

            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.senderId === userId
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
