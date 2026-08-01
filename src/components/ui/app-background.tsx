import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { alpha, darkColors } from '@/theme';

export type AppBackgroundVariant = 'default' | 'onboarding' | 'dashboard' | 'map' | 'profile';

export type AppBackgroundProps = PropsWithChildren<{
  variant?: AppBackgroundVariant;
  style?: StyleProp<ViewStyle>;
}>;

type HaloSpec = { color: string; size: number; top?: number; bottom?: number; left?: number; right?: number };

const HALOS: Record<AppBackgroundVariant, HaloSpec[]> = {
  default: [
    { color: alpha.primary12, size: 340, top: -160, right: -120 },
    { color: alpha.cyan16, size: 300, bottom: -180, left: -120 },
  ],
  onboarding: [
    { color: darkColors.primarySoft, size: 380, top: -180, right: -130 },
    { color: alpha.cyan16, size: 340, bottom: -200, left: -140 },
  ],
  dashboard: [
    { color: alpha.success16, size: 280, top: -140, left: -100 },
    { color: alpha.primary12, size: 320, bottom: -180, right: -140 },
  ],
  map: [
    { color: alpha.cyan16, size: 260, top: -120, right: -100 },
  ],
  profile: [
    { color: darkColors.primarySoft, size: 300, top: -150, left: -110 },
    { color: alpha.success16, size: 260, bottom: -160, right: -120 },
  ],
};

/**
 * Fond programmatique commun à tous les écrans : couleur de base du thème
 * + halos doux positionnés selon le contexte (onboarding, tableau de bord, carte, profil).
 * Ne charge aucune image : reste léger et cohérent sur Web, Android et iOS.
 */
export function AppBackground({ variant = 'default', style, children }: AppBackgroundProps) {
  const halos = HALOS[variant];

  return (
    <View style={[styles.root, style]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {halos.map((halo, index) => (
          <View
            key={index}
            style={[
              styles.halo,
              {
                backgroundColor: halo.color,
                height: halo.size,
                width: halo.size,
                borderRadius: halo.size / 2,
                top: halo.top,
                bottom: halo.bottom,
                left: halo.left,
                right: halo.right,
              },
            ]}
          />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: darkColors.background,
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
  },
});
