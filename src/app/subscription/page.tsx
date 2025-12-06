'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 999,
    duration: '1 Month',
    features: [
      'Basic Kundali Reading',
      'Daily Horoscope',
      'Email Support',
      'Mobile App Access'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 2499,
    duration: '3 Months',
    features: [
      'Advanced Kundali Analysis',
      'Personalized Predictions',
      'Video Consultation (1)',
      'Priority Support',
      'All Basic Features'
    ],
    popular: true
  },
  {
    id: 'ultimate',
    name: 'Ultimate Plan',
    price: 4999,
    duration: '6 Months',
    features: [
      'Complete Life Analysis',
      'Video Consultations (3)',
      'Remedial Solutions',
      'Family Compatibility',
      'All Premium Features'
    ]
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleSubscribe = async (planId: string, price: number) => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login?redirect=/subscription');
      return;
    }

    if (price === 0) {
      router.push('/');
      return;
    }

    setLoading(planId);
    setError('');

    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: price,
          planId
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Viprakarma',
        description: `${plans.find((p: SubscriptionPlan) => p.id === planId)?.name} Subscription`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId
              })
            });

            if (verifyResponse.ok) {
              router.push('/?payment=success');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#d97706'
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-2">
          <Button variant="outline" onClick={handleClose} className="gap-2">
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Astrological Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the mysteries of the cosmos with our comprehensive astrology subscription plans
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative p-8 ${plan.popular ? 'border-amber-500 border-2 shadow-xl' : 'border-gray-200'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white">
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  ₹{plan.price}
                </div>
                <p className="text-gray-600">{plan.duration}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id, plan.price)}
                disabled={loading === plan.id}
                className={`w-full ${plan.popular ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include access to our premium astrology tools and expert guidance
          </p>
          <p className="text-sm text-gray-500">
            Cancel anytime • Secure payments • 100% satisfaction guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
