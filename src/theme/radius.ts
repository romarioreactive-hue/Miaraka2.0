export const radius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 24,
  pill: 999,
  circle: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

