'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginContent() {
    const router = useRouter();
    const { login } = useAuth();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.token, data.user);

            if (data.user.isAdmin) {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-20 w-32 h-32 border-4 border-amber-600 rounded-full"></div>
                <div className="absolute bottom-40 right-40 w-24 h-24 border-4 border-amber-700 rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Sparkles className="w-8 h-8 text-amber-600" />
                    <span className="text-2xl font-bold golden-text">Viprakarma</span>
                </Link>

                <Card className="classical-card p-8 bg-white">
                    <h1 className="text-3xl font-bold text-center text-amber-900 mb-2">
                        {t('login.welcomeBack')}
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        {t('login.subtitle')}
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">{t('login.email')}</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password">{t('login.password')}</Label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white classical-shadow"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('login.signingIn')}
                                </>
                            ) : (
                                t('login.signIn')
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        {t('login.noAccount')}{' '}
                        <Link href="/signup" className="text-amber-700 hover:underline font-medium">
                            {t('login.signUp')}
                        </Link>
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        <Link href="/astrologer/login" className="text-purple-700 hover:underline font-medium">
                            Login as Astrologer
                        </Link>
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        <Link href="/" className="hover:text-amber-700 transition-colors">
                            {t('login.backToHome')}
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
