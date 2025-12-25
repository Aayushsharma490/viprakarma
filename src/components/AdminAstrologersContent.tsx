'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Loader2, Search, X, CheckCircle, XCircle, User, Phone, Star } from 'lucide-react';
import { toast } from 'sonner';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';

interface Astrologer {
    id: number;
    name: string;
    email: string;
    phone: string;
    specializations: string[];
    experience: number;
    rating: number;
    totalConsultations: number;
    hourlyRate: number;
    isApproved: boolean;
    bio: string;
    isOnline: boolean;
    createdAt: string;
}

export default function AdminAstrologersContent() {
    const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        specializations: '',
        experience: '',
        hourlyRate: '',
        bio: '',
    });
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    useEffect(() => {
        fetchAstrologers();
    }, []);

    const fetchAstrologers = async () => {
        try {
            const response = await fetch('/api/admin/astrologers');
            if (!response.ok) {
                throw new Error('Failed to fetch astrologers');
            }
            const data = await response.json();
            setAstrologers(data);
        } catch (error) {
            console.error('Error fetching astrologers:', error);
            toast.error('Failed to fetch astrologers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAstrologer = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessingAction('add');

        try {
            const response = await fetch('/api/admin/astrologers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    specializations: formData.specializations.split(',').map(s => s.trim()),
                    experience: parseInt(formData.experience),
                    hourlyRate: parseInt(formData.hourlyRate),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add astrologer');
            }

            toast.success('Astrologer added successfully');
            setShowAddModal(false);
            resetForm();
            fetchAstrologers();
        } catch (error) {
            console.error('Error adding astrologer:', error);
            toast.error('Failed to add astrologer');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleEditAstrologer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAstrologer) return;

        setProcessingAction('edit');

        try {
            const response = await fetch(`/api/admin/astrologers/${selectedAstrologer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    specializations: formData.specializations.split(',').map(s => s.trim()),
                    experience: parseInt(formData.experience),
                    hourlyRate: parseInt(formData.hourlyRate),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update astrologer');
            }

            toast.success('Astrologer updated successfully');
            setShowEditModal(false);
            setSelectedAstrologer(null);
            resetForm();
            fetchAstrologers();
        } catch (error) {
            console.error('Error updating astrologer:', error);
            toast.error('Failed to update astrologer');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleDeleteAstrologer = async (id: number) => {
        if (!confirm('Are you sure you want to delete this astrologer?')) return;

        setProcessingAction(`delete-${id}`);

        try {
            const response = await fetch(`/api/admin/astrologers/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete astrologer');
            }

            toast.success('Astrologer deleted successfully');
            fetchAstrologers();
        } catch (error) {
            console.error('Error deleting astrologer:', error);
            toast.error('Failed to delete astrologer');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleToggleApproval = async (id: number, currentStatus: boolean) => {
        setProcessingAction(`toggle-${id}`);

        try {
            const response = await fetch(`/api/admin/astrologers/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update astrologer status');
            }

            toast.success(`Astrologer ${!currentStatus ? 'approved' : 'disapproved'} successfully`);
            fetchAstrologers();
        } catch (error) {
            console.error('Error updating astrologer status:', error);
            toast.error('Failed to update astrologer status');
        } finally {
            setProcessingAction(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            specializations: '',
            experience: '',
            hourlyRate: '',
            bio: '',
        });
    };

    const openEditModal = (astrologer: Astrologer) => {
        setSelectedAstrologer(astrologer);
        setFormData({
            name: astrologer.name,
            email: astrologer.email,
            phone: astrologer.phone,
            password: '', // Don't populate password for security
            specializations: astrologer.specializations.join(', '),
            experience: astrologer.experience.toString(),
            hourlyRate: astrologer.hourlyRate.toString(),
            bio: astrologer.bio,
        });
        setShowEditModal(true);
    };

    const filteredAstrologers = astrologers.filter(astrologer =>
        astrologer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        astrologer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen cosmic-gradient">
            <AdminNavbar />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-24"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Astrologer Management</h1>
                        <p className="text-gray-600 mt-2">Manage astrologer accounts and credentials</p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Astrologer
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search astrologers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Astrologers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAstrologers.map((astrologer) => (
                        <Card key={astrologer.id} className="bg-white shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{astrologer.name}</h3>
                                            <p className="text-sm text-gray-600">{astrologer.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant={astrologer.isApproved ? "default" : "secondary"}>
                                        {astrologer.isApproved ? "Approved" : "Pending"}
                                    </Badge>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        {astrologer.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Star className="w-4 h-4" />
                                        {astrologer.rating.toFixed(1)} ({astrologer.totalConsultations} consultations)
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Experience: {astrologer.experience} years
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Rate: ₹{astrologer.hourlyRate}/hour
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-4">
                                    {astrologer.specializations.map((spec, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => openEditModal(astrologer)}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleToggleApproval(astrologer.id, astrologer.isApproved)}
                                        variant={astrologer.isApproved ? "destructive" : "default"}
                                        size="sm"
                                        className="flex-1"
                                        disabled={processingAction === `toggle-${astrologer.id}`}
                                    >
                                        {processingAction === `toggle-${astrologer.id}` ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : null}
                                        {astrologer.isApproved ? 'Disapprove' : 'Approve'}
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteAstrologer(astrologer.id)}
                                        variant="destructive"
                                        size="sm"
                                        disabled={processingAction === `delete-${astrologer.id}`}
                                    >
                                        {processingAction === `delete-${astrologer.id}` ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {filteredAstrologers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No astrologers found.</p>
                    </div>
                )}

                {/* Add Astrologer Modal */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Astrologer</DialogTitle>
                            <DialogDescription>
                                Create a new astrologer account with login credentials.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAddAstrologer} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                                <Input
                                    id="specializations"
                                    value={formData.specializations}
                                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                                    placeholder="Vedic Astrology, Kundali Reading"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="experience">Experience (years)</Label>
                                    <Input
                                        id="experience"
                                        type="number"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                                    <Input
                                        id="hourlyRate"
                                        type="number"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={processingAction === 'add'}
                                >
                                    {processingAction === 'add' ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    Add Astrologer
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Astrologer Modal */}
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Astrologer</DialogTitle>
                            <DialogDescription>
                                Update astrologer information and credentials.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditAstrologer} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-specializations">Specializations (comma-separated)</Label>
                                <Input
                                    id="edit-specializations"
                                    value={formData.specializations}
                                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                                    placeholder="Vedic Astrology, Kundali Reading"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-experience">Experience (years)</Label>
                                    <Input
                                        id="edit-experience"
                                        type="number"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit-hourlyRate">Hourly Rate (₹)</Label>
                                    <Input
                                        id="edit-hourlyRate"
                                        type="number"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-bio">Bio</Label>
                                <Textarea
                                    id="edit-bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={processingAction === 'edit'}
                                >
                                    {processingAction === 'edit' ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    Update Astrologer
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <Footer />
        </div >
    );
}
