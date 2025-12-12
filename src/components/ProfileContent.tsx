'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Edit, Trash2, Download, Calendar, User, Star, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SavedKundali {
    id: string;
    name: string;
    birthDetails: any;
    kundaliData: any;
    savedAt: string;
    status: string;
}

interface PaymentVerification {
    id: number;
    amount: number;
    paymentMethod: string;
    payerName: string;
    phoneNumber: string;
    status: string;
    adminNotes: string | null;
    verifiedAt: string | null;
    createdAt: string;
}

export default function ProfileContent() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [savedKundalis, setSavedKundalis] = useState<SavedKundali[]>([]);
    const [paymentVerifications, setPaymentVerifications] = useState<PaymentVerification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedKundali, setSelectedKundali] = useState<SavedKundali | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [canChatWithAstrologer, setCanChatWithAstrologer] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadSavedKundalis();
        loadPaymentVerifications();
        loadUserChatStatus();
    }, [user, router]);

    const loadSavedKundalis = () => {
        try {
            const saved = JSON.parse(localStorage.getItem('savedKundalis') || '[]');
            setSavedKundalis(saved);
        } catch (error) {
            console.error('Error loading saved kundalis:', error);
            toast.error('Failed to load saved kundalis');
        }
    };

    const loadPaymentVerifications = async () => {
        try {
            if (!user?.id) return;

            const response = await fetch(`/api/user/payment-verifications?userId=${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setPaymentVerifications(data);
            } else {
                console.error('Failed to load payment verifications:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error loading payment verifications:', error);
        }
    };

    const loadUserChatStatus = async () => {
        try {
            if (!user?.id) return;

            const response = await fetch(`/api/user/chat-status?userId=${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setCanChatWithAstrologer(data.canChatWithAstrologer);
            } else {
                console.error('Failed to load user chat status:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error loading user chat status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const hasApprovedPayment = paymentVerifications.some(pv => pv.status === 'approved');

    const handleChatWithAstrologer = () => {
        router.push('/chat/astrologer');
    };

    const deleteKundali = (id: string) => {
        try {
            const updated = savedKundalis.filter(k => k.id !== id);
            setSavedKundalis(updated);
            localStorage.setItem('savedKundalis', JSON.stringify(updated));
            toast.success('Kundali deleted successfully');
        } catch (error) {
            console.error('Error deleting kundali:', error);
            toast.error('Failed to delete kundali');
        }
    };

    const exportKundali = async (kundali: SavedKundali) => {
        if (!kundali.kundaliData) return;
        setIsExporting(true);

        try {
            // Create a temporary div with kundali data for export
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #d97706; text-align: center;">Kundali Report</h1>
          <h2>${kundali.name}</h2>
          <p><strong>Birth Details:</strong></p>
          <p>Date: ${kundali.birthDetails.day}/${kundali.birthDetails.month}/${kundali.birthDetails.year}</p>
          <p>Time: ${kundali.birthDetails.hour}:${kundali.birthDetails.minute} ${kundali.birthDetails.ampm}</p>
          <p>Place: ${kundali.birthDetails.place}</p>
          <p><strong>Status:</strong> ${kundali.status}</p>
          <p><strong>Saved At:</strong> ${new Date(kundali.savedAt).toLocaleString()}</p>
        </div>
      `;
            document.body.appendChild(tempDiv);

            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`kundali-${kundali.name || 'report'}.pdf`);
            document.body.removeChild(tempDiv);
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export kundali');
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <ChatBot />

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 golden-text">
                            My Profile
                        </h1>
                        <p className="text-xl text-gray-600">
                            Manage your saved kundalis and account information
                        </p>
                    </div>

                    {/* Chat with Astrologer Button */}
                    {canChatWithAstrologer && (
                        <Card className="p-6 mb-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Chat with Astrologer</h2>
                                    <p className="text-amber-100">Get personalized astrological guidance from our expert astrologers</p>
                                </div>
                                <Button
                                    onClick={handleChatWithAstrologer}
                                    className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-6 py-2"
                                >
                                    Start Chat
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* User Info */}
                    <Card className="classical-card p-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-sm text-gray-500">Member since {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Payment Verifications */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-semibold mb-6 text-gray-900">Payment Verifications</h2>

                        {paymentVerifications.length === 0 ? (
                            <Card className="classical-card p-8 text-center">
                                <CreditCard className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Payment Verifications</h3>
                                <p className="text-gray-600 mb-4">
                                    You haven't submitted any payment verification requests yet.
                                </p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paymentVerifications.map((payment) => (
                                    <Card key={payment.id} className="classical-card p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    ₹{payment.amount}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {payment.paymentMethod}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(payment.status)}>
                                                {payment.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Submitted: {new Date(payment.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Phone: {payment.phoneNumber}
                                            </p>
                                            {payment.verifiedAt && (
                                                <p className="text-sm text-green-600">
                                                    Verified: {new Date(payment.verifiedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>

                                        {payment.adminNotes && (
                                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">
                                                    <strong>Admin Notes:</strong> {payment.adminNotes}
                                                </p>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Saved Kundalis */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-semibold mb-6 text-gray-900">Saved Kundalis</h2>

                        {savedKundalis.length === 0 ? (
                            <Card className="classical-card p-8 text-center">
                                <Star className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Saved Kundalis</h3>
                                <p className="text-gray-600 mb-4">
                                    You haven't saved any kundalis yet. Generate and save your first kundali to see it here.
                                </p>
                                <Button
                                    onClick={() => router.push('/kundali')}
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    Generate Kundali
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedKundalis.map((kundali) => (
                                    <Card key={kundali.id} className="classical-card p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {kundali.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {kundali.birthDetails.day}/{kundali.birthDetails.month}/{kundali.birthDetails.year}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(kundali.status)}>
                                                {kundali.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Saved: {new Date(kundali.savedAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Time: {kundali.birthDetails.hour}:{kundali.birthDetails.minute} {kundali.birthDetails.ampm}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Place: {kundali.birthDetails.place}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedKundali(kundali)}
                                                className="flex-1"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => exportKundali(kundali)}
                                                disabled={isExporting}
                                                className="flex-1"
                                            >
                                                {isExporting ? (
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <Download className="w-4 h-4 mr-1" />
                                                )}
                                                Export
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => deleteKundali(kundali.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Kundali Details Modal */}
                    {selectedKundali && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-900">
                                            {selectedKundali.name}'s Kundali
                                        </h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedKundali(null)}
                                        >
                                            Close
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Basic Details */}
                                        <Card className="p-4">
                                            <h3 className="text-lg font-semibold mb-3">Birth Details</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <p><strong>Name:</strong> {selectedKundali.name}</p>
                                                <p><strong>Date:</strong> {selectedKundali.birthDetails.day}/{selectedKundali.birthDetails.month}/{selectedKundali.birthDetails.year}</p>
                                                <p><strong>Time:</strong> {selectedKundali.birthDetails.hour}:{selectedKundali.birthDetails.minute} {selectedKundali.birthDetails.ampm}</p>
                                                <p><strong>Place:</strong> {selectedKundali.birthDetails.place}</p>
                                                <p><strong>Status:</strong> <Badge className={getStatusColor(selectedKundali.status)}>{selectedKundali.status}</Badge></p>
                                                <p><strong>Saved:</strong> {new Date(selectedKundali.savedAt).toLocaleString()}</p>
                                            </div>
                                        </Card>

                                        {/* Kundali Data Summary */}
                                        {selectedKundali.kundaliData && (
                                            <Card className="p-4">
                                                <h3 className="text-lg font-semibold mb-3">Kundali Summary</h3>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div className="text-center">
                                                        <p className="font-semibold">Sun Sign</p>
                                                        <p>{selectedKundali.kundaliData.sunSign}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-semibold">Moon Sign</p>
                                                        <p>{selectedKundali.kundaliData.moonSign}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-semibold">Ascendant</p>
                                                        <p>{selectedKundali.kundaliData.ascendant}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
