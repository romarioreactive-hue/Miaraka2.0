import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { alpha, darkColors, radius, spacing, typography } from '@/theme';
import { useLanguage } from '@/contexts/language-context';

export function ConnectedPeopleVisual() {
  const scale = useSharedValue(0.92);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(600)} style={[styles.connectedScene, animatedStyle]}>
      <View style={[styles.connectionLine, styles.lineOne]} />
      <View style={[styles.connectionLine, styles.lineTwo]} />
      <View style={[styles.connectionLine, styles.lineThree]} />
      <View style={styles.logoGlow} />
      <View style={styles.logo}><Text style={styles.logoText}>M</Text></View>
      <Avatar initials="RI" color={darkColors.family} style={styles.avatarOne} delay={160} />
      <Avatar initials="FA" color={darkColors.friends} style={styles.avatarTwo} delay={280} />
      <Avatar initials="TO" color={darkColors.team} style={styles.avatarThree} delay={400} />
    </Animated.View>
  );
}

function Avatar({ initials, color, style, delay }: { initials: string; color: string; style: object; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={[styles.avatar, style, { borderColor: color, backgroundColor: `${color}32` }]}>
      <Text style={[styles.avatarText, { color }]}>{initials}</Text>
      <View style={styles.liveDot} />
    </Animated.View>
  );
}

export function MapVisual() {
  const { t } = useLanguage();
  const markerY = useSharedValue(0);

  useEffect(() => {
    markerY.value = withRepeat(withSequence(withTiming(-5, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1, false);
  }, [markerY]);

  const markerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: markerY.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.mapCard}>
      <View style={[styles.road, styles.roadHorizontal]} />
      <View style={[styles.road, styles.roadVertical]} />
      <View style={[styles.road, styles.roadDiagonal]} />
      <View style={styles.routeLine} />
      <View style={[styles.routeDot, styles.routeStart]} />
      <Animated.View style={[styles.mapMarker, styles.markerOne, markerStyle]}><Text style={styles.markerText}>RI</Text></Animated.View>
      <Animated.View entering={FadeInDown.delay(280)} style={[styles.mapMarker, styles.markerTwo]}><Text style={styles.markerText}>FA</Text></Animated.View>
      <View style={styles.etaCard}><Text style={styles.etaLabel}>{t('onboarding.eta')}</Text><Text style={styles.etaValue}>12 min</Text><Text style={styles.etaPlace}>{t('onboarding.home')}</Text></View>
    </Animated.View>
  );
}

export function ChallengeVisual() {
  const { t } = useLanguage();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(250, withTiming(82, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <Animated.View entering={FadeInUp.duration(550)} style={styles.rankingCard}>
      <View style={styles.rankingHeader}><View><Text style={styles.miniLabel}>{t('onboarding.weekChallenge')}</Text><Text style={styles.rankingTitle}>{t('onboarding.together')}</Text></View><Animated.View entering={FadeIn.delay(850)} style={styles.successBadge}><Text style={styles.successBadgeText}>{t('onboarding.onTrack')}</Text></Animated.View></View>
      <Animated.View style={[styles.challengeProgress, progressStyle]} />
      <View style={styles.rankings}>
        <RankingRow rank="1" initials="R" name="Rica" value="14,8 km" width="92%" color={darkColors.accent} />
        <RankingRow rank="2" initials="M" name={t('common.me')} value="12,4 km" width="78%" color={darkColors.primary} />
        <RankingRow rank="3" initials="T" name="Tovo" value="9,1 km" width="58%" color={darkColors.team} />
      </View>
    </Animated.View>
  );
}

function RankingRow({ rank, initials, name, value, width, color }: { rank: string; initials: string; name: string; value: string; width: `${number}%`; color: string }) {
  return (
    <View style={styles.rankingRow}><Text style={styles.rank}>{rank}</Text><View style={[styles.rankAvatar, { backgroundColor: `${color}28` }]}><Text style={[styles.rankAvatarText, { color }]}>{initials}</Text></View><View style={styles.rankCopy}><View style={styles.rankMeta}><Text style={styles.rankName}>{name}</Text><Text style={styles.rankValue}>{value}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width, backgroundColor: color }]} /></View></View></View>
  );
}

export function MiaVisual() {
  const { t } = useLanguage();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.12, { duration: 750 }), withTiming(1, { duration: 750 })), -1, false);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }], opacity: 2 - pulse.value }));

  return (
    <View style={styles.miaScene}>
      <Animated.View entering={FadeInUp.duration(500)} style={styles.questionBubble}><Text style={styles.questionText}>{t('onboarding.whereRica')}</Text></Animated.View>
      <View style={styles.micWrap}><Animated.View style={[styles.micPulse, pulseStyle]} /><View style={styles.micButton}><Text style={styles.micLabel}>MIA</Text><Text style={styles.micIcon}>●</Text></View></View>
      <View style={styles.wave}>{[12, 25, 38, 20, 44, 29, 14].map((height, index) => <Animated.View entering={FadeIn.delay(80 * index)} key={index} style={[styles.waveBar, { height }]} />)}</View>
      <Animated.View entering={FadeInDown.delay(500).duration(550)} style={styles.answerBubble}><View style={styles.answerDot} /><Text style={styles.answerText}><Text style={styles.answerStrong}>{t('onboarding.ricaOffice')}</Text>{'\n'}{t('onboarding.liveNow')}</Text></Animated.View>
    </View>
  );
}

export function PrivacyVisual() {
  const { t } = useLanguage();
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.permissions}>
      <PermissionCard icon="⌖" title={t('onboarding.location')} text={t('onboarding.sharedFamily')} enabled delay={100} />
      <PermissionCard icon="◌" title={t('onboarding.notifications')} text={t('onboarding.importantAlerts')} enabled delay={220} />
      <PermissionCard icon="↗" title={t('onboarding.physicalActivity')} text={t('onboarding.visibleChallenges')} enabled={false} delay={340} />
    </Animated.View>
  );
}

function PermissionCard({ icon, title, text, enabled, delay }: { icon: string; title: string; text: string; enabled: boolean; delay: number }) {
  const { t } = useLanguage();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(450)} style={styles.permissionCard}>
      <View style={[styles.permissionIcon, enabled && styles.permissionIconEnabled]}><Text style={[styles.permissionIconText, enabled && styles.permissionIconTextEnabled]}>{icon}</Text></View>
      <View style={styles.permissionCopy}><Text style={styles.permissionTitle}>{title}</Text><Text style={styles.permissionText}>{text}</Text></View>
      <View accessibilityLabel={enabled ? t('common.enabled') : t('common.disabled')} style={[styles.switchTrack, enabled && styles.switchTrackEnabled]}><View style={[styles.switchThumb, enabled && styles.switchThumbEnabled]} /></View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  connectedScene: { width: 280, height: 250, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  logoGlow: { position: 'absolute', width: 130, height: 130, borderRadius: radius.circle, backgroundColor: 'rgba(56,214,232,0.10)' },
  logo: { width: 82, height: 82, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: darkColors.primary, shadowColor: darkColors.accent, shadowOpacity: 0.42, shadowRadius: 22 }, logoText: { color: darkColors.textPrimary, fontSize: 35, fontWeight: '800' },
  connectionLine: { position: 'absolute', width: 2, height: 92, backgroundColor: darkColors.borderStrong }, lineOne: { left: 92, top: 43, transform: [{ rotate: '48deg' }] }, lineTwo: { right: 89, top: 44, transform: [{ rotate: '-48deg' }] }, lineThree: { bottom: 27, transform: [{ rotate: '4deg' }] },
  avatar: { position: 'absolute', width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 2 }, avatarOne: { top: 12, left: 22 }, avatarTwo: { top: 18, right: 18 }, avatarThree: { bottom: 8, left: 112 }, avatarText: { ...typography.labelMedium }, liveDot: { position: 'absolute', right: 1, bottom: 2, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: darkColors.background, backgroundColor: darkColors.live },
  mapCard: { width: '100%', maxWidth: 350, height: 250, alignSelf: 'center', borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface, overflow: 'hidden' },
  road: { position: 'absolute', backgroundColor: darkColors.surfaceElevated, borderRadius: radius.pill }, roadHorizontal: { left: -20, right: -20, top: 76, height: 18, transform: [{ rotate: '-7deg' }] }, roadVertical: { top: -20, bottom: -20, left: 92, width: 16, transform: [{ rotate: '12deg' }] }, roadDiagonal: { left: 105, right: -40, bottom: 55, height: 13, transform: [{ rotate: '28deg' }] },
  routeLine: { position: 'absolute', left: 105, top: 62, width: 142, height: 94, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: darkColors.accent, borderBottomLeftRadius: 52, transform: [{ rotate: '-8deg' }] }, routeDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: darkColors.accent }, routeStart: { left: 100, top: 55 },
  mapMarker: { position: 'absolute', width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 3, borderColor: darkColors.textPrimary, backgroundColor: darkColors.primary }, markerOne: { left: 78, top: 42 }, markerTwo: { right: 70, top: 122, backgroundColor: darkColors.team }, markerText: { color: darkColors.textPrimary, fontSize: 10, fontWeight: '800' },
  etaCard: { position: 'absolute', left: spacing[3], right: spacing[3], bottom: spacing[3], padding: spacing[3], borderRadius: radius.large, backgroundColor: darkColors.backgroundElevated, borderWidth: 1, borderColor: darkColors.border }, etaLabel: { fontSize: 8, lineHeight: 12, fontWeight: '700', letterSpacing: 0.8, color: darkColors.accent }, etaValue: { ...typography.titleMedium, color: darkColors.textPrimary }, etaPlace: { ...typography.caption, color: darkColors.textMuted },
  rankingCard: { width: '100%', maxWidth: 350, alignSelf: 'center', padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface }, rankingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, miniLabel: { fontSize: 8, lineHeight: 12, fontWeight: '700', letterSpacing: 0.8, color: darkColors.textMuted }, rankingTitle: { ...typography.titleMedium, color: darkColors.textPrimary }, successBadge: { paddingHorizontal: spacing[2], paddingVertical: 6, borderRadius: radius.pill, backgroundColor: darkColors.successSoft }, successBadgeText: { fontSize: 8, lineHeight: 12, fontWeight: '800', color: darkColors.success }, challengeProgress: { height: 5, marginVertical: spacing[3], borderRadius: radius.pill, backgroundColor: darkColors.success }, rankings: { gap: spacing[3] }, rankingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, rank: { width: 14, ...typography.labelMedium, color: darkColors.textMuted }, rankAvatar: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle }, rankAvatarText: { fontSize: 10, fontWeight: '800' }, rankCopy: { flex: 1 }, rankMeta: { flexDirection: 'row', justifyContent: 'space-between' }, rankName: { ...typography.labelMedium, color: darkColors.textPrimary }, rankValue: { ...typography.caption, color: darkColors.textSecondary }, progressTrack: { height: 5, marginTop: 5, borderRadius: radius.pill, backgroundColor: darkColors.surfaceElevated, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: radius.pill },
  miaScene: { width: '100%', maxWidth: 350, minHeight: 270, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }, questionBubble: { alignSelf: 'flex-start', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderRadius: radius.extraLarge, borderBottomLeftRadius: radius.small, backgroundColor: darkColors.surface }, questionText: { ...typography.bodyMedium, color: darkColors.textSecondary }, micWrap: { width: 92, height: 92, alignItems: 'center', justifyContent: 'center', marginVertical: spacing[3] }, micPulse: { position: 'absolute', width: 88, height: 88, borderRadius: radius.circle, backgroundColor: alpha.cyan16 }, micButton: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.accent }, micLabel: { fontSize: 11, lineHeight: 14, fontWeight: '800', color: darkColors.textInverse }, micIcon: { fontSize: 8, color: darkColors.textInverse }, wave: { height: 45, flexDirection: 'row', alignItems: 'center', gap: 5 }, waveBar: { width: 4, borderRadius: radius.pill, backgroundColor: darkColors.accent }, answerBubble: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingHorizontal: spacing[3], paddingVertical: spacing[3], borderRadius: radius.large, borderBottomRightRadius: radius.small, borderWidth: 1, borderColor: darkColors.successSoft, backgroundColor: darkColors.surface }, answerDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: darkColors.live }, answerText: { ...typography.caption, color: darkColors.textMuted }, answerStrong: { color: darkColors.textPrimary, fontWeight: '700' },
  permissions: { width: '100%', maxWidth: 350, alignSelf: 'center', gap: spacing[3] }, permissionCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3], borderRadius: radius.large, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface }, permissionIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.disabledSurface }, permissionIconEnabled: { backgroundColor: darkColors.primarySoft }, permissionIconText: { fontSize: 20, color: darkColors.textMuted }, permissionIconTextEnabled: { color: darkColors.primary }, permissionCopy: { flex: 1 }, permissionTitle: { ...typography.labelLarge, color: darkColors.textPrimary }, permissionText: { ...typography.caption, color: darkColors.textMuted }, switchTrack: { width: 46, height: 28, justifyContent: 'center', paddingHorizontal: 3, borderRadius: radius.pill, backgroundColor: darkColors.disabledSurface }, switchTrackEnabled: { backgroundColor: darkColors.success }, switchThumb: { width: 22, height: 22, borderRadius: radius.circle, backgroundColor: darkColors.textMuted }, switchThumbEnabled: { alignSelf: 'flex-end', backgroundColor: darkColors.textPrimary },
});
