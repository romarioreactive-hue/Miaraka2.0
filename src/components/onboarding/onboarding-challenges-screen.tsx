import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/cards';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

type OnboardingChallengesScreenProps = {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

const COLORS = {
  background: darkColors.background,
  surface: darkColors.surface,
  surfaceHigh: darkColors.surfaceElevated,
  surfaceHighest: darkColors.surfaceInteractive,
  outline: darkColors.textMuted,
  outlineVariant: darkColors.border,
  text: darkColors.textPrimary,
  textSecondary: darkColors.textSecondary,
  primary: darkColors.textPrimary,
  onPrimary: darkColors.textInverse,
  secondary: darkColors.accent,
  tertiary: darkColors.textPrimary,
  green: darkColors.success,
  blue: darkColors.primary,
  paleBlue: darkColors.accent,
  cyan: darkColors.accent,
  glass: 'rgba(12, 33, 71, 0.72)',
} as const;

export function OnboardingChallengesScreen({ onBack, onContinue, onSkip }: OnboardingChallengesScreenProps) {
  const { language, t } = useLanguage();

  return (
    <View style={styles.root}>
      <Atmosphere />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>{t('onboarding.3.title')}</Text>
            <Text style={styles.description}>{t('onboarding.3.text')}</Text>
          </Animated.View>

          <RankingVisual language={language} meLabel={t('common.me')} todayLabel={t('common.today')} />

          <View
            accessibilityLabel={t('onboarding.step', { current: 3 })}
            style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.activeDot} />
          </View>

          <View style={styles.navigation}>
            <Pressable
              accessibilityRole="button"
              onPress={onContinue}
              style={({ pressed }) => [styles.continueButton, pressed && styles.pressedButton]}>
              <Text style={styles.continueLabel}>{t('common.continue')}</Text>
            </Pressable>
            <View style={styles.secondaryActions}>
              <Pressable
                accessibilityRole="button"
                hitSlop={6}
                onPress={onBack}
                style={({ pressed }) => [styles.textButton, pressed && styles.pressedTextButton]}>
                <SymbolView
                  name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                  size={18}
                  tintColor={COLORS.outline}
                  weight="semibold"
                />
                <Text style={styles.textButtonLabel}>{t('common.back')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                hitSlop={6}
                onPress={onSkip}
                style={({ pressed }) => [styles.textButton, pressed && styles.pressedTextButton]}>
                <Text style={styles.textButtonLabel}>{t('common.skip')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Atmosphere() {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 1500 }), withTiming(0.15, { duration: 1500 })),
      -1,
    );
  }, [opacity, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.glow, styles.glowTop, animatedStyle]} />
      <Animated.View style={[styles.glow, styles.glowBottom, animatedStyle]} />
    </View>
  );
}

type RankingVisualProps = {
  language: 'fr' | 'mg';
  meLabel: string;
  todayLabel: string;
};

function RankingVisual({ language, meLabel, todayLabel }: RankingVisualProps) {
  const reduceMotion = useReducedMotion();
  const distanceY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    distanceY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [distanceY, reduceMotion]);

  const distanceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: distanceY.value }] }));
  const weeklyLabel = language === 'fr' ? 'CLASSEMENT HEBDO' : 'LAHARANA ISAN-KERINANDRO';
  const achievementLabel = language === 'fr' ? 'Objectif atteint !' : 'Tratra ny tanjona !';

  return (
    <View style={styles.visualArea}>
      <Animated.View entering={FadeIn.delay(300).duration(450)} style={[styles.distanceWrap, distanceStyle]}>
        <Card style={styles.distanceCard}>
          <View style={styles.distanceIcon}>
            <SymbolView
              name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
              size={24}
              tintColor={COLORS.secondary}
              weight="bold"
            />
          </View>
          <View>
            <Text style={styles.distanceValue}>7.4 km</Text>
            <Text style={styles.distanceLabel}>{todayLabel}</Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(120).duration(550)} style={styles.rankingWrap}>
        <Card style={styles.rankingCard}>
          <View style={styles.rankingHeader}>
            <Text style={styles.rankingHeading}>{weeklyLabel}</Text>
            <SymbolView
              name={{ ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' }}
              size={24}
              tintColor={COLORS.tertiary}
              weight="medium"
            />
          </View>
          <View style={styles.rows}>
            <RankingRow
              color={COLORS.green}
              delay={350}
              distance="42.5 km"
              initials="S"
              name="Sophie"
              progress={90}
            />
            <RankingRow
              color={COLORS.primary}
              delay={500}
              distance="38.2 km"
              initials="T"
              name="Thomas"
              progress={75}
            />
            <RankingRow
              color={COLORS.cyan}
              delay={650}
              distance="31.8 km"
              highlighted
              initials="M"
              name={meLabel}
              progress={60}
            />
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(850).duration(450)} style={styles.achievementWrap}>
        <Card style={styles.achievementBadge}>
          <SymbolView
            name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
            size={16}
            tintColor={COLORS.tertiary}
            weight="bold"
          />
          <Text style={styles.achievementText}>{achievementLabel}</Text>
        </Card>
      </Animated.View>
    </View>
  );
}

type RankingRowProps = {
  name: string;
  initials: string;
  distance: string;
  progress: number;
  color: string;
  delay: number;
  highlighted?: boolean;
};

function RankingRow({ name, initials, distance, progress, color, delay, highlighted = false }: RankingRowProps) {
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(reduceMotion ? progress : 0);

  useEffect(() => {
    fill.value = reduceMotion
      ? progress
      : withDelay(delay, withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [delay, fill, progress, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));

  return (
    <Animated.View
      accessibilityLabel={`${name}, ${distance}`}
      entering={reduceMotion ? FadeIn.duration(1) : FadeInDown.delay(delay).duration(450)}
      style={[styles.rankingRow, highlighted && styles.highlightedRow]}>
      <View style={styles.avatarFrame}>
        <View style={[styles.avatarRing, { borderColor: `${color}80` }]} />
        <View style={styles.avatarScaled}>
          <Avatar
            backgroundColor={`${color}24`}
            initials={initials}
            name={name}
            ringColor={color}
            size={48}
          />
        </View>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowMeta}>
          <Text style={[styles.name, highlighted && { color }]}>{name}</Text>
          <Text style={[styles.rowDistance, { color }]}>{distance}</Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              fillStyle,
              {
                backgroundColor: color,
                experimental_backgroundImage: highlighted
                  ? undefined
                  : `linear-gradient(90deg, ${color} 0%, #FFFFFF 100%)`,
              },
            ]}
          />
        </View>
      </View>
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
  glow: {
    borderRadius: radius.circle,
    position: 'absolute',
  },
  glowTop: {
    backgroundColor: 'rgba(79, 140, 255, 0.16)',
    height: 440,
    right: -220,
    top: -180,
    width: 440,
  },
  glowBottom: {
    backgroundColor: 'rgba(62, 224, 157, 0.12)',
    bottom: -210,
    height: 420,
    left: -210,
    width: 420,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
    maxWidth: 512,
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[12],
    width: '100%',
  },
  header: {
    alignItems: 'center',
    gap: spacing[4],
    marginTop: spacing[8],
  },
  title: {
    ...typography.titleLarge,
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 34,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 280,
    textAlign: 'center',
  },
  visualArea: {
    alignItems: 'center',
    marginVertical: spacing[8],
    paddingVertical: spacing[8],
    position: 'relative',
    width: '100%',
  },
  distanceWrap: {
    position: 'absolute',
    right: -8,
    top: -16,
    zIndex: 4,
  },
  distanceCard: {
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 32,
    flexDirection: 'row',
    gap: spacing[4],
    padding: spacing[4],
    shadowColor: '#000000',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
  },
  distanceIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(186, 208, 119, 0.20)',
    borderRadius: radius.circle,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  distanceValue: {
    ...typography.titleMedium,
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 30,
  },
  distanceLabel: {
    ...typography.caption,
    color: COLORS.outline,
  },
  rankingWrap: {
    maxWidth: 472,
    width: '100%',
  },
  rankingCard: {
    backgroundColor: 'rgba(41, 43, 31, 0.82)',
    borderColor: 'rgba(68, 73, 53, 0.30)',
    borderRadius: 32,
    padding: spacing[6],
    shadowColor: COLORS.blue,
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  rankingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  rankingHeading: {
    ...typography.labelMedium,
    color: COLORS.text,
    letterSpacing: 1,
  },
  rows: {
    gap: spacing[4],
  },
  rankingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[4],
    minHeight: 48,
  },
  highlightedRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radius.medium,
    marginHorizontal: -spacing[2],
    padding: spacing[2],
  },
  avatarFrame: {
    height: 40,
    position: 'relative',
    width: 40,
  },
  avatarRing: {
    borderRadius: radius.circle,
    borderWidth: 2,
    height: 44,
    left: -2,
    position: 'absolute',
    top: -2,
    width: 44,
  },
  avatarScaled: {
    left: -4,
    position: 'absolute',
    top: -4,
    transform: [{ scale: 0.833 }],
  },
  rowContent: {
    flex: 1,
  },
  rowMeta: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  name: {
    ...typography.labelMedium,
    color: COLORS.text,
  },
  rowDistance: {
    ...typography.caption,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: COLORS.surface,
    borderRadius: radius.pill,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.pill,
    height: 8,
    shadowColor: COLORS.green,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  achievementWrap: {
    bottom: 14,
    left: -8,
    position: 'absolute',
    zIndex: 5,
  },
  achievementBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  achievementText: {
    ...typography.caption,
    color: COLORS.tertiary,
    fontWeight: '600',
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    minHeight: 24,
    paddingVertical: spacing[4],
  },
  dot: {
    backgroundColor: COLORS.outlineVariant,
    borderRadius: radius.circle,
    height: 8,
    width: 8,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    borderRadius: radius.pill,
    height: 8,
    shadowColor: COLORS.paleBlue,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    width: 24,
  },
  navigation: {
    gap: spacing[4],
    width: '100%',
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: radius.pill,
    experimental_backgroundImage: 'linear-gradient(90deg, #B6F393 0%, #FFFFFF 100%)',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  continueLabel: {
    ...typography.labelMedium,
    color: COLORS.onPrimary,
  },
  secondaryActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
  },
  textButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[1],
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
  },
  textButtonLabel: {
    ...typography.labelMedium,
    color: COLORS.outline,
  },
  pressedButton: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  pressedTextButton: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },
});
