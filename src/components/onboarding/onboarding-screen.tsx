import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { alpha, darkColors, radius, spacing, typography } from '@/theme';
import { useLanguage } from '@/contexts/language-context';
import type { TranslationKey } from '@/i18n';

import { OnboardingChallengesScreen } from './onboarding-challenges-screen';
import { OnboardingConnectionsScreen } from './onboarding-connections-screen';
import { OnboardingLocationScreen } from './onboarding-location-screen';
import { OnboardingMiaScreen } from './onboarding-mia-screen';
import { OnboardingPrivacyControlScreen } from './onboarding-privacy-control-screen';
import { ChallengeVisual, ConnectedPeopleVisual, MapVisual, MiaVisual, PrivacyVisual } from './onboarding-visuals';

type OnboardingScreenProps = {
  step: number;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

const STEPS = [
  {
    title: 'onboarding.1.title',
    text: 'onboarding.1.text',
    visual: ConnectedPeopleVisual,
  },
  {
    title: 'onboarding.2.title',
    text: 'onboarding.2.text',
    visual: MapVisual,
  },
  {
    title: 'onboarding.3.title',
    text: 'onboarding.3.text',
    visual: ChallengeVisual,
  },
  {
    title: 'onboarding.4.title',
    text: 'onboarding.4.text',
    visual: MiaVisual,
  },
  {
    title: 'onboarding.5.title',
    text: 'onboarding.5.text',
    visual: PrivacyVisual,
  },
] as const satisfies readonly { title: TranslationKey; text: TranslationKey; visual: React.ComponentType }[];

export function OnboardingScreen({ step, onBack, onContinue, onSkip }: OnboardingScreenProps) {
  const { t } = useLanguage();

  if (step === 0) {
    return <OnboardingConnectionsScreen onContinue={onContinue} onSkip={onSkip} />;
  }

  if (step === 1) {
    return <OnboardingLocationScreen onBack={onBack} onContinue={onContinue} onSkip={onSkip} />;
  }

  if (step === 2) {
    return <OnboardingChallengesScreen onBack={onBack} onContinue={onContinue} onSkip={onSkip} />;
  }

  if (step === 3) {
    return <OnboardingPrivacyControlScreen onBack={onBack} onContinue={onContinue} />;
  }

  if (step === 4) {
    return <OnboardingMiaScreen onBack={onBack} onContinue={onContinue} onSkip={onSkip} />;
  }

  const current = STEPS[step];
  const Visual = current.visual;

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.glow, styles.glowTop]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom]} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <View style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandLetter}>M</Text></View><Text style={styles.brandName}>Miaraka</Text></View>
          {step < 4 ? (
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onSkip} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
              <Text style={styles.skipText}>{t('common.skip')}</Text>
            </Pressable>
          ) : <View style={styles.topPlaceholder} />}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View key={`visual-${step}`} entering={FadeIn.duration(350)} exiting={FadeOut.duration(180)} layout={LinearTransition} style={styles.visualArea}>
            <Visual />
          </Animated.View>
          <Animated.View key={`copy-${step}`} entering={FadeInDown.delay(100).duration(450)} style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>{t(current.title)}</Text>
            <Text style={styles.description}>{t(current.text)}</Text>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <ProgressDots activeStep={step} />
          <View style={styles.buttons}>
            {step > 0 && (
              <Pressable accessibilityRole="button" onPress={onBack} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
              </Pressable>
            )}
            <Pressable accessibilityRole="button" onPress={onContinue} style={({ pressed }) => [styles.primaryButton, step > 0 && styles.primaryButtonFlexible, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>{t('common.continue')}</Text><Text style={styles.arrow}>→</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

export function ProgressDots({ activeStep }: { activeStep: number }) {
  const { t } = useLanguage();
  return (
    <View accessibilityLabel={t('onboarding.step', { current: activeStep + 1 })} style={styles.dots}>
      {Array.from({ length: 6 }, (_, index) => <View key={index} style={[styles.dot, index === activeStep && styles.dotActive, index < activeStep && styles.dotComplete]} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: darkColors.background, overflow: 'hidden' }, safeArea: { flex: 1 },
  glow: { position: 'absolute', width: 360, height: 360, borderRadius: radius.circle }, glowTop: { top: -180, right: -120, backgroundColor: darkColors.primarySoft }, glowBottom: { bottom: -220, left: -130, backgroundColor: alpha.cyan16 },
  topBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4] }, brand: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, brandMark: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.primary }, brandLetter: { color: darkColors.textPrimary, fontSize: 17, fontWeight: '800' }, brandName: { ...typography.labelLarge, color: darkColors.textPrimary },
  skipButton: { minWidth: 64, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, skipText: { ...typography.labelMedium, color: darkColors.textSecondary }, topPlaceholder: { width: 64 },
  scrollContent: { flexGrow: 1, width: '100%', maxWidth: 460, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: spacing[5], paddingVertical: spacing[2] }, visualArea: { minHeight: 285, justifyContent: 'center' }, copy: { alignItems: 'center', gap: spacing[3], marginTop: spacing[2] }, title: { ...typography.titleLarge, maxWidth: 380, color: darkColors.textPrimary, textAlign: 'center' }, description: { ...typography.bodyMedium, maxWidth: 360, color: darkColors.textSecondary, textAlign: 'center' },
  footer: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: spacing[4], paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[4] }, dots: { minHeight: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2] }, dot: { width: 7, height: 7, borderRadius: radius.circle, backgroundColor: darkColors.disabledSurface }, dotActive: { width: 24, backgroundColor: darkColors.primary }, dotComplete: { backgroundColor: darkColors.accent },
  buttons: { flexDirection: 'row', gap: spacing[3] }, primaryButton: { width: '100%', minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], borderRadius: radius.pill, backgroundColor: darkColors.primary }, primaryButtonFlexible: { flex: 1, width: 'auto' }, primaryButtonText: { ...typography.labelLarge, color: darkColors.textPrimary }, arrow: { color: darkColors.textPrimary, fontSize: 19 }, secondaryButton: { minWidth: 104, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: darkColors.borderStrong, backgroundColor: darkColors.surface }, secondaryButtonText: { ...typography.labelLarge, color: darkColors.textSecondary }, pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
