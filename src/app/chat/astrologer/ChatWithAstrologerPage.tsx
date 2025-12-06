'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Upload, Mic, MicOff, User, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Astrologer {
  id: number;
  name: string;
  specializations: string[];
  experience: number;
  rating: number;
  totalConsultations: number;
  hourlyRate: number;
  bio: string;
  photo: string;
  isOnline: boolean;
}

interface Message {
  id: number;
  senderId: number;
  senderType: 'user' | 'astrologer';
  messageType: 'text' | 'image' | 'voice';
  content: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
}

interface ChatSession {
  id: number;
  astrologerId: number;
  astrologer: Astrologer;
  messages: Message[];
  status: string;
  startTime: string;
}

export default function ChatWithAstrologerPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'active' | 'completed' | 'pending' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [canChat, setCanChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionEndedRef = useRef(false);

  const getAuthHeaders = (): Record<string, string> => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    checkChatEligibility();
  }, [user, router]);

  useEffect(() => {
    if (canChat) {
      loadAstrologers();
      const astrologerId = searchParams.get('astrologer');
      if (astrologerId) {
        autoStartChat(parseInt(astrologerId));
      }
    }
  }, [canChat, searchParams]);

  useEffect(() => {
    if (chatSession && astrologers.length > 0) {
      const match = astrologers.find(a => a.id === chatSession.astrologerId);
      if (match) {
        setSelectedAstrologer(match);
      }
    }
  }, [chatSession, astrologers]);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
      const interval = setInterval(() => loadMessages(activeSessionId), 3000);
      return () => clearInterval(interval);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkChatEligibility = async () => {
    try {
      const statusResponse = await fetch(`/api/user/chat-status?userId=${user?.id}`);
      let canChatWithAstrologer = false;
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        canChatWithAstrologer = statusData.canChatWithAstrologer;
        setCanChat(canChatWithAstrologer);
      }

      if (!token) {
        setIsLoading(false);
        return;
      }

      const existingHeaders = getAuthHeaders();
      if (existingHeaders) {
        const existingSessionResponse = await fetch('/api/chat/astrologer/start', {
          method: 'GET',
          headers: existingHeaders,
        });

        if (existingSessionResponse.ok) {
          const existingData = await existingSessionResponse.json();
          if (existingData.session) {
            setChatSession(existingData.session);
            setActiveSessionId(existingData.session.id);
            setSessionStatus(existingData.session.status || null);
            if (existingData.session.status === 'active') {
              setCanChat(true);
              sessionEndedRef.current = false;
            } else {
              sessionEndedRef.current = true;
            }
          } else {
            setActiveSessionId(null);
            setSessionStatus(null);
          }
        }
      }
    } catch (error) {
      console.error('Error checking chat eligibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAstrologers = async () => {
    try {
      const response = await fetch('/api/astrologers/list');
      if (response.ok) {
        const data = await response.json();
        setAstrologers(data.astrologers);
      }
    } catch (error) {
      console.error('Error loading astrologers:', error);
      toast.error('Failed to load astrologers');
    }
  };

  const startChatWithAstrologer = async (astrologerId: number, astrologer?: Astrologer | null) => {
    const headers = getAuthHeaders();
    if (!headers) {
      toast.error('Please login to start a chat');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/chat/astrologer/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ astrologerId }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatSession(data.session);
        setActiveSessionId(data.session.id);
        setSessionStatus('active');
        setCanChat(true);
        if (astrologer) {
          setSelectedAstrologer(astrologer);
        } else {
          const found = astrologers.find(a => a.id === astrologerId);
          if (found) {
            setSelectedAstrologer(found);
          }
        }
        toast.success('Chat session started!');
        sessionEndedRef.current = false;
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.error || 'Failed to start chat session');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat session');
    }
  };

  const autoStartChat = async (astrologerId: number) => {
    await startChatWithAstrologer(astrologerId);
  };

  const startChat = async (astrologer: Astrologer) => {
    if (chatSession && chatSession.astrologerId !== astrologer.id && sessionStatus === 'active') {
      toast.error('You already have an active chat. Please end it before starting a new one.');
      return;
    }

    if (chatSession && chatSession.astrologerId === astrologer.id && sessionStatus === 'completed') {
      toast.error('This chat session has been completed by astrologer. Please book a new consultation.');
      return;
    }

    await startChatWithAstrologer(astrologer.id, astrologer);
  };

  const loadMessages = async (sessionId?: number) => {
    const targetSessionId = sessionId || activeSessionId || chatSession?.id;
    if (!targetSessionId) return;

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/chat/astrologer/messages?sessionId=${targetSessionId}`, {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => {
          // Only update if messages have changed to prevent unnecessary scrolling
          if (prev.length === data.messages.length && 
              prev[prev.length - 1]?.id === data.messages[data.messages.length - 1]?.id) {
            return prev;
          }
          return data.messages;
        });
        setSessionStatus(data.session?.status || null);
        if (data.session) {
          setChatSession(data.session);
          setActiveSessionId(data.session.id);
        }
        if (data.session?.status && data.session.status !== 'active' && !sessionEndedRef.current) {
          sessionEndedRef.current = true;
          toast.info('Chat session has been ended.');
          setCanChat(false);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatSession || isSending || sessionStatus !== 'active' || !canChat) return;

    setIsSending(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/chat/astrologer/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          sessionId: chatSession.id,
          content: newMessage,
          messageType: 'text',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !chatSession) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', chatSession.id.toString());

    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/upload/chat-file', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.ok) {
        loadMessages(); // Refresh messages
        toast.success('File uploaded successfully');
      } else {
        toast.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!canChat && !chatSession) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8">
              <Star className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat with Astrologer</h1>
              <p className="text-gray-600 mb-6">
                To chat with our expert astrologers, you need to have an approved payment verification.
                Please submit a payment verification request and wait for admin approval.
              </p>
              <Button
                onClick={() => router.push('/profile')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Go to Profile
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Chat with Astrologer</h1>

          {!chatSession ? (
            // Astrologer Selection
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {astrologers.map((astrologer) => {
                const isCurrentAstrologer = !!chatSession && (chatSession as any).astrologerId === astrologer.id;
                const hasActiveDifferentSession = Boolean(chatSession) && sessionStatus === 'active' && !isCurrentAstrologer;
                const buttonDisabled = !canChat || hasActiveDifferentSession || !astrologer.isOnline;

                let buttonText = 'Start Chat';
                if (!astrologer.isOnline) {
                  buttonText = 'Offline';
                } else if (isCurrentAstrologer && sessionStatus === 'active') {
                  buttonText = 'Resume Chat';
                } else if (isCurrentAstrologer && sessionStatus === 'completed') {
                  buttonText = 'Completed';
                } else if (!canChat) {
                  buttonText = 'Locked';
                }

                // Hide or disable 'Continue Chat' if session completed
                const showButton = !(isCurrentAstrologer && sessionStatus === 'completed');

                return (
                  <Card key={astrologer.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{astrologer.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{astrologer.bio}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {astrologer.specializations.map((spec, index) => (
                            <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span>{astrologer.experience} years exp.</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-400" />
                            {astrologer.rating}
                          </span>
                          <span>₹{astrologer.hourlyRate}/hr</span>
                        </div>
                        {showButton && (
                          <Button
                            onClick={() => startChat(astrologer)}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={buttonDisabled}
                          >
                            {buttonText}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Chat Interface
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat Area */}
              <div className="lg:col-span-3">
                <Card className="h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-amber-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedAstrologer?.name}</h3>
                        <p className="text-sm text-gray-600">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderType === 'user'
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          {message.messageType === 'text' && (
                            <p className="text-sm">{message.content}</p>
                          )}
                          {message.messageType === 'image' && message.fileUrl && (
                            <img
                              src={message.fileUrl}
                              alt={message.fileName}
                              className="max-w-full rounded"
                            />
                          )}
                          {message.messageType === 'voice' && message.fileUrl && (
                            <audio controls className="max-w-full">
                              <source src={message.fileUrl} type="audio/mpeg" />
                            </audio>
                          )}
                          <p className={`text-xs mt-1 ${message.senderType === 'user' ? 'text-amber-100' : 'text-gray-500'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*,audio/*"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                        className={`flex-shrink-0 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSending || sessionStatus !== 'active' || !canChat}
                        className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Astrologer Info */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedAstrologer?.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{selectedAstrologer?.bio}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{selectedAstrologer?.experience} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                          {selectedAstrologer?.rating}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium">₹{selectedAstrologer?.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
