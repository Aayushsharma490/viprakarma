'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, QrCode, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  title: string;
  description: string;
  onSuccess: (paymentId: string) => void;
}

export default function PaymentModal({
  open,
  onOpenChange,
  amount,
  title,
  description,
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // Create order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR' }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Server error - show QR code fallback
        if (data.error === 'Payment gateway unavailable') {
          await generateQRCode();
          return;
        }
        throw new Error(data.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Astro Genesis',
        description: description,
        order_id: data.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast.success('Payment successful!');
            onSuccess(response.razorpay_payment_id);
            onOpenChange(false);
          } else {
            toast.error('Payment verification failed');
          }
          setLoading(false);
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#d97706',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function () {
        toast.error('Payment failed. Please try again.');
        setLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      await generateQRCode();
    }
  };

  const generateQRCode = async () => {
    try {
      const response = await fetch('/api/payment/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      setQrCode(data.qrCode);
      setShowQR(true);
      setLoading(false);
      toast.info('Payment gateway unavailable. Please use QR code for payment.');
    } catch (error) {
      toast.error('Failed to generate QR code');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold golden-text">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Amount to Pay</p>
            <p className="text-4xl font-bold text-amber-900">₹{amount}</p>
          </div>

          {!showQR ? (
            <div className="space-y-3">
              <Button
                onClick={handleRazorpayPayment}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay with Razorpay
                  </>
                )}
              </Button>

              <Button
                onClick={generateQRCode}
                variant="outline"
                className="w-full border-amber-600 text-amber-900 hover:bg-amber-50"
                size="lg"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Pay with QR Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-900">
                  Payment gateway is temporarily unavailable. Please scan QR code to complete payment.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {qrCode && (
                  <div className="p-4 bg-white border-2 border-amber-600 rounded-lg">
                    <Image src={qrCode} alt="Payment QR Code" width={200} height={200} />
                  </div>
                )}
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with any UPI app to complete payment
                </p>
                <Button
                  onClick={() => {
                    toast.success('Payment received! Consultation will be activated shortly.');
                    onSuccess('qr_payment_' + Date.now());
                    onOpenChange(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  I have completed the payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}