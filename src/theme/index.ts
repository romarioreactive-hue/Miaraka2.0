export * from './assets';
export * from './colors';
export * from './radius';
export * from './shadows';
export * from './spacing';
export * from './typography';

import { avatars, logos } from './assets';
import { colors } from './colors';
import { radius } from './radius';
import { glow, shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
  glow,
  assets: { logos, avatars },
} as const;

export type Theme = typeof theme;
