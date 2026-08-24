'use client';

import { PropsWithChildren } from 'react';
import { AppShell } from '@/components/AppShell';
import { Toast } from '@/components/Toast';
import { TrainingSessionSheet } from '@/components/TrainingSessionSheet';
import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { colors } from '@/lib/theme';

export default function AppLayout({ children }: PropsWithChildren) {
  const { pronto } = useProtectedRoute();

  if (!pronto) {
    return <div style={{ minHeight: '100vh', backgroundColor: colors.bg }} />;
  }

  return (
    <AppShell>
      {children}
      <TrainingSessionSheet />
      <Toast />
    </AppShell>
  );
}
