'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Users,
    Calendar,
    CreditCard,
    MessageSquare,
    Star,
    Settings,
    LayoutDashboard,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AdminSidebar({ activePage }: { activePage: string }) {
    const { adminLogout } = useAuth();
    const pathname = usePathname();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
        { id: 'astrologers', label: 'Astrologers', icon: Star, href: '/admin/astrologers' },
        { id: 'pooja-bookings', label: 'Pooja Bookings', icon: Calendar, href: '/admin/pooja-bookings' },
        { id: 'consultations', label: 'Consultations', icon: MessageSquare, href: '/admin/consultations' },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
        { id: 'payments', label: 'Payments', icon: CreditCard, href: '/admin/payments' },
        // { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <div className="w-64 bg-white shadow-lg h-screen flex flex-col sticky top-0">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-amber-600 flex items-center gap-2">
                    Admin
                </h2>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id || pathname === item.href;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-amber-100 text-amber-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={adminLogout}
                >
                    <LogOut size={18} className="mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
