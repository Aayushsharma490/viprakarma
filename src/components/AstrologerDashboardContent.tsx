'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Clock, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChatSession {
    id: number;
    userId: number;
    userName: string;
    sessionType: string;
    status: string;
    startTime: string;
    messageCount: number;
    lastMessage: string;
}

export default function AstrologerDashboardContent() {
    const router = useRouter();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [astrologer, setAstrologer] = useState<any>(null);

    useEffect(() => {
        checkAuth();
        fetchSessions();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('astrologer_token');
        const astrologerData = localStorage.getItem('astrologer_user');

        if (!token || !astrologerData) {
            toast.error('Session expired. Please log in again.');
            router.push('/astrologer/login');
            return;
        }

        try {
            setAstrologer(JSON.parse(astrologerData));
        } catch (error) {
            toast.error('Session expired. Please log in again.');
            router.push('/astrologer/login');
        }
    };

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('astrologer_token');
            if (!token) return;

            const response = await fetch('/api/astrologer/sessions', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions || []);
            } else if (response.status === 401) {
                router.push('/astrologer/login');
            }
        } catch (error) {
            console.error('Fetch sessions error:', error);
            toast.error('Failed to load chat sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('astrologer_token');
        localStorage.removeItem('astrologer_user');
        router.push('/astrologer/login');
    };

    const handleEndChat = async (sessionId: number) => {
        try {
            const token = localStorage.getItem('astrologer_token');
            if (!token) return;

            const response = await fetch('/api/chat/astrologer/end', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ sessionId }),
            });

            if (response.ok) {
                toast.success('Chat session ended successfully');
                fetchSessions(); // Refresh the sessions list
            } else {
                toast.error('Failed to end chat session');
            }
        } catch (error) {
            console.error('Error ending chat:', error);
            toast.error('Failed to end chat session');
        }
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Astrologer Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {astrologer?.name}</p>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center">
                            <MessageSquare className="w-8 h-8 text-purple-600 mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                                <p className="text-gray-600">Total Sessions</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-green-600 mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {sessions.filter(s => s.status === 'active').length}
                                </p>
                                <p className="text-gray-600">Active Chats</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-blue-600 mr-4" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {sessions.filter(s => s.status === 'completed').length}
                                </p>
                                <p className="text-gray-600">Completed Sessions</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Chat Sessions */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Chat Sessions</h2>

                    {sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No chat sessions yet</h3>
                            <p className="text-gray-600">Sessions will appear here when users start chatting with you.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sessions.map((session) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    Session #{session.id}
                                                </h3>
                                                <Badge className={getStatusColor(session.status)}>
                                                    {session.status}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-2">
                                                User: {session.userName}
                                            </p>

                                            <p className="text-sm text-gray-600 mb-2">
                                                Started: {new Date(session.startTime).toLocaleString()}
                                            </p>

                                            <p className="text-sm text-gray-600">
                                                Messages: {session.messageCount}
                                            </p>

                                            {session.lastMessage && (
                                                <p className="text-sm text-gray-500 mt-2 italic">
                                                    "{session.lastMessage.length > 100
                                                        ? session.lastMessage.substring(0, 100) + '...'
                                                        : session.lastMessage}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="ml-4 flex flex-col gap-2">
                                            <Button
                                                onClick={() => router.push(`/astrologer/chat/${session.id}`)}
                                                className="bg-purple-600 hover:bg-purple-700"
                                                disabled={session.status !== 'active'}
                                            >
                                                {session.status === 'active' ? 'Continue Chat' : 'View Chat'}
                                            </Button>
                                            {session.status === 'active' && (
                                                <Button
                                                    onClick={() => handleEndChat(session.id)}
                                                    variant="outline"
                                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                                >
                                                    End Chat
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
