'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Check, X, Search, Bell, Calendar, User, CreditCard, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubscriptionRequest {
    request: {
        id: number;
        userId: number;
        planId: string;
        planName: string;
        amount: number;
        duration: string;
        paymentMethod: string;
        payerName: string;
        phoneNumber: string;
        transactionId: string;
        paymentScreenshot: string;
        status: 'pending' | 'approved' | 'rejected';
        adminNotes: string | null;
        requestedAt: string;
        processedAt: string | null;
        expiryDate: string | null;
    };
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
}

export default function AdminSubscriptionsContent() {
    const { t } = useLanguage();
    const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<SubscriptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [cancellationReason, setCancellationReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [requests, searchTerm, activeTab]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests || []);
            } else if (response.status === 401) {
                toast.error('Session expired. Please re-login to the admin panel.');
                // Optionally redirect to admin login
                // window.location.href = '/admin/login';
            } else {
                toast.error('Failed to fetch subscription requests');
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Error loading subscription requests');
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = requests.filter(req => req.request.status === activeTab);

        if (searchTerm) {
            filtered = filtered.filter(req =>
                req.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.request.planName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRequests(filtered);
    };

    const handleApprove = async (requestId: number) => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/subscriptions/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestId, adminNotes })
            });

            if (response.ok) {
                toast.success('Subscription approved successfully!');
                setShowDetailsModal(false);
                setAdminNotes('');
                fetchRequests();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to approve subscription');
            }
        } catch (error) {
            console.error('Error approving subscription:', error);
            toast.error('Error approving subscription');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (requestId: number) => {
        if (!adminNotes.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/subscriptions/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestId, adminNotes })
            });

            if (response.ok) {
                toast.success('Subscription rejected');
                setShowDetailsModal(false);
                setAdminNotes('');
                fetchRequests();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to reject subscription');
            }
        } catch (error) {
            console.error('Error rejecting subscription:', error);
            toast.error('Error rejecting subscription');
        } finally {
            setProcessing(false);
        }
    };

    const sendReminder = async (userId: number) => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/subscriptions/reminder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(`Reminder sent! ${data.daysRemaining} days remaining`);
            } else {
                toast.error('Failed to send reminder');
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            toast.error('Error sending reminder');
        }
    };

    const handleCancelSubscription = async (requestId: number) => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/subscriptions/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestId, cancellationReason })
            });

            if (response.ok) {
                toast.success('Subscription cancelled successfully');
                setShowCancelDialog(false);
                setShowDetailsModal(false);
                setCancellationReason('');
                fetchRequests();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            toast.error('Error cancelling subscription');
        } finally {
            setProcessing(false);
        }
    };

    const getDaysRemaining = (expiryDate: string | null) => {
        if (!expiryDate) return null;
        const expiry = new Date(expiryDate);
        const now = new Date();
        const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const openDetailsModal = (request: SubscriptionRequest) => {
        setSelectedRequest(request);
        setAdminNotes(request.request.adminNotes || '');
        setShowDetailsModal(true);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading subscriptions...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-24 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('admin.subscriptions.title')}</h1>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder={t('admin.subscriptions.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="pending">
                        {t('admin.subscriptions.pending')} ({requests.filter(r => r.request.status === 'pending').length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                        {t('admin.subscriptions.approved')} ({requests.filter(r => r.request.status === 'approved').length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                        {t('admin.subscriptions.rejected')} ({requests.filter(r => r.request.status === 'rejected').length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {filteredRequests.length === 0 ? (
                        <Card className="p-12 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>{t('admin.subscriptions.noRequests')} {activeTab} {t('admin.subscriptions.subscriptionRequests')}</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredRequests.map(({ request, user }) => {
                                const daysRemaining = getDaysRemaining(request.expiryDate);
                                return (
                                    <Card key={request.id} className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-lg font-semibold">{user.name}</h3>
                                                    <Badge className={getStatusColor(request.status)}>
                                                        {request.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span>{user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-gray-400" />
                                                        <span>{request.planName} - ₹{request.amount}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {request.expiryDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span>
                                                                Expires: {new Date(request.expiryDate).toLocaleDateString()}
                                                                {daysRemaining !== null && (
                                                                    <span className={`ml-2 ${daysRemaining <= 7 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                                                        ({daysRemaining} days)
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openDetailsModal({ request, user })}
                                                >
                                                    {t('admin.subscriptions.viewDetails')}
                                                </Button>
                                                {request.status === 'approved' && daysRemaining !== null && daysRemaining <= 30 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => sendReminder(user.id)}
                                                    >
                                                        <Bell className="w-4 h-4 mr-1" />
                                                        {t('admin.subscriptions.sendReminder')}
                                                    </Button>
                                                )}
                                                {request.status === 'approved' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                            setSelectedRequest({ request, user });
                                                            setShowCancelDialog(true);
                                                        }}
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        {t('admin.subscriptions.cancel')}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('admin.subscriptions.detailsTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.subscriptions.detailsSubtitle')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">User Name</label>
                                    <p className="text-lg">{selectedRequest.user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-lg">{selectedRequest.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Plan</label>
                                    <p className="text-lg">{selectedRequest.request.planName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Amount</label>
                                    <p className="text-lg">₹{selectedRequest.request.amount}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                                    <p className="text-lg">{selectedRequest.request.paymentMethod}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Phone</label>
                                    <p className="text-lg">{selectedRequest.request.phoneNumber}</p>
                                </div>
                                {selectedRequest.request.transactionId && (
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                                        <p className="text-lg font-mono">{selectedRequest.request.transactionId}</p>
                                    </div>
                                )}
                            </div>

                            {selectedRequest.request.paymentScreenshot && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-2">Payment Screenshot</label>
                                    <div className="border rounded-lg overflow-hidden">
                                        <Image
                                            src={selectedRequest.request.paymentScreenshot}
                                            alt="Payment Screenshot"
                                            width={600}
                                            height={400}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-2">Admin Notes</label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this request..."
                                    rows={3}
                                    disabled={selectedRequest.request.status !== 'pending'}
                                />
                            </div>

                            {selectedRequest.request.status === 'pending' && (
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleReject(selectedRequest.request.id)}
                                        disabled={processing}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        {t('admin.subscriptions.reject')}
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(selectedRequest.request.id)}
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        {t('admin.subscriptions.approve')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Subscription Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.subscriptions.cancelSubscription')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.subscriptions.cancelConfirm')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    User: <span className="font-semibold">{selectedRequest.user.name}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Plan: <span className="font-semibold">{selectedRequest.request.planName}</span>
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-2">
                                    Cancellation Reason *
                                </label>
                                <Textarea
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Please provide a reason for cancellation..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCancelDialog(false);
                                        setCancellationReason('');
                                    }}
                                    disabled={processing}
                                >
                                    No, Keep It
                                </Button>
                                <Button
                                    onClick={() => handleCancelSubscription(selectedRequest.request.id)}
                                    disabled={processing}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Yes, Cancel Subscription
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
