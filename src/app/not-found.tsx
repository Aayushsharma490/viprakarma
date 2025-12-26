'use client';

import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
            <div className="text-center space-y-6 max-w-md mx-auto">
                <h1 className="text-9xl font-bold text-amber-600">404</h1>
                <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
                <p className="text-gray-600">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="border-amber-200 text-amber-800 hover:bg-amber-50 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
