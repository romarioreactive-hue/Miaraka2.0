import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, useColorScheme, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, radius } from '@/theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radiusValue?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height = 16, radiusValue = radius.small, style }: SkeletonProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const opacity = useRef(new Animated.Value(0.48)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.64);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          toValue: 0.48,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      accessibilityLabel="Contenu en cours de chargement"
      accessibilityRole="progressbar"
      style={[
        styles.block,
        {
          backgroundColor: theme.disabledSurface,
          borderRadius: radiusValue,
          height,
          opacity,
          width,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
});
