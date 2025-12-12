import { Suspense } from 'react';
import AstrologerLoginContent from '@/components/AstrologerLoginContent';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AstrologerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
      <AstrologerLoginContent />
    </Suspense>
  );
}
