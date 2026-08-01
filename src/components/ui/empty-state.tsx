import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, spacing, typography } from '@/theme';
import { PrimaryButton, SecondaryButton } from './buttons';

export type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: EmptyStateProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;

  return (
    <View accessibilityRole="summary" style={[styles.container, style]}>
      {icon ? <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>{icon}</View> : null}
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <SecondaryButton label={secondaryActionLabel} onPress={onSecondaryAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[4],
    justifyContent: 'center',
    padding: spacing[6],
  },
  icon: {
    alignItems: 'center',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  copy: {
    alignItems: 'center',
    gap: spacing[2],
    maxWidth: 360,
  },
  title: {
    ...typography.titleMedium,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
});
