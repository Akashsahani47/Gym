'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useUserStore from '@/store/useUserStore';

/**
 * Gym owners must have status === 'active' to use the dashboard.
 * Pending / inactive → waiting-approval. Suspended → suspended page.
 *
 * - First visit: shows a spinner until /api/auth/me confirms you're active.
 * - Every navigation (pathname change): calls /api/auth/me again in the background
 *   so status changes (approval, suspension) apply without refreshing the browser.
 *   After the first successful load, the UI is not blocked by a full-screen spinner.
 */
export default function GymOwnerStatusGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  const updateUser = useUserStore((s) => s.updateUser);
  /** Becomes true after first successful "allowed in" check; stays true on later navigations */
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
        if (u.userType !== 'gym_owner') {
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

  if (user.userType !== 'gym_owner') {
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
