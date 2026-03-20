'use client';

import MemberSidebar from '@/components/MemberDashboard/MemberSidebar';
import AuthGuard from '@/components/important/AuthGuard';

export default function MemberLayout({ children }) {
  return (
    <AuthGuard allowedRoles={['member']}>
      <div className="flex min-h-screen bg-black">
        <MemberSidebar />
        <main className="flex-1 min-h-screen overflow-y-auto bg-black">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
