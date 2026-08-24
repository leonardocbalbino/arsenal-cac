'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useProtectedRoute() {
  const { accessToken, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken) router.replace('/login');
  }, [accessToken, hydrated, router]);

  return { pronto: hydrated && !!accessToken };
}
