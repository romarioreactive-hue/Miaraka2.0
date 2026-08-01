import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, spacing, typography } from '@/theme';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Header({
  title,
  subtitle,
  onBack,
  backLabel = 'Retour',
  leading,
  trailing,
  bordered = false,
  style,
}: HeaderProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;

  return (
    <View
      accessibilityRole="header"
      style={[
        styles.container,
        bordered && { borderBottomColor: theme.border, borderBottomWidth: 1 },
        style,
      ]}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            accessibilityLabel={backLabel}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={[styles.backIcon, { color: theme.primary }]}>‹</Text>
          </Pressable>
        ) : leading}
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.trailing]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
    minHeight: 64,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  side: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 48,
  },
  trailing: {
    alignItems: 'flex-end',
  },
  backButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  backIcon: {
    fontSize: 38,
    lineHeight: 40,
  },
  copy: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    ...typography.titleLarge,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});
