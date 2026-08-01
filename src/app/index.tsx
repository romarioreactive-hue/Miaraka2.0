import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingScreen, ProgressDots } from '@/components/onboarding/onboarding-screen';
import { alpha, darkColors, radius, spacing, typography } from '@/theme';

let onboardingFinishedForSession = false;

export default function HomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState(onboardingFinishedForSession ? 5 : 0);

  function openDemo() {
    onboardingFinishedForSession = true;
    router.replace('/demo');
  }

  if (step < 5) {
    return (
      <OnboardingScreen
        step={step}
        onBack={() => setStep((current) => Math.max(0, current - 1))}
        onContinue={() => setStep((current) => Math.min(5, current + 1))}
        onSkip={() => setStep(5)}
      />
    );
  }

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.glow, styles.glowBlue]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowCyan]} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Animated.View entering={FadeIn.duration(650)} style={styles.logoWrap}>
              <View style={styles.logoHalo} />
              <View style={styles.logoCircle}><Text style={styles.logoLetter}>M</Text></View>
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(120).duration(500)} accessibilityRole="header" style={styles.title}>Bienvenue dans Miaraka</Animated.Text>
            <Animated.Text entering={FadeInDown.delay(240).duration(500)} style={styles.slogan}>Ensemble, partout, à chaque instant.</Animated.Text>
            <Animated.View entering={FadeInUp.delay(360).duration(500)} style={styles.trustCard}>
              <View style={styles.trustIcon}><Text style={styles.trustIconText}>✓</Text></View>
              <Text style={styles.trustText}>Vos espaces restent privés et sous votre contrôle.</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(480).duration(500)} style={styles.buttons}>
              <Pressable accessibilityHint="Ouvre la démonstration avec un utilisateur fictif" accessibilityRole="button" onPress={openDemo} style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}>
                <View style={styles.googleMark}><Text style={styles.googleLetter}>G</Text></View><Text style={styles.googleButtonText}>Continuer avec Google</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={openDemo} style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}><Text style={styles.demoButtonText}>Voir la démonstration</Text></Pressable>
            </Animated.View>
          </View>
        </ScrollView>
        <View style={styles.footer}><ProgressDots activeStep={5} /><Text style={styles.fictionNote}>Connexion Google simulée pour cette démonstration</Text></View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: darkColors.background, overflow: 'hidden' }, safeArea: { flex: 1 }, glow: { position: 'absolute', width: 420, height: 420, borderRadius: radius.circle }, glowBlue: { top: -170, right: -170, backgroundColor: darkColors.primarySoft }, glowCyan: { bottom: -220, left: -180, backgroundColor: alpha.cyan16 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing[6] }, content: { width: '100%', maxWidth: 440, alignItems: 'center', alignSelf: 'center', gap: spacing[4], paddingHorizontal: spacing[5] },
  logoWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] }, logoHalo: { position: 'absolute', width: 148, height: 148, borderRadius: radius.circle, backgroundColor: alpha.cyan16 }, logoCircle: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', borderRadius: 32, backgroundColor: darkColors.primary, shadowColor: darkColors.accent, shadowOpacity: 0.42, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } }, logoLetter: { color: darkColors.textPrimary, fontSize: 40, fontWeight: '800' },
  title: { ...typography.titleLarge, maxWidth: 340, color: darkColors.textPrimary, textAlign: 'center' }, slogan: { ...typography.bodyLarge, color: darkColors.textSecondary, textAlign: 'center', marginTop: -spacing[2] },
  trustCard: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.pill, backgroundColor: darkColors.successSoft }, trustIcon: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.success }, trustIconText: { color: darkColors.textInverse, fontSize: 12, fontWeight: '800' }, trustText: { flexShrink: 1, ...typography.caption, color: darkColors.success },
  buttons: { width: '100%', gap: spacing[3], marginTop: spacing[3] }, googleButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[3], borderRadius: radius.pill, backgroundColor: darkColors.textPrimary }, googleMark: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.background }, googleLetter: { color: darkColors.textPrimary, fontSize: 14, fontWeight: '800' }, googleButtonText: { ...typography.labelLarge, color: darkColors.textInverse }, demoButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: darkColors.borderStrong, backgroundColor: darkColors.surface }, demoButtonText: { ...typography.labelLarge, color: darkColors.textPrimary }, pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  footer: { gap: spacing[1], paddingHorizontal: spacing[4], paddingBottom: spacing[4] }, fictionNote: { ...typography.caption, color: darkColors.textMuted, textAlign: 'center' },
});
