type WebShadow = {
  readonly boxShadow: string;
};

type AndroidShadow = {
  readonly elevation: number;
  readonly shadowColor: string;
};

type IosShadow = {
  readonly shadowColor: string;
  readonly shadowOffset: { readonly width: number; readonly height: number };
  readonly shadowOpacity: number;
  readonly shadowRadius: number;
};

export type ShadowToken = {
  readonly web: WebShadow;
  readonly android: AndroidShadow;
  readonly ios: IosShadow;
};

export const shadowSmall: ShadowToken = {
  web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.16)' },
  android: { elevation: 2, shadowColor: '#000000' },
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
};

export const shadowMedium: ShadowToken = {
  web: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.24)' },
  android: { elevation: 6, shadowColor: '#000000' },
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
};

export const shadowLarge: ShadowToken = {
  web: { boxShadow: '0 16px 48px rgba(0, 0, 0, 0.32)' },
  android: { elevation: 12, shadowColor: '#000000' },
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
  },
};

export const glowPrimary: ShadowToken = {
  web: { boxShadow: '0 0 24px rgba(108, 99, 255, 0.48)' },
  android: { elevation: 8, shadowColor: '#6C63FF' },
  ios: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.48,
    shadowRadius: 12,
  },
};

export const glowLive: ShadowToken = {
  web: { boxShadow: '0 0 20px rgba(41, 211, 145, 0.48)' },
  android: { elevation: 8, shadowColor: '#29D391' },
  ios: {
    shadowColor: '#29D391',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.48,
    shadowRadius: 10,
  },
};

export const shadows = {
  small: shadowSmall,
  medium: shadowMedium,
  large: shadowLarge,
  primaryGlow: glowPrimary,
  liveGlow: glowLive,
} as const;

/** Alias explicite pour les halos lumineux (glow) utilisés sur les états actifs/en direct. */
export const glow = {
  primary: glowPrimary,
  live: glowLive,
} as const;

