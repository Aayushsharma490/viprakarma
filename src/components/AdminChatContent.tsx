'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Send, Loader2, User, Bot, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';

interface ChatSession {
    id: number;
    userName: string;
    astrologerName: string | null;
    serviceType: string;
    status: string;
    startTime: string;
    endTime: string | null;
    messageCount: number;
    lastMessage: string;
}

interface Message {
    id: number;
    content: string;
    sender: 'user' | 'astrologer' | 'admin';
    timestamp: string;
}

export default function AdminChatContent() {
    const router = useRouter();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        fetchChatSessions();
    }, []);

    const fetchChatSessions = async () => {
        try {
            const rawToken = localStorage.getItem('admin_token');
            let token: string | null = null;
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (typeof parsed === 'string') token = parsed;
                    else if (parsed && typeof parsed === 'object' && 'token' in parsed) token = (parsed as any).token;
                    else token = String(parsed);
                } catch (e) {
                    token = rawToken;
                }
            }

            if (token === '[object Object]') {
                const adminUserRaw = localStorage.getItem('admin_user');
                if (adminUserRaw) {
                    try {
                        const adminUser = JSON.parse(adminUserRaw);
                        if (adminUser && typeof adminUser === 'object' && 'token' in adminUser) {
                            token = (adminUser as any).token;
                        }
                    } catch (e) {
                        // ignore
                    }
                }
                if (!token || token === '[object Object]') {
                    const fallback = localStorage.getItem('token');
                    if (fallback) token = fallback;
                }
            }

            const response = await fetch('/api/admin/chat/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/admin/login');
                    return;
                }
                throw new Error('Failed to fetch chat sessions');
            }

            const data = await response.json();
            setSessions(data);
        } catch (error) {
            console.error('Error fetching chat sessions:', error);
            toast.error('Failed to load chat sessions');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (sessionId: number) => {
        try {
            const rawToken = localStorage.getItem('admin_token');
            let token: string | null = null;
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (typeof parsed === 'string') token = parsed;
                    else if (parsed && typeof parsed === 'object' && 'token' in parsed) token = (parsed as any).token;
                    else token = String(parsed);
                } catch (e) {
                    token = rawToken;
                }
            }

            const response = await fetch(`/api/admin/chat/sessions/${sessionId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const handleSessionSelect = async (session: ChatSession) => {
        setSelectedSession(session);
        await fetchMessages(session.id);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedSession) return;

        try {
            const rawToken = localStorage.getItem('admin_token');
            let token: string | null = null;
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (typeof parsed === 'string') token = parsed;
                    else if (parsed && typeof parsed === 'object' && 'token' in parsed) token = (parsed as any).token;
                    else token = String(parsed);
                } catch (e) {
                    token = rawToken;
                }
            }

            const response = await fetch(`/api/admin/chat/sessions/${selectedSession.id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: newMessage,
                    sender: 'admin'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setNewMessage('');
            await fetchMessages(selectedSession.id);
            toast.success('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleEndSession = async (sessionId: number) => {
        if (!confirm('Are you sure you want to end this chat session?')) return;

        try {
            const rawToken = localStorage.getItem('admin_token');
            let token: string | null = null;
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (typeof parsed === 'string') token = parsed;
                    else if (parsed && typeof parsed === 'object' && 'token' in parsed) token = (parsed as any).token;
                    else token = String(parsed);
                } catch (e) {
                    token = rawToken;
                }
            }

            const response = await fetch(`/api/admin/chat/sessions/${sessionId}/end`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to end session');
            }

            toast.success('Chat session ended successfully');
            await fetchChatSessions();
            if (selectedSession?.id === sessionId) {
                setSelectedSession(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('Error ending session:', error);
            toast.error('Failed to end session');
        }
    };

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.astrologerName && session.astrologerName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
        const matchesType = filterType === 'all' || session.serviceType === filterType;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-500">Active</Badge>;
            case 'ended':
                return <Badge variant="secondary">Ended</Badge>;
            case 'pending':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen cosmic-gradient">
            <AdminNavbar />

            <div className="container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4 text-cosmic">Chat Management</h1>
                    <p className="text-muted-foreground">Monitor and manage chat sessions between users and astrologers</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chat Sessions List */}
                    <div className="lg:col-span-1">
                        <Card className="glass-effect p-6">
                            <h2 className="text-2xl font-semibold mb-6 text-cosmic">Chat Sessions</h2>

                            {/* Filters */}
                            <div className="space-y-4 mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by user or astrologer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="ended">Ended</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="ai">AI Chat</SelectItem>
                                        <SelectItem value="astrologer">Astrologer Chat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sessions List */}
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {filteredSessions.map((session) => (
                                        <motion.div
                                            key={session.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedSession?.id === session.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                            onClick={() => handleSessionSelect(session)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-sm text-foreground">{session.userName}</h3>
                                                {getStatusBadge(session.status)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {session.astrologerName ? `with ${session.astrologerName}` : 'AI Assistant'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.messageCount} messages • {new Date(session.startTime).toLocaleDateString()}
                                            </p>
                                            {session.lastMessage && (
                                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                                    "{session.lastMessage}"
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {!loading && filteredSessions.length === 0 && (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No chat sessions found</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Chat Messages */}
                    <div className="lg:col-span-2">
                        <Card className="glass-effect p-6">
                            {selectedSession ? (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-semibold text-cosmic">
                                                Chat with {selectedSession.userName}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedSession.astrologerName ? `Astrologer: ${selectedSession.astrologerName}` : 'AI Assistant'}
                                            </p>
                                        </div>
                                        {selectedSession.status === 'active' && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleEndSession(selectedSession.id)}
                                            >
                                                End Session
                                            </Button>
                                        )}
                                    </div>

                                    {/* Messages */}
                                    <div className="h-96 overflow-y-auto mb-4 p-4 border border-border rounded-lg bg-background/50">
                                        {messages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground">No messages yet</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {messages.map((message) => (
                                                    <motion.div
                                                        key={message.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`flex gap-3 ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                                                    >
                                                        <div className={`flex gap-2 max-w-[70%] ${message.sender === 'user' ? 'flex-row' : 'flex-row-reverse'
                                                            }`}>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-primary' :
                                                                message.sender === 'admin' ? 'bg-amber-500' : 'bg-green-500'
                                                                }`}>
                                                                {message.sender === 'user' ? <User className="w-4 h-4 text-white" /> :
                                                                    message.sender === 'admin' ? <AlertCircle className="w-4 h-4 text-white" /> :
                                                                        <Bot className="w-4 h-4 text-white" />}
                                                            </div>
                                                            <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                                                                }`}>
                                                                <p className="text-sm">{message.content}</p>
                                                                <p className="text-xs opacity-70 mt-1">
                                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    {selectedSession.status === 'active' && (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message as admin..."
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                className="flex-1"
                                            />
                                            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-96">
                                    <div className="text-center">
                                        <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Select a Chat Session</h3>
                                        <p className="text-muted-foreground">Choose a session from the list to view messages and participate</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
