'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/useUserStore';

export default function AuthGuard({ children, allowedRoles = [] }) {
  const router = useRouter();

  const user = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);
  const hasHydrated = useUserStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user || !token) {
      router.replace('/loginpage');
      return;
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.userType)
    ) {
      router.replace('/unauthorized');
    }
  }, [hasHydrated, user, token, allowedRoles, router]);

  // Show loading state while hydrating
  if (!hasHydrated) {
    return null; // or a loading spinner
  }

  // Check authentication after hydration
  if (!user || !token) {
    return null; // or a loading spinner while redirecting
  }

  return children;
}