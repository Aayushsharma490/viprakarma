import { Suspense } from 'react';
import AdminPanditsContent from '@/components/AdminPanditsContent';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminPanditsPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>}>
        <AdminPanditsContent />
      </Suspense>
    </>
  );
}
