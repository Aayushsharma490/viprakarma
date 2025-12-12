import { Suspense } from 'react';
import AdminSubscriptionsContent from '@/components/AdminSubscriptionsContent';
import AdminNavbar from '@/components/AdminNavbar';

export const dynamic = 'force-dynamic';

export default function AdminSubscriptionsPage() {
    return (
        <>
            <AdminNavbar />
            <Suspense fallback={<div>Loading...</div>}>
                <AdminSubscriptionsContent />
            </Suspense>
        </>
    );
}
