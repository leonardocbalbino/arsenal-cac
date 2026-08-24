'use client';

import { colors, fonts } from '@/lib/theme';
import { useToastStore } from '@/store/uiStore';

export function Toast() {
  const toast = useToastStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 32,
        zIndex: 60,
        backgroundColor: colors.toastBg,
        borderRadius: 13,
        padding: '13px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
        maxWidth: 'min(90vw, 420px)',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: colors.accent, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontFamily: fonts.sans, fontWeight: 500, color: colors.toastText }}>{toast}</span>
    </div>
  );
}
