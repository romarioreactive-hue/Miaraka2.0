export * from './colors';
export * from './radius';
export * from './shadows';
export * from './spacing';
export * from './typography';

import { colors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
} as const;

export type Theme = typeof theme;
