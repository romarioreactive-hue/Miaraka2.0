import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

const NAVY = '#060C1F';
const TEXT_SECONDARY = '#A9B4D0';

const FEATURES: { icon: string; label: string }[] = [
  { icon: '📍', label: 'Localisation en temps réel' },
  { icon: '👥', label: 'Famille, amis et équipe' },
  { icon: '🎯', label: 'Activités et défis' },
];

export default function HomeScreen() {
  const router = useRouter();
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [floatY]);

  const logoFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.glow, styles.glowBlue]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowGreen]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowCyan]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Animated.View entering={FadeIn.duration(700)} style={[styles.logoWrapper, logoFloatStyle]}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoLetter}>M</Text>
              </View>
            </Animated.View>

            <Animated.Text entering={FadeInDown.delay(150).duration(600)} style={styles.title}>
              Miaraka
            </Animated.Text>

            <Animated.Text entering={FadeInDown.delay(300).duration(600)} style={styles.slogan}>
              Ensemble, partout, à chaque instant.
            </Animated.Text>

            <Animated.View entering={FadeInUp.delay(450).duration(600)} style={styles.buttonsRow}>
              <AnimatedButton
                label="Commencer"
                variant="primary"
                onPress={() => router.push('/demo')}
              />
              <AnimatedButton
                label="Voir la démonstration"
                variant="secondary"
                onPress={() => router.push('/demo')}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.featuresRow}>
              {FEATURES.map((feature) => (
                <View key={feature.label} style={styles.featureItem}>
                  <View style={styles.featureIconCircle}>
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </View>
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type AnimatedButtonProps = {
  label: string;
  variant: 'primary' | 'secondary';
  onPress?: () => void;
};

function AnimatedButton({ label, variant, onPress }: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 });
      }}
      hitSlop={8}>
      <Animated.View
        style={[
          styles.button,
          variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
          pressStyle,
        ]}>
        <Text style={[styles.buttonText, variant === 'secondary' && styles.buttonTextSecondary]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NAVY,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 999,
  },
  glowBlue: {
    top: -60,
    right: -80,
    experimental_backgroundImage:
      'radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0) 70%)',
  },
  glowGreen: {
    top: 220,
    left: -120,
    experimental_backgroundImage:
      'radial-gradient(circle, rgba(34,197,94,0.30) 0%, rgba(34,197,94,0) 70%)',
  },
  glowCyan: {
    bottom: -100,
    right: -60,
    experimental_backgroundImage:
      'radial-gradient(circle, rgba(34,211,238,0.30) 0%, rgba(34,211,238,0) 70%)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.six,
  },
  content: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 440,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  logoWrapper: {
    marginBottom: Spacing.two,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: 'linear-gradient(135deg, #22C55E 0%, #22D3EE 55%, #3B82F6 100%)',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  logoLetter: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: -Spacing.two,
  },
  buttonsRow: {
    width: '100%',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    experimental_backgroundImage: 'linear-gradient(90deg, #22C55E 0%, #22D3EE 55%, #3B82F6 100%)',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#E2E8F0',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.four,
    marginTop: Spacing.four,
  },
  featureItem: {
    alignItems: 'center',
    width: 108,
    gap: Spacing.one,
  },
  featureIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featureIcon: {
    fontSize: 20,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 16,
  },
});
