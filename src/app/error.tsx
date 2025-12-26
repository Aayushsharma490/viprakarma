'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center space-y-6 max-w-md mx-auto">
                <h1 className="text-8xl font-bold text-red-200">OPS!</h1>
                <h2 className="text-2xl font-semibold text-gray-800">Something went wrong!</h2>
                <p className="text-gray-600">
                    We encountered an unexpected error. Our team has been notified.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                    <Button
                        onClick={() => reset()}
                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="border-amber-200 text-amber-800 hover:bg-amber-50 flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
