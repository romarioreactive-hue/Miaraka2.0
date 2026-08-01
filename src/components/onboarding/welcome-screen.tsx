import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/contexts/language-context';
import { darkColors, logos, radius, spacing, typography } from '@/theme';

type WelcomeScreenProps = { onOpenDemo: () => void };

const COLORS = {
  background: darkColors.background,
  deep: darkColors.background,
  glass: 'rgba(9, 26, 55, 0.70)',
  surfaceHigh: darkColors.surfaceElevated,
  outline: darkColors.textMuted,
  outlineVariant: darkColors.border,
  text: darkColors.textPrimary,
  textSecondary: darkColors.textSecondary,
  white: darkColors.textPrimary,
  green: darkColors.success,
  cyan: darkColors.accent,
  blue: darkColors.primary,
  paleBlue: darkColors.accent,
} as const;

export function WelcomeScreen({ onOpenDemo }: WelcomeScreenProps) {
  const { language, setLanguage, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState<string | null>(null);
  const copy = getCopy(language);

  return (
    <View style={styles.root}>
      <Atmosphere />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image accessibilityLabel="Miaraka" source={logos.mark} style={styles.brandMark} />
          </View>
          <Pressable
            accessibilityLabel={copy.changeLanguage}
            accessibilityRole="button"
            onPress={() => setLanguage(language === 'fr' ? 'mg' : 'fr')}
            style={({ pressed }) => [styles.languageButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'globe', android: 'language', web: 'language' }}
              size={21}
              tintColor={COLORS.textSecondary}
              weight="medium"
            />
            <Text style={styles.languageCode}>{language.toUpperCase()}</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(spacing[8], insets.bottom + spacing[5]) }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.main}>
            <NetworkVisual />
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroCopy}>
              <Text accessibilityRole="header" style={styles.title}>{t('welcome.title')}</Text>
              <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(240).duration(500)} style={styles.actions}>
              <Pressable
                accessibilityHint={t('welcome.googleHint')}
                accessibilityRole="button"
                onPress={onOpenDemo}
                style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}>
                <GoogleMark />
                <Text style={styles.googleLabel}>{t('welcome.google')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onOpenDemo}
                style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'play.circle.fill', android: 'play_circle', web: 'play_circle' }}
                  size={20}
                  tintColor={COLORS.paleBlue}
                  weight="medium"
                />
                <Text style={styles.demoLabel}>{t('welcome.demo')}</Text>
              </Pressable>

              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>{copy.or}</Text>
                <View style={styles.separatorLine} />
              </View>

              <View style={styles.futureOptions}>
                <FutureButton icon="mail" label="Email" onPress={() => setFeedback(copy.futureOption)} />
                <FutureButton icon="apple" label="Apple" onPress={() => setFeedback(copy.futureOption)} />
              </View>
              {feedback ? <Animated.Text entering={FadeIn.duration(200)} style={styles.feedback}>{feedback}</Animated.Text> : null}
            </Animated.View>
          </View>

          <Animated.View entering={FadeInUp.delay(380).duration(500)} style={styles.footer}>
            <View style={styles.securityBadge}>
              <SymbolView
                name={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }}
                size={17}
                tintColor={COLORS.paleBlue}
                weight="bold"
              />
              <Text style={styles.securityText}>{copy.secureConnection}</Text>
            </View>
            <View style={styles.legalLinks}>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setFeedback(copy.demoDocument)}>
                <Text style={styles.legalLink}>{copy.privacy}</Text>
              </Pressable>
              <Text style={styles.legalDot}>•</Text>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setFeedback(copy.demoDocument)}>
                <Text style={styles.legalLink}>{copy.terms}</Text>
              </Pressable>
            </View>
            <Text style={styles.copyright}>{copy.copyright}</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Atmosphere() {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(
      withSequence(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })),
      -1,
    );
  }, [progress, reduceMotion]);
  const firstStyle = useAnimatedStyle(() => ({ transform: [{ translateY: progress.value * -10 }, { translateX: progress.value * 7 }] }));
  const secondStyle = useAnimatedStyle(() => ({ transform: [{ translateY: progress.value * 10 }, { translateX: progress.value * -7 }] }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.ambientGlow, styles.ambientGlowTop, firstStyle]} />
      <Animated.View style={[styles.ambientGlow, styles.ambientGlowBottom, secondStyle]} />
    </View>
  );
}

function NetworkVisual() {
  const reduceMotion = useReducedMotion();
  const float = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    float.value = withRepeat(withSequence(withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })), -1);
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1500 }), withTiming(0, { duration: 1500 })), -1);
  }, [float, pulse, reduceMotion]);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.15 + pulse.value * 0.1, transform: [{ scale: 1 + pulse.value * 0.1 }] }));
  return (
    <Animated.View entering={FadeIn.duration(650)} style={[styles.visualWrap, floatStyle]}>
      <Animated.View style={[styles.visualHalo, pulseStyle]} />
      <View style={styles.visualCircle}>
        <View style={[styles.networkLine, styles.networkLineOne]} />
        <View style={[styles.networkLine, styles.networkLineTwo]} />
        <View style={[styles.networkLine, styles.networkLineThree]} />
        <View style={[styles.networkLine, styles.networkLineFour]} />
        <NetworkNode style={styles.nodeTop} />
        <NetworkNode style={styles.nodeRight} />
        <NetworkNode style={styles.nodeBottom} />
        <NetworkNode style={styles.nodeLeft} />
        <View style={styles.centralShield}>
          <SymbolView name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }} size={28} tintColor={COLORS.white} weight="bold" />
        </View>
      </View>
    </Animated.View>
  );
}

function NetworkNode({ style }: { style: object }) {
  return <View style={[styles.networkNode, style]}><View style={styles.networkNodeCore} /></View>;
}

function GoogleMark() {
  return (
    <View accessibilityLabel="Google" style={styles.googleMark}>
      <Text style={styles.googleG}>G</Text>
      <View style={[styles.googleAccent, styles.googleRed]} />
      <View style={[styles.googleAccent, styles.googleYellow]} />
      <View style={[styles.googleAccent, styles.googleGreen]} />
    </View>
  );
}

function FutureButton({ icon, label, onPress }: { icon: 'mail' | 'apple'; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.futureButton, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: icon === 'apple' ? 'apple.logo' : 'envelope.fill', android: icon === 'apple' ? 'phone_iphone' : 'mail', web: icon === 'apple' ? 'phone_iphone' : 'mail' }}
        size={19}
        tintColor={COLORS.text}
        weight="medium"
      />
      <Text style={styles.futureLabel}>{label}</Text>
    </Pressable>
  );
}

function getCopy(language: 'fr' | 'mg') {
  return language === 'mg'
    ? {
        changeLanguage: 'Hanova ny fiteny ho Français', or: 'NA', futureOption: 'Safidy santatra — tsy mbola misy fifandraisana napetraka.', secureConnection: 'Fifandraisana azo antoka', privacy: 'Politika momba ny tsiambaratelo', terms: 'Fepetra fampiasana', demoDocument: 'Antontan-taratasy santatra ho an’ny fampisehoana.', copyright: '© 2024 Miaraka. Voaaro amin’ny fanafenana tanteraka.',
      }
    : {
        changeLanguage: 'Passer l’interface en Malagasy', or: 'OU', futureOption: 'Option fictive — aucune connexion n’est configurée.', secureConnection: 'Connexion sécurisée', privacy: 'Politique de confidentialité', terms: 'Conditions d’utilisation', demoDocument: 'Document fictif pour la démonstration.', copyright: '© 2024 Miaraka. Protégé par un chiffrement de bout en bout.',
      };
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background, flex: 1, overflow: 'hidden' },
  safeArea: { flex: 1 },
  ambientGlow: { borderRadius: radius.circle, height: 360, position: 'absolute', width: 360 },
  ambientGlowTop: { backgroundColor: 'rgba(175, 198, 255, 0.08)', left: -180, top: -170 },
  ambientGlowBottom: { backgroundColor: 'rgba(62, 224, 157, 0.07)', bottom: -180, right: -170 },
  header: { alignItems: 'center', backgroundColor: 'rgba(18, 20, 10, 0.40)', flexDirection: 'row', justifyContent: 'space-between', minHeight: 64, paddingHorizontal: spacing[5], zIndex: 20 },
  brand: { alignItems: 'center', flexDirection: 'row', gap: spacing[2] },
  brandMark: { width: 40, height: 40, borderRadius: radius.medium, overflow: 'hidden' },
  languageButton: { alignItems: 'center', borderRadius: radius.pill, flexDirection: 'row', gap: spacing[2], justifyContent: 'center', minHeight: 48, minWidth: 72 },
  languageCode: { ...typography.labelMedium, color: COLORS.textSecondary },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing[5] },
  main: { alignItems: 'center', alignSelf: 'center', flexGrow: 1, justifyContent: 'center', maxWidth: 430, paddingTop: spacing[8], width: '100%' },
  visualWrap: { alignItems: 'center', height: 208, justifyContent: 'center', marginBottom: spacing[6], width: 208 },
  visualHalo: { backgroundColor: COLORS.blue, borderRadius: radius.circle, height: 192, position: 'absolute', width: 192 },
  visualCircle: { alignItems: 'center', backgroundColor: COLORS.glass, borderColor: 'rgba(175, 198, 255, 0.20)', borderRadius: radius.circle, borderWidth: 1, height: 192, justifyContent: 'center', overflow: 'hidden', shadowColor: COLORS.blue, shadowOpacity: 0.25, shadowRadius: 20, width: 192 },
  networkLine: { backgroundColor: 'rgba(56, 214, 232, 0.45)', height: 2, position: 'absolute', width: 72 },
  networkLineOne: { left: 38, top: 62, transform: [{ rotate: '32deg' }] },
  networkLineTwo: { right: 35, top: 66, transform: [{ rotate: '-30deg' }] },
  networkLineThree: { bottom: 57, left: 38, transform: [{ rotate: '-34deg' }] },
  networkLineFour: { bottom: 57, right: 35, transform: [{ rotate: '34deg' }] },
  networkNode: { alignItems: 'center', backgroundColor: 'rgba(79, 140, 255, 0.22)', borderRadius: radius.circle, height: 28, justifyContent: 'center', position: 'absolute', width: 28 },
  networkNodeCore: { backgroundColor: COLORS.paleBlue, borderRadius: radius.circle, height: 9, shadowColor: COLORS.paleBlue, shadowOpacity: 0.9, shadowRadius: 7, width: 9 },
  nodeTop: { left: 82, top: 22 }, nodeRight: { right: 20, top: 81 }, nodeBottom: { bottom: 19, left: 82 }, nodeLeft: { left: 20, top: 81 },
  centralShield: { alignItems: 'center', backgroundColor: COLORS.blue, borderColor: 'rgba(255, 255, 255, 0.30)', borderRadius: 22, borderWidth: 1, height: 58, justifyContent: 'center', shadowColor: COLORS.cyan, shadowOpacity: 0.45, shadowRadius: 16, transform: [{ rotate: '45deg' }], width: 58 },
  heroCopy: { alignItems: 'center', marginBottom: spacing[8] },
  title: { ...typography.titleLarge, color: COLORS.text, fontSize: 28, fontWeight: '700', lineHeight: 34, marginBottom: spacing[2], textAlign: 'center' },
  subtitle: { ...typography.bodyMedium, color: COLORS.textSecondary, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  actions: { gap: spacing[4], width: '100%' },
  googleButton: { alignItems: 'center', backgroundColor: COLORS.white, borderRadius: radius.pill, flexDirection: 'row', gap: spacing[3], justifyContent: 'center', minHeight: 56, paddingHorizontal: spacing[6], shadowColor: '#000000', shadowOffset: { height: 5, width: 0 }, shadowOpacity: 0.25, shadowRadius: 12 },
  googleLabel: { ...typography.labelLarge, color: COLORS.deep },
  googleMark: { height: 22, justifyContent: 'center', position: 'relative', width: 22 }, googleG: { color: '#4285F4', fontSize: 20, fontWeight: '800', lineHeight: 22 }, googleAccent: { height: 3, position: 'absolute', width: 5 }, googleRed: { backgroundColor: '#EA4335', left: 4, top: 1 }, googleYellow: { backgroundColor: '#FBBC05', bottom: 1, left: 3 }, googleGreen: { backgroundColor: '#34A853', bottom: 2, right: 1 },
  demoButton: { alignItems: 'center', borderColor: COLORS.paleBlue, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: spacing[2], justifyContent: 'center', minHeight: 56, paddingHorizontal: spacing[6] },
  demoLabel: { ...typography.labelLarge, color: COLORS.paleBlue },
  separator: { alignItems: 'center', flexDirection: 'row', paddingVertical: spacing[2] }, separatorLine: { backgroundColor: 'rgba(68, 73, 53, 0.30)', flex: 1, height: 1 }, separatorText: { color: COLORS.outline, fontSize: 10, fontWeight: '600', letterSpacing: 1.4, paddingHorizontal: spacing[4] },
  futureOptions: { flexDirection: 'row', gap: spacing[4] }, futureButton: { alignItems: 'center', backgroundColor: COLORS.surfaceHigh, borderRadius: radius.large, flex: 1, flexDirection: 'row', gap: spacing[2], justifyContent: 'center', minHeight: 48 }, futureLabel: { ...typography.labelMedium, color: COLORS.text },
  feedback: { ...typography.caption, color: COLORS.textSecondary, marginTop: -spacing[1], textAlign: 'center' },
  footer: { alignItems: 'center', alignSelf: 'center', marginTop: spacing[10], maxWidth: 430, width: '100%' },
  securityBadge: { alignItems: 'center', backgroundColor: 'rgba(175, 198, 255, 0.05)', borderColor: 'rgba(175, 198, 255, 0.10)', borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: spacing[2], marginBottom: spacing[8], minHeight: 40, paddingHorizontal: spacing[4] },
  securityText: { ...typography.labelMedium, color: COLORS.paleBlue },
  legalLinks: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4], justifyContent: 'center' }, legalLink: { ...typography.caption, color: COLORS.outline }, legalDot: { color: COLORS.outlineVariant },
  copyright: { ...typography.caption, color: 'rgba(143, 147, 123, 0.60)', marginTop: spacing[6], textAlign: 'center' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
