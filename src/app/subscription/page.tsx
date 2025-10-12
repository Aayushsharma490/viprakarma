'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    icon: Sparkles,
    features: [
      'Basic Kundali Generation',
      'Daily Horoscope',
      'Limited Numerology Calculator',
      '1 Free Chat with Astrologer',
      'Community Access'
    ],
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 499,
    period: 'month',
    icon: Zap,
    popular: true,
    features: [
      'Unlimited Kundali Generation',
      'Advanced Birth Chart Analysis',
      'Full Numerology Reports',
      'Palmistry AI Analysis',
      '10 AI Chat Sessions/month',
      '5 Live Astrologer Sessions',
      'Personalized Remedies',
      'Email Support'
    ],
    color: 'from-amber-600 to-amber-700'
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 4999,
    period: 'year',
    icon: Crown,
    savings: 'Save ₹1,000',
    features: [
      'Everything in Monthly',
      'Unlimited AI Chat',
      'Unlimited Astrologer Sessions',
      'Priority Pandit Booking',
      'Exclusive Vedic Reports',
      'Personalized Puja Recommendations',
      'Premium Support',
      'Free Gemstone Consultation'
    ],
    color: 'from-amber-700 to-amber-800'
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

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
        name: 'Kundali Platform',
        description: `${plans.find(p => p.id === planId)?.name} Subscription`,
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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="relative bg-gradient-to-r from-amber-50 to-amber-100 py-20 pt-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 golden-text">
              Choose Your Cosmic Plan
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Unlock the mysteries of the universe with our premium features
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-20">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className={`classical-card p-8 h-full flex flex-col relative overflow-hidden classical-hover ${
                    plan.popular ? 'ring-2 ring-amber-600' : ''
                  }`}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-amber-600 text-white px-4 py-1 text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    
                    {plan.savings && (
                      <div className="absolute top-0 left-0 bg-amber-700 text-white px-4 py-1 text-sm font-semibold">
                        {plan.savings}
                      </div>
                    )}

                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 mx-auto classical-shadow`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-center mb-2 text-gray-900">{plan.name}</h3>
                    
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-amber-900">₹{plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSubscribe(plan.id, plan.price)}
                      disabled={loading === plan.id}
                      className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 classical-shadow text-white`}
                    >
                      {loading === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        plan.price === 0 ? 'Get Started Free' : 'Subscribe Now'
                      )}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center pb-10 text-gray-600"
          >
            <p>All plans include 7-day money-back guarantee</p>
            <p className="mt-2">Need help choosing? <a href="/chat" className="text-amber-700 hover:underline font-medium">Chat with us</a></p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}