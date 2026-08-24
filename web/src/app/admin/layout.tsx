'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPerfil } from '@/api/auth';
import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { colors } from '@/lib/theme';
import { AppShell } from '@/components/AppShell';
import { Toast } from '@/components/Toast';

export default function AdminLayout({ children }: PropsWithChildren) {
  const { pronto } = useProtectedRoute();
  const router = useRouter();
  const perfil = useQuery({ queryKey: ['perfil'], queryFn: getPerfil, enabled: pronto });

  useEffect(() => {
    if (perfil.data && perfil.data.role !== 'ADMIN') {
      router.replace('/app');
    }
  }, [perfil.data, router]);

  if (!pronto || !perfil.data) {
    return <div style={{ minHeight: '100vh', backgroundColor: colors.bg }} />;
  }

  if (perfil.data.role !== 'ADMIN') return null;

  return (
    <AppShell>
      {children}
      <Toast />
    </AppShell>
  );
}
