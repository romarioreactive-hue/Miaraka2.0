import { SymbolView } from 'expo-symbols';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/cards';
import { useLanguage } from '@/contexts/language-context';
import { radius, spacing, typography } from '@/theme';

type OnboardingPrivacyControlScreenProps = {
  onBack: () => void;
  onContinue: () => void;
};

const COLORS = {
  background: '#12140A',
  surface: '#1E2115',
  surfaceHigh: '#292B1F',
  surfaceHighest: '#333629',
  outline: '#8F937B',
  outlineVariant: '#444935',
  text: '#E2E4D1',
  textSecondary: '#C5C9AF',
  primary: '#FFFFFF',
  primaryContainer: '#C9F23B',
  onPrimaryContainer: '#576C00',
  secondary: '#BAD077',
  tertiary: '#FFFFFF',
  green: '#29D391',
  brightGreen: '#3EE09D',
  cyan: '#38D6E8',
  blue: '#4F8CFF',
  glass: 'rgba(12, 33, 71, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.05)',
} as const;

export function OnboardingPrivacyControlScreen({ onBack, onContinue }: OnboardingPrivacyControlScreenProps) {
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activityEnabled, setActivityEnabled] = useState(false);
  const copy = getCopy(language);

  return (
    <View style={styles.root}>
      <Atmosphere />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 124 + insets.bottom }]}
          showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <View style={styles.shieldTile}>
              <SymbolView
                name={{ ios: 'lock.shield.fill', android: 'shield_lock', web: 'shield_lock' }}
                size={32}
                tintColor={COLORS.secondary}
                weight="bold"
              />
            </View>
            <Text accessibilityRole="header" style={styles.title}>{t('onboarding.5.title')}</Text>
            <Text style={styles.introduction}>
              {t('onboarding.5.text')} {copy.securityPriority}
            </Text>
          </Animated.View>

          <View style={styles.permissions}>
            <PermissionCard
              delay={100}
              description={copy.locationDescription}
              enabled={locationEnabled}
              icon={
                <SymbolView
                  name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }}
                  size={22}
                  tintColor={COLORS.primary}
                  weight="bold"
                />
              }
              importance={copy.required}
              onValueChange={setLocationEnabled}
              status={locationEnabled ? copy.alwaysAllowed : copy.disabled}
              title={t('onboarding.location')}
            />
            <PermissionCard
              delay={220}
              description={copy.notificationsDescription}
              enabled={notificationsEnabled}
              icon={
                <SymbolView
                  name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
                  size={22}
                  tintColor={COLORS.secondary}
                  weight="bold"
                />
              }
              importance={copy.recommended}
              onValueChange={setNotificationsEnabled}
              status={notificationsEnabled ? copy.allowed : copy.disabled}
              title={t('onboarding.notifications')}
            />
            <PermissionCard
              delay={340}
              description={copy.activityDescription}
              enabled={activityEnabled}
              icon={
                <SymbolView
                  name={{ ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' }}
                  size={22}
                  tintColor={COLORS.tertiary}
                  weight="medium"
                />
              }
              importance={copy.optional}
              onValueChange={setActivityEnabled}
              status={activityEnabled ? copy.allowed : copy.disabled}
              title={t('onboarding.physicalActivity')}
            />
          </View>

          <PrivacyIllustration encryptionLabel={copy.encryption} />
        </ScrollView>
      </SafeAreaView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(spacing[5], insets.bottom + spacing[2]) },
        ]}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backLabel}>{t('common.back')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
          <Text style={styles.continueLabel}>{t('common.continue')}</Text>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={20}
            tintColor={COLORS.onPrimaryContainer}
            weight="bold"
          />
        </Pressable>
      </View>
    </View>
  );
}

function Atmosphere() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.backgroundGlow, styles.backgroundGlowTop]} />
      <View style={[styles.backgroundGlow, styles.backgroundGlowBottom]} />
    </View>
  );
}

type PermissionCardProps = {
  title: string;
  importance: string;
  description: string;
  status: string;
  icon: ReactNode;
  enabled: boolean;
  onValueChange: (value: boolean) => void;
  delay: number;
};

function PermissionCard({
  title,
  importance,
  description,
  status,
  icon,
  enabled,
  onValueChange,
  delay,
}: PermissionCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View entering={reduceMotion ? FadeIn.duration(1) : FadeInDown.delay(delay).duration(450)}>
      <Card style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <View style={styles.permissionIdentity}>
            <View style={styles.permissionIcon}>{icon}</View>
            <View style={styles.permissionHeading}>
              <Text style={styles.permissionTitle}>{title}</Text>
              <Text style={[styles.importance, enabled && styles.importanceEnabled]}>{importance}</Text>
            </View>
          </View>
          <PermissionToggle label={title} onValueChange={onValueChange} value={enabled} />
        </View>
        <Text style={styles.permissionDescription}>{description}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, enabled && styles.statusDotEnabled]} />
          <Text style={[styles.statusText, enabled && styles.statusTextEnabled]}>{status}</Text>
        </View>
      </Card>
    </Animated.View>
  );
}

function PermissionToggle({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? value ? 1 : 0
      : withTiming(value ? 1 : 0, { duration: 200, easing: Easing.inOut(Easing.ease) });
  }, [progress, reduceMotion, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.surfaceHighest, COLORS.green],
    ),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 24 }],
  }));

  return (
    <Pressable
      accessibilityLabel={`${value ? 'Désactiver' : 'Activer'} ${label}`}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={styles.toggleTouchTarget}>
      <Animated.View style={[styles.toggleTrack, trackStyle, value && styles.toggleTrackEnabled]}>
        <Animated.View style={[styles.toggleThumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

function PrivacyIllustration({ encryptionLabel }: { encryptionLabel: string }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) }),
      ),
      -1,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 1000 }), withTiming(0.35, { duration: 1000 })),
      -1,
    );
  }, [opacity, reduceMotion, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(460).duration(500)}>
      <Card style={styles.illustration}>
        <View style={styles.illustrationGlow} />
        <View style={[styles.dataLine, styles.dataLineOne]} />
        <View style={[styles.dataLine, styles.dataLineTwo]} />
        <View style={[styles.dataLine, styles.dataLineThree]} />
        <View style={[styles.dataNode, styles.nodeOne]} />
        <View style={[styles.dataNode, styles.nodeTwo]} />
        <View style={[styles.dataNode, styles.nodeThree]} />
        <Animated.View style={[styles.shieldPulse, pulseStyle]} />
        <View style={styles.centralShield}>
          <SymbolView
            name={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }}
            size={42}
            tintColor={COLORS.cyan}
            weight="bold"
          />
        </View>
        <View style={styles.encryptionBadge}>
          <SymbolView
            name={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }}
            size={14}
            tintColor={COLORS.primary}
            weight="bold"
          />
          <Text style={styles.encryptionText}>{encryptionLabel}</Text>
        </View>
      </Card>
    </Animated.View>
  );
}

function getCopy(language: 'fr' | 'mg') {
  if (language === 'mg') {
    return {
      securityPriority: 'Ny fiarovana anao no laharam-pahamehana indrindra.',
      required: 'ILAINA',
      recommended: 'Soso-kevitra',
      optional: 'Tsy voatery',
      alwaysAllowed: 'Mahazo alalana mandrakariva',
      allowed: 'Mahazo alalana',
      disabled: 'Tsy mandeha',
      locationDescription: 'Mampiseho ny toerana misy anao eo amin’ny sarintany ary mampandre ny havanao rehefa misy fanairana na dia azo antoka.',
      notificationsDescription: 'Mahazoa fanairana avy hatrany rehefa mila fanampiana na tonga any amin’ny toerana halehany ny havanao.',
      activityDescription: 'Mahita ho azy rehefa mandeha na mihazakazaka ianao mba hanatsarana ny fahamarinan’ny lalana.',
      encryption: 'Voaaro tanteraka ny fifandraisana',
    };
  }

  return {
    securityPriority: 'Votre sécurité est notre priorité absolue.',
    required: 'INDISPENSABLE',
    recommended: 'RECOMMANDÉ',
    optional: 'OPTIONNEL',
    alwaysAllowed: 'Toujours autorisé',
    allowed: 'Autorisé',
    disabled: 'Désactivé',
    locationDescription: "Permet de vous situer sur la carte et de notifier vos proches en cas d'alerte ou de trajet sécurisé.",
    notificationsDescription: "Recevez des alertes immédiates si un membre de votre cercle a besoin d'aide ou termine son trajet.",
    activityDescription: 'Détecte automatiquement quand vous marchez ou courez pour optimiser la précision de votre trajet.',
    encryption: 'Chiffrement de bout en bout',
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
  backgroundGlow: {
    borderRadius: radius.circle,
    position: 'absolute',
  },
  backgroundGlowTop: {
    backgroundColor: 'rgba(79, 140, 255, 0.10)',
    height: 420,
    right: -210,
    top: -190,
    width: 420,
  },
  backgroundGlowBottom: {
    backgroundColor: 'rgba(56, 214, 232, 0.08)',
    bottom: -210,
    height: 420,
    left: -210,
    width: 420,
  },
  content: {
    alignSelf: 'center',
    maxWidth: 512,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[12],
    width: '100%',
  },
  header: {
    marginBottom: spacing[8],
  },
  shieldTile: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceHigh,
    borderColor: 'rgba(68, 73, 53, 0.20)',
    borderRadius: 24,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing[6],
    width: 56,
  },
  title: {
    ...typography.titleLarge,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 34,
    marginBottom: spacing[4],
  },
  introduction: {
    ...typography.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  permissions: {
    gap: spacing[4],
  },
  permissionCard: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.glassBorder,
    borderRadius: 32,
    gap: spacing[4],
    padding: spacing[6],
  },
  permissionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  permissionIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: spacing[4],
  },
  permissionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: radius.circle,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  permissionHeading: {
    flexShrink: 1,
    gap: 2,
  },
  permissionTitle: {
    ...typography.labelMedium,
    color: COLORS.text,
    fontSize: 14,
  },
  importance: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  importanceEnabled: {
    color: COLORS.primary,
  },
  permissionDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  statusDot: {
    backgroundColor: COLORS.outline,
    borderRadius: radius.circle,
    height: 8,
    width: 8,
  },
  statusDotEnabled: {
    backgroundColor: COLORS.tertiary,
    shadowColor: COLORS.brightGreen,
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  statusText: {
    ...typography.caption,
    color: COLORS.outline,
    fontWeight: '500',
  },
  statusTextEnabled: {
    color: COLORS.tertiary,
  },
  toggleTouchTarget: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginRight: -spacing[3],
    marginTop: -spacing[3],
    width: 56,
  },
  toggleTrack: {
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 4,
    width: 48,
  },
  toggleTrackEnabled: {
    experimental_backgroundImage: 'linear-gradient(90deg, #29D391 0%, #4F8CFF 100%)',
  },
  toggleThumb: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.circle,
    height: 16,
    shadowColor: '#000000',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: 16,
  },
  illustration: {
    aspectRatio: 16 / 9,
    backgroundColor: '#071424',
    borderColor: 'transparent',
    borderRadius: 48,
    marginTop: spacing[8],
    overflow: 'hidden',
    padding: 0,
    position: 'relative',
  },
  illustrationGlow: {
    backgroundColor: 'rgba(56, 214, 232, 0.12)',
    borderRadius: radius.circle,
    height: 210,
    left: '50%',
    marginLeft: -105,
    marginTop: -105,
    position: 'absolute',
    top: '50%',
    width: 210,
  },
  dataLine: {
    backgroundColor: 'rgba(79, 140, 255, 0.38)',
    height: 2,
    position: 'absolute',
    width: 150,
  },
  dataLineOne: {
    left: 28,
    top: 60,
    transform: [{ rotate: '18deg' }],
  },
  dataLineTwo: {
    right: 22,
    top: 82,
    transform: [{ rotate: '-24deg' }],
  },
  dataLineThree: {
    bottom: 58,
    left: 80,
    transform: [{ rotate: '-12deg' }],
    width: 220,
  },
  dataNode: {
    backgroundColor: COLORS.blue,
    borderRadius: radius.circle,
    height: 10,
    position: 'absolute',
    shadowColor: COLORS.blue,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    width: 10,
  },
  nodeOne: {
    left: 36,
    top: 56,
  },
  nodeTwo: {
    right: 42,
    top: 64,
  },
  nodeThree: {
    bottom: 54,
    right: 72,
  },
  shieldPulse: {
    borderColor: COLORS.cyan,
    borderRadius: radius.circle,
    borderWidth: 2,
    height: 88,
    left: '50%',
    marginLeft: -44,
    marginTop: -44,
    position: 'absolute',
    top: '50%',
    width: 88,
  },
  centralShield: {
    alignItems: 'center',
    backgroundColor: 'rgba(12, 33, 71, 0.92)',
    borderColor: 'rgba(56, 214, 232, 0.32)',
    borderRadius: radius.circle,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -36,
    marginTop: -36,
    position: 'absolute',
    top: '50%',
    width: 72,
  },
  encryptionBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(201, 242, 59, 0.20)',
    borderRadius: radius.pill,
    bottom: spacing[4],
    flexDirection: 'row',
    gap: spacing[2],
    left: spacing[4],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    position: 'absolute',
  },
  encryptionText: {
    color: COLORS.onPrimaryContainer,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 10, 0.92)',
    borderTopColor: 'rgba(68, 73, 53, 0.10)',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing[4],
    left: 0,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    position: 'absolute',
    right: 0,
    zIndex: 50,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHigh,
    borderColor: COLORS.outlineVariant,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  backLabel: {
    ...typography.labelMedium,
    color: COLORS.text,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    borderRadius: radius.pill,
    experimental_backgroundImage: 'linear-gradient(90deg, #FFFFFF 0%, #C9F23B 100%)',
    flex: 2,
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  continueLabel: {
    ...typography.labelMedium,
    color: COLORS.onPrimaryContainer,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
