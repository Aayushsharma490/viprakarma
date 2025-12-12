import { Suspense } from 'react';
import SignupContent from '@/components/SignupContent';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>}>
      <SignupContent />
    </Suspense>
  );
}
