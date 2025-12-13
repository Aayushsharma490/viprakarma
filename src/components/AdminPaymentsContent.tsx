'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, CheckCircle, XCircle, Eye, Loader2, CreditCard, User, Phone, Banknote, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentVerification {
    id: number;
    userId: number;
    bookingId: number | null;
    subscriptionId: number | null;
    consultationId: number | null;
    amount: number;
    paymentMethod: string;
    payerName: string;
    bankName: string | null;
    accountNumber: string | null;
    transactionId: string | null;
    phoneNumber: string;
    status: string;
    adminNotes: string | null;
    verifiedBy: number | null;
    verifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
    user?: {
        name: string;
        email: string;
    };
    consultation?: {
        mode: string;
        astrologerId: number;
        astrologer?: {
            name: string;
        };
    };
}

export default function AdminPaymentsContent() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [payments, setPayments] = useState<PaymentVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            // Simplified - no auth header needed
            const response = await fetch('/api/admin/payments');

            if (!response.ok) {
                throw new Error('Failed to fetch payments');
            }

            const data = await response.json();
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (paymentId: number, action: 'approve' | 'reject' | 'approve_enable_chat') => {
        setProcessingAction(`${action}-${paymentId}`);
        try {
            // Simplified - no auth header needed
            const response = await fetch(`/api/admin/payments/${paymentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    adminNotes: adminNotes.trim() || null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update payment status');
            }

            const actionMsg = action === 'approve_enable_chat' ? 'approved and chat enabled' : `${action}d`;
            toast.success(`Payment ${actionMsg} successfully`);
            await fetchPayments();
            setShowDetailsModal(false);
            setAdminNotes('');
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error(`Failed to ${action} payment`);
        } finally {
            setProcessingAction(null);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.phoneNumber.includes(searchTerm) ||
            (payment.user?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.user?.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="default" className="bg-green-600">{t('admin.pandits.approved')}</Badge>;
            case 'rejected':
                return <Badge variant="destructive">{t('admin.pandits.disapprove')}</Badge>; // Using available key or fallback
            default:
                return <Badge variant="secondary">{t('admin.pandits.pending')}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="min-h-screen cosmic-gradient">
            <AdminNavbar />

            <div className="container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4 text-cosmic">{t('admin.payments.title')}</h1>
                    <p className="text-muted-foreground">{t('admin.payments.subtitle')}</p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder={t('admin.payments.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder={t('admin.payments.filterStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('admin.payments.allStatus')}</SelectItem>
                            <SelectItem value="pending">{t('admin.pandits.pending')}</SelectItem>
                            <SelectItem value="approved">{t('admin.pandits.approved')}</SelectItem>
                            <SelectItem value="rejected">{t('admin.subscriptions.rejected')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Payments List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredPayments.map((payment) => (
                            <motion.div
                                key={payment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="glass-effect p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-foreground">{payment.payerName}</h3>
                                                {getStatusBadge(payment.status)}
                                            </div>
                                            <p className="text-primary mb-1">{payment.user?.email || 'N/A'}</p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {t('admin.users.phone')} {payment.phoneNumber} • {t('admin.payments.amount')}: ₹{payment.amount} • {t('admin.payments.method')}: {payment.paymentMethod}
                                                {typeof payment.consultationId === 'number' && (
                                                    <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs align-middle">
                                                        {t('admin.payments.consultation')} #{payment.consultationId}
                                                    </span>
                                                )}
                                                {payment.consultation && (
                                                    <span className="ml-2 text-amber-600">
                                                        • {payment.consultation.mode} with {payment.consultation.astrologer?.name || 'Astrologer'}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {t('admin.payments.submitted')}: {formatDate(payment.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setShowDetailsModal(true);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                {t('admin.payments.viewDetails')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const message = `Payment Request Details:\nName: ${payment.payerName}\nPhone: ${payment.phoneNumber}\nAmount: ₹${payment.amount}\nMethod: ${payment.paymentMethod}\nStatus: ${payment.status}`;
                                                    const whatsappUrl = `https://wa.me/${payment.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                                                    window.open(whatsappUrl, '_blank');
                                                }}
                                            >
                                                <MessageCircle className="w-4 h-4 mr-1" />
                                                {t('admin.payments.whatsapp')}
                                            </Button>
                                            {payment.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleStatusUpdate(payment.id, 'approve')}
                                                        disabled={processingAction === `approve-${payment.id}`}
                                                    >
                                                        {processingAction === `approve-${payment.id}` ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                        )}
                                                        {t('admin.payments.approve')}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleStatusUpdate(payment.id, 'reject')}
                                                        disabled={processingAction === `reject-${payment.id}`}
                                                    >
                                                        {processingAction === `reject-${payment.id}` ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                        )}
                                                        {t('admin.subscriptions.reject')}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredPayments.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('admin.payments.noPayments')}</p>
                    </div>
                )}
            </div>

            {/* Payment Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="golden-text">{t('admin.payments.detailsTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.payments.detailsSubtitle')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">{t('admin.payments.amount')}</Label>
                                    <p className="text-2xl font-bold text-amber-900">₹{selectedPayment.amount}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">{t('admin.subscriptions.status')}</Label>
                                    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        <strong>{t('admin.payments.payerName')}:</strong> {selectedPayment.payerName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        <strong>{t('admin.users.phone')}</strong> {selectedPayment.phoneNumber}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        <strong>{t('admin.payments.method')}:</strong> {selectedPayment.paymentMethod}
                                    </span>
                                </div>

                                {selectedPayment.bankName && (
                                    <div className="flex items-center gap-2">
                                        <Banknote className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            <strong>{t('admin.payments.bank')}:</strong> {selectedPayment.bankName}
                                        </span>
                                    </div>
                                )}

                                {selectedPayment.accountNumber && (
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            <strong>{t('admin.payments.account')}:</strong> {selectedPayment.accountNumber}
                                        </span>
                                    </div>
                                )}

                                {selectedPayment.transactionId && (
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            <strong>{t('admin.payments.transactionId')}:</strong> {selectedPayment.transactionId}
                                        </span>
                                    </div>
                                )}

                                {typeof selectedPayment.consultationId === 'number' && (
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            <strong>{t('admin.payments.consultation')} ID:</strong> #{selectedPayment.consultationId}
                                        </span>
                                    </div>
                                )}
                                {selectedPayment.consultation && (
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            <strong>{t('admin.payments.consultation')}:</strong> {selectedPayment.consultation.mode} with {selectedPayment.consultation.astrologer?.name || 'Astrologer'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {selectedPayment.status === 'pending' && (
                                <div className="space-y-3 pt-4 border-t">
                                    <Label htmlFor="adminNotes">{t('admin.payments.adminNotes')}</Label>
                                    <Textarea
                                        id="adminNotes"
                                        placeholder={t('admin.payments.adminNotesPlaceholder')}
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={3}
                                    />

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedPayment.id, 'approve')}
                                            className="bg-green-600 hover:bg-green-700 flex-1"
                                            disabled={processingAction === `approve-${selectedPayment.id}`}
                                        >
                                            {processingAction === `approve-${selectedPayment.id}` ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                            )}
                                            {t('admin.payments.approve')}
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedPayment.id, 'approve_enable_chat')}
                                            className="bg-emerald-700 hover:bg-emerald-800 flex-1"
                                            disabled={processingAction === `approve_enable_chat-${selectedPayment.id}`}
                                        >
                                            {processingAction === `approve_enable_chat-${selectedPayment.id}` ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                            )}
                                            {t('admin.payments.approveEnableChat')}
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedPayment.id, 'reject')}
                                            variant="destructive"
                                            className="flex-1"
                                            disabled={processingAction === `reject-${selectedPayment.id}`}
                                        >
                                            {processingAction === `reject-${selectedPayment.id}` ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <XCircle className="w-4 h-4 mr-2" />
                                            )}
                                            {t('admin.subscriptions.reject')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedPayment.adminNotes && (
                                <div className="pt-4 border-t">
                                    <Label className="text-sm font-medium">{t('admin.payments.adminNotes')}</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedPayment.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
