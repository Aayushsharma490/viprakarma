'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

type Booking = {
    id: number;
    userName: string;
    userEmail: string;
    poojaName: string;
    date: string;
    time: string;
    location: string;
    phone: string;
    status: string;
    createdAt: string;
};

export default function AdminPoojaBookingsPage() {
    const { t } = useLanguage();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/pooja-bookings')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setBookings(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen cosmic-gradient">
            <AdminNavbar />

            <div className="container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4 text-cosmic">{t('admin.poojaBookings.title') || 'Pooja Bookings'}</h1>
                    <p className="text-muted-foreground">{t('admin.poojaBookings.subtitle') || 'Manage all pooja booking requests'}</p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Mobile View: Card List */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {bookings.map((booking) => (
                                <Card key={booking.id} className="p-4 bg-white shadow-sm border border-gray-100 rounded-xl">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                ID #{booking.id}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 mt-1">{booking.poojaName}</h3>
                                        </div>
                                        <select
                                            value={booking.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
                                                fetch(`/api/admin/pooja-bookings/${booking.id}/status`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: newStatus })
                                                }).catch(() => {
                                                    setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: booking.status } : b));
                                                });
                                            }}
                                            className={`px-3 py-1 text-xs font-bold rounded-full border-0 cursor-pointer ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">User</p>
                                            <p className="text-sm font-medium text-gray-800 truncate">{booking.userName}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Contact</p>
                                            <p className="text-sm font-medium text-gray-800">{booking.phone}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Date</p>
                                            <p className="text-sm font-medium text-gray-800">{booking.date}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Time</p>
                                            <p className="text-sm font-medium text-gray-800">{booking.time}</p>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {booking.phone && (
                                                <a
                                                    href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=Namaste, we have received your booking request for ${booking.poojaName}.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                                >
                                                    <img
                                                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                                        alt="WhatsApp"
                                                        className="w-3.5 h-3.5 mr-1.5"
                                                    />
                                                    WhatsApp
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-400 italic">Created at: {new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Desktop View: Table (Hidden on small screens) */}
                        <div className="hidden md:block overflow-x-auto">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-w-full">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.user') || 'User'}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.poojaBookings.poojaDetails') || 'Pooja Details'}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.poojaBookings.datetime') || 'Date & Time'}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.poojaBookings.location') || 'Location'}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.phone') || 'Contact'}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.subscriptions.status') || 'Status'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">#{booking.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">{booking.userName || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500">{booking.userEmail}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{booking.poojaName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{booking.date}</div>
                                                    <div className="text-xs text-gray-500">{booking.time}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-700 truncate max-w-xs" title={booking.location}>
                                                        {booking.location}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-medium text-gray-700">{booking.phone}</div>
                                                        {booking.phone && (
                                                            <a
                                                                href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=Namaste, we have received your booking request for ${booking.poojaName}.`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-xs text-green-600 hover:text-green-700 font-bold"
                                                            >
                                                                <img
                                                                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                                                    alt="WhatsApp"
                                                                    className="w-3.5 h-3.5 mr-1"
                                                                />
                                                                {t('admin.payments.whatsapp') || 'WhatsApp'}
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={booking.status}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            // Optimistic update
                                                            setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));

                                                            fetch(`/api/admin/pooja-bookings/${booking.id}/status`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ status: newStatus })
                                                            }).then(res => {
                                                                if (!res.ok) throw new Error('Failed to update status');
                                                            }).catch(err => {
                                                                console.error(err);
                                                                // Revert on error
                                                                setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: booking.status } : b));
                                                            });
                                                        }}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-full border-0 cursor-pointer ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        <option value="pending">{t('admin.pandits.pending') || 'Pending'}</option>
                                                        <option value="approved">{t('admin.pandits.approved') || 'Approved'}</option>
                                                        <option value="completed">{t('admin.poojaBookings.completed') || 'Completed'}</option>
                                                        <option value="cancelled">{t('admin.poojaBookings.cancelled') || 'Cancelled'}</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
