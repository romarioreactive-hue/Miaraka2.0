import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, spacing, typography } from '@/theme';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  value?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  divider?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function ListItem({
  title,
  subtitle,
  value,
  leading,
  trailing,
  onPress,
  disabled = false,
  divider = false,
  accessibilityLabel,
  style,
}: ListItemProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const content = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: disabled ? theme.disabled : theme.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {value ? <Text numberOfLines={1} style={[styles.value, { color: theme.textSecondary }]}>{value}</Text> : null}
      {trailing ?? (onPress ? <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text> : null)}
    </>
  );
  const baseStyle = [
    styles.container,
    divider && { borderBottomColor: theme.border, borderBottomWidth: 1 },
    disabled && styles.disabled,
    style,
  ];

  if (!onPress) {
    return <View style={baseStyle}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? [title, value, subtitle].filter(Boolean).join(', ')}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [baseStyle, pressed && { backgroundColor: theme.surfaceInteractive }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
    minHeight: 64,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  copy: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.caption,
  },
  value: {
    ...typography.bodyMedium,
    flexShrink: 1,
    textAlign: 'right',
  },
  chevron: {
    fontSize: 28,
    lineHeight: 30,
  },
  disabled: {
    opacity: 0.7,
  },
});
