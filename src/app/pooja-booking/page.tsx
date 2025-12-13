'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PoojaBookingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        poojaName: '',
        date: '',
        time: '',
        location: '',
        purpose: '',
        phone: '',
        email: '',
        occasion: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Get user ID from localStorage (assuming simplified auth for now)
            // Ideally this should use a proper auth context
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error('Please login to book a pooja');
            }
            const user = JSON.parse(userStr);

            const res = await fetch('/api/pooja-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, userId: user.id }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit booking');
            }

            setSuccess('Pooja booking request submitted successfully! We will contact you shortly.');
            setFormData({
                poojaName: '',
                date: '',
                time: '',
                location: '',
                purpose: '',
                phone: '',
                email: '',
                occasion: '',
                description: ''
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center text-orange-800 mb-8">Book a Pooja</h1>

                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-orange-100">
                    {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}
                    {success && <div className="bg-green-100 text-green-700 p-4 rounded mb-6">{success}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Pooja Name *</label>
                                <input
                                    type="text"
                                    name="poojaName"
                                    value={formData.poojaName}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Satyanarayan Pooja"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Occasion</label>
                                <input
                                    type="text"
                                    name="occasion"
                                    value={formData.occasion}
                                    onChange={handleChange}
                                    placeholder="e.g. House Warming"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Preferred Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Location/Address *</label>
                            <textarea
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                rows={3}
                                placeholder="Full address where pooja will be performed"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91..."
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Purpose/Notes</label>
                            <textarea
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Any specific requirements or purpose..."
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-70"
                        >
                            {loading ? 'Submitting...' : 'Book Pooja'}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
