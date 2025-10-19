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
  Loader2,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalAstrologers: number;
  totalBookings: number;
  totalPayments: number;
  totalRevenue: number;
}

interface Booking {
  id: number;
  userName: string;
  astrologerName: string | null;
  serviceType: string;
  amount: number;
  status: string;
  scheduledDate: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAstrologers: 0,
    totalBookings: 0,
    totalPayments: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview');

  useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem('admin_token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');

      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Simplified - no auth header needed
      const response = await fetch('/api/admin/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.stats);
      setRecentBookings(data.recentBookings);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-amber-500 to-amber-600' },
    { title: 'Astrologers', value: stats.totalAstrologers, icon: UserCheck, color: 'from-amber-600 to-amber-700' },
    { title: 'Bookings', value: stats.totalBookings, icon: Calendar, color: 'from-amber-700 to-amber-800' },
    { title: 'Payments', value: stats.totalPayments, icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Revenue', value: `₹${stats.totalRevenue}`, icon: TrendingUp, color: 'from-green-600 to-green-700' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold golden-text">Viprakarma Admin</h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">Manage your astrology platform</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button onClick={() => router.push('/')} variant="outline" className="border-amber-600 text-amber-900 text-sm md:text-base">
                Home
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="text-sm md:text-base">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="classical-card p-4 md:p-6 hover:shadow-xl transition-shadow">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs md:text-sm text-gray-600">{stat.title}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            <Button
              onClick={() => setActiveTab('overview')}
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              className={`${activeTab === 'overview' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-600 text-amber-900'} text-sm md:text-base`}
            >
              Overview
            </Button>
            <Button
              onClick={() => setActiveTab('bookings')}
              variant={activeTab === 'bookings' ? 'default' : 'outline'}
              className={`${activeTab === 'bookings' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-600 text-amber-900'} text-sm md:text-base`}
            >
              Recent Bookings
            </Button>
            <Button
              onClick={() => router.push('/admin/payments')}
              variant="outline"
              className="border-amber-600 text-amber-900 hover:bg-amber-50 text-sm md:text-base"
            >
              Payment Verifications
            </Button>
            <Button
              onClick={() => router.push('/admin/users')}
              variant="outline"
              className="border-amber-600 text-amber-900 hover:bg-amber-50 text-sm md:text-base"
            >
              User Management
            </Button>
            <Button
              onClick={() => router.push('/admin/pandits')}
              variant="outline"
              className="border-amber-600 text-amber-900 hover:bg-amber-50 text-sm md:text-base"
            >
              Manage Pandits
            </Button>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <Card className="classical-card p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 golden-text">Platform Overview</h2>
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Platform Growth</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {stats.totalUsers} registered users and growing
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Expert Astrologers</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {stats.totalAstrologers} verified astrologers on platform
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Total Revenue</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      ₹{stats.totalRevenue} generated from {stats.totalPayments} payments
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Calendar className="w-6 h-6 md:w-8 md:h-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Total Bookings</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {stats.totalBookings} consultations booked
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card className="classical-card p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 golden-text">Recent Bookings</h2>
              <div className="space-y-3 md:space-y-4">
                {recentBookings.length === 0 ? (
                  <p className="text-center text-gray-600 py-6 md:py-8 text-sm md:text-base">No bookings found</p>
                ) : (
                  recentBookings.map(booking => (
                    <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{booking.userName}</p>
                        <p className="text-xs md:text-sm text-gray-600 mb-1">
                          {booking.serviceType} {booking.astrologerName ? `with ${booking.astrologerName}` : ''}
                        </p>
                        <p className="text-xs md:text-sm text-amber-700">
                          {new Date(booking.scheduledDate).toLocaleDateString()} • ₹{booking.amount}
                        </p>
                      </div>
                      <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
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
