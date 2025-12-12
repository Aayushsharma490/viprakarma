'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [showCode, setShowCode] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetCode(data.resetCode || '');
                setShowCode(true);
                toast.success('Reset code generated!');
            } else {
                toast.error(data.error || 'Failed to generate reset code');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {t('forgotPassword.title') || 'Forgot Password'}
                            </h1>
                            <p className="text-gray-600">
                                {t('forgotPassword.subtitle') || 'Reset your password'}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!showCode ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="email">
                                        {t('forgotPassword.emailLabel') || 'Enter your email'}
                                    </Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('forgotPassword.generating') || 'Generating...'}
                                        </>
                                    ) : (
                                        t('forgotPassword.submitButton') || 'Send Reset Code'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="text-amber-600 hover:text-amber-700 flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        {t('forgotPassword.backToLogin') || 'Back to Login'}
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                                        Reset Code Generated!
                                    </h3>
                                    <p className="text-sm text-green-700 mb-4">
                                        Your 6-digit reset code is:
                                    </p>
                                    <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-4">
                                        <p className="text-3xl font-bold text-green-600 tracking-widest">
                                            {resetCode}
                                        </p>
                                    </div>
                                    <p className="text-xs text-green-600">
                                        This code will expire in 15 minutes
                                    </p>
                                </div>

                                <Button
                                    onClick={handleContinue}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    Continue to Reset Password
                                </Button>

                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="text-amber-600 hover:text-amber-700 flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </>
    );
}
