'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Loader2, Search, X } from 'lucide-react';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface Astrologer {
    id: number;
    name: string;
    email: string;
    // Password is write-only
    specializations: string[];
    experience: number;
    // languages and location added in schema
    languages?: string;
    location?: string;
    rating: number;
    hourlyRate: number; // mapped from pricePerHour concept
    description?: string; // mapped to bio
    photo?: string; // mapped from imageUrl concept
    isOnline: boolean;
    isApproved: boolean;
    createdAt: string;
}

export default function AdminPanditsContent() {
    const { t } = useLanguage();
    const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        specializations: '',
        experience: 0,
        languages: '',
        rating: 4.5,
        hourlyRate: 1000,
        location: '',
        bio: '',
        photo: '',
        isOnline: false,
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    useEffect(() => {
        fetchAstrologers();
    }, []);

    const fetchAstrologers = async () => {
        try {
            const response = await fetch('/api/astrologers?limit=100');
            const data = await response.json();
            setAstrologers(data);
        } catch (error) {
            console.error('Error fetching astrologers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formDataUpload,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData({ ...formData, photo: data.url });
            } else {
                console.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingId
                ? `/api/astrologers?id=${editingId}`
                : '/api/astrologers';

            const method = editingId ? 'PUT' : 'POST';

            // Convert comma separated strings to array
            const specializationsArray = formData.specializations
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || '+910000000000', // Add default phone if missing
                specializations: specializationsArray,
                experience: formData.experience,
                hourlyRate: formData.hourlyRate,
                languages: formData.languages,
                location: formData.location,
                bio: formData.bio,
                photo: formData.photo,
                isOnline: formData.isOnline, // Add isOnline to payload
            };

            // Remove empty password if editing
            if (editingId && !payload.password) {
                delete (payload as any).password;
            }

            console.log('Sending payload:', payload);

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchAstrologers();
                resetForm();
            } else {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                alert(`Error: ${errorData.error || 'Failed to save'}`);
            }
        } catch (error) {
            console.error('Error saving astrologer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (astro: Astrologer) => {
        setEditingId(astro.id);
        setFormData({
            name: astro.name,
            email: astro.email || '',
            password: '',
            phone: (astro as any).phone || '',
            specializations: Array.isArray(astro.specializations) ? astro.specializations.join(', ') : '',
            experience: astro.experience,
            languages: astro.languages || '',
            rating: astro.rating || 0,
            hourlyRate: astro.hourlyRate,
            location: astro.location || '',
            bio: astro.description || '',
            photo: astro.photo || '',
            isOnline: astro.isOnline || false,
        });
        setShowForm(true);

        // Scroll to top to show the form
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.pandits.deleteConfirm'))) return;

        try {
            await fetch(`/api/astrologers?id=${id}`, { method: 'DELETE' });
            await fetchAstrologers();
        } catch (error) {
            console.error('Error deleting astrologer:', error);
        }
    };

    const handleToggleApproval = async (id: number, currentStatus: boolean) => {
        setProcessingAction(`toggle-${id}`);
        try {
            const response = await fetch(`/api/astrologers?id=${id}`, { // Using PUT for approval update
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            await fetchAstrologers();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setProcessingAction(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            specializations: '',
            experience: 0,
            languages: '',
            rating: 4.5,
            hourlyRate: 1000,
            location: '',
            bio: '',
            photo: '',
            isOnline: false,
        });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredAstrologers = astrologers.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(a.specializations) && a.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (a.location && a.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen cosmic-gradient">
            <AdminNavbar />

            <div className="container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4 text-cosmic">{t('admin.pandits.title')}</h1>
                    <p className="text-muted-foreground">{t('admin.pandits.subtitle')}</p>
                </motion.div>

                {/* Search and Add Button */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder={t('admin.pandits.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-primary hover:bg-primary/90 glow-purple"
                    >
                        {showForm ? (
                            <>
                                <X className="mr-2 w-4 h-4" />
                                {t('admin.pandits.cancel')}
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 w-4 h-4" />
                                {t('admin.pandits.addAstrologer')}
                            </>
                        )}
                    </Button>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Card className="glass-effect p-6">
                            <h2 className="text-2xl font-semibold mb-6 text-cosmic">
                                {editingId ? t('admin.pandits.editAstrologer') : t('admin.pandits.addNewAstrologer')}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+919999999999"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Password {editingId ? '(Leave blank to keep)' : '*'}</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingId}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="specializations">Specializations (comma separated) *</Label>
                                        <Input
                                            id="specializations"
                                            value={formData.specializations}
                                            onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                                            placeholder="Vedic, Tarot, Numerology"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="experience">Experience (years) *</Label>
                                        <Input
                                            id="experience"
                                            type="number"
                                            min="0"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="languages">Languages *</Label>
                                        <Input
                                            id="languages"
                                            value={formData.languages}
                                            onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                                            placeholder="Hindi, English"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rating">Rating (0-5)</Label>
                                        <Input
                                            id="rating"
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="hourlyRate">Hourly Rate (₹) *</Label>
                                        <Input
                                            id="hourlyRate"
                                            type="number"
                                            min="1"
                                            value={formData.hourlyRate}
                                            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="location">Location *</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="photo">Image URL</Label>
                                        <Input
                                            id="photo"
                                            value={formData.photo}
                                            onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="uploadImage">Upload Image</Label>
                                        <Input
                                            id="uploadImage"
                                            type="file"
                                            accept="image/*"
                                            disabled={uploadingImage}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(file);
                                            }}
                                        />
                                        {uploadingImage && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="bio">Bio / Description</Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isOnline"
                                        checked={formData.isOnline}
                                        onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <Label htmlFor="isOnline">Available for booking (Online)</Label>
                                </div>
                                <div className="flex gap-4">
                                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                                        {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
                                        {editingId ? t('admin.pandits.update') : t('admin.pandits.create')} {t('admin.pandits.astrologer')}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        {t('admin.pandits.cancel')}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {/* Astrologers List */}
                {loading && !showForm ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredAstrologers.map((astro) => (
                            <motion.div
                                key={astro.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="glass-effect p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-foreground">{astro.name}</h3>
                                                <span className={`px-2 py-1 text-xs rounded ${astro.isOnline ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                                    {astro.isOnline ? t('admin.pandits.online') : t('admin.pandits.offline')}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded ${astro.isApproved ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                    {astro.isApproved ? t('admin.pandits.approved') : t('admin.pandits.pending')}
                                                </span>
                                            </div>
                                            <p className="text-primary mb-1">
                                                {Array.isArray(astro.specializations) ? astro.specializations.join(', ') : astro.specializations}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {astro.experience} {t('admin.pandits.yearsExp')} • {astro.languages} • {astro.location}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-muted-foreground">{t('admin.pandits.rating')}: {astro.rating}⭐</span>
                                                <span className="text-muted-foreground">₹{astro.hourlyRate}{t('admin.pandits.perHour')}</span>
                                            </div>
                                            {astro.email && (
                                                <p className="text-sm text-muted-foreground mt-1">{t('admin.pandits.emailLabel')} {astro.email}</p>
                                            )}
                                            {astro.description && (
                                                <p className="text-sm text-muted-foreground mt-2">{astro.description}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(astro)}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                {t('admin.pandits.edit')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={astro.isApproved ? "destructive" : "default"}
                                                onClick={() => handleToggleApproval(astro.id, astro.isApproved)}
                                                disabled={processingAction === `toggle-${astro.id}`}
                                            >
                                                {processingAction === `toggle-${astro.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : (astro.isApproved ? t('admin.pandits.disapprove') : t('admin.pandits.approve'))}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(astro.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredAstrologers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('admin.pandits.noAstrologers')}</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
