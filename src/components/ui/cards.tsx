import type { PropsWithChildren, ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, radius, shadowSmall, spacing } from '@/theme';

export type CardVariant = 'surface' | 'elevated' | 'interactive';

export type CardProps = PropsWithChildren<{
  variant?: CardVariant;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  header?: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

const floatingShadow = Platform.OS === 'web'
  ? shadowSmall.web
  : Platform.OS === 'android'
    ? shadowSmall.android
    : shadowSmall.ios;

export function Card({
  children,
  variant = 'surface',
  selected = false,
  onPress,
  accessibilityLabel,
  header,
  footer,
  style,
}: CardProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const backgroundColor = variant === 'surface'
    ? theme.surface
    : variant === 'elevated'
      ? theme.surfaceElevated
      : theme.surfaceInteractive;
  const cardStyle = [
    styles.card,
    variant === 'elevated' && floatingShadow,
    {
      backgroundColor,
      borderColor: selected ? theme.primary : theme.border,
    },
    style,
  ];

  const content = (
    <>
      {header ? <View style={styles.header}>{header}</View> : null}
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  if (!onPress) {
    return <View style={cardStyle}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.large,
    borderWidth: 1,
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[3],
  },
  footer: {
    marginTop: spacing[4],
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
