'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalAstrologers: number;
  totalBookings: number;
  totalRevenue: number;
  aiChats: number;
  pendingBookings: number;
}

interface Astrologer {
  id: number;
  name: string;
  email: string;
  specialization: string;
  status: string;
}

interface Booking {
  id: number;
  userName: string;
  type: string;
  scheduledDate: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAstrologers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    aiChats: 0,
    pendingBookings: 0
  });
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'astrologers' | 'bookings'>('overview');

  useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/login?redirect=/admin');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.email !== 'admin@kundali.com') {
        router.push('/');
        return;
      }
    } catch (e) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch users
      const usersRes = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();

      // Fetch astrologers
      const astrologersRes = await fetch('/api/astrologers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const astrologersData = await astrologersRes.json();

      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();

      // Fetch payments
      const paymentsRes = await fetch('/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const paymentsData = await paymentsRes.json();

      // Fetch chat sessions
      const chatsRes = await fetch('/api/chat-sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const chatsData = await chatsRes.json();

      // Calculate stats
      const totalRevenue = paymentsData.payments?.reduce((sum: number, p: any) => 
        sum + parseFloat(p.amount || 0), 0) || 0;
      
      const pendingBookings = bookingsData.bookings?.filter((b: any) => 
        b.status === 'pending').length || 0;

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalAstrologers: astrologersData.astrologers?.length || 0,
        totalBookings: bookingsData.bookings?.length || 0,
        totalRevenue: totalRevenue,
        aiChats: chatsData.chatSessions?.length || 0,
        pendingBookings: pendingBookings
      });

      setAstrologers(astrologersData.astrologers || []);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAstrologerStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/astrologers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update astrologer status:', error);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { title: 'Astrologers', value: stats.totalAstrologers, icon: UserCheck, color: 'from-purple-500 to-violet-500' },
    { title: 'Bookings', value: stats.totalBookings, icon: Calendar, color: 'from-pink-500 to-rose-500' },
    { title: 'Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { title: 'AI Chats', value: stats.aiChats, icon: MessageSquare, color: 'from-orange-500 to-amber-500' },
    { title: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'from-red-500 to-orange-500' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-gradient flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-gradient">
      <div className="fixed inset-0 stars-bg opacity-30 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-cosmic">Admin Dashboard</h1>
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Home
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="glass-effect p-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-cosmic">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setActiveTab('overview')}
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              className={activeTab === 'overview' ? 'bg-primary' : ''}
            >
              Overview
            </Button>
            <Button
              onClick={() => setActiveTab('astrologers')}
              variant={activeTab === 'astrologers' ? 'default' : 'outline'}
              className={activeTab === 'astrologers' ? 'bg-primary' : ''}
            >
              Astrologers
            </Button>
            <Button
              onClick={() => setActiveTab('bookings')}
              variant={activeTab === 'bookings' ? 'default' : 'outline'}
              className={activeTab === 'bookings' ? 'bg-primary' : ''}
            >
              Bookings
            </Button>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <Card className="glass-effect p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-semibold">Platform Growth</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalUsers} registered users and growing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold">AI Chat Sessions</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.aiChats} total conversations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-semibold">Total Revenue</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{stats.totalRevenue.toFixed(2)} generated
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'astrologers' && (
            <Card className="glass-effect p-6">
              <h2 className="text-2xl font-bold mb-4">Astrologer Applications</h2>
              <div className="space-y-4">
                {astrologers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No astrologers found</p>
                ) : (
                  astrologers.map(astrologer => (
                    <div key={astrologer.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-semibold">{astrologer.name}</p>
                        <p className="text-sm text-muted-foreground">{astrologer.email}</p>
                        <p className="text-sm text-primary">{astrologer.specialization}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          astrologer.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                          astrologer.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {astrologer.status}
                        </span>
                      </div>
                      {astrologer.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAstrologerStatus(astrologer.id, 'approved')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAstrologerStatus(astrologer.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card className="glass-effect p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Bookings</h2>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No bookings found</p>
                ) : (
                  bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-semibold">{booking.userName}</p>
                        <p className="text-sm text-muted-foreground">{booking.type}</p>
                        <p className="text-sm text-primary">
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                        booking.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}