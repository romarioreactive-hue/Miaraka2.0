import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { darkColors, lightColors, radius, shadowMedium, spacing, typography } from '@/theme';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export type ToastProps = {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  position?: 'top' | 'bottom';
  duration?: number;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
};

const toastShadow = Platform.OS === 'web'
  ? shadowMedium.web
  : Platform.OS === 'android'
    ? shadowMedium.android
    : shadowMedium.ios;

export function Toast({
  visible,
  message,
  variant = 'info',
  position = 'bottom',
  duration = 3000,
  onDismiss,
  style,
}: ToastProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(position === 'top' ? -12 : 12));
  const accent = {
    info: theme.info,
    success: theme.success,
    warning: theme.warning,
    error: theme.error,
  }[variant];

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }

    translateY.setValue(position === 'top' ? -12 : 12);
    Animated.parallel([
      Animated.timing(opacity, { duration: 200, toValue: 1, useNativeDriver: true }),
      Animated.timing(translateY, { duration: 200, toValue: 0, useNativeDriver: true }),
    ]).start();

    if (!onDismiss || duration <= 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss, opacity, position, translateY, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.toast,
        toastShadow,
        position === 'top'
          ? { top: Math.max(insets.top, spacing[4]) }
          : { bottom: Math.max(insets.bottom, spacing[4]) },
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: accent,
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}>
      <Text style={[styles.message, { color: theme.textPrimary }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    borderLeftWidth: 4,
    borderRadius: radius.medium,
    left: spacing[4],
    maxWidth: 480,
    minHeight: 48,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    position: 'absolute',
    right: spacing[4],
    zIndex: 1000,
  },
  message: {
    ...typography.bodyMedium,
    fontWeight: '600',
    textAlign: 'center',
  },
});
