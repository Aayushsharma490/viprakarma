'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, UserCog, CreditCard, MessageSquare, LogOut, Languages, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminNavbar() {
    const router = useRouter();
    const { language, toggleLanguage, t } = useLanguage();

    const handleToggleLanguage = () => {
        toggleLanguage();
        toast.success(language === 'en' ? 'भाषा हिंदी में बदली गई' : 'Language changed to English');
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        toast.success(t('admin.logout'));
        router.push('/admin/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: t('admin.dashboard'), path: '/admin' },
        { icon: UserCog, label: t('admin.pandits'), path: '/admin/pandits' },
        { icon: CreditCard, label: t('admin.subscriptions'), path: '/admin/subscriptions' },
        { icon: ScrollText, label: t('admin.pooja.title'), path: '/admin/pooja-bookings' },
        { icon: MessageSquare, label: t('admin.whatsapp'), path: '/admin/whatsapp' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-amber-600">{t('admin.title')}</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 whitespace-nowrap"
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="hidden md:inline">{item.label}</span>
                            </Button>
                        ))}

                        {/* Language Toggle */}
                        <Button
                            onClick={handleToggleLanguage}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Languages className="w-4 h-4" />
                            <span className="hidden md:inline">{language === 'en' ? 'हिं' : 'EN'}</span>
                        </Button>

                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">{t('logout')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
