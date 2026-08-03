import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/cards';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

type OnboardingLocationScreenProps = {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

const COLORS = {
  background: darkColors.background,
  mapBackground: darkColors.background,
  mapRoad: darkColors.surfaceInteractive,
  mapRoadMuted: darkColors.surfaceElevated,
  mapBlock: darkColors.surface,
  panel: 'rgba(12, 33, 71, 0.94)',
  panelBorder: darkColors.border,
  text: darkColors.textPrimary,
  textSecondary: darkColors.textSecondary,
  green: darkColors.success,
  brightGreen: darkColors.success,
  cyan: darkColors.accent,
  blue: darkColors.primary,
  paleBlue: darkColors.accent,
  surfaceHigh: darkColors.surfaceElevated,
  outline: darkColors.border,
} as const;

export function OnboardingLocationScreen({ onBack, onContinue, onSkip }: OnboardingLocationScreenProps) {
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const title = t('onboarding.2.title');
  const accentStart = Math.max(0, title.indexOf(language === 'fr' ? 'en temps' : 'nahazoana'));
  const titleLead = title.slice(0, accentStart).trim();
  const titleAccent = title.slice(accentStart).trim();

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <MapIllustration />
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onSkip}
          style={({ pressed }) => [
            styles.skipButton,
            { top: insets.top + spacing[3] },
            pressed && styles.pressed,
          ]}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </Pressable>
      </View>

      <Animated.View
        entering={FadeInDown.duration(500).easing(Easing.out(Easing.cubic))}
        style={[
          styles.panel,
          { paddingBottom: Math.max(spacing[12], insets.bottom + spacing[4]) },
        ]}>
        <View
          accessibilityLabel={t('onboarding.step', { current: 2 })}
          style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.activeDot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>
            {titleLead}{' '}
            <Text style={styles.titleAccent}>{titleAccent}</Text>
          </Text>
          <Text style={styles.description}>{t('onboarding.2.text')}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            fullWidth
            label={t('common.continue')}
            onPress={onContinue}
            style={styles.primaryButton}
          />
          <SecondaryButton
            fullWidth
            label={t('common.back')}
            onPress={onBack}
            style={styles.backButton}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function MapIllustration() {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const etaY = useSharedValue(0);
  const destinationScale = useSharedValue(1);
  const destinationOpacity = useSharedValue(0.75);

  useEffect(() => {
    if (reduceMotion) return;
    etaY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    destinationScale.value = withRepeat(
      withSequence(
        withTiming(1.55, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.in(Easing.ease) }),
      ),
      -1,
    );
    destinationOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 1500 }),
        withTiming(0.75, { duration: 1500 }),
      ),
      -1,
    );
  }, [destinationOpacity, destinationScale, etaY, reduceMotion]);

  const etaStyle = useAnimatedStyle(() => ({ transform: [{ translateY: etaY.value }] }));
  const destinationPulseStyle = useAnimatedStyle(() => ({
    opacity: destinationOpacity.value,
    transform: [{ scale: destinationScale.value }],
  }));

  return (
    <View accessibilityLabel="Carte fictive avec un trajet autorisé" style={styles.map}>
      <View style={styles.mapVignette} />
      <MapBlocks />
      <MapRoad style={styles.roadOne} />
      <MapRoad style={styles.roadTwo} />
      <MapRoad style={styles.roadThree} />
      <MapRoad style={styles.roadFour} />
      <MapRoad style={styles.roadFive} muted />
      <MapRoad style={styles.roadSix} muted />

      <View style={styles.routeLayer}>
        <RouteSegment delay={500} targetWidth={width * 0.27} style={styles.routeOne} />
        <RouteSegment delay={1250} targetWidth={width * 0.29} style={styles.routeTwo} />
        <RouteSegment delay={2050} targetWidth={width * 0.26} style={styles.routeThree} />

        <View style={styles.originGlow} />
        <View style={styles.origin} />
        <Animated.View style={[styles.destinationPulse, destinationPulseStyle]} />
        <View style={styles.destination} />
      </View>

      <Animated.View entering={FadeIn.delay(900).duration(450)} style={[styles.etaWrap, etaStyle]}>
        <Card style={styles.etaCard}>
          <SymbolView
            name={{ ios: 'timer', android: 'timer', web: 'timer' }}
            size={20}
            tintColor={COLORS.paleBlue}
            weight="semibold"
          />
          <Text style={styles.etaText}>ETA 15 min</Text>
        </Card>
      </Animated.View>
    </View>
  );
}

function MapRoad({ style, muted = false }: { style: StyleProp<ViewStyle>; muted?: boolean }) {
  return <View style={[styles.road, muted && styles.roadMuted, style]} />;
}

function MapBlocks() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.mapBlock, styles.blockOne]} />
      <View style={[styles.mapBlock, styles.blockTwo]} />
      <View style={[styles.mapBlock, styles.blockThree]} />
      <View style={[styles.mapBlock, styles.blockFour]} />
      <View style={[styles.mapBlock, styles.blockFive]} />
    </View>
  );
}

function RouteSegment({ delay, targetWidth, style }: { delay: number; targetWidth: number; style: StyleProp<ViewStyle> }) {
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(reduceMotion ? targetWidth : 0);

  useEffect(() => {
    if (reduceMotion) {
      width.value = targetWidth;
      return;
    }
    width.value = withDelay(
      delay,
      withTiming(targetWidth, { duration: 950, easing: Easing.inOut(Easing.cubic) }),
    );
  }, [delay, reduceMotion, targetWidth, width]);

  const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));
  return <Animated.View style={[styles.routeSegment, style, animatedStyle]} />;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
    overflow: 'hidden',
  },
  hero: {
    flex: 1,
    minHeight: 360,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.mapBackground,
    overflow: 'hidden',
  },
  mapVignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 20, 43, 0.22)',
    experimental_backgroundImage: 'radial-gradient(circle at center, rgba(79, 140, 255, 0.08) 0%, rgba(6, 20, 43, 0.72) 100%)',
    zIndex: 5,
  },
  mapBlock: {
    backgroundColor: COLORS.mapBlock,
    borderColor: 'rgba(79, 140, 255, 0.08)',
    borderRadius: radius.large,
    borderWidth: 1,
    position: 'absolute',
  },
  blockOne: {
    height: 120,
    left: -30,
    top: 58,
    transform: [{ rotate: '-12deg' }],
    width: 160,
  },
  blockTwo: {
    height: 150,
    right: -18,
    top: 38,
    transform: [{ rotate: '9deg' }],
    width: 178,
  },
  blockThree: {
    bottom: 116,
    height: 142,
    left: 32,
    transform: [{ rotate: '8deg' }],
    width: 150,
  },
  blockFour: {
    bottom: 60,
    height: 132,
    right: 30,
    transform: [{ rotate: '-10deg' }],
    width: 156,
  },
  blockFive: {
    height: 90,
    left: '35%',
    top: '38%',
    transform: [{ rotate: '22deg' }],
    width: 112,
  },
  road: {
    backgroundColor: COLORS.mapRoad,
    borderRadius: radius.pill,
    height: 10,
    position: 'absolute',
    zIndex: 2,
  },
  roadMuted: {
    backgroundColor: COLORS.mapRoadMuted,
    height: 6,
  },
  roadOne: {
    left: -70,
    right: -70,
    top: '24%',
    transform: [{ rotate: '-8deg' }],
  },
  roadTwo: {
    left: -90,
    right: -90,
    top: '61%',
    transform: [{ rotate: '17deg' }],
  },
  roadThree: {
    height: '130%',
    left: '28%',
    top: -80,
    transform: [{ rotate: '8deg' }],
    width: 12,
  },
  roadFour: {
    height: '130%',
    right: '24%',
    top: -60,
    transform: [{ rotate: '-16deg' }],
    width: 9,
  },
  roadFive: {
    left: -40,
    right: 50,
    top: '43%',
    transform: [{ rotate: '29deg' }],
  },
  roadSix: {
    left: 80,
    right: -80,
    top: '76%',
    transform: [{ rotate: '-24deg' }],
  },
  routeLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  routeSegment: {
    backgroundColor: COLORS.cyan,
    borderRadius: radius.pill,
    height: 4,
    position: 'absolute',
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  routeOne: {
    bottom: '24%',
    left: '24%',
    transform: [{ rotate: '-30deg' }],
  },
  routeTwo: {
    bottom: '38%',
    left: '42%',
    transform: [{ rotate: '-34deg' }],
  },
  routeThree: {
    bottom: '54%',
    left: '61%',
    transform: [{ rotate: '-38deg' }],
  },
  originGlow: {
    backgroundColor: 'rgba(79, 140, 255, 0.22)',
    borderRadius: radius.circle,
    bottom: '17%',
    height: 32,
    left: '21%',
    position: 'absolute',
    width: 32,
  },
  origin: {
    backgroundColor: COLORS.blue,
    borderRadius: radius.circle,
    bottom: '19%',
    height: 16,
    left: '23%',
    position: 'absolute',
    width: 16,
  },
  destinationPulse: {
    borderColor: COLORS.green,
    borderRadius: radius.circle,
    borderWidth: 2,
    bottom: '58%',
    height: 28,
    position: 'absolute',
    right: '22%',
    width: 28,
  },
  destination: {
    backgroundColor: COLORS.green,
    borderRadius: radius.circle,
    bottom: '60%',
    height: 12,
    position: 'absolute',
    right: '24%',
    width: 12,
  },
  etaWrap: {
    left: '50%',
    marginLeft: -68,
    marginTop: -24,
    position: 'absolute',
    top: '50%',
    zIndex: 20,
  },
  etaCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(12, 33, 71, 0.78)',
    borderColor: COLORS.panelBorder,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing[2],
    minHeight: 48,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    shadowColor: COLORS.blue,
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  etaText: {
    ...typography.labelMedium,
    color: COLORS.text,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
    position: 'absolute',
    right: spacing[3],
    zIndex: 30,
  },
  skipText: {
    ...typography.labelMedium,
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },
  panel: {
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    marginTop: -40,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    shadowColor: '#000000',
    shadowOffset: { height: -8, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    zIndex: 20,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    marginBottom: spacing[6],
    minHeight: 8,
  },
  activeDot: {
    backgroundColor: COLORS.green,
    borderRadius: radius.pill,
    experimental_backgroundImage: 'linear-gradient(90deg, #29D391 0%, #6C63FF 100%)',
    height: 6,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    width: 32,
  },
  dot: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: radius.circle,
    height: 6,
    width: 6,
  },
  copy: {
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[12],
  },
  title: {
    ...typography.titleLarge,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 34,
    maxWidth: 390,
    textAlign: 'center',
  },
  titleAccent: {
    color: COLORS.brightGreen,
  },
  description: {
    ...typography.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 330,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'center',
    gap: spacing[4],
    maxWidth: 420,
    width: '100%',
  },
  primaryButton: {
    borderColor: COLORS.green,
    borderRadius: radius.pill,
    experimental_backgroundImage: 'linear-gradient(135deg, #29D391 0%, #6C63FF 100%)',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(68, 73, 53, 0.30)',
    borderRadius: radius.pill,
  },
});
