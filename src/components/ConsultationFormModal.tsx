'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Calendar, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import PaymentModal from '@/components/PaymentModal';

interface ConsultationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    astrologerId: number;
    astrologerName: string;
    hourlyRate?: number;
}

export default function ConsultationFormModal({
    isOpen,
    onClose,
    astrologerId,
    astrologerName,
    hourlyRate = 299 // Default fallback
}: ConsultationFormModalProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        dob: "",
        timeOfBirth: "",
        placeOfBirth: "",
        concerns: "",
    });

    const handleSubmit = () => {
        // Validate required fields
        if (
            !formData.name ||
            !formData.email ||
            !formData.phone ||
            !formData.dob ||
            !formData.timeOfBirth ||
            !formData.placeOfBirth ||
            !formData.concerns
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Open payment modal
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = (paymentId: string) => {
        setPaymentModalOpen(false);
        onClose();
        toast.success(
            "Payment submitted! Admin will verify and activate your consultation."
        );

        setTimeout(() => {
            toast.info(
                "You will be notified once approved. Check your notifications."
            );
        }, 2000);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center">
                            {t("consultation.formTitle") || "Book Consultation"}
                        </DialogTitle>
                        <p className="text-center text-sm text-muted-foreground">
                            with {astrologerName}
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">{t("consultation.fullName")} *</Label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Enter your name"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="email">{t("consultation.email")} *</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        placeholder="your@email.com"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">
                                    {t("consultation.phoneNumber")} *
                                </Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    placeholder="+91 1234567890"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="dob">
                                    {t("consultation.dateOfBirth")} *
                                </Label>
                                <div className="relative mt-1">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dob: e.target.value })
                                        }
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="timeOfBirth">
                                    {t("consultation.timeOfBirth")} *
                                </Label>
                                <div className="relative mt-1">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="timeOfBirth"
                                        type="time"
                                        value={formData.timeOfBirth}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                timeOfBirth: e.target.value,
                                            })
                                        }
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="placeOfBirth">
                                    {t("consultation.placeOfBirth")} *
                                </Label>
                                <div className="relative mt-1">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="placeOfBirth"
                                        value={formData.placeOfBirth}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                placeOfBirth: e.target.value,
                                            })
                                        }
                                        placeholder="City, State"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="concerns">
                                {t("consultation.yourConcerns")} *
                            </Label>
                            <Textarea
                                id="concerns"
                                value={formData.concerns}
                                onChange={(e) =>
                                    setFormData({ ...formData, concerns: e.target.value })
                                }
                                placeholder="Describe your concerns or questions..."
                                rows={4}
                                className="mt-1"
                                required
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            size="lg"
                        >
                            {t("consultation.bookNowButton") || "Proceed to Payment"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payment Modal */}
            <PaymentModal
                open={paymentModalOpen}
                onOpenChange={setPaymentModalOpen}
                amount={hourlyRate}
                title="Chat Consultation"
                description={`30 minutes chat with ${astrologerName}`}
                onSuccess={handlePaymentSuccess}
                userId={user?.id}
                consultationMode="chat"
                consultationDetails={{
                    ...formData,
                    astrologerId,
                    astrologerName
                }}
            />
        </>
    );
}
