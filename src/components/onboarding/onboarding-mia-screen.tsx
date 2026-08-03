import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

type OnboardingMiaScreenProps = {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

const COLORS = {
  background: darkColors.background,
  glass: 'rgba(12, 33, 71, 0.60)',
  glassBorder: darkColors.border,
  text: darkColors.textPrimary,
  textMuted: darkColors.textSecondary,
  outline: darkColors.textMuted,
  green: darkColors.success,
  blue: darkColors.primary,
  paleBlue: darkColors.accent,
  lime: darkColors.accent,
  oliveText: darkColors.textInverse,
} as const;

const WAVE_HEIGHTS = [20, 40, 32, 48, 24] as const;
const WAVE_COLORS = [COLORS.green, COLORS.paleBlue, '#FFFFFF', COLORS.green, COLORS.paleBlue] as const;

export function OnboardingMiaScreen({ onBack, onContinue, onSkip }: OnboardingMiaScreenProps) {
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);
  const copy = getCopy(language);

  return (
    <View style={styles.root}>
      <Atmosphere />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 144 + insets.bottom }]}
          showsVerticalScrollIndicator={false}>
          <ProgressIndicator />

          <Animated.View entering={FadeInDown.duration(500)} style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>
              {copy.titlePrefix}<Text style={styles.titleAccent}>MIA.</Text>
            </Text>
            <Text style={styles.description}>{t('onboarding.4.text')}</Text>
          </Animated.View>

          <View style={styles.visual}>
            <PulseRing delay={0} />
            <PulseRing delay={800} />
            <PulseRing delay={1600} />

            <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.answerBubble}>
              <View style={styles.answerRow}>
                <SymbolView
                  name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                  size={20}
                  tintColor={COLORS.green}
                  weight="medium"
                />
                <Text style={styles.answerText}>
                  {copy.answerStart}<Text style={styles.answerPlace}>{copy.place}</Text>{copy.answerEnd}
                </Text>
              </View>
              <View style={styles.bubbleTail} />
            </Animated.View>

            <Pressable
              accessibilityLabel={copy.microphoneLabel}
              accessibilityRole="button"
              accessibilityState={{ selected: isListening }}
              onPress={() => setIsListening((value) => !value)}
              style={({ pressed }) => [styles.micTouchTarget, pressed && styles.micPressed]}>
              <View style={[styles.micHalo, isListening && styles.micHaloListening]}>
                <View style={styles.micButton}>
                  <View style={styles.waveform}>
                    {WAVE_HEIGHTS.map((height, index) => (
                      <WaveBar
                        color={WAVE_COLORS[index]}
                        delay={index * 110}
                        height={height}
                        key={height + index}
                        listening={isListening}
                      />
                    ))}
                  </View>
                  <SymbolView
                    name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
                    size={31}
                    tintColor={COLORS.text}
                    weight="bold"
                  />
                </View>
              </View>
            </Pressable>

            <FloatingAvatar />
          </View>
        </ScrollView>
      </SafeAreaView>

      <View style={[styles.footer, { paddingBottom: Math.max(28, insets.bottom + spacing[2]) }]}>
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
          <Text style={styles.continueLabel}>{t('common.continue')}</Text>
        </Pressable>
        <View style={styles.secondaryActions}>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
              size={18}
              tintColor={COLORS.outline}
              weight="medium"
            />
            <Text style={styles.secondaryLabel}>{t('common.back')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onSkip}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryLabel}>{t('common.skip')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Atmosphere() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.ambientGlow, styles.ambientGlowTop]} />
      <View style={[styles.ambientGlow, styles.ambientGlowBottom]} />
    </View>
  );
}

function ProgressIndicator() {
  return (
    <View accessibilityLabel="Étape 4 sur 4" style={styles.progress}>
      <View style={styles.progressTrack} />
      <View style={styles.progressTrack} />
      <View style={styles.progressTrack} />
      <View style={styles.progressActive} />
    </View>
  );
}

function PulseRing({ delay }: { delay: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }), -1, false),
    );
  }, [delay, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.18 : 0.5 * (1 - progress.value),
    transform: [{ scale: reduceMotion ? 1.15 : 0.8 + progress.value * 0.7 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.pulseRing, animatedStyle]} />;
}

function WaveBar({ color, delay, height, listening }: { color: string; delay: number; height: number; listening: boolean }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(0.35);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 0.7;
      return;
    }

    const duration = listening ? 300 : 600;
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
  }, [delay, listening, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: scale.value }] }));

  return <Animated.View style={[styles.waveBar, { backgroundColor: color, height }, animatedStyle]} />;
}

function FloatingAvatar() {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    translateY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1450, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1450, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }, { rotate: '-12deg' }] }));

  return (
    <Animated.View entering={FadeIn.delay(400).duration(450)} style={[styles.avatar, animatedStyle]}>
      <Avatar
        backgroundColor="#253B63"
        initials="R"
        name="Rica"
        ringColor={COLORS.lime}
        size={64}
      />
    </Animated.View>
  );
}

function getCopy(language: 'fr' | 'mg') {
  if (language === 'mg') {
    return {
      titlePrefix: 'Anontanio tsotra izao i ',
      answerStart: 'Eo akaikinâ€™ny ',
      place: 'Jumbo Score Ankorondrano',
      answerEnd: ' i Rica. Nohavaozina 20 segondra lasa ny toerana misy azy.',
      microphoneLabel: 'Miresaha aminâ€™i MIA',
    };
  }

  return {
    titlePrefix: 'Demandez simplement à ',
    answerStart: 'Rica est près de ',
    place: 'Jumbo Score Ankorondrano',
    answerEnd: '. Position mise à jour il y a 20 secondes.',
    microphoneLabel: 'Parler à MIA',
  };
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
  ambientGlow: {
    borderRadius: radius.circle,
    height: 320,
    position: 'absolute',
    width: 320,
  },
  ambientGlowTop: {
    backgroundColor: 'rgba(175, 198, 255, 0.07)',
    right: -150,
    top: 150,
  },
  ambientGlowBottom: {
    backgroundColor: 'rgba(62, 224, 157, 0.07)',
    bottom: 80,
    left: -160,
  },
  content: {
    alignItems: 'center',
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 512,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    width: '100%',
  },
  progress: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  progressTrack: {
    backgroundColor: 'rgba(175, 198, 255, 0.18)',
    borderRadius: radius.pill,
    height: 4,
    width: 32,
  },
  progressActive: {
    backgroundColor: COLORS.paleBlue,
    borderRadius: radius.pill,
    height: 4,
    shadowColor: COLORS.paleBlue,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    width: 48,
  },
  copy: {
    alignItems: 'center',
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
  titleAccent: {
    color: COLORS.green,
  },
  description: {
    ...typography.bodyMedium,
    color: COLORS.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 390,
    paddingHorizontal: spacing[4],
    textAlign: 'center',
  },
  visual: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    marginBottom: spacing[4],
    marginTop: spacing[4],
    maxWidth: 430,
    position: 'relative',
    width: '100%',
  },
  pulseRing: {
    borderColor: 'rgba(175, 198, 255, 0.45)',
    borderRadius: radius.circle,
    borderWidth: 2,
    height: 192,
    position: 'absolute',
    width: 192,
  },
  answerBubble: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.glassBorder,
    borderRadius: 28,
    borderWidth: 1,
    maxWidth: 210,
    padding: spacing[4],
    position: 'absolute',
    right: 0,
    shadowColor: '#000000',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    top: 0,
    zIndex: 20,
  },
  answerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[2],
  },
  answerText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  answerPlace: {
    fontWeight: '800',
  },
  bubbleTail: {
    backgroundColor: COLORS.glass,
    bottom: -6,
    height: 14,
    left: 40,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 14,
  },
  micTouchTarget: {
    alignItems: 'center',
    height: 144,
    justifyContent: 'center',
    width: 144,
    zIndex: 10,
  },
  micHalo: {
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    borderColor: COLORS.green,
    borderRadius: radius.circle,
    borderWidth: 2,
    height: 132,
    justifyContent: 'center',
    shadowColor: COLORS.blue,
    shadowOpacity: 0.55,
    shadowRadius: 30,
    width: 132,
  },
  micHaloListening: {
    borderColor: COLORS.lime,
    shadowColor: COLORS.green,
    shadowOpacity: 0.9,
  },
  micButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: radius.circle,
    height: 126,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 126,
  },
  waveform: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  waveBar: {
    borderRadius: radius.pill,
    transformOrigin: 'bottom',
    width: 6,
  },
  avatar: {
    bottom: 34,
    left: 34,
    position: 'absolute',
  },
  footer: {
    backgroundColor: 'rgba(7, 20, 36, 0.96)',
    bottom: 0,
    gap: spacing[4],
    left: 0,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    position: 'absolute',
    right: 0,
    zIndex: 50,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: COLORS.lime,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  continueLabel: {
    ...typography.labelMedium,
    color: COLORS.oliveText,
  },
  secondaryActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
  },
  secondaryButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[1],
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 72,
  },
  secondaryLabel: {
    ...typography.labelMedium,
    color: COLORS.outline,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  micPressed: {
    transform: [{ scale: 0.92 }],
  },
});
