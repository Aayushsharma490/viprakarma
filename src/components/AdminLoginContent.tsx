'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Shield, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginContent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Admin login failed');
            }

            // Aggressively find a valid string token from the API response.
            let foundToken = null;
            if (data && typeof data.token === 'string' && data.token.split('.').length === 3) {
                foundToken = data.token;
            } else if (data && typeof data.token === 'object' && data.token !== null) {
                // Look inside a nested token object
                foundToken = data.token.token || data.token.accessToken || null;
            } else if (data && data.accessToken) {
                foundToken = data.accessToken;
            }

            if (!foundToken || typeof foundToken !== 'string') {
                const errorMessage = `Admin login succeeded, but the server did not return a valid token. Response: ${JSON.stringify(data)}`;
                setError(errorMessage);
                alert(errorMessage); // Use a blocking alert to make sure the error is seen.
                setIsLoading(false);
                return;
            }

            // At this point, foundToken is a valid string.
            localStorage.setItem('admin_token', foundToken);
            localStorage.setItem('admin_user', JSON.stringify(data.user));

            // Force a page reload to ensure auth context updates
            window.location.href = '/admin';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-64 h-64 border-4 border-amber-600 rounded-full animate-pulse"></div>
                <div className="absolute bottom-40 right-40 w-48 h-48 border-4 border-amber-700 rounded-full animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Shield className="w-10 h-10 text-amber-500" />
                    <span className="text-3xl font-bold text-white">Admin Portal</span>
                </div>

                <Card className="classical-card p-8 bg-white/95 backdrop-blur-sm">
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                        Admin Access Only
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Enter your credentials to access the admin dashboard
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-700 text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Admin Email</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@viprakarma.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password">Admin Password</Label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
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
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Admin Sign In
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <Link href="/" className="hover:text-amber-700 transition-colors flex items-center justify-center gap-1">
                            ← Back to Home
                        </Link>
                    </div>

                    <div className="mt-4 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="font-semibold mb-1">🔒 Restricted Access</p>
                        <p>This area is for authorized administrators only. Unauthorized access attempts are logged.</p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
