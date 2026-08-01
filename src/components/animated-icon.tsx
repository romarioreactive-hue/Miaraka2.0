import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  Easing,
  FadeIn,
  FadeInUp,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { darkColors, logos, radius, spacing, typography } from '@/theme';

const COLORS = {
  background: darkColors.background,
  green: darkColors.success,
  cyan: darkColors.accent,
  blue: darkColors.primary,
  progressTrack: darkColors.surfaceInteractive,
} as const;

const PROGRESS_WIDTH = 192;
const DISPLAY_TIME = 4000;

export function AnimatedSplashOverlay() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const started = useRef(false);
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const overlayOpacity = useSharedValue(1);

  const start = useCallback(() => {
    if (started.current) return;
    started.current = true;
    if (Platform.OS === 'web') {
      setReady(true);
      return;
    }
    SplashScreen.hideAsync().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (reduceMotion) {
      progress.value = 1;
      glowOpacity.value = 0.5;
    } else {
      progress.value = withDelay(
        500,
        withTiming(1, { duration: 3000, easing: Easing.out(Easing.cubic) }),
      );
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    }

    const timeout = setTimeout(() => {
      overlayOpacity.value = withTiming(
        0,
        { duration: reduceMotion ? 120 : 400, easing: Easing.out(Easing.cubic) },
        (finished) => {
          'worklet';
          if (finished) scheduleOnRN(setVisible, false);
        },
      );
    }, reduceMotion ? 1100 : DISPLAY_TIME);

    return () => {
      clearTimeout(timeout);
      cancelAnimation(progress);
      cancelAnimation(glowScale);
      cancelAnimation(glowOpacity);
      cancelAnimation(overlayOpacity);
    };
  }, [glowOpacity, glowScale, overlayOpacity, progress, ready, reduceMotion]);

  const progressStyle = useAnimatedStyle<ViewStyle>(() => ({
    width: PROGRESS_WIDTH * progress.value,
  }));
  const glowStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const overlayStyle = useAnimatedStyle<ViewStyle>(() => ({ opacity: overlayOpacity.value }));

  if (!visible) return null;

  return (
    <Animated.View onLayout={start} style={[styles.root, overlayStyle]}>
      {ready ? (
        <SplashScene
          glowStyle={glowStyle}
          progressStyle={progressStyle}
          reduceMotion={reduceMotion}
        />
      ) : null}
    </Animated.View>
  );
}

type SplashSceneProps = {
  glowStyle: AnimatedStyle<ViewStyle>;
  progressStyle: AnimatedStyle<ViewStyle>;
  reduceMotion: boolean;
};

function SplashScene({ glowStyle, progressStyle, reduceMotion }: SplashSceneProps) {
  const { width } = useWindowDimensions();
  const desktop = width >= 768;
  const entering = (delay: number) => reduceMotion
    ? FadeIn.duration(1)
    : FadeInUp.delay(delay).duration(1500).easing(Easing.bezier(0.22, 1, 0.36, 1));

  return (
    <View style={styles.scene}>
      <View pointerEvents="none" style={styles.atmosphere}>
        <Animated.View style={[styles.glow, styles.glowCenter, glowStyle]} />
        <Animated.View style={[styles.glow, styles.glowTop, styles.delayedGlow, glowStyle]} />
        <Animated.View style={[styles.glow, styles.glowBottom, styles.softGlow, glowStyle]} />
      </View>

      <View style={styles.mainContent}>
        <Animated.View entering={entering(0)} style={styles.brandLockup}>
          <BrandMark large={desktop} />
        </Animated.View>

        <Animated.View entering={entering(700)} style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </Animated.View>
      </View>
    </View>
  );
}

function BrandMark({ large = false }: { large?: boolean }) {
  const size = large ? 240 : 208;

  return (
    <View style={[styles.logoShell, { height: size + 48, width: size + 48 }]}>
      <View style={[styles.outerLogoGlow, { height: size + 26, width: size + 26 }]} />
      <Image
        accessibilityLabel="Logo Miaraka"
        accessibilityRole="image"
        resizeMode="contain"
        source={logos.mark}
        style={[styles.logoImage, { height: size, width: size }]}
      />
    </View>
  );
}

export function AnimatedIcon() {
  return <BrandMark />;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
    zIndex: 1000,
  },
  scene: {
    flex: 1,
    overflow: 'hidden',
  },
  atmosphere: {
    ...StyleSheet.absoluteFill,
  },
  glow: {
    borderRadius: radius.circle,
    position: 'absolute',
  },
  glowCenter: {
    alignSelf: 'center',
    backgroundColor: 'rgba(79, 140, 255, 0.14)',
    experimental_backgroundImage: 'radial-gradient(circle, rgba(79, 140, 255, 0.24) 0%, rgba(79, 140, 255, 0) 72%)',
    height: 500,
    left: '50%',
    marginLeft: -250,
    marginTop: -250,
    top: '50%',
    width: 500,
  },
  glowTop: {
    backgroundColor: 'rgba(62, 224, 157, 0.08)',
    experimental_backgroundImage: 'radial-gradient(circle, rgba(62, 224, 157, 0.18) 0%, rgba(62, 224, 157, 0) 72%)',
    height: 300,
    right: '10%',
    top: '18%',
    width: 300,
  },
  glowBottom: {
    backgroundColor: 'rgba(56, 214, 232, 0.09)',
    experimental_backgroundImage: 'radial-gradient(circle, rgba(56, 214, 232, 0.18) 0%, rgba(56, 214, 232, 0) 72%)',
    bottom: '8%',
    height: 400,
    left: '5%',
    width: 400,
  },
  delayedGlow: {
    transform: [{ scale: 0.92 }],
  },
  softGlow: {
    opacity: 0.5,
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
  },
  brandLockup: {
    alignItems: 'center',
  },
  logoShell: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  outerLogoGlow: {
    backgroundColor: 'rgba(56, 214, 232, 0.12)',
    borderRadius: radius.circle,
    experimental_backgroundImage: 'radial-gradient(circle, rgba(56, 214, 232, 0.28) 0%, rgba(79, 140, 255, 0) 72%)',
    position: 'absolute',
  },
  logoImage: {
    borderRadius: radius.large,
  },
  progressTrack: {
    backgroundColor: COLORS.progressTrack,
    borderRadius: radius.pill,
    bottom: 96,
    height: 2,
    overflow: 'hidden',
    position: 'absolute',
    width: PROGRESS_WIDTH,
  },
  progressBar: {
    backgroundColor: COLORS.cyan,
    borderRadius: radius.pill,
    experimental_backgroundImage: 'linear-gradient(90deg, #3EE09D 0%, #38D6E8 50%, #4F8CFF 100%)',
    height: 2,
  },
});
