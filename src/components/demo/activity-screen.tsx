import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
  yellow: '#F6C85F',
} as const;

type WeekDay = {
  day: string;
  steps: number;
  today?: boolean;
};

const WEEK: WeekDay[] = [
  { day: 'L', steps: 6200 },
  { day: 'M', steps: 8450 },
  { day: 'M', steps: 7100 },
  { day: 'J', steps: 10800 },
  { day: 'V', steps: 9300 },
  { day: 'S', steps: 12100 },
  { day: 'D', steps: 8436, today: true },
] as const;

type RankingPerson = {
  name: string;
  initials: string;
  steps: string;
  color: string;
  isMe?: boolean;
};

const RANKING: RankingPerson[] = [
  { name: 'Rica', initials: 'R', steps: '12 480', color: '#F6C85F' },
  { name: 'Moi', initials: 'M', steps: '8 436', color: '#35D7E8', isMe: true },
  { name: 'Mario', initials: 'MA', steps: '7 920', color: '#8B7CF6' },
  { name: 'Taratra', initials: 'T', steps: '6 730', color: '#39D98A' },
] as const;

const MAX_STEPS = 12_100;

export function ActivityScreen() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.eyebrow}>AUJOURD’HUI</Text>
          <Text style={styles.title}>Mon activité</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>01</Text>
          <Text style={styles.dateMonth}>AOÛT</Text>
        </View>
      </View>

      <View style={styles.goalCard}>
        <View style={styles.goalTopRow}>
          <View>
            <Text style={styles.cardLabel}>OBJECTIF QUOTIDIEN</Text>
            <View style={styles.stepsRow}>
              <Text style={styles.stepsValue}>8 436</Text>
              <Text style={styles.stepsUnit}>pas</Text>
            </View>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>84 %</Text>
          </View>
        </View>

        <View
          accessible
          accessibilityLabel="Objectif quotidien atteint à 84 pour cent"
          style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.goalBottomRow}>
          <Text style={styles.goalHint}>Encore 1 564 pas, vous y êtes presque !</Text>
          <Text style={styles.goalTarget}>10 000</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard icon="↗" value="6,2" unit="km" label="À pied" color={COLORS.green} />
        <MetricCard icon="▰" value="18,4" unit="km" label="Motorisés" color={COLORS.blue} />
        <MetricCard icon="◷" value="1 h 12" unit="min" label="Temps de marche" color={COLORS.yellow} />
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.cardLabel}>CETTE SEMAINE</Text>
            <Text style={styles.sectionTitle}>Pas quotidiens</Text>
          </View>
          <View style={styles.weekTotalBlock}>
            <Text style={styles.weekTotal}>62 386</Text>
            <Text style={styles.weekTotalLabel}>pas au total</Text>
          </View>
        </View>

        <View style={styles.chart}>
          <View pointerEvents="none" style={[styles.chartLine, { bottom: 48 }]} />
          <View pointerEvents="none" style={[styles.chartLine, { bottom: 94 }]} />
          <View pointerEvents="none" style={[styles.chartLine, { bottom: 140 }]} />
          {WEEK.map((item) => {
            const height = Math.max(28, Math.round((item.steps / MAX_STEPS) * 130));
            return (
              <View key={`${item.day}-${item.steps}`} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    accessible
                    accessibilityLabel={`${item.steps.toLocaleString('fr-FR')} pas`}
                    style={[
                      styles.bar,
                      { height },
                      item.today ? styles.barToday : styles.barDefault,
                    ]}
                  />
                </View>
                <View style={[styles.dayBadge, item.today && styles.dayBadgeToday]}>
                  <Text style={[styles.dayLabel, item.today && styles.dayLabelToday]}>{item.day}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Objectif : 10 000 pas</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.cardLabel}>ENTRE NOUS</Text>
            <Text style={styles.sectionTitle}>Classement du jour</Text>
          </View>
          <Text style={styles.trophy}>★</Text>
        </View>

        <View style={styles.rankingList}>
          {RANKING.map((person, index) => (
            <View key={person.name} style={[styles.rankRow, person.isMe && styles.myRankRow]}>
              <Text style={[styles.rankNumber, index === 0 && styles.firstRank]}>#{index + 1}</Text>
              <View style={[styles.avatar, { backgroundColor: `${person.color}26` }]}>
                <Text style={[styles.avatarText, { color: person.color }]}>{person.initials}</Text>
              </View>
              <View style={styles.rankNameBlock}>
                <Text style={styles.rankName}>{person.name}</Text>
                {person.isMe && <Text style={styles.youLabel}>VOUS</Text>}
              </View>
              <View style={styles.rankStepsBlock}>
                <Text style={styles.rankSteps}>{person.steps}</Text>
                <Text style={styles.rankStepsLabel}>pas</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

type MetricCardProps = {
  icon: string;
  value: string;
  unit: string;
  label: string;
  color: string;
};

function MetricCard({ icon, value, unit, label, color }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}1F` }]}>
        <Text style={[styles.metricIconText, { color }]}>{icon}</Text>
      </View>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  eyebrow: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateDay: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '800',
  },
  dateMonth: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  goalCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(53,215,232,0.20)',
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
    marginTop: 3,
  },
  stepsValue: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  stepsUnit: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  percentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(57,217,138,0.13)',
  },
  percentText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    marginTop: 14,
    backgroundColor: COLORS.surfaceLight,
  },
  progressFill: {
    width: '84%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.green,
  },
  goalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  goalHint: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '500',
  },
  goalTarget: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  metricIconText: {
    fontSize: 15,
    fontWeight: '900',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  metricUnit: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },
  card: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 3,
  },
  weekTotalBlock: {
    alignItems: 'flex-end',
  },
  weekTotal: {
    color: COLORS.cyan,
    fontSize: 14,
    fontWeight: '800',
  },
  weekTotalLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '600',
  },
  chart: {
    height: 178,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  barTrack: {
    flex: 1,
    width: 18,
    justifyContent: 'flex-end',
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.035)',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 7,
  },
  barDefault: {
    backgroundColor: COLORS.blue,
    opacity: 0.65,
  },
  barToday: {
    backgroundColor: COLORS.cyan,
  },
  dayBadge: {
    width: 25,
    height: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeToday: {
    backgroundColor: COLORS.cyan,
  },
  dayLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  dayLabelToday: {
    color: COLORS.background,
    fontWeight: '900',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  legendText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  trophy: {
    color: COLORS.yellow,
    fontSize: 20,
  },
  rankingList: {
    marginTop: 12,
    gap: 7,
  },
  rankRow: {
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 17,
  },
  myRankRow: {
    backgroundColor: 'rgba(53,215,232,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(53,215,232,0.16)',
  },
  rankNumber: {
    width: 29,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  firstRank: {
    color: COLORS.yellow,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '900',
  },
  rankNameBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  rankName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  youLabel: {
    color: COLORS.cyan,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: 'rgba(53,215,232,0.12)',
  },
  rankStepsBlock: {
    alignItems: 'flex-end',
  },
  rankSteps: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  rankStepsLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '600',
  },
});
