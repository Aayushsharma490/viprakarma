'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle, X, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

interface UserSubscription {
  planId: string;
  planName: string;
  expiryDate: string;
  isActive: boolean;
}

const getPlans = (t: (key: string) => string): SubscriptionPlan[] => [
  {
    id: 'basic',
    name: t('subscription.basic'),
    price: 999,
    duration: t('subscription.duration.1month'),
    features: [
      t('subscription.feature.basicKundali'),
      t('subscription.feature.dailyHoroscope'),
      t('subscription.feature.emailSupport'),
      t('subscription.feature.mobileApp')
    ]
  },
  {
    id: 'premium',
    name: t('subscription.premium'),
    price: 2499,
    duration: t('subscription.duration.3months'),
    features: [
      t('subscription.feature.advancedKundali'),
      t('subscription.feature.personalizedPredictions'),
      t('subscription.feature.videoConsultation1'),
      t('subscription.feature.prioritySupport'),
      t('subscription.feature.allBasic')
    ],
    popular: true
  },
  {
    id: 'ultimate',
    name: t('subscription.ultimate'),
    price: 4999,
    duration: t('subscription.duration.6months'),
    features: [
      t('subscription.feature.completeLife'),
      t('subscription.feature.videoConsultation3'),
      t('subscription.feature.remedialSolutions'),
      t('subscription.feature.familyCompatibility'),
      t('subscription.feature.allPremium')
    ]
  }
];

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<Record<string, UserSubscription>>({});

  // Get translated plans
  const plans = getPlans(t);

  useEffect(() => {
    fetchUserSubscriptionStatus();
  }, []);

  const fetchUserSubscriptionStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setFetchingStatus(false);
      return;
    }

    try {
      const response = await fetch('/api/user/subscription-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        // Token invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login?redirect=/subscription&error=session_expired');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Convert array to map by planId for easy lookup
        const subscriptionMap: Record<string, UserSubscription> = {};
        if (data.subscriptions && Array.isArray(data.subscriptions)) {
          data.subscriptions.forEach((sub: UserSubscription) => {
            subscriptionMap[sub.planId] = sub;
          });
        }
        setUserSubscriptions(subscriptionMap);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      // Silently fail - user can still purchase
    } finally {
      setFetchingStatus(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login?redirect=/subscription');
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentId: string, paymentDetails?: any) => {
    if (!selectedPlan) return;

    setLoading(selectedPlan.id);
    try {
      const token = localStorage.getItem('token');

      // Get user data for fallback values
      const userData = localStorage.getItem('user');
      let userName = 'User';
      let userPhone = '';

      if (userData) {
        try {
          const user = JSON.parse(userData);
          userName = user.name || 'User';
          userPhone = user.phone || '';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Create subscription request
      const response = await fetch('/api/subscription/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          duration: selectedPlan.duration,
          paymentMethod: paymentDetails?.paymentMethod || 'UPI/QR',
          payerName: paymentDetails?.payerName || userName,
          phoneNumber: paymentDetails?.phoneNumber || userPhone,
          transactionId: paymentDetails?.transactionId || paymentId,
          paymentScreenshot: paymentDetails?.paymentScreenshot || '',
        })
      });

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login?redirect=/subscription');
        return;
      }

      if (response.ok) {
        toast.success('Subscription request submitted! Awaiting admin approval.');
        setShowPaymentModal(false);
        router.push('/?subscription=pending');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit subscription request');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to submit subscription request');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-2">
            <Button variant="outline" onClick={handleClose} className="gap-2">
              <X className="w-4 h-4" />
              {t('subscription.close')}
            </Button>
          </div>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('subscription.chooseJourney')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('subscription.unlockMysteries')}
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
                    {t('subscription.mostPopular')}
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

                {(() => {
                  const subscription = userSubscriptions[plan.id];
                  const isActive = subscription?.isActive;
                  const expiryDate = subscription?.expiryDate;

                  if (fetchingStatus) {
                    return (
                      <Button disabled className="w-full bg-gray-400 text-white">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('subscription.loading')}
                      </Button>
                    );
                  }

                  if (isActive && expiryDate) {
                    const expiry = new Date(expiryDate);
                    const daysRemaining = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysRemaining <= 7;

                    return (
                      <div className="space-y-3">
                        <div className={`p-4 rounded-lg border-2 ${isExpiringSoon ? 'border-orange-500 bg-orange-50' : 'border-green-500 bg-green-50'}`}>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-700">{t('subscription.activeSubscription')}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span>{t('subscription.expiresLabel')} {expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          {isExpiringSoon && (
                            <div className="flex items-center justify-center gap-2 text-sm text-orange-600 mt-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{daysRemaining} {t('subscription.daysLeft')}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleSubscribe(plan)}
                          variant="outline"
                          className="w-full border-amber-600 text-amber-700 hover:bg-amber-50"
                        >
                          {t('subscription.renew')}
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loading === plan.id}
                      className={`w-full ${plan.popular ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-900 hover:bg-gray-800'
                        } text-white shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                    >
                      {loading === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('subscription.processing')}
                        </>
                      ) : (
                        `${t('subscription.subscribeTo')} ${plan.name}`
                      )}
                    </Button>
                  );
                })()}
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              {t('subscription.allPlansInclude')}
            </p>
            <p className="text-sm text-gray-500">
              {t('subscription.cancelAnytime')}
            </p>
          </div>
        </div>
      </div>
      <Footer />

      {selectedPlan && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          amount={selectedPlan.price}
          title={`Subscribe to ${selectedPlan.name}`}
          description={`Complete payment for ${selectedPlan.name} subscription`}
          onSuccess={handlePaymentSuccess}
          subscriptionId={1} // Placeholder, will be created after payment
        />
      )}
    </>
  );
}
