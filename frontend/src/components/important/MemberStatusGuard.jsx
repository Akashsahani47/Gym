'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useUserStore from '@/store/useUserStore';

/**
 * Members must have status === 'active' to use the member dashboard.
 * Pending / inactive → waiting-approval (same flow as gym owner pending).
 * Suspended → suspended page.
 *
 * Re-fetches /api/auth/me on every navigation so gym-owner changes to pending/suspended
 * apply without a full page refresh.
 */
export default function MemberStatusGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  const updateUser = useUserStore((s) => s.updateUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !token) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok || !data.user) {
          router.replace('/loginpage');
          return;
        }

        const u = data.user;
        if (u.userType !== 'member') {
          setReady(true);
          return;
        }

        updateUser(u);

        const status = u.status;

        if (status === 'suspended') {
          router.replace('/notice/suspended');
          return;
        }

        if (status === 'pending' || status === 'inactive') {
          router.replace('/notice/waiting-approval');
          return;
        }

        setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, token, router, updateUser, pathname]);

  if (!hasHydrated || !token || !user) {
    return null;
  }

  if (user.userType !== 'member') {
    return children;
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const status = user.status;
  if (status === 'suspended' || status === 'pending' || status === 'inactive') {
    return null;
  }

  return children;
}
