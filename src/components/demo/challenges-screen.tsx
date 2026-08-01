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

import { CreateChallengeSheet } from './create-challenge-sheet';

const COLORS = {
  background: '#060C1F',
  surface: '#0D1933',
  surfaceLight: '#142342',
  text: '#F7FAFF',
  muted: '#8D9AB8',
  border: 'rgba(255,255,255,0.08)',
  green: '#39D98A',
  cyan: '#35D7E8',
  blue: '#5B8DEF',
} as const;

type ChallengeFilter = 'En cours' | 'Terminés' | 'Mes groupes';

const FILTERS: ChallengeFilter[] = ['En cours', 'Terminés', 'Mes groupes'];

const PARTICIPANTS = [
  { rank: 1, name: 'Moi', initials: 'M', distance: 7.4, goal: 10, color: COLORS.cyan },
  { rank: 2, name: 'Rica', initials: 'R', distance: 6.2, goal: 8, color: COLORS.green },
  { rank: 3, name: 'Mario', initials: 'MA', distance: 3.7, goal: 5, color: COLORS.blue },
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
  const [activeFilter, setActiveFilter] = useState<ChallengeFilter>('En cours');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>BOUGEONS ENSEMBLE</Text>
            <Text accessibilityRole="header" style={styles.title}>Défis</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsCreateOpen(true)}
            style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
            <Text style={styles.createButtonPlus}>＋</Text>
            <Text style={styles.createButtonText}>Créer un défi</Text>
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
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.teamBadge}>
              <View style={styles.teamDot} />
              <Text style={styles.teamBadgeText}>ÉQUIPE</Text>
            </View>
            <Text style={styles.period}>Lun. → Dim.</Text>
          </View>

          <Text style={styles.challengeName}>Défi XR de la semaine</Text>
          <Text style={styles.challengeSubtitle}>Objectif collectif</Text>

          <View style={styles.totalRow}>
            <View style={styles.totalNumbers}>
              <Text style={styles.totalValue}>21,4</Text>
              <Text style={styles.totalTarget}> / 40 km</Text>
            </View>
            <View style={styles.daysBlock}>
              <Text style={styles.daysValue}>3</Text>
              <Text style={styles.daysLabel}>jours restants</Text>
            </View>
          </View>

          <ProgressBar progress={53.5} color={COLORS.green} height={10} delay={100} />
          <View style={styles.progressFooter}>
            <Text style={styles.progressHint}>Toute l’équipe avance</Text>
            <Text style={styles.progressPercent}>54 %</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>4 PARTICIPANTS</Text>
            <Text style={styles.sectionTitle}>Classement</Text>
          </View>
          <Text style={styles.updated}>Mis à jour maintenant</Text>
        </View>

        <View style={styles.rankingCard}>
          {PARTICIPANTS.map((participant, index) => (
            <ParticipantRow
              key={participant.name}
              {...participant}
              isLast={index === PARTICIPANTS.length - 1}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>À CHACUN SON RYTHME</Text>
            <Text style={styles.sectionTitle}>Types de défi</Text>
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
              <Text style={styles.typeLabel}>{type.label}</Text>
              <Text numberOfLines={2} style={styles.typeDetail}>{type.detail}</Text>
              {type.complete && <AchievementPulse />}
            </View>
          ))}
        </View>
      </ScrollView>

      <CreateChallengeSheet visible={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}

type ParticipantRowProps = (typeof PARTICIPANTS)[number] & { isLast: boolean };

function ParticipantRow({ rank, name, initials, distance, goal, color, isLast }: ParticipantRowProps) {
  const percentage = Math.round((distance / goal) * 100);

  return (
    <View style={[styles.participantRow, !isLast && styles.participantDivider]}>
      <View style={styles.participantTopRow}>
        <Text style={[styles.rank, rank === 1 && styles.rankFirst]}>#{rank}</Text>
        <View style={[styles.avatar, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
          <Text style={[styles.avatarText, { color }]}>{initials}</Text>
        </View>
        <View style={styles.participantNameBlock}>
          <Text style={styles.participantName}>{name}</Text>
          <Text style={styles.participantDistance}>
            <Text style={styles.distanceStrong}>{distance.toLocaleString('fr-FR')} km</Text>
            {' '}sur {goal} km
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
      accessibilityLabel={`Progression ${Math.round(progress)} pour cent`}
      style={[styles.progressTrack, { height }]}>
      <Animated.View style={[styles.progressFill, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

function AchievementPulse() {
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
    <Animated.View accessibilityLabel="Objectif atteint" style={[styles.achievement, animatedStyle]}>
      <Text style={styles.achievementText}>✓ ATTEINT</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  eyebrow: { color: COLORS.cyan, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: COLORS.text, fontSize: 29, fontWeight: '800', letterSpacing: -0.6 },
  createButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  createButtonPlus: { color: COLORS.background, fontSize: 17, lineHeight: 18, fontWeight: '600' },
  createButtonText: { color: COLORS.background, fontSize: 11, fontWeight: '900' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  filters: { flexDirection: 'row', gap: 7 },
  filter: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterActive: { backgroundColor: 'rgba(53,215,232,0.13)', borderColor: 'rgba(53,215,232,0.42)' },
  filterText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: COLORS.cyan },
  heroCard: {
    padding: 18,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(91,141,239,0.28)',
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
    backgroundColor: 'rgba(91,141,239,0.14)',
  },
  teamDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.blue },
  teamBadgeText: { color: COLORS.blue, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  period: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  challengeName: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginTop: 15, letterSpacing: -0.3 },
  challengeSubtitle: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 3 },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginVertical: 16 },
  totalNumbers: { flexDirection: 'row', alignItems: 'baseline' },
  totalValue: { color: COLORS.text, fontSize: 35, fontWeight: '900', letterSpacing: -1 },
  totalTarget: { color: COLORS.muted, fontSize: 14, fontWeight: '700' },
  daysBlock: { alignItems: 'flex-end' },
  daysValue: { color: COLORS.green, fontSize: 24, lineHeight: 25, fontWeight: '900' },
  daysLabel: { color: COLORS.muted, fontSize: 8, fontWeight: '700' },
  progressTrack: { width: '100%', borderRadius: 999, overflow: 'hidden', backgroundColor: COLORS.surfaceLight },
  progressFill: { height: '100%', borderRadius: 999 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  progressHint: { color: COLORS.muted, fontSize: 9, fontWeight: '600' },
  progressPercent: { color: COLORS.green, fontSize: 10, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 },
  sectionEyebrow: { color: COLORS.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
  sectionTitle: { color: COLORS.text, fontSize: 19, fontWeight: '800', marginTop: 2 },
  updated: { color: COLORS.muted, fontSize: 8, fontWeight: '600' },
  rankingCard: {
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  participantRow: { paddingVertical: 13 },
  participantDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  participantTopRow: { flexDirection: 'row', alignItems: 'center' },
  rank: { width: 28, color: COLORS.muted, fontSize: 10, fontWeight: '900' },
  rankFirst: { color: COLORS.cyan },
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
  participantName: { color: COLORS.text, fontSize: 12, fontWeight: '800' },
  participantDistance: { color: COLORS.muted, fontSize: 9, fontWeight: '600', marginTop: 2 },
  distanceStrong: { color: COLORS.text, fontWeight: '800' },
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    marginBottom: 7,
    backgroundColor: 'rgba(91,141,239,0.15)',
  },
  typeIconComplete: { backgroundColor: 'rgba(57,217,138,0.15)' },
  typeIconText: { color: COLORS.blue, fontSize: 17, fontWeight: '900' },
  typeIconTextComplete: { color: COLORS.green },
  typeLabel: { color: COLORS.text, fontSize: 10, fontWeight: '800' },
  typeDetail: { color: COLORS.muted, fontSize: 8, lineHeight: 11, textAlign: 'center', marginTop: 3 },
  achievement: {
    marginTop: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(57,217,138,0.13)',
  },
  achievementText: { color: COLORS.green, fontSize: 6, fontWeight: '900', letterSpacing: 0.5 },
});
