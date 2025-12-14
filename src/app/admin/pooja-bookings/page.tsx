'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

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
                    <div className="overflow-x-auto">
                        <div className="bg-white rounded-lg shadow overflow-hidden min-w-full">
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
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{booking.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{booking.userName || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{booking.userEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.poojaName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.date}</div>
                                                <div className="text-sm text-gray-500">{booking.time}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 truncate max-w-xs" title={booking.location}>
                                                    {booking.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm text-gray-500">{booking.phone}</div>
                                                    {booking.phone && (
                                                        <a
                                                            href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=Namaste, we have received your booking request for ${booking.poojaName}.`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-xs text-green-600 hover:text-green-700 font-medium"
                                                        >
                                                            <img
                                                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                                                alt="WhatsApp"
                                                                className="w-4 h-4 mr-1"
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
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                )}
            </div>

            <Footer />
        </div>
    );
}
