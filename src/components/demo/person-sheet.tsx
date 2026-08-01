import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

import { GROUP_COLORS, Person } from './people-data';

type PersonSheetProps = {
  person: Person;
  onClose: () => void;
};

const COLORS = {
  background: darkColors.background,
  glass: 'rgba(9, 26, 55, 0.94)',
  glassBorder: darkColors.border,
  surface: darkColors.surface,
  surfaceLow: darkColors.backgroundElevated,
  surfaceHigh: darkColors.surfaceElevated,
  surfaceHighest: darkColors.surfaceInteractive,
  outline: darkColors.textMuted,
  outlineVariant: darkColors.border,
  text: darkColors.textPrimary,
  textSecondary: darkColors.textSecondary,
  white: darkColors.textPrimary,
  green: darkColors.success,
  cyan: darkColors.accent,
  blue: darkColors.primary,
  paleBlue: darkColors.accent,
  lime: darkColors.accent,
  onPrimary: darkColors.textInverse,
  warning: darkColors.warning,
  error: darkColors.error,
} as const;

export function PersonSheet({ person, onClose }: PersonSheetProps) {
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState<string | null>(null);
  const copy = getCopy(language);
  const groupColor = GROUP_COLORS[person.group];
  const display = getDisplayData(person, language);
  const batteryTint = display.battery >= 50 ? COLORS.green : display.battery >= 20 ? COLORS.warning : COLORS.error;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(180)} style={StyleSheet.absoluteFill}>
        <Pressable
          accessibilityLabel={t('common.close')}
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
      </Animated.View>

      <Animated.View
        accessibilityViewIsModal
        entering={SlideInDown.duration(400).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(240).easing(Easing.in(Easing.ease))}
        style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(spacing[8], insets.bottom + spacing[4]) }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.identityHeader}>
            <View style={styles.avatarWrap}>
              <Avatar
                backgroundColor={person.color}
                initials={person.initials}
                name={person.name}
                ringColor={COLORS.paleBlue}
                size={88}
                source={person.avatar}
              />
              <View style={styles.movementBadge}>
                <SymbolView
                  name={{ ios: 'scooter', android: 'two_wheeler', web: 'two_wheeler' }}
                  size={16}
                  tintColor={COLORS.paleBlue}
                  weight="bold"
                />
              </View>
            </View>

            <View style={styles.identityCopy}>
              <View style={styles.nameRow}>
                <Text numberOfLines={1} style={styles.name}>
                  {person.isMe ? `${person.name} (${t('map.youInformal')})` : person.name}
                </Text>
                <View style={[styles.groupBadge, { backgroundColor: `${groupColor}22`, borderColor: `${groupColor}55` }]}>
                  <Text style={[styles.groupText, { color: groupColor }]}>
                    {t(person.group === 'famille' ? 'groups.family' : person.group === 'amis' ? 'groups.friends' : 'groups.team')}
                  </Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <SymbolView
                  name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }}
                  size={15}
                  tintColor={COLORS.textSecondary}
                  weight="medium"
                />
                <Text numberOfLines={2} style={styles.location}>{display.location}</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.liveBadge}>
                  <SymbolView
                    name={{ ios: 'sensor.fill', android: 'sensors', web: 'sensors' }}
                    size={14}
                    tintColor={COLORS.paleBlue}
                    weight="bold"
                  />
                  <Text style={styles.liveText}>{copy.livePosition}</Text>
                </View>
                <View style={styles.battery}>
                  <SymbolView
                    name={{ ios: 'battery.75percent', android: 'battery_horiz_075', web: 'battery_horiz_075' }}
                    size={16}
                    tintColor={batteryTint}
                    weight="medium"
                  />
                  <Text style={[styles.batteryText, { color: batteryTint }]}>{display.battery}%</Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityLabel={t('common.close')}
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={20}
                tintColor={COLORS.textSecondary}
                weight="bold"
              />
            </Pressable>
          </View>

          <MovementBanner copy={copy} eta={display.eta} movement={display.movement} />

          <View style={styles.statsGrid}>
            <StatCard
              accent={COLORS.green}
              icon="footprint"
              label={copy.today}
              unit={t('common.steps')}
              value={display.steps.toLocaleString(language === 'fr' ? 'fr-FR' : 'mg-MG')}
            />
            <StatCard
              accent={COLORS.paleBlue}
              icon="distance"
              label={t('common.thisWeek')}
              unit="km"
              value={display.weeklyKm.toLocaleString(language === 'fr' ? 'fr-FR' : 'mg-MG')}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setFeedback(copy.routeFeedback)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'point.topleft.down.to.point.bottomright.curvepath', android: 'route', web: 'route' }} size={21} tintColor={COLORS.onPrimary} weight="bold" />
              <Text style={styles.primaryLabel}>{copy.seeRoute}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setFeedback(copy.destinationFeedback)}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'flag.fill', android: 'flag', web: 'flag' }} size={20} tintColor={COLORS.paleBlue} weight="medium" />
              <Text style={styles.secondaryLabel}>{copy.setDestination}</Text>
            </Pressable>
            {feedback ? <Animated.Text entering={FadeIn.duration(200)} style={styles.feedback}>{feedback}</Animated.Text> : null}
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.closeAction, pressed && styles.pressed]}>
              <Text style={styles.closeActionLabel}>{t('common.close')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function MovementBanner({ copy, eta, movement }: { copy: ReturnType<typeof getCopy>; eta: number; movement: string }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 1500 }), withTiming(0, { duration: 1500 })),
      -1,
    );
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.1 + pulse.value * 0.3,
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }));

  return (
    <View style={styles.movementBanner}>
      <View style={styles.movementInfo}>
        <Animated.View style={[styles.navigationIcon, pulseStyle]}>
          <SymbolView
            name={{ ios: 'location.north.fill', android: 'navigation', web: 'navigation' }}
            size={22}
            tintColor={COLORS.paleBlue}
            weight="bold"
          />
        </Animated.View>
        <View style={styles.movementCopy}>
          <Text style={styles.movementTitle}>{movement}</Text>
          <Text style={styles.movementSubtitle}>{copy.arrivalOffice.replace('{minutes}', String(eta))}</Text>
        </View>
      </View>
      <View style={styles.etaValueRow}>
        <Text style={styles.etaValue}>{eta}</Text>
        <Text style={styles.etaUnit}>min</Text>
      </View>
    </View>
  );
}

function StatCard({ accent, icon, label, unit, value }: { accent: string; icon: 'footprint' | 'distance'; label: string; unit: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeading}>
        <SymbolView
          name={{ ios: icon === 'footprint' ? 'figure.walk' : 'point.bottomleft.forward.to.point.topright.scurvepath', android: icon, web: icon }}
          size={20}
          tintColor={accent}
          weight="medium"
        />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <View style={styles.statValueRow}>
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function getDisplayData(person: Person, language: 'fr' | 'mg') {
  if (person.id === 'rica') {
    return {
      battery: 72,
      eta: 18,
      location: 'Jumbo Score Ankorondrano',
      movement: language === 'fr' ? 'À moto' : 'Amin’ny moto',
      steps: 6420,
      weeklyKm: 4.8,
    };
  }

  return {
    battery: person.battery,
    eta: Number.parseInt(person.eta, 10) || 0,
    location: person.location,
    movement: person.speedKmh > 0 ? (language === 'fr' ? 'En déplacement' : 'Mivezivezy') : (language === 'fr' ? 'À l’arrêt' : 'Mijanona'),
    steps: person.steps,
    weeklyKm: person.weeklyKm,
  };
}

function getCopy(language: 'fr' | 'mg') {
  return language === 'mg'
    ? {
        livePosition: 'TOERANA MIVANTANA', today: 'ANIO', arrivalOffice: 'Ho tonga any amin’ny birao afaka {minutes} min', seeRoute: 'Hijery ny lalana', setDestination: 'Hametraka ho toerana haleha', routeFeedback: 'Lalana santatra naseho.', destinationFeedback: 'Toerana haleha santatra voafaritra.',
      }
    : {
        livePosition: 'POSITION EN DIRECT', today: "AUJOURD'HUI", arrivalOffice: 'Arrivée au bureau dans {minutes} min', seeRoute: 'Voir le trajet', setDestination: 'Définir comme destination', routeFeedback: 'Trajet fictif affiché.', destinationFeedback: 'Destination fictive définie.',
      };
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0, 0, 0, 0.46)' },
  sheet: { backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, bottom: 0, left: 0, maxHeight: '86%', overflow: 'hidden', paddingTop: spacing[4], position: 'absolute', right: 0, shadowColor: '#000000', shadowOffset: { height: -8, width: 0 }, shadowOpacity: 0.45, shadowRadius: 28 },
  handle: { alignSelf: 'center', backgroundColor: 'rgba(68, 73, 53, 0.50)', borderRadius: radius.pill, height: 6, marginBottom: spacing[4], width: 48 },
  content: { gap: spacing[6], paddingHorizontal: spacing[5] },
  identityHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing[4] },
  avatarWrap: { position: 'relative' },
  movementBadge: { alignItems: 'center', backgroundColor: COLORS.surface, borderColor: COLORS.outlineVariant, borderRadius: radius.circle, borderWidth: 1, bottom: -2, height: 28, justifyContent: 'center', position: 'absolute', right: -2, width: 28 },
  identityCopy: { flex: 1, gap: spacing[2], paddingTop: spacing[1] },
  nameRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  name: { ...typography.titleLarge, color: COLORS.text, flexShrink: 1, fontSize: 28, lineHeight: 34 },
  groupBadge: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing[2], paddingVertical: 3 },
  groupText: { fontSize: 11, fontWeight: '700', lineHeight: 15 },
  locationRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing[1] },
  location: { ...typography.bodyMedium, color: COLORS.textSecondary, flex: 1, fontSize: 14, lineHeight: 20 },
  statusRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  liveBadge: { alignItems: 'center', backgroundColor: 'rgba(175, 198, 255, 0.10)', borderRadius: radius.medium, flexDirection: 'row', gap: spacing[1], paddingHorizontal: spacing[2], paddingVertical: spacing[1] },
  liveText: { color: COLORS.paleBlue, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, lineHeight: 14 },
  battery: { alignItems: 'center', flexDirection: 'row', gap: spacing[1] },
  batteryText: { fontSize: 12, fontWeight: '600' },
  closeButton: { alignItems: 'center', backgroundColor: COLORS.surfaceHigh, borderRadius: radius.circle, height: 48, justifyContent: 'center', marginRight: -spacing[2], marginTop: -spacing[2], width: 48 },
  movementBanner: { alignItems: 'center', backgroundColor: COLORS.surfaceHigh, borderColor: 'rgba(175, 198, 255, 0.10)', borderRadius: radius.extraLarge, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: spacing[4], shadowColor: COLORS.blue, shadowOpacity: 0.15, shadowRadius: 20 },
  movementInfo: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing[3] },
  navigationIcon: { alignItems: 'center', backgroundColor: 'rgba(175, 198, 255, 0.16)', borderRadius: radius.circle, height: 44, justifyContent: 'center', shadowColor: COLORS.cyan, shadowRadius: 15, width: 44 },
  movementCopy: { flex: 1, gap: 2 },
  movementTitle: { ...typography.labelLarge, color: COLORS.text },
  movementSubtitle: { ...typography.caption, color: COLORS.textSecondary },
  etaValueRow: { alignItems: 'baseline', flexDirection: 'row', marginLeft: spacing[2] },
  etaValue: { color: COLORS.paleBlue, fontSize: 20, fontWeight: '800', lineHeight: 26 },
  etaUnit: { color: COLORS.paleBlue, fontSize: 11, fontWeight: '700', marginLeft: 2 },
  statsGrid: { flexDirection: 'row', gap: spacing[4] },
  statCard: { backgroundColor: COLORS.surfaceLow, borderColor: 'rgba(68, 73, 53, 0.30)', borderRadius: radius.extraLarge, borderWidth: 1, flex: 1, gap: spacing[2], minWidth: 0, padding: spacing[4] },
  statHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing[2] },
  statLabel: { color: COLORS.textSecondary, flexShrink: 1, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, lineHeight: 14, textTransform: 'uppercase' },
  statValueRow: { alignItems: 'baseline', flexDirection: 'row', gap: spacing[1] },
  statValue: { color: COLORS.text, flexShrink: 1, fontSize: 30, fontWeight: '700', letterSpacing: -0.5, lineHeight: 38 },
  statUnit: { ...typography.caption, color: COLORS.textSecondary },
  actions: { gap: spacing[3], paddingTop: spacing[2] },
  primaryButton: { alignItems: 'center', backgroundColor: COLORS.lime, borderRadius: radius.pill, experimental_backgroundImage: 'linear-gradient(90deg, #B6F393 0%, #C9F23B 100%)', flexDirection: 'row', gap: spacing[2], justifyContent: 'center', minHeight: 52, shadowColor: COLORS.blue, shadowOpacity: 0.18, shadowRadius: 14 },
  primaryLabel: { ...typography.labelLarge, color: COLORS.onPrimary, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', backgroundColor: COLORS.surfaceHigh, borderColor: 'rgba(175, 198, 255, 0.50)', borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: spacing[2], justifyContent: 'center', minHeight: 52 },
  secondaryLabel: { ...typography.labelLarge, color: COLORS.paleBlue, fontWeight: '700' },
  feedback: { ...typography.caption, color: COLORS.textSecondary, textAlign: 'center' },
  closeAction: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  closeActionLabel: { ...typography.labelMedium, color: COLORS.textSecondary },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
