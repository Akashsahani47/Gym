'use client';

import { useEffect } from 'react';
import GymSidebar from '@/components/GymDashboard/GymSidebar/GymSidebar';
import AuthGuard from '@/components/important/AuthGuard';
import useThemeStore from '@/store/useThemeStore';

export default function OwnerLayout({ children }) {
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <AuthGuard allowedRoles={['gym_owner']}>
      <div className="flex min-h-screen bg-white dark:bg-black">
        <GymSidebar />
        <main className="flex-1 min-h-screen overflow-y-auto bg-white dark:bg-black">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
