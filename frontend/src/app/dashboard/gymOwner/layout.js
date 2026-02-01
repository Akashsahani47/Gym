'use client';

import GymSidebar from '@/components/GymDashboard/GymSidebar/GymSidebar';
import AuthGuard from '@/components/important/AuthGuard';

export default function OwnerLayout({ children }) {
  return (
    <AuthGuard allowedRoles={['gym_owner']}>
      <div className="flex min-h-screen">
        <GymSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
