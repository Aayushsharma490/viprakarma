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
    TrendingUp,
    Loader2,
    LogOut
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

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

export default function AdminDashboardContent() {
    const router = useRouter();
    const { t } = useLanguage();
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
        // Check admin authentication (coerce stored token to string if needed)
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

        if (!token) {
            router.push('/admin/login');
            return;
        }

        fetchDashboardData();
    }, [router]);

    const fetchDashboardData = async () => {
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
        { title: t('admin.dashboard.totalUsers'), value: stats.totalUsers, icon: Users, color: 'text-[#FFD700]' },
        { title: t('admin.dashboard.astrologers'), value: stats.totalAstrologers, icon: UserCheck, color: 'text-[#00F2FF]' },
        { title: t('admin.dashboard.bookings'), value: stats.totalBookings, icon: Calendar, color: 'text-amber-500' },
        { title: t('admin.dashboard.payments'), value: stats.totalPayments, icon: DollarSign, color: 'text-green-500' },
        { title: t('admin.dashboard.revenue'), value: `₹${stats.totalRevenue}`, icon: TrendingUp, color: 'text-emerald-500' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-24">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter font-sans leading-none mb-4">
                                Admin <span className="golden-text">Control</span>
                            </h1>
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">{t('admin.managePlatform')}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <Button onClick={() => router.push('/')} variant="outline" className="border-border text-foreground hover:bg-accent/10 text-xs font-black uppercase tracking-widest h-12 px-8 rounded-xl shadow-2xl backdrop-blur-md transition-colors">
                                {t('admin.home')}
                            </Button>
                            <Button onClick={handleLogout} variant="destructive" className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 border border-red-500/20 dark:border-red-900/40 text-xs font-black uppercase tracking-widest h-12 px-8 rounded-xl shadow-2xl backdrop-blur-md">
                                <LogOut className="w-4 h-4 mr-2" />
                                {t('admin.logout')}
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Card className="celestial-card p-8 group hover:border-primary/30 transition-all duration-500 bg-card/40 border-border rounded-3xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-full blur-2xl"></div>
                                        <div className={`w-12 h-12 rounded-2xl bg-accent/20 border border-border flex items-center justify-center mb-6 shadow-xl`}>
                                            <Icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                                        </div>
                                        <p className="text-3xl font-black text-foreground font-sans tracking-tighter mb-2">{stat.value}</p>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">{stat.title}</p>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-4 mb-10 pb-6 border-b border-white/5">
                        {[
                            { id: 'overview', label: t('admin.dashboard.overview') },
                            { id: 'bookings', label: t('admin.dashboard.recentBookings') }
                        ].map((tab) => (
                            <Button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                variant="ghost"
                                className={`text-xs font-black uppercase tracking-widest h-12 px-8 rounded-xl transition-all duration-500 ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(255,215,0,0.2)]' : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'}`}
                            >
                                {tab.label}
                            </Button>
                        ))}
                        <div className="flex-1" />
                        <div className="flex flex-wrap gap-2">
                            {[
                                { path: '/admin/payments', label: t('admin.dashboard.paymentVerifications') },
                                { path: '/admin/users', label: t('admin.dashboard.userManagement') },
                                { path: '/admin/pandits', label: t('admin.dashboard.managePandits') },
                                { path: '/admin/subscriptions', label: t('admin.dashboard.subscriptions') }
                            ].map((nav) => (
                                <Button
                                    key={nav.path}
                                    onClick={() => router.push(nav.path)}
                                    variant="outline"
                                    className="border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/50 text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-lg backdrop-blur-sm transition-all"
                                >
                                    {nav.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' ? (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="celestial-card p-8 border-border bg-card/60 backdrop-blur-xl rounded-[2.5rem]">
                                    <h2 className="text-2xl font-black text-foreground mb-10 uppercase tracking-tighter font-sans">{t('admin.dashboard.platformOverview')}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { icon: TrendingUp, label: t('admin.dashboard.platformGrowth'), desc: `${stats.totalUsers} ${t('admin.dashboard.registeredUsers')}`, color: 'text-green-400' },
                                            { icon: UserCheck, label: t('admin.dashboard.expertAstrologers'), desc: `${stats.totalAstrologers} ${t('admin.dashboard.verifiedAstrologers')}`, color: 'text-[#FFD700]' },
                                            { icon: DollarSign, label: t('admin.dashboard.totalRevenue'), desc: `₹${stats.totalRevenue} from ${stats.totalPayments} payments`, color: 'text-emerald-400' },
                                            { icon: Calendar, label: t('admin.dashboard.totalBookings'), desc: `${stats.totalBookings} ${t('admin.dashboard.consultationsBooked')}`, color: 'text-[#00F2FF]' }
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ x: 10 }}
                                                className="flex items-center gap-6 p-6 bg-accent/5 rounded-3xl border border-border transition-all duration-500 hover:border-primary/20"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-border flex items-center justify-center shadow-xl">
                                                    <item.icon className={`w-8 h-8 ${item.color}`} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground text-sm uppercase tracking-widest mb-1">{item.label}</p>
                                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{item.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="bookings"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="celestial-card p-8 border-border bg-card/60 backdrop-blur-xl rounded-[2.5rem]">
                                    <h2 className="text-2xl font-black text-foreground mb-10 uppercase tracking-tighter font-sans">{t('admin.dashboard.recentBookings')}</h2>
                                    <div className="space-y-4">
                                        {recentBookings.length === 0 ? (
                                            <p className="text-center text-gray-500 py-20 font-bold uppercase tracking-widest text-xs">{t('admin.dashboard.noBookings')}</p>
                                        ) : (
                                            recentBookings.map((booking, idx) => (
                                                <motion.div
                                                    key={booking.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-accent/5 rounded-3xl border border-border transition-all duration-500 hover:bg-accent/10 group"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-foreground text-sm uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{booking.userName}</p>
                                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
                                                            {booking.serviceType} {booking.astrologerName ? `with ${booking.astrologerName}` : ''}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] text-primary font-black uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                                                ₹{booking.amount}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                                {new Date(booking.scheduledDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl backdrop-blur-md ${booking.status === 'confirmed' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/30' :
                                                        booking.status === 'cancelled' ? 'bg-red-950/30 text-red-400 border border-red-500/30' :
                                                            'bg-primary/10 text-primary border border-primary/20'
                                                        }`}>
                                                        {booking.status.toUpperCase()}
                                                    </span>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
