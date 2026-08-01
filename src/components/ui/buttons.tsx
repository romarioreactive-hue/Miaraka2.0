import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, radius, spacing, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'compact' | 'regular';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  size = 'regular',
  leading,
  trailing,
  loading = false,
  fullWidth = false,
  disabled = false,
  style,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const isDisabled = disabled || loading;
  const background = {
    primary: theme.primary,
    secondary: theme.surfaceElevated,
    ghost: 'transparent',
    danger: theme.error,
  }[variant];
  const foreground = {
    primary: theme.textInverse,
    secondary: theme.textPrimary,
    ghost: theme.primary,
    danger: theme.textInverse,
  }[variant];
  const pressedBackground = {
    primary: theme.primaryPressed,
    secondary: theme.surfaceInteractive,
    ghost: theme.primarySoft,
    danger: theme.error,
  }[variant];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'compact' ? styles.compact : styles.regular,
        {
          backgroundColor: isDisabled ? theme.disabledSurface : pressed ? pressedBackground : background,
          borderColor: variant === 'secondary' ? theme.borderStrong : variant === 'ghost' ? 'transparent' : background,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={isDisabled ? theme.disabled : foreground} />
      ) : (
        <>
          {leading}
          <Text style={[styles.label, { color: isDisabled ? theme.disabled : foreground }]}>{label}</Text>
          {trailing}
        </>
      )}
    </Pressable>
  );
}

export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />;
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />;
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  regular: {
    minHeight: 48,
  },
  compact: {
    minHeight: 40,
    paddingHorizontal: spacing[3],
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  label: {
    ...typography.labelLarge,
  },
});
