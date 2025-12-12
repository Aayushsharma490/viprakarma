'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Password, 4: Success
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSendCode = async (e: React.FormEvent) => {
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
                toast.success('Reset code sent to your email!');
                setStep(2);
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

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) {
            toast.error('Please enter the verification code');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Code verified successfully!');
                setStep(3);
            } else {
                toast.error(data.error || 'Invalid verification code');
            }
        } catch (error) {
            console.error('Verify code error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            toast.error('Please enter new password');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword: password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password reset successfully!');
                setStep(4);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                toast.error(data.error || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md shadow-xl border-amber-100">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-amber-600">
                            {step === 1 && <Mail className="w-6 h-6" />}
                            {step === 2 && <KeyRound className="w-6 h-6" />}
                            {step === 3 && <Lock className="w-6 h-6" />}
                            {step === 4 && <Lock className="w-6 h-6" />}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {step === 1 && 'Forgot Password'}
                            {step === 2 && 'Enter Verification Code'}
                            {step === 3 && 'Reset Password'}
                            {step === 4 && 'Password Changed!'}
                        </h1>
                        <p className="text-gray-600 text-sm">
                            {step === 1 && 'Enter your email to receive a reset code'}
                            {step === 2 && `Enter the 6-digit code sent to ${email}`}
                            {step === 3 && 'Create a strong new password'}
                            {step === 4 && 'You can now login with your new password'}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {step === 1 && (
                            <form onSubmit={handleSendCode} className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Send Reset Code'}
                                </Button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div>
                                    <Label htmlFor="code">Verification Code</Label>
                                    <div className="relative mt-1">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            id="code"
                                            placeholder="••••••"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="pl-10 text-center tracking-widest text-lg"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Verify Code'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs text-center w-full text-amber-600 hover:underline"
                                >
                                    Change Email
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Reset Password'}
                                </Button>
                            </form>
                        )}

                        {step === 4 && (
                            <div className="text-center space-y-4">
                                <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                                    <Link href="/login">Back to Login</Link>
                                </Button>
                            </div>
                        )}

                        {step < 4 && (
                            <div className="mt-6 text-center">
                                <Link
                                    href="/login"
                                    className="text-amber-600 hover:text-amber-700 text-sm flex items-center justify-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Back to Login
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </>
    );
}
