'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    Users,
    Calendar,
    CreditCard,
    MessageSquare,
    Star,
    Settings,
    LayoutDashboard,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AdminSidebar({ activePage }: { activePage: string }) {
    const { adminLogout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
        { id: 'astrologers', label: 'Astrologers', icon: Star, href: '/admin/astrologers' },
        { id: 'pooja-bookings', label: 'Pooja Bookings', icon: Calendar, href: '/admin/pooja-bookings' },
        { id: 'consultations', label: 'Consultations', icon: MessageSquare, href: '/admin/consultations' },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
        { id: 'payments', label: 'Payments', icon: CreditCard, href: '/admin/payments' },
    ];

    const SidebarContent = () => (
        <>
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
                            onClick={() => setIsMobileMenuOpen(false)}
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
        </>
    );

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 bg-white shadow-lg h-screen flex-col sticky top-0">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Drawer */}
            {isMobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50 flex flex-col">
                        <SidebarContent />
                    </div>
                </>
            )}
        </>
    );
}
