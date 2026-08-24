export const colors = {
  bg: '#0D0F0E',
  surface: '#131614',
  surfaceRaised: '#1B201D',
  surfaceHover: '#222926',
  sheet: '#151917',
  border: 'rgba(255,255,255,0.09)',
  borderSoft: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.07)',
  text: '#ECEFEC',
  textMuted: 'rgba(236,239,236,0.45)',
  textFaint: 'rgba(236,239,236,0.35)',
  tabInactive: 'rgba(236,239,236,0.38)',
  accent: '#1F5C4A',
  accentHover: '#26705A',
  accentText: '#4E9C82',
  onAccent: '#EAF3EF',
  accentWashBg: 'rgba(31,92,74,0.14)',
  accentWashBorder: 'rgba(78,156,130,0.26)',
  warn: '#C9A227',
  warnBar: '#B08300',
  danger: '#D97F62',
  dangerBar: '#C4694E',
  chartTrack: '#2A3230',
  chartBg: '#222825',
  neutralBar: 'rgba(255,255,255,0.14)',
  walletBg: '#F4F2EC',
  walletCard: '#FFFFFF',
  walletCardBorder: 'rgba(20,23,15,0.12)',
  walletText: '#14170F',
  walletTextMuted: 'rgba(20,23,15,0.5)',
  walletTextFaint: 'rgba(20,23,15,0.45)',
  walletDivider: 'rgba(20,23,15,0.1)',
  walletChip: 'rgba(20,23,15,0.08)',
  toastBg: '#EDF2EF',
  toastText: '#0D0F0E',

  // legacy aliases kept for any not-yet-migrated call sites
  background: '#0D0F0E',
  surfaceAlt: '#1B201D',
  primary: '#1F5C4A',
  primaryText: '#EAF3EF',
  danger_legacy: '#D97F62',
  warning: '#C9A227',
  success: '#4E9C82',
};

export const spacing = (n: number) => n * 4;

/** Converts a CSS letter-spacing em value to RN's pixel-based letterSpacing at a given font size. */
export function ls(fontSize: number, em: number) {
  return Math.round(fontSize * em * 100) / 100;
}

export const radius = {
  chartBar: 4,
  badge: 5,
  buttonSmall: 7,
  segmentActive: 8,
  input: 11,
  vencRow: 12,
  docRow: 13,
  toast: 13,
  ammoCard: 14,
  weaponCard: 16,
  featureCard: 18,
  sheetTop: 22,
  pill: 99,
};

export const fonts = {
  sans: 'IBMPlexSans_400Regular',
  sansMedium: 'IBMPlexSans_500Medium',
  sansSemiBold: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
};
