import { Suspense } from 'react';
import AdminDashboardContent from '@/components/AdminDashboardContent';
import AdminNavbar from '@/components/AdminNavbar';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <>
      <AdminNavbar />
      <Suspense fallback={<div>Loading...</div>}>
        <AdminDashboardContent />
      </Suspense>
    </>
  );
}
