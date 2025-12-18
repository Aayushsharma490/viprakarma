'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, QrCode, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  title: string;
  description: string;
  onSuccess: (paymentId: string, paymentDetails?: any) => void;
  userId?: number;
  bookingId?: number;
  subscriptionId?: number;
  consultationMode?: 'chat' | 'call' | 'video';
  consultationDetails?: any;
}

export default function PaymentModal({
  open,
  onOpenChange,
  amount,
  title,
  description,
  onSuccess,
  userId,
  bookingId,
  subscriptionId,
  consultationMode,
  consultationDetails,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [upiUrl, setUpiUrl] = useState<string>('');
  const [verifying, setVerifying] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    payerName: '',
    bankName: '',
    accountNumber: '',
    transactionId: '',
    phoneNumber: '',
    paymentMethod: '',
  });

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      setQrCode(data.qrCode);
      setUpiUrl(data.upiString);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to generate QR code');
      setLoading(false);
    }
  };

  const handleQRPaymentComplete = async () => {
    setShowPaymentForm(true);
  };

  const handlePaymentDetailsSubmit = async () => {
    // Validate required fields
    if (!paymentDetails.payerName || !paymentDetails.phoneNumber || !paymentDetails.paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    setVerifying(true);
    try {
      // For subscriptions, skip the payment verify API and return details directly
      if (subscriptionId) {
        toast.success('Payment details submitted successfully!', {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          duration: 3000,
        });
        // Pass payment details back to parent
        onSuccess('qr_payment_' + Date.now(), paymentDetails);
        onOpenChange(false);
        setVerifying(false);
        return;
      }

      // If this is a consultation payment, create consultation first
      let consultationId: number | null = null;
      let paymentVerificationId: number | null = null;
      if (consultationMode && consultationDetails) {
        try {
          const consultationResponse = await fetch('/api/consultations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              type: consultationMode,
              formData: consultationDetails,
            }),
          });

          if (consultationResponse.ok) {
            const consultationData = await consultationResponse.json();
            consultationId = consultationData.consultationId;
            paymentVerificationId = consultationData.paymentId;
          } else {
            const errorData = await consultationResponse.json();
            toast.error(errorData.error || 'Failed to create consultation request. Please try again.');
            setVerifying(false);
            return;
          }
        } catch (error) {
          console.error('Consultation creation error:', error);
          toast.error('Failed to connect to the server. Please check your connection.');
          setVerifying(false);
          return;
        }
      }

      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'qr_' + Date.now(),
          paymentId: 'qr_payment_' + Date.now(),
          signature: 'manual_qr_payment',
          userId,
          bookingId,
          subscriptionId,
          consultationId,
          amount,
          paymentDetails,
          paymentVerificationId,
        }),
      });

      if (response.ok) {
        toast.success('Payment details submitted successfully! Admin will verify your payment soon.', {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          duration: 5000,
        });
        onSuccess('qr_payment_' + Date.now());
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit payment details. Please contact support.');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment details. Please contact support.');
    } finally {
      setVerifying(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-generate QR on open
  if (open && !qrCode && !loading) {
    generateQRCode();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="golden-text">
            {showPaymentForm ? 'Enter Payment Details' : 'Complete Your Payment'}
          </DialogTitle>
          <DialogDescription>
            {showPaymentForm
              ? 'Please provide your payment details for verification'
              : 'Scan the QR code to pay for your Viprakarma consultation'
            }
          </DialogDescription>
        </DialogHeader>

        {verifying ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
            <p className="text-lg font-medium text-amber-900">Submitting payment details...</p>
            <p className="text-sm text-gray-600">Please wait while we process your information</p>
          </div>
        ) : showPaymentForm ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentForm(false)}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">Back to QR code</span>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="text-2xl font-bold text-amber-900">₹{amount}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentDetails.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI (PhonePe, GPay, Paytm)</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Net Banking">Net Banking</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payerName">Your Full Name *</Label>
                <Input
                  id="payerName"
                  value={paymentDetails.payerName}
                  onChange={(e) => handleInputChange('payerName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={paymentDetails.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={paymentDetails.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="Enter bank name (if applicable)"
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number / UPI ID</Label>
                <Input
                  id="accountNumber"
                  value={paymentDetails.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Enter account number or UPI ID"
                />
              </div>

              <div>
                <Label htmlFor="transactionId">Transaction ID / Reference Number</Label>
                <Input
                  id="transactionId"
                  value={paymentDetails.transactionId}
                  onChange={(e) => handleInputChange('transactionId', e.target.value)}
                  placeholder="Enter transaction ID or reference number"
                />
              </div>

              <Button
                onClick={handlePaymentDetailsSubmit}
                className="bg-green-600 hover:bg-green-700 text-white w-full"
                size="lg"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Submit Payment Details
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Amount to Pay</p>
              <p className="text-4xl font-bold text-amber-900">₹{amount}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-900">
                  Scan the QR code with any UPI app (PhonePe, GPay, Paytm, etc.)
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white border-2 border-amber-600 rounded-lg shadow-lg">
                  <Image
                    src="/qr.jpg"
                    alt="Payment QR Code"
                    width={200}
                    height={200}
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  {upiUrl && (
                    <>
                      <Button
                        onClick={() => window.location.href = upiUrl}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Open with Google Pay / PhonePe
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        Tap above to open your installed UPI app automatically, or scan QR.
                        <br />
                        <b>Note:</b> You can also upload the QR screenshot in your UPI app.
                      </p>
                    </>
                  )}
                </div>

                <p className="text-sm text-gray-600 text-center font-medium">
                  After completing payment, click the button below
                </p>
                <Button
                  onClick={handleQRPaymentComplete}
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  I have completed the payment
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
