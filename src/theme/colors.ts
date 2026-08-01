/**
 * Official Miaraka color tokens.
 * Dark mode is the primary experience; light mode is prepared for future use.
 */

export const palette = {
  navy950: '#06142B',
  navy900: '#0C2147',
  blue500: '#4F8CFF',
  cyan400: '#38D6E8',
  green500: '#29D391',
  white: '#FFFFFF',
  gray100: '#E7ECF5',
  gray500: '#8B97AC',
  red400: '#FF6577',
  yellow400: '#F6BE4F',
  black: '#000000',
} as const;

export const alpha = {
  transparent: 'transparent',
  white04: 'rgba(255, 255, 255, 0.04)',
  white08: 'rgba(255, 255, 255, 0.08)',
  white12: 'rgba(255, 255, 255, 0.12)',
  white16: 'rgba(255, 255, 255, 0.16)',
  white24: 'rgba(255, 255, 255, 0.24)',
  white64: 'rgba(255, 255, 255, 0.64)',
  white80: 'rgba(255, 255, 255, 0.80)',
  black08: 'rgba(0, 0, 0, 0.08)',
  black16: 'rgba(0, 0, 0, 0.16)',
  black24: 'rgba(0, 0, 0, 0.24)',
  black40: 'rgba(0, 0, 0, 0.40)',
  black56: 'rgba(0, 0, 0, 0.56)',
  black72: 'rgba(0, 0, 0, 0.72)',
  primary12: 'rgba(79, 140, 255, 0.12)',
  primary20: 'rgba(79, 140, 255, 0.20)',
  primary32: 'rgba(79, 140, 255, 0.32)',
  primary48: 'rgba(79, 140, 255, 0.48)',
  cyan16: 'rgba(56, 214, 232, 0.16)',
  cyan32: 'rgba(56, 214, 232, 0.32)',
  success16: 'rgba(41, 211, 145, 0.16)',
  warning16: 'rgba(246, 190, 79, 0.16)',
  error16: 'rgba(255, 101, 119, 0.16)',
} as const;

export const groupColors = {
  family: palette.blue500,
  friends: palette.cyan400,
  team: palette.green500,
} as const;

export const darkColors = {
  background: palette.navy950,
  backgroundElevated: '#091A37',
  surface: palette.navy900,
  surfaceElevated: '#122B57',
  surfaceInteractive: '#173565',
  border: alpha.white12,
  borderStrong: alpha.white24,
  textPrimary: palette.white,
  textSecondary: '#B7C1D3',
  textMuted: palette.gray500,
  textInverse: palette.navy950,
  disabled: '#536078',
  disabledSurface: alpha.white08,
  primary: palette.blue500,
  primaryPressed: '#3B76E8',
  primarySoft: alpha.primary20,
  accent: palette.cyan400,
  success: palette.green500,
  successSoft: alpha.success16,
  warning: palette.yellow400,
  warningSoft: alpha.warning16,
  error: palette.red400,
  errorSoft: alpha.error16,
  info: palette.blue500,
  infoSoft: alpha.primary12,
  live: palette.green500,
  offline: palette.gray500,
  overlay: alpha.black56,
  overlayStrong: alpha.black72,
  focusRing: palette.cyan400,
  family: groupColors.family,
  friends: groupColors.friends,
  team: groupColors.team,
} as const;

export const lightColors = {
  background: '#F5F7FB',
  backgroundElevated: palette.white,
  surface: palette.white,
  surfaceElevated: '#F0F4FA',
  surfaceInteractive: '#E8F0FF',
  border: '#D7DEEA',
  borderStrong: '#B7C1D3',
  textPrimary: palette.navy950,
  textSecondary: '#3F4D66',
  textMuted: '#66738A',
  textInverse: palette.white,
  disabled: '#9AA5B8',
  disabledSurface: '#E7EBF2',
  primary: '#3979F0',
  primaryPressed: '#2B65D1',
  primarySoft: '#E5EEFF',
  accent: '#087F91',
  success: '#12845B',
  successSoft: '#DDF7ED',
  warning: '#9B6700',
  warningSoft: '#FFF2D2',
  error: '#C9384F',
  errorSoft: '#FFE4E8',
  info: '#276ED9',
  infoSoft: '#E5EEFF',
  live: '#12845B',
  offline: '#66738A',
  overlay: alpha.black40,
  overlayStrong: alpha.black56,
  focusRing: '#087F91',
  family: '#3979F0',
  friends: '#087F91',
  team: '#12845B',
} as const;

export const colors = {
  palette,
  alpha,
  groups: groupColors,
  dark: darkColors,
  light: lightColors,
} as const;

export type ThemeMode = 'dark' | 'light';
export type ThemeColors = typeof darkColors | typeof lightColors;
export type ColorToken = keyof typeof darkColors;

