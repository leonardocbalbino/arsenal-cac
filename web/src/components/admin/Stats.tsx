'use client';

import { colors, fonts } from '@/lib/theme';

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 140,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.borderSoft}`,
        borderRadius: 14,
        padding: '14px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.textMuted }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 600, color: colors.text, letterSpacing: '-0.02em' }}>{value}</span>
    </div>
  );
}

export function BarList({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderSoft}`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.textMuted }}>
        {title}
      </span>
      {items.length === 0 ? (
        <span style={{ color: colors.textMuted, fontSize: 13.5 }}>Sem dados ainda</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, flexShrink: 0 }}>{item.value}</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, backgroundColor: colors.chartBg, overflow: 'hidden' }}>
                <div style={{ width: `${(item.value / max) * 100}%`, height: '100%', borderRadius: 4, backgroundColor: colors.accent }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
