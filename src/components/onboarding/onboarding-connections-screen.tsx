import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, type AvatarSize } from '@/components/ui/avatar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { useLanguage } from '@/contexts/language-context';
import { avatars, darkColors, radius, spacing, typography } from '@/theme';
import type { ImageSourcePropType } from 'react-native';

type OnboardingConnectionsScreenProps = {
  onContinue: () => void;
  onSkip: () => void;
};

const COLORS = {
  background: darkColors.background,
  text: darkColors.textPrimary,
  textSecondary: darkColors.textSecondary,
  green: darkColors.success,
  brightGreen: darkColors.success,
  cyan: darkColors.accent,
  blue: darkColors.primary,
  paleBlue: darkColors.accent,
  surface: darkColors.surface,
  surfaceHigh: darkColors.surfaceElevated,
  outline: darkColors.border,
} as const;

export function OnboardingConnectionsScreen({ onContinue, onSkip }: OnboardingConnectionsScreenProps) {
  const { language, t } = useLanguage();
  const { width } = useWindowDimensions();
  const canvasSize = Math.min(400, Math.max(280, width - 40));
  const title = t('onboarding.1.title');
  const accentStart = Math.max(0, title.indexOf(language === 'fr' ? 'ceux' : 'ireo'));
  const titleLead = title.slice(0, accentStart).trim();
  const titleAccent = title.slice(accentStart).trim();
  const accentWords = titleAccent.split(' ');
  const accentLastWord = accentWords.pop();
  const accentFirstWords = accentWords.join(' ');

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.atmosphericGlow, styles.glowTop]} />
      <View pointerEvents="none" style={[styles.atmosphericGlow, styles.glowBottom]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ConnectionsVisual size={canvasSize} />

          <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>
              {titleLead}{'\n'}
              <Text style={styles.titleGreen}>{accentFirstWords} </Text>
              <Text style={styles.titleBlue}>{accentLastWord}</Text>
            </Text>
            <Text style={styles.description}>{t('onboarding.1.text')}</Text>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <View
            accessibilityLabel={t('onboarding.step', { current: 1 })}
            style={styles.pagination}>
            <View style={styles.activeDot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <PrimaryButton
            fullWidth
            label={t('common.continue')}
            onPress={onContinue}
            style={styles.primaryButton}
          />
          <SecondaryButton
            fullWidth
            label={t('common.skip')}
            onPress={onSkip}
            style={styles.skipButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function ConnectionsVisual({ size }: { size: number }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.2);
  const scale = size / 400;

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [pulse, pulseOpacity, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={[styles.visualFrame, { height: size, width: size }]}>
      <Animated.View
        entering={FadeIn.duration(450)}
        style={[styles.visual, { transform: [{ scale }] }]}>
        <ConnectionLine delay={500} style={styles.lineTopLeft} />
        <ConnectionLine delay={700} style={styles.lineTopRight} />
        <ConnectionLine delay={900} style={styles.lineBottomRight} />
        <ConnectionLine delay={1100} style={styles.lineBottomLeft} />

        <Animated.View entering={ZoomIn.delay(100).duration(600)} style={styles.centerPinWrap}>
          <Animated.View style={[styles.centerPulse, pulseStyle]} />
          <View style={styles.centerPin}>
            <SymbolView
              name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }}
              size={40}
              tintColor="#FFFFFF"
              weight="bold"
            />
          </View>
        </Animated.View>

        <FloatingAvatar
          color={COLORS.blue}
          delay={1200}
          name="Papa"
          size={64}
          source={avatars.papa}
          style={styles.avatarTopLeft}
          visualScale={0.875}
        />
        <FloatingAvatar
          color={COLORS.cyan}
          delay={1400}
          name="Rica"
          size={48}
          source={avatars.rica}
          style={styles.avatarTopRight}
        />
        <FloatingAvatar
          color={COLORS.green}
          delay={1600}
          name="Équipe XR"
          size={64}
          style={styles.avatarBottomRight}
        />
        <FloatingAvatar
          color={COLORS.paleBlue}
          delay={1800}
          name="Mario"
          size={64}
          source={avatars.mario}
          style={styles.avatarBottomLeft}
          visualScale={0.875}
        />
      </Animated.View>
    </View>
  );
}

function ConnectionLine({ delay, style }: { delay: number; style: object }) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(700)}
      style={[styles.connectionLine, style]}
    />
  );
}

type FloatingAvatarProps = {
  name: string;
  color: string;
  size: AvatarSize;
  delay: number;
  style: object;
  visualScale?: number;
  source?: ImageSourcePropType;
};

function FloatingAvatar({ name, color, size, delay, style, visualScale = 1, source }: FloatingAvatarProps) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 2800 + delay / 4, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2800 + delay / 4, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
  }, [delay, reduceMotion, translateY]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: visualScale }],
  }));

  return (
    <Animated.View
      entering={reduceMotion ? FadeIn.duration(1) : ZoomIn.delay(delay).duration(600)}
      style={[styles.floatingAvatar, style]}>
      <Animated.View style={floatingStyle}>
        <Avatar
          backgroundColor={`${color}30`}
          initials={name === 'Équipe XR' ? 'XR' : undefined}
          name={name}
          ringColor={COLORS.surfaceHigh}
          size={size}
          source={source}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  atmosphericGlow: {
    borderRadius: radius.circle,
    position: 'absolute',
  },
  glowTop: {
    backgroundColor: 'rgba(79, 140, 255, 0.10)',
    experimental_backgroundImage: 'radial-gradient(circle, rgba(79, 140, 255, 0.18) 0%, rgba(79, 140, 255, 0) 72%)',
    height: 420,
    left: -180,
    top: -160,
    width: 420,
  },
  glowBottom: {
    backgroundColor: 'rgba(62, 224, 157, 0.08)',
    experimental_backgroundImage: 'radial-gradient(circle, rgba(62, 224, 157, 0.16) 0%, rgba(62, 224, 157, 0) 72%)',
    bottom: -180,
    height: 360,
    right: -160,
    width: 360,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  visualFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  visual: {
    alignItems: 'center',
    height: 400,
    justifyContent: 'center',
    position: 'relative',
    width: 400,
  },
  connectionLine: {
    backgroundColor: COLORS.cyan,
    experimental_backgroundImage: 'linear-gradient(90deg, #29D391 0%, #6C63FF 100%)',
    height: 2,
    opacity: 0.8,
    position: 'absolute',
  },
  lineTopLeft: {
    left: 79,
    top: 149,
    transform: [{ rotate: '45deg' }],
    width: 142,
  },
  lineTopRight: {
    left: 172,
    top: 139,
    transform: [{ rotate: '-50deg' }],
    width: 156,
  },
  lineBottomRight: {
    left: 188,
    top: 239,
    transform: [{ rotate: '34deg' }],
    width: 145,
  },
  lineBottomLeft: {
    left: 73,
    top: 229,
    transform: [{ rotate: '-27deg' }],
    width: 134,
  },
  centerPinWrap: {
    alignItems: 'center',
    height: 80,
    justifyContent: 'center',
    left: 160,
    position: 'absolute',
    top: 160,
    width: 80,
    zIndex: 2,
  },
  centerPulse: {
    backgroundColor: COLORS.blue,
    borderRadius: radius.circle,
    height: 104,
    position: 'absolute',
    width: 104,
  },
  centerPin: {
    alignItems: 'center',
    backgroundColor: COLORS.green,
    borderRadius: radius.circle,
    experimental_backgroundImage: 'linear-gradient(135deg, #29D391 0%, #38D6E8 48%, #6C63FF 100%)',
    height: 80,
    justifyContent: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    width: 80,
  },
  floatingAvatar: {
    position: 'absolute',
    zIndex: 3,
  },
  avatarTopLeft: {
    left: 60,
    top: 60,
  },
  avatarTopRight: {
    right: 80,
    top: 40,
  },
  avatarBottomRight: {
    bottom: 100,
    right: 60,
  },
  avatarBottomLeft: {
    bottom: 120,
    left: 40,
  },
  copy: {
    alignItems: 'center',
    maxWidth: 384,
    width: '100%',
  },
  title: {
    ...typography.titleLarge,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 34,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  titleGreen: {
    color: COLORS.brightGreen,
    fontWeight: '800',
  },
  titleBlue: {
    color: COLORS.paleBlue,
    fontWeight: '800',
  },
  description: {
    ...typography.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 352,
    paddingHorizontal: spacing[4],
    textAlign: 'center',
  },
  footer: {
    alignSelf: 'center',
    gap: spacing[4],
    maxWidth: 460,
    paddingBottom: spacing[12],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    width: '100%',
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    marginBottom: spacing[2],
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
  primaryButton: {
    borderColor: COLORS.green,
    borderRadius: radius.pill,
    experimental_backgroundImage: 'linear-gradient(135deg, #29D391 0%, #6C63FF 100%)',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(68, 73, 53, 0.30)',
    borderRadius: radius.pill,
  },
});
