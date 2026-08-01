import { ActivityIndicator, StyleSheet, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, spacing, typography } from '@/theme';

export type LoadingProps = {
  label?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  style?: StyleProp<ViewStyle>;
};

export function Loading({ label = 'Chargement…', fullScreen = false, size = 'small', style }: LoadingProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator color={theme.primary} size={size} />
      {label ? <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[3],
    justifyContent: 'center',
    minHeight: 48,
  },
  fullScreen: {
    flex: 1,
    padding: spacing[6],
  },
  label: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
});
