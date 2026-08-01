import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateChallengeSheet } from './create-challenge-sheet';
import { useLanguage } from '@/contexts/language-context';
import { alpha, darkColors, radius, spacing, typography } from '@/theme';

type ChallengeFilter = 'En cours' | 'Terminés' | 'Mes groupes';

const FILTERS: ChallengeFilter[] = ['En cours', 'Terminés', 'Mes groupes'];

const PARTICIPANTS = [
  { rank: 1, name: 'Moi', initials: 'M', distance: 7.4, goal: 10, color: darkColors.accent },
  { rank: 2, name: 'Rica', initials: 'R', distance: 6.2, goal: 8, color: darkColors.success },
  { rank: 3, name: 'Mario', initials: 'MA', distance: 3.7, goal: 5, color: darkColors.primary },
  { rank: 4, name: 'Taratra', initials: 'T', distance: 4.1, goal: 6, color: '#7C8DF6' },
] as const;

type ChallengeTypeCard = {
  icon: string;
  label: string;
  detail: string;
  complete?: boolean;
};

const CHALLENGE_TYPES: ChallengeTypeCard[] = [
  { icon: '◇', label: 'Individuel', detail: 'Objectif atteint', complete: true },
  { icon: '◎', label: 'Collectif', detail: 'Un objectif commun' },
  { icon: '≡', label: 'Classement', detail: 'Le meilleur gagne' },
];

export function ChallengesScreen() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<ChallengeFilter>('En cours');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showAllRanking, setShowAllRanking] = useState(false);

  const hasActiveChallenge = activeFilter === 'En cours';
  const visibleParticipants = showAllRanking ? PARTICIPANTS : PARTICIPANTS.slice(0, 3);
  const overflowCount = PARTICIPANTS.length - 3;

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.topBarIdentity}>
            <Avatar backgroundColor="#253B63" initials="M" name={t('common.me')} ringColor={alpha.white24} size={32} />
            <Text accessibilityRole="header" style={styles.title}>{t('challenges.title')}</Text>
          </View>
          <Pressable
            accessibilityLabel={t('common.notifications')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
              size={20}
              tintColor={darkColors.primary}
              weight="medium"
            />
          </Pressable>
        </View>

        <View style={styles.filters}>
          {FILTERS.map((filter) => {
            const selected = filter === activeFilter;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[styles.filter, selected && styles.filterActive]}>
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter === 'En cours' ? t('challenges.inProgress') : filter === 'Terminés' ? t('challenges.finished') : t('nav.spaces')}</Text>
              </Pressable>
            );
          })}
        </View>

        {!hasActiveChallenge ? (
          <EmptyState
            actionLabel={t('challenges.createTitle')}
            description={t('challenges.emptyDescription')}
            icon={
              <SymbolView
                name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
                size={32}
                tintColor={darkColors.accent}
              />
            }
            onAction={() => setIsCreateOpen(true)}
            title={t('challenges.emptyTitle')}
          />
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.teamBadge}>
                  <View style={styles.teamDot} />
                  <Text style={styles.teamBadgeText}>{t('groups.team').toLocaleUpperCase()}</Text>
                </View>
                <Text style={styles.period}>Lun. → Dim.</Text>
              </View>

              <Text style={styles.challengeName}>{t('challenges.heroName')}</Text>
              <Text style={styles.challengeSubtitle}>{t('spaces.collectiveGoal')}</Text>

              <Text style={styles.progressLabel}>{t('challenges.progressTotal').toLocaleUpperCase()}</Text>
              <View style={styles.totalRow}>
                <View style={styles.totalNumbers}>
                  <Text style={styles.totalValue}>21,4</Text>
                  <Text style={styles.totalTarget}> / 40 km</Text>
                </View>
                <View style={styles.daysBlock}>
                  <Text style={styles.daysValue}>3</Text>
                  <Text style={styles.daysLabel}>{t('challenges.daysLeft')}</Text>
                </View>
              </View>

              <ProgressBar progress={53.5} color={darkColors.success} height={10} delay={100} />
              <View style={styles.progressFooter}>
                <Text style={styles.progressHint}>{t('challenges.teamMoving')}</Text>
                <Text style={styles.progressPercent}>54 %</Text>
              </View>

              <View style={styles.avatarStackRow}>
                <View style={styles.avatarStack}>
                  {PARTICIPANTS.slice(0, 3).map((participant, index) => (
                    <View
                      key={participant.name}
                      style={[
                        styles.stackAvatar,
                        { marginLeft: index === 0 ? 0 : -10, backgroundColor: `${participant.color}33`, borderColor: darkColors.surface },
                      ]}>
                      <Text style={[styles.stackAvatarText, { color: participant.color }]}>{participant.initials}</Text>
                    </View>
                  ))}
                  {overflowCount > 0 ? (
                    <View style={[styles.stackAvatar, styles.stackAvatarMore]}>
                      <Text style={styles.stackAvatarMoreText}>+{overflowCount}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>{PARTICIPANTS.length} PARTICIPANTS</Text>
                <Text style={styles.sectionTitle}>{t('challenges.ranking')}</Text>
              </View>
              {PARTICIPANTS.length > 3 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowAllRanking((current) => !current)}
                  style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>{showAllRanking ? t('challenges.seeLess') : t('challenges.seeAll')}</Text>
                  <Text style={styles.seeAllChevron}>{showAllRanking ? '︿' : '›'}</Text>
                </Pressable>
              ) : (
                <Text style={styles.updated}>{t('challenges.updated')}</Text>
              )}
            </View>

            <View style={styles.rankingCard}>
              {visibleParticipants.map((participant, index) => (
                <ParticipantRow
                  key={participant.name}
                  {...participant}
                  isFirst={participant.rank === 1}
                  isLast={index === visibleParticipants.length - 1}
                />
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>{t('challenges.eachPace')}</Text>
                <Text style={styles.sectionTitle}>{t('challenges.types')}</Text>
              </View>
            </View>

            <View style={styles.typeRow}>
              {CHALLENGE_TYPES.map((type) => (
                <View key={type.label} style={styles.typeCard}>
                  <View style={[styles.typeIcon, type.complete && styles.typeIconComplete]}>
                    <Text style={[styles.typeIconText, type.complete && styles.typeIconTextComplete]}>
                      {type.icon}
                    </Text>
                  </View>
                  <Text style={styles.typeLabel}>{type.label === 'Individuel' ? t('challenges.individual') : type.label === 'Collectif' ? t('challenges.collective') : t('challenges.ranking')}</Text>
                  <Text numberOfLines={2} style={styles.typeDetail}>{type.detail === 'Objectif atteint' ? t('challenges.goalReached') : type.detail === 'Un objectif commun' ? t('challenges.commonGoal') : t('challenges.bestWins')}</Text>
                  {type.complete && <AchievementPulse />}
                </View>
              ))}
            </View>

            <View style={styles.ctaBlock}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsCreateOpen(true)}
                style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}>
                <Text style={styles.ctaButtonIcon}>＋</Text>
                <Text style={styles.ctaButtonText}>{t('challenges.createTitle')}</Text>
              </Pressable>
              <Text style={styles.ctaHelper}>{t('challenges.ctaHelper')}</Text>
            </View>
          </>
        )}
      </ScrollView>

      <CreateChallengeSheet visible={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}

type ParticipantRowProps = (typeof PARTICIPANTS)[number] & { isFirst: boolean; isLast: boolean };

function ParticipantRow({ rank, name, initials, distance, goal, color, isFirst, isLast }: ParticipantRowProps) {
  const { t } = useLanguage();
  const percentage = Math.round((distance / goal) * 100);

  return (
    <View style={[styles.participantRow, isFirst && styles.participantRowFirst, !isLast && styles.participantDivider]}>
      <View style={styles.participantTopRow}>
        <Text style={[styles.rank, rank === 1 && styles.rankFirst]}>#{rank}</Text>
        <View style={[styles.avatar, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
          <Text style={[styles.avatarText, { color }]}>{initials}</Text>
        </View>
        <View style={styles.participantNameBlock}>
          <Text style={styles.participantName}>{name === 'Moi' ? t('common.me') : name}</Text>
          <Text style={styles.participantDistance}>
            <Text style={styles.distanceStrong}>{distance.toLocaleString('fr-FR')} km</Text>
            {' '}{t('challenges.ofGoal', { goal })}
          </Text>
        </View>
        <Text style={[styles.participantPercent, { color }]}>{percentage} %</Text>
      </View>
      <View style={styles.participantProgress}>
        <ProgressBar progress={percentage} color={color} height={6} delay={rank * 100} />
      </View>
    </View>
  );
}

type ProgressBarProps = {
  progress: number;
  color: string;
  height: number;
  delay?: number;
};

function ProgressBar({ progress, color, height, delay = 0 }: ProgressBarProps) {
  const { t } = useLanguage();
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withDelay(
      delay,
      withTiming(Math.min(progress, 100), { duration: 850, easing: Easing.out(Easing.cubic) }),
    );
  }, [animatedProgress, delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  return (
    <View
      accessible
      accessibilityLabel={t('challenges.progressA11y', { progress: Math.round(progress) })}
      style={[styles.progressTrack, { height }]}>
      <Animated.View style={[styles.progressFill, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

function AchievementPulse() {
  const { t } = useLanguage();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      3,
      false,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View accessibilityLabel={t('challenges.goalReached')} style={[styles.achievement, animatedStyle]}>
      <Text style={styles.achievementText}>{t('challenges.achieved')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: darkColors.background },
  content: { paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[10], gap: spacing[4] },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  topBarIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  title: { ...typography.titleLarge, color: darkColors.textPrimary },
  notificationButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surfaceElevated },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  filters: { flexDirection: 'row', gap: 7 },
  filter: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  filterActive: { backgroundColor: alpha.cyan16, borderColor: alpha.cyan32 },
  filterText: { color: darkColors.textMuted, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: darkColors.accent },
  heroCard: {
    padding: 18,
    borderRadius: 25,
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: alpha.primary32,
    overflow: 'hidden',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: alpha.primary12,
  },
  teamDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: darkColors.primary },
  teamBadgeText: { color: darkColors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  period: { color: darkColors.textMuted, fontSize: 10, fontWeight: '700' },
  challengeName: { color: darkColors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 15, letterSpacing: -0.3 },
  challengeSubtitle: { color: darkColors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 3 },
  progressLabel: { color: darkColors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginTop: 16 },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4, marginBottom: 16 },
  totalNumbers: { flexDirection: 'row', alignItems: 'baseline' },
  totalValue: { color: darkColors.textPrimary, fontSize: 35, fontWeight: '900', letterSpacing: -1 },
  totalTarget: { color: darkColors.textMuted, fontSize: 14, fontWeight: '700' },
  daysBlock: { alignItems: 'flex-end' },
  daysValue: { color: darkColors.success, fontSize: 24, lineHeight: 25, fontWeight: '900' },
  daysLabel: { color: darkColors.textMuted, fontSize: 8, fontWeight: '700' },
  progressTrack: { width: '100%', borderRadius: 999, overflow: 'hidden', backgroundColor: darkColors.surfaceElevated },
  progressFill: { height: '100%', borderRadius: 999 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  progressHint: { color: darkColors.textMuted, fontSize: 9, fontWeight: '600' },
  progressPercent: { color: darkColors.success, fontSize: 10, fontWeight: '900' },
  avatarStackRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 2 },
  stackAvatarText: { fontSize: 10, fontWeight: '800' },
  stackAvatarMore: { marginLeft: -10, backgroundColor: darkColors.surfaceElevated, borderColor: darkColors.surface },
  stackAvatarMoreText: { color: darkColors.textSecondary, fontSize: 10, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 },
  sectionEyebrow: { color: darkColors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
  sectionTitle: { color: darkColors.textPrimary, fontSize: 19, fontWeight: '800', marginTop: 2 },
  updated: { color: darkColors.textMuted, fontSize: 8, fontWeight: '600' },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32, paddingHorizontal: 4 },
  seeAllText: { color: darkColors.primary, fontSize: 11, fontWeight: '800' },
  seeAllChevron: { color: darkColors.primary, fontSize: 13, fontWeight: '800' },
  rankingCard: {
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  participantRow: { paddingVertical: 13 },
  participantRowFirst: { borderLeftWidth: 3, borderLeftColor: darkColors.accent, paddingLeft: 10, marginLeft: -13, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  participantDivider: { borderBottomWidth: 1, borderBottomColor: darkColors.border },
  participantTopRow: { flexDirection: 'row', alignItems: 'center' },
  rank: { width: 28, color: darkColors.textMuted, fontSize: 10, fontWeight: '900' },
  rankFirst: { color: darkColors.accent },
  avatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1,
    marginRight: 9,
  },
  avatarText: { fontSize: 10, fontWeight: '900' },
  participantNameBlock: { flex: 1 },
  participantName: { color: darkColors.textPrimary, fontSize: 12, fontWeight: '800' },
  participantDistance: { color: darkColors.textMuted, fontSize: 9, fontWeight: '600', marginTop: 2 },
  distanceStrong: { color: darkColors.textPrimary, fontWeight: '800' },
  participantPercent: { fontSize: 12, fontWeight: '900' },
  participantProgress: { paddingLeft: 73, marginTop: 8 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeCard: {
    flex: 1,
    minHeight: 125,
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  typeIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    marginBottom: 7,
    backgroundColor: alpha.primary12,
  },
  typeIconComplete: { backgroundColor: darkColors.successSoft },
  typeIconText: { color: darkColors.primary, fontSize: 17, fontWeight: '900' },
  typeIconTextComplete: { color: darkColors.success },
  typeLabel: { color: darkColors.textPrimary, fontSize: 10, fontWeight: '800' },
  typeDetail: { color: darkColors.textMuted, fontSize: 8, lineHeight: 11, textAlign: 'center', marginTop: 3 },
  achievement: {
    marginTop: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: darkColors.successSoft,
  },
  achievementText: { color: darkColors.success, fontSize: 6, fontWeight: '900', letterSpacing: 0.5 },
  ctaBlock: { gap: spacing[2], paddingTop: spacing[2] },
  ctaButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    backgroundColor: darkColors.success,
    shadowColor: darkColors.success,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaButtonIcon: { color: darkColors.textInverse, fontSize: 20, fontWeight: '700' },
  ctaButtonText: { color: darkColors.textInverse, fontSize: 14, fontWeight: '900' },
  ctaHelper: { textAlign: 'center', color: darkColors.textMuted, fontSize: 11, fontWeight: '600' },
});
