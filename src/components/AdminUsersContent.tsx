'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, UserX, Ban, CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subscriptionPlan: string;
    isAdmin: boolean;
    canChatWithAstrologer: boolean;
    createdAt: string;
    paymentVerifications?: {
        id: number;
        status: string;
        amount: number;
        createdAt: string;
    }[];
}

export default function AdminUsersContent() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const rawToken = localStorage.getItem('admin_token');

            // Coerce token to a string in case it was stored as a JSON object by mistake.
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

            // Handle cases where an object was stored without JSON.stringify
            if (token === '[object Object]') {
                // Try to recover token from admin_user or fallback to generic token
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
                toast.error('Admin session expired. Please log in again.');
                // Force navigation to admin login so the user can re-authenticate
                router.push('/admin/login');
                return;
            }

            // DEBUG: log token before fetch (temporary)
            try { console.debug('DEBUG fetchUsers admin_token (type):', typeof token, token); } catch { };

            const response = await fetch('/api/admin/users?limit=all', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                // API says token is invalid — redirect to login so user can re-authenticate
                router.push('/admin/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId: number, action: 'ban' | 'unban' | 'promote' | 'demote' | 'enable_chat' | 'disable_chat') => {
        try {
            const rawToken = localStorage.getItem('admin_token');

            let token: string | null = null;
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (typeof parsed === 'string') token = parsed;
                    else if (parsed && typeof parsed === 'object') {
                        // Common fields that may contain the actual token
                        token = parsed.token || parsed.accessToken || parsed.access_token || parsed.jwt || parsed.authToken || null;
                        if (!token) token = String(parsed);
                    } else token = String(parsed);
                } catch (e) {
                    token = rawToken;
                }
            }

            // If we recovered a token from an object, persist the fixed string value so future reads are simple
            if (token && rawToken && rawToken !== token) {
                try { localStorage.setItem('admin_token', String(token)); } catch (e) { }
            }

            if (!token) {
                toast.error('Admin session expired. Please log in again.');
                router.push('/admin/login');
                return;
            }

            // DEBUG: log token before PATCH (temporary)
            try { console.debug('DEBUG handleStatusChange admin_token (type):', typeof token, token); } catch { };

            const response = await fetch(`/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action }),
            });

            if (response.status === 401) {
                router.push('/admin/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            toast.success('User status updated successfully');
            await fetchUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = filterPlan === 'all' || user.subscriptionPlan === filterPlan;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'admin' && user.isAdmin) ||
            (filterStatus === 'user' && !user.isAdmin);

        return matchesSearch && matchesPlan && matchesStatus;
    });

    const getStatusBadge = (user: User) => {
        if (user.isAdmin) {
            return <Badge variant="destructive">Admin</Badge>;
        }
        return <Badge variant="secondary">{user.subscriptionPlan}</Badge>;
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
                    <h1 className="text-4xl font-bold mb-4 text-cosmic">{t('admin.dashboard.userManagement')}</h1>
                    <p className="text-muted-foreground">{t('admin.users.manageUsers')}</p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder={t('admin.users.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterPlan} onValueChange={setFilterPlan}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder={t('admin.users.filterPlan')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('admin.users.allPlans')}</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder={t('admin.users.filterStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('admin.users.allUsers')}</SelectItem>
                            <SelectItem value="admin">{t('admin.users.admins')}</SelectItem>
                            <SelectItem value="user">{t('admin.users.regularUsers')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="glass-effect p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-foreground">{user.name}</h3>
                                                {getStatusBadge(user)}
                                            </div>
                                            <p className="text-primary mb-1">{user.email}</p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {t('admin.users.phone')} {user.phone || 'Not provided'} • {t('admin.users.joined')} {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                            {user.paymentVerifications && user.paymentVerifications.length > 0 && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-muted-foreground">{t('admin.dashboard.paymentsText')}:</span>
                                                    {user.paymentVerifications.slice(0, 2).map((pv: any) => (
                                                        <Badge
                                                            key={pv.id}
                                                            variant={pv.status === 'approved' ? 'default' : pv.status === 'rejected' ? 'destructive' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            ₹{pv.amount} - {pv.status}
                                                        </Badge>
                                                    ))}
                                                    {user.paymentVerifications.length > 2 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{user.paymentVerifications.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {!user.isAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(user.id, 'promote')}
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    <UserCheck className="w-4 h-4 mr-1" />
                                                    {t('admin.users.makeAdmin')}
                                                </Button>
                                            )}
                                            {user.isAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(user.id, 'demote')}
                                                    className="text-orange-600 hover:text-orange-700"
                                                >
                                                    <UserX className="w-4 h-4 mr-1" />
                                                    {t('admin.users.removeAdmin')}
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusChange(user.id, 'ban')}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Ban className="w-4 h-4 mr-1" />
                                                {t('admin.users.ban')}
                                            </Button>
                                            <Badge
                                                variant={user.canChatWithAstrologer ? 'default' : 'outline'}
                                                className="flex items-center gap-1"
                                            >
                                                <MessageSquare className="w-3 h-3" />
                                                {user.canChatWithAstrologer ? t('admin.users.chatEnabled') : t('admin.users.chatDisabled')}
                                            </Badge>
                                            {user.canChatWithAstrologer ? (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleStatusChange(user.id, 'disable_chat')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    {t('admin.users.disableChat')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleStatusChange(user.id, 'enable_chat')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    {t('admin.users.enableChat')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('admin.users.noUsers')}</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
