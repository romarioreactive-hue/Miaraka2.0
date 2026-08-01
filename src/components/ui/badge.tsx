import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, radius, spacing, typography } from '@/theme';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'family' | 'friends' | 'team';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, variant = 'neutral', icon, style }: BadgeProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const foreground = {
    neutral: theme.textSecondary,
    primary: theme.primary,
    success: theme.success,
    warning: theme.warning,
    error: theme.error,
    family: theme.family,
    friends: theme.friends,
    team: theme.team,
  }[variant];
  const background = {
    neutral: theme.disabledSurface,
    primary: theme.primarySoft,
    success: theme.successSoft,
    warning: theme.warningSoft,
    error: theme.errorSoft,
    family: theme.primarySoft,
    friends: theme.infoSoft,
    team: theme.successSoft,
  }[variant];

  return (
    <View accessibilityLabel={label} style={[styles.badge, { backgroundColor: background }, style]}>
      {icon}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing[1],
    minHeight: 28,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  label: {
    ...typography.labelMedium,
  },
});
