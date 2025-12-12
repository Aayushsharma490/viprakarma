import { Suspense } from 'react';
import AdminWhatsAppContent from '@/components/AdminWhatsAppContent';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminWhatsAppPage() {
    return (
        <>
            <AdminNavbar />
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                <AdminWhatsAppContent />
            </Suspense>
        </>
    );
}
