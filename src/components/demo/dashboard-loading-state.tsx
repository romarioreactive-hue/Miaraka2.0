import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/ui/app-background';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

import { DemoTab, DemoTabBar } from './demo-tab-bar';

type DashboardLoadingStateProps = {
  activeTab: DemoTab;
  onChangeTab: (tab: DemoTab) => void;
  onPressMia?: () => void;
};

export function DashboardLoadingState({ activeTab, onChangeTab, onPressMia }: DashboardLoadingStateProps) {
  const { t } = useLanguage();

  return (
    <AppBackground style={styles.root} variant="dashboard">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <View style={styles.topBarIdentity}>
            <Skeleton height={40} radiusValue={radius.circle} width={40} />
            <Text style={styles.brand}>{t('loading.brand')}</Text>
          </View>
          <View style={styles.notificationDot} />
        </View>

        <View style={styles.mapArea}>
          <MapPulse />
          <Text style={styles.mapHint}>{t('loading.preparingMap')}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Skeleton height={18} width={140} />
            <Skeleton height={14} width={40} />
          </View>
          <View style={styles.activityRow}>
            <ActivitySkeletonCard />
            <ActivitySkeletonCard dimmed />
          </View>
        </View>

        <View style={styles.section}>
          <Skeleton height={18} width={160} />
          <View style={styles.challengeRow}>
            <ChallengeSkeletonCard />
            <ChallengeSkeletonCard />
          </View>
        </View>

        <DemoTabBar activeTab={activeTab} onChangeTab={onChangeTab} onPressMia={onPressMia} />
      </SafeAreaView>
    </AppBackground>
  );
}

function MapPulse() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })),
      -1,
      false,
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: Math.max(0, 1 - (scale.value - 1) / 0.5),
  }));

  return (
    <View style={styles.mapPulseWrap}>
      <Animated.View style={[styles.mapPulseRing, style]} />
      <View style={styles.mapPulseDot} />
    </View>
  );
}

function ActivitySkeletonCard({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <View style={[styles.activityCard, dimmed && styles.activityCardDimmed]}>
      <View style={styles.activityCardTop}>
        <Skeleton height={36} radiusValue={radius.circle} width={36} />
        <View style={styles.activityCardLines}>
          <Skeleton height={10} width="80%" />
          <Skeleton height={8} width="55%" />
        </View>
      </View>
      <Skeleton height={4} radiusValue={radius.pill} width="100%" />
    </View>
  );
}

function ChallengeSkeletonCard() {
  return (
    <View style={styles.challengeCard}>
      <Skeleton height={72} radiusValue={radius.medium} width="100%" />
      <Skeleton height={10} width="100%" />
      <Skeleton height={8} width="65%" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: spacing[4], paddingTop: spacing[2] },
  topBarIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  brand: { ...typography.titleMedium, color: darkColors.accent },
  notificationDot: { width: 40, height: 40, borderRadius: radius.circle, backgroundColor: darkColors.surfaceElevated },
  mapArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[4] },
  mapPulseWrap: { alignItems: 'center', justifyContent: 'center', width: 80, height: 80 },
  mapPulseRing: { position: 'absolute', width: 80, height: 80, borderRadius: radius.circle, backgroundColor: darkColors.primarySoft },
  mapPulseDot: { width: 16, height: 16, borderRadius: radius.circle, backgroundColor: darkColors.primary },
  mapHint: { ...typography.caption, color: darkColors.textMuted },
  section: { paddingHorizontal: spacing[4], gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityRow: { flexDirection: 'row', gap: spacing[3] },
  activityCard: { flex: 1, padding: spacing[3], borderRadius: radius.large, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface, gap: spacing[3] },
  activityCardDimmed: { opacity: 0.6 },
  activityCardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  activityCardLines: { flex: 1, gap: spacing[1] },
  challengeRow: { flexDirection: 'row', gap: spacing[3] },
  challengeCard: { flex: 1, padding: spacing[3], borderRadius: radius.large, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface, gap: spacing[2] },
});
