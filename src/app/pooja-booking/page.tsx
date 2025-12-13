'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import PoojaRatingModal from '@/components/PoojaRatingModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function PoojaBookingPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [showRatingModal, setShowRatingModal] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Get user ID from localStorage (assuming simplified auth for now)
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

            setSuccess(t('pooja.success') || 'Pooja booking request submitted successfully! We will contact you shortly.');
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

            // Optional: Show rating modal after success (if we considered it "completed" instantly, but technically it is just booked)
            // setShowRatingModal(true); 

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
                <h1 className="text-3xl font-bold text-center text-orange-800 mb-8">{t('pooja.title') || "Book a Pooja"}</h1>

                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-orange-100">
                    {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}
                    {success && <div className="bg-green-100 text-green-700 p-4 rounded mb-6">{success}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="poojaName" className="mb-2 block">{t('pooja.name') || "Pooja Name"} *</Label>
                                <Select
                                    value={formData.poojaName}
                                    onValueChange={(value) => setFormData({ ...formData, poojaName: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('pooja.selectPlaceholder') || "Select a Pooja"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            "Satyanarayan Pooja",
                                            "Ganesh Puja",
                                            "Lakshmi Puja",
                                            "Rudrabhishek",
                                            "Griha Pravesh",
                                            "Mahamrityunjaya Jaap",
                                            "Navagraha Shanti",
                                            "Vastu Shanti",
                                            "Kalsarp Dosh Nivas",
                                            "Mangal Dosh Nivas",
                                            "Vivah Sanskar",
                                            "Engagement Ceremony",
                                            "Namkaran Sanskar",
                                            "Mundan",
                                            "Shradh / Pitru Paksha",
                                            "Sunderkand",
                                            "Durga Path",
                                            "Saraswati Puja"
                                        ].map((pooja) => (
                                            <SelectItem key={pooja} value={pooja}>
                                                {pooja}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="occasion" className="mb-2 block">{t('pooja.occasion') || "Occasion"}</Label>
                                <Input
                                    type="text"
                                    name="occasion"
                                    value={formData.occasion}
                                    onChange={handleChange}
                                    placeholder="e.g. House Warming"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="date" className="mb-2 block">{t('pooja.date') || "Date"} *</Label>
                                <Input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="time" className="mb-2 block">{t('pooja.time') || "Time"} *</Label>
                                <Input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="location" className="mb-2 block">{t('pooja.location') || "Location/Address"} *</Label>
                            <Textarea
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                rows={3}
                                placeholder="Full address where pooja will be performed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="phone" className="mb-2 block">{t('pooja.phone') || "Phone Number"} *</Label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className="mb-2 block">{t('pooja.email') || "Email"} *</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description" className="mb-2 block">{t('pooja.notes') || "Purpose/Notes"}</Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Any specific requirements or purpose..."
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg"
                        >
                            {loading ? (t('pooja.submitting') || 'Submitting...') : (t('pooja.bookButton') || 'Book Pooja')}
                        </Button>
                    </form>

                    {/* Rate Us Section */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-600 mb-4">{t('pooja.ratePrompt') || "Completed a Pooja recently?"}</p>
                        <Button
                            variant="link"
                            onClick={() => setShowRatingModal(true)}
                            className="text-orange-600 hover:text-orange-700 font-medium underline p-0 h-auto"
                        >
                            {t('pooja.rateButton') || "Rate Your Experience"}
                        </Button>
                    </div>
                </div>

                <PoojaRatingModal
                    isOpen={showRatingModal}
                    onClose={() => setShowRatingModal(false)}
                    poojaName={formData.poojaName || "Pooja"}
                />
            </main>
            <Footer />
        </div>
    );
}
