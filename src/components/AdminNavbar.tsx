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
        <div className="bg-background/80 backdrop-blur-2xl border-b border-border fixed top-0 left-0 right-0 z-[100] shadow-2xl">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-3 group px-4">
                        <span className="text-xl font-black text-foreground uppercase tracking-tighter font-sans">
                            Admin <span className="golden-text">Viprakarma</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 whitespace-nowrap text-muted-foreground hover:text-primary hover:bg-accent/10 transition-all duration-300 px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="hidden lg:inline">{item.label}</span>
                            </Button>
                        ))}

                        <div className="h-6 w-[1px] bg-border mx-2 hidden md:block"></div>

                        {/* Language Toggle */}
                        <Button
                            onClick={handleToggleLanguage}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-border bg-card/40 text-muted-foreground hover:text-foreground hover:border-primary/20 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-lg backdrop-blur-sm"
                        >
                            <Languages className="w-4 h-4" />
                            <span className="hidden md:inline">{language === 'en' ? 'हिं' : 'EN'}</span>
                        </Button>

                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
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
