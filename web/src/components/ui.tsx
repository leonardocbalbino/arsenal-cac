'use client';

import { CSSProperties, PropsWithChildren, ReactNode, useState } from 'react';
import { colors, fonts, radius } from '@/lib/theme';

export type Tone = 'accent' | 'warn' | 'danger' | 'neutral';

const toneColors: Record<Tone, { fg: string; border: string; bar: string }> = {
  accent: { fg: colors.accentText, border: 'rgba(78,156,130,0.4)', bar: colors.accent },
  warn: { fg: colors.warn, border: 'rgba(201,162,39,0.42)', bar: colors.warnBar },
  danger: { fg: colors.danger, border: 'rgba(217,127,98,0.45)', bar: colors.dangerBar },
  neutral: { fg: colors.textFaint, border: 'rgba(255,255,255,0.14)', bar: colors.neutralBar },
};

export function toneOf(dias: number | null): Tone {
  if (dias === null) return 'neutral';
  if (dias <= 30) return 'danger';
  if (dias <= 90) return 'warn';
  return 'neutral';
}

/* ---------- navigation ---------- */

export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: 13.5,
        fontWeight: 500,
        color: colors.accentText,
        alignSelf: 'flex-start',
      }}
    >
      ‹ {label}
    </button>
  );
}

/* ---------- layout ---------- */

export function Card({ children, style }: PropsWithChildren<{ style?: CSSProperties }>) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.weaponCard,
        border: `1px solid ${colors.border}`,
        padding: 15,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function GradientCard({ children, style }: PropsWithChildren<{ style?: CSSProperties }>) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #171B19, #131614)',
        borderRadius: radius.featureCard,
        border: `1px solid ${colors.border}`,
        padding: '18px 18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StripedPlaceholder({
  label,
  style,
  variant = 'dark',
}: {
  label: string;
  style?: CSSProperties;
  variant?: 'dark' | 'light';
}) {
  const stripe = variant === 'light' ? 'rgba(20,23,15,0.07)' : 'rgba(255,255,255,0.055)';
  return (
    <div
      style={{
        borderRadius: 14,
        backgroundColor: variant === 'light' ? '#E7E4DA' : '#1B201D',
        backgroundImage: `repeating-linear-gradient(115deg, ${stripe} 0px, ${stripe} 4.5px, transparent 4.5px, transparent 9px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: 9.5,
          letterSpacing: '0.14em',
          color: variant === 'light' ? 'rgba(20,23,15,0.45)' : 'rgba(236,239,236,0.3)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ---------- text ---------- */

export function MonoLabel({ children, style, color = colors.textMuted }: PropsWithChildren<{ style?: CSSProperties; color?: string }>) {
  return (
    <span style={{ fontFamily: fonts.mono, fontSize: 11, color, ...style }}>{children}</span>
  );
}

export function ScreenTitle({ children, action }: PropsWithChildren<{ action?: ReactNode }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <h1 style={{ fontSize: 26, fontFamily: fonts.sans, fontWeight: 600, color: colors.text, letterSpacing: '-0.025em' }}>{children}</h1>
      {action}
    </div>
  );
}

/* ---------- badges / pills ---------- */

export function Badge({ text, tone = 'neutral' }: { text: string; tone?: Tone }) {
  const c = toneColors[tone];
  return (
    <span
      style={{
        border: `1px solid ${c.border}`,
        borderRadius: radius.badge,
        padding: '3px 6px',
        fontFamily: fonts.mono,
        fontWeight: 600,
        fontSize: 9.5,
        color: c.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

export function EmDiaPill({ emDia = true, faltam }: { emDia?: boolean; faltam?: number }) {
  const cor = emDia ? colors.accentText : colors.warn;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: cor, display: 'inline-block' }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: cor }}>{emDia ? 'Em dia' : `Faltam ${faltam ?? ''}`}</span>
    </span>
  );
}

/* ---------- progress ---------- */

export function ProgressBar({ progress, color = colors.accent, height = 5, track = colors.chartBg }: { progress: number; color?: string; height?: number; track?: string }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <div style={{ height, borderRadius: 99, backgroundColor: track, overflow: 'hidden' }}>
      <div style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color }} />
    </div>
  );
}

export function BarRow({ segments }: { segments: { filled: boolean }[] }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {segments.map((s, i) => (
        <div key={i} style={{ flex: 1, height: 6, borderRadius: 99, backgroundColor: s.filled ? colors.accent : colors.chartBg }} />
      ))}
    </div>
  );
}

/* ---------- segmented control ---------- */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 4, backgroundColor: colors.surface, border: `1px solid ${colors.borderSoft}`, borderRadius: radius.input, padding: 4 }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '8px 0',
              borderRadius: radius.segmentActive,
              border: 'none',
              backgroundColor: active ? colors.accent : 'transparent',
              color: active ? colors.onAccent : 'rgba(236,239,236,0.6)',
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- chips ---------- */

export function Chip({ label, active, onPress, mono = true }: { label: string; active?: boolean; onPress?: () => void; mono?: boolean }) {
  return (
    <button
      onClick={onPress}
      style={{
        padding: '6px 11px',
        borderRadius: radius.pill,
        border: `1px solid ${active ? colors.accent : 'rgba(255,255,255,0.12)'}`,
        backgroundColor: active ? colors.accent : 'transparent',
        fontFamily: mono ? fonts.mono : fonts.sans,
        fontWeight: active ? 600 : 400,
        fontSize: 10.5,
        color: active ? colors.onAccent : 'rgba(236,239,236,0.55)',
      }}
    >
      {label}
    </button>
  );
}

/* ---------- buttons ---------- */

export function Button({
  title,
  onClick,
  variant = 'primary',
  compact,
  loading,
  disabled,
  style,
  type = 'button',
}: {
  title: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  compact?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit';
}) {
  const [hover, setHover] = useState(false);
  const base: CSSProperties = {
    backgroundColor: variant === 'primary' ? (hover ? colors.accentHover : colors.accent) : variant === 'secondary' ? (hover ? colors.surfaceHover : colors.surfaceRaised) : 'transparent',
    border: variant === 'secondary' ? `1px solid ${colors.borderSoft}` : variant === 'danger' ? `1px solid ${colors.danger}` : 'none',
    borderRadius: compact ? 12 : 13,
    padding: compact ? '14px 0' : '15px 0',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: variant === 'primary' ? colors.onAccent : colors.text,
    fontSize: compact ? 13.5 : 15,
    fontWeight: 600,
    opacity: disabled || loading ? 0.6 : 1,
    ...style,
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={base}
    >
      {loading ? '···' : title}
    </button>
  );
}

export function FAB({ onPress, icon = '+' }: { onPress: () => void; icon?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 38,
        height: 38,
        borderRadius: 99,
        backgroundColor: hover ? colors.accentHover : colors.accent,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.onAccent,
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {icon}
    </button>
  );
}

export function GhostFAB({ onPress, icon = '+' }: { onPress: () => void; icon?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 38,
        height: 38,
        borderRadius: 99,
        backgroundColor: hover ? colors.surfaceHover : colors.surfaceRaised,
        border: `1px solid ${colors.borderSoft}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(236,239,236,0.8)',
        fontSize: 18,
        lineHeight: 1,
      }}
    >
      {icon}
    </button>
  );
}

/* ---------- list rows ---------- */

export function VencimentoRow({
  titulo,
  meta,
  contagem,
  tone,
  onClick,
}: {
  titulo: string;
  meta: string;
  contagem: string;
  tone: Tone;
  onClick?: () => void;
}) {
  const c = toneColors[tone];
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.borderSoft}`,
        borderLeft: `2px solid ${c.bar}`,
        borderRadius: radius.vencRow,
        padding: '13px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        width: '100%',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>{titulo}</span>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>{meta}</span>
      </div>
      <span style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: 11, color: tone === 'neutral' ? colors.textMuted : c.fg }}>{contagem}</span>
    </button>
  );
}

/* ---------- form fields ---------- */

export function Label({ children }: PropsWithChildren) {
  return (
    <span style={{ display: 'block', fontFamily: fonts.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.textMuted, marginBottom: 6 }}>
      {children}
    </span>
  );
}

export function Field({
  label,
  style,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      <input
        style={{
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.input,
          padding: '12px 13px',
          color: colors.text,
          fontSize: 14,
          border: `1px solid ${colors.borderSoft}`,
          width: '100%',
          ...style,
        }}
        {...rest}
      />
    </div>
  );
}

/** Campo de data — usa o seletor de calendário nativo do navegador.
 * `value`/`onChange` trafegam em "AAAA-MM-DD" (o formato que `<input
 * type="date">` e a API usam); `colorScheme: dark` faz o navegador desenhar
 * o próprio calendário (e o ícone) no tema escuro. */
export function DateField({
  label,
  value,
  onChange,
  style,
}: {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  style?: CSSProperties;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.input,
          padding: '12px 13px',
          color: colors.text,
          fontSize: 14,
          border: `1px solid ${colors.borderSoft}`,
          width: '100%',
          colorScheme: 'dark',
          ...style,
        }}
      />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <span style={{ color: colors.textMuted, fontSize: 14 }}>{message}</span>
    </div>
  );
}

export function LoadingState() {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <span style={{ color: colors.accentText, fontSize: 13, fontFamily: fonts.mono }}>CARREGANDO…</span>
    </div>
  );
}
