import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { alpha, darkColors, radius, spacing, typography } from '@/theme';

import { ChallengeVisual, ConnectedPeopleVisual, MapVisual, MiaVisual, PrivacyVisual } from './onboarding-visuals';

type OnboardingScreenProps = {
  step: number;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

const STEPS = [
  {
    title: 'Restez proche de ceux qui comptent.',
    text: 'Retrouvez votre famille, vos amis et votre équipe dans des espaces privés.',
    visual: ConnectedPeopleVisual,
  },
  {
    title: 'Voyez les déplacements autorisés en temps réel.',
    text: 'Une carte claire, la dernière position connue et le temps d’arrivée estimé.',
    visual: MapVisual,
  },
  {
    title: 'Bougez ensemble.',
    text: 'Créez des défis de marche avec vos proches et votre équipe.',
    visual: ChallengeVisual,
  },
  {
    title: 'Demandez simplement à MIA.',
    text: 'Où est Rica ? Qui est au bureau ? Qui est premier du défi ?',
    visual: MiaVisual,
  },
  {
    title: 'Vous gardez le contrôle.',
    text: 'Chaque personne choisit qui peut voir sa position et quand la partager.',
    visual: PrivacyVisual,
  },
] as const;

export function OnboardingScreen({ step, onBack, onContinue, onSkip }: OnboardingScreenProps) {
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
              <Text style={styles.skipText}>Passer</Text>
            </Pressable>
          ) : <View style={styles.topPlaceholder} />}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View key={`visual-${step}`} entering={FadeIn.duration(350)} exiting={FadeOut.duration(180)} layout={LinearTransition} style={styles.visualArea}>
            <Visual />
          </Animated.View>
          <Animated.View key={`copy-${step}`} entering={FadeInDown.delay(100).duration(450)} style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>{current.title}</Text>
            <Text style={styles.description}>{current.text}</Text>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <ProgressDots activeStep={step} />
          <View style={styles.buttons}>
            {step > 0 && (
              <Pressable accessibilityRole="button" onPress={onBack} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <Text style={styles.secondaryButtonText}>Retour</Text>
              </Pressable>
            )}
            <Pressable accessibilityRole="button" onPress={onContinue} style={({ pressed }) => [styles.primaryButton, step > 0 && styles.primaryButtonFlexible, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Continuer</Text><Text style={styles.arrow}>→</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

export function ProgressDots({ activeStep }: { activeStep: number }) {
  return (
    <View accessibilityLabel={`Étape ${activeStep + 1} sur 6`} style={styles.dots}>
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
