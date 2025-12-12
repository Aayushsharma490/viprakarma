'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Upload, User, ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

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
  userId: number;
  astrologerId: number;
  sessionType: string;
  status: string;
  startTime: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

export default function AstrologerChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [astrologer, setAstrologer] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSessionId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (sessionId) {
      checkAuth();
      loadSession();
      loadMessages();
      // Set up polling for new messages
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = () => {
    const token = localStorage.getItem('astrologer_token');
    const astrologerData = localStorage.getItem('astrologer_user');

    if (!token || !astrologerData) {
      router.push('/astrologer/login');
      return;
    }

    try {
      setAstrologer(JSON.parse(astrologerData));
    } catch (error) {
      router.push('/astrologer/login');
    }
  };

  const loadSession = async () => {
    try {
      const token = localStorage.getItem('astrologer_token');
      if (!token) return;

      const response = await fetch(`/api/astrologer/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const currentSession = data.sessions.find((s: any) => s.id === parseInt(sessionId));
        if (currentSession) {
          setSession(currentSession);
        } else {
          toast.error('Session not found');
          router.push('/astrologer/dashboard');
        }
      } else if (response.status === 401) {
        router.push('/astrologer/login');
      }
    } catch (error) {
      console.error('Load session error:', error);
      toast.error('Failed to load session');
    }
  };

  const loadMessages = async () => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem('astrologer_token');
      const response = await fetch(`/api/chat/astrologer/messages?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
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
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId || isSending) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('astrologer_token');
      const response = await fetch('/api/chat/astrologer/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: parseInt(sessionId),
          content: newMessage,
          messageType: 'text',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages(); // Refresh messages
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
    if (!file || !sessionId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    try {
      const token = localStorage.getItem('astrologer_token');
      const response = await fetch('/api/upload/chat-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session not found</h2>
          <p className="text-gray-600 mb-4">The chat session you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/astrologer/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/astrologer/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chat Session #{session.id}</h1>
                <p className="text-sm text-gray-600">with {session.userName}</p>
              </div>
            </div>
            <Badge className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{session.userName}</h3>
                    <p className="text-sm text-gray-600">Active now</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(session.startTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'astrologer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderType === 'astrologer'
                          ? 'bg-purple-600 text-white'
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
                      <p className={`text-xs mt-1 ${message.senderType === 'astrologer' ? 'text-purple-100' : 'text-gray-500'}`}>
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
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
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

          {/* User Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.userName}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{session.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{session.userPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session:</span>
                    <span className="font-medium">#{session.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={getStatusColor(session.status)} variant="outline">
                      {session.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
