import { PropsWithChildren, ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts, ls, radius, spacing } from '@/constants/theme';
import { dateParaIso, formatDataBr, isoParaDateLocal } from '@/lib/format';

export { ls };

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

/* ---------- layout ---------- */

export function Screen({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Section({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[{ gap: 9 }, style]}>{children}</View>;
}

export function SectionHeader({ label, actionLabel, onAction }: { label: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Title({ children }: PropsWithChildren) {
  return <Text style={[styles.screenTitle, { marginBottom: spacing(1) }]}>{children}</Text>;
}

export function Subtitle({ children }: PropsWithChildren) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function ScreenTitle({ children, action }: PropsWithChildren<{ action?: ReactNode }>) {
  return (
    <View style={styles.screenTitleRow}>
      <Text style={styles.screenTitle}>{children}</Text>
      {action}
    </View>
  );
}

export function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={styles.backLink}>‹ {label}</Text>
    </Pressable>
  );
}

/* ---------- surfaces ---------- */

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function GradientCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <LinearGradient colors={['#171B19', '#131614']} style={[styles.gradientCard, style]}>
      {children}
    </LinearGradient>
  );
}

function StripedTexture({ light }: { light?: boolean }) {
  const stripe = light ? 'rgba(20,23,15,0.07)' : 'rgba(255,255,255,0.055)';
  return (
    <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Defs>
        <Pattern id="stripes" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(115)">
          <Rect width={9} height={9} fill="transparent" />
          <Rect width={4.5} height={9} fill={stripe} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#stripes)" />
    </Svg>
  );
}

export function StripedPlaceholder({
  label,
  style,
  variant = 'dark',
}: {
  label: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'dark' | 'light';
}) {
  return (
    <View style={[styles.stripedPlaceholder, variant === 'light' && styles.stripedPlaceholderLight, style]}>
      <StripedTexture light={variant === 'light'} />
      <Text style={[styles.stripedLabel, variant === 'light' && styles.stripedLabelLight]}>{label}</Text>
    </View>
  );
}

/* ---------- text ---------- */

export function MonoLabel({ children, style, color = colors.textMuted }: PropsWithChildren<{ style?: StyleProp<TextStyle>; color?: string }>) {
  return <Text style={[styles.monoLabel, { color }, style]}>{children}</Text>;
}

/* ---------- badges / pills ---------- */

export function Badge({
  text,
  tone = 'neutral',
  variant = 'outline',
}: {
  text: string;
  tone?: Tone;
  variant?: 'outline' | 'filled';
}) {
  const c = toneColors[tone];
  if (variant === 'filled') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
        <Text style={[styles.badgeText, { color: colors.onAccent }]}>{text}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { borderColor: c.border }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{text}</Text>
    </View>
  );
}

export function StatusDot({ color = colors.accentText }: { color?: string }) {
  return <View style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: color }} />;
}

export function EmDiaPill({ emDia = true, faltam }: { emDia?: boolean; faltam?: number }) {
  const cor = emDia ? colors.accentText : colors.warn;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <StatusDot color={cor} />
      <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: fonts.sansSemiBold, color: cor }}>
        {emDia ? 'Em dia' : `Faltam ${faltam ?? ''}`}
      </Text>
    </View>
  );
}

/* ---------- progress ---------- */

export function ProgressBar({ progress, color = colors.accent, height = 5, track = colors.chartBg }: { progress: number; color?: string; height?: number; track?: string }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ height, borderRadius: 99, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}

export function BarRow({ segments }: { segments: { filled: boolean }[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {segments.map((s, i) => (
        <View key={i} style={{ flex: 1, height: 6, borderRadius: 99, backgroundColor: s.filled ? colors.accent : colors.chartBg }} />
      ))}
    </View>
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
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable key={opt.value} onPress={() => onChange(opt.value)} style={[styles.segmentedItem, active && styles.segmentedItemActive]}>
            <Text style={[styles.segmentedText, active && styles.segmentedTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- chips ---------- */

export function Chip({ label, active, onPress, mono = true }: { label: string; active?: boolean; onPress?: () => void; mono?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, mono && { fontFamily: active ? fonts.monoSemiBold : fonts.mono }, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- buttons ---------- */

export function Button({
  title,
  onPress,
  variant = 'primary',
  compact,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  compact?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        compact && styles.buttonCompact,
        (disabled || loading) && { opacity: 0.6 },
        pressed && !disabled && !loading && { backgroundColor: variant === 'primary' ? colors.accentHover : colors.surfaceHover },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onAccent : colors.text} />
      ) : (
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact, variant !== 'primary' && { color: colors.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function FAB({ onPress, icon = '+' }: { onPress: () => void; icon?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && { backgroundColor: colors.accentHover }]}
    >
      <Text style={styles.fabIcon}>{icon}</Text>
    </Pressable>
  );
}

export function GhostFAB({ onPress, icon = '+' }: { onPress: () => void; icon?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostFab, pressed && { backgroundColor: colors.surfaceHover }]}
    >
      <Text style={styles.ghostFabIcon}>{icon}</Text>
    </Pressable>
  );
}

/* ---------- list rows ---------- */

export function VencimentoRow({
  titulo,
  meta,
  contagem,
  tone,
  onPress,
}: {
  titulo: string;
  meta: string;
  contagem: string;
  tone: Tone;
  onPress?: () => void;
}) {
  const c = toneColors[tone];
  return (
    <Pressable onPress={onPress} style={[styles.vencRow, { borderLeftColor: c.bar }]}>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.vencTitle}>{titulo}</Text>
        <Text style={styles.vencMeta}>{meta}</Text>
      </View>
      <Text style={[styles.vencContagem, { color: tone === 'neutral' ? colors.textMuted : c.fg }]}>{contagem}</Text>
    </Pressable>
  );
}

/* ---------- form fields (kept from previous system, restyled) ---------- */

export function Label({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ marginBottom: spacing(4) }}>
      <Label>{label}</Label>
      <TextInput placeholderTextColor={colors.textFaint} style={[styles.input, style]} {...rest} />
    </View>
  );
}

/** Campo de data — abre o calendário nativo (iOS/Android). `value`/`onChange`
 * trafegam em "AAAA-MM-DD" (o formato que a API espera); a exibição é sempre
 * DD/MM/AAAA. */
export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Selecionar data',
  style,
}: {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [aberto, setAberto] = useState(false);
  const dataAtual = value ? isoParaDateLocal(value) : new Date();

  return (
    <View style={{ marginBottom: spacing(4) }}>
      <Label>{label}</Label>
      <Pressable onPress={() => setAberto(true)} style={[styles.input, { justifyContent: 'center' }, style]}>
        <Text style={{ color: value ? colors.text : colors.textFaint, fontSize: 14, fontFamily: fonts.sans }}>
          {value ? formatDataBr(value) : placeholder}
        </Text>
      </Pressable>
      {aberto && (
        <DateTimePicker
          value={dataAtual}
          mode="date"
          display="default"
          onChange={(event, selecionada) => {
            setAberto(false);
            if (event.type === 'set' && selecionada) {
              onChange(dateParaIso(selecionada));
            }
          }}
        />
      )}
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={colors.accentText} />
    </View>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24 },

  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: ls(10.5, 0.16),
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  sectionAction: { fontSize: 12, color: colors.accentText, fontFamily: fonts.sansMedium },

  screenTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  screenTitle: { fontSize: 26, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(26, -0.025) },
  subtitle: { fontSize: 14, color: colors.textMuted, fontFamily: fonts.sans, marginBottom: spacing(4) },

  backLink: { fontSize: 13.5, fontFamily: fonts.sansMedium, color: colors.accentText },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.weaponCard,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
  },
  gradientCard: {
    borderRadius: radius.featureCard,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    paddingBottom: 16,
    gap: 14,
  },

  stripedPlaceholder: {
    borderRadius: 14,
    backgroundColor: '#1B201D',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stripedLabel: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: ls(9.5, 0.14), color: 'rgba(236,239,236,0.3)' },
  stripedPlaceholderLight: { backgroundColor: '#E7E4DA' },
  stripedLabelLight: { color: 'rgba(20,23,15,0.45)' },

  monoLabel: { fontFamily: fonts.mono, fontSize: 11 },

  badge: {
    borderWidth: 1,
    borderRadius: radius.badge,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  badgeText: { fontFamily: fonts.monoSemiBold, fontSize: 9.5 },

  segmented: { flexDirection: 'row', gap: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.input, padding: 4 },
  segmentedItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.segmentActive },
  segmentedItemActive: { backgroundColor: colors.accent },
  segmentedText: { fontSize: 12.5, fontFamily: fonts.sansMedium, color: 'rgba(236,239,236,0.6)' },
  segmentedTextActive: { color: colors.onAccent },

  chip: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 10.5, color: 'rgba(236,239,236,0.55)' },
  chipTextActive: { color: colors.onAccent, fontWeight: '600' },

  button: {
    backgroundColor: colors.accent,
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderSoft },
  buttonDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
  buttonText: { color: colors.onAccent, fontFamily: fonts.sansSemiBold, fontSize: 15 },
  buttonCompact: { borderRadius: 12, paddingVertical: 14 },
  buttonTextCompact: { fontSize: 13.5 },

  fab: {
    width: 38,
    height: 38,
    borderRadius: 99,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { fontSize: 22, fontWeight: '600', color: colors.onAccent, lineHeight: 24 },
  ghostFab: {
    width: 38,
    height: 38,
    borderRadius: 99,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostFabIcon: { fontSize: 20, color: 'rgba(236,239,236,0.8)', lineHeight: 22 },

  vencRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderLeftWidth: 2,
    borderRadius: radius.vencRow,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  vencTitle: { fontSize: 14, fontFamily: fonts.sansMedium, color: colors.text },
  vencMeta: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
  vencContagem: { fontFamily: fonts.monoSemiBold, fontSize: 11 },

  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: ls(10, 0.14), textTransform: 'uppercase', color: colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.input,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },

  empty: { padding: spacing(6), alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', fontFamily: fonts.sans },
});
