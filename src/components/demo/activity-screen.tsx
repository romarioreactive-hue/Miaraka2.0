import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/language-context';
import { radius, spacing, typography } from '@/theme';

type Period = 'today' | 'week' | 'month';

const COLORS = {
  background: '#071424',
  glass: 'rgba(12, 33, 71, 0.70)',
  glassBorder: 'rgba(255, 255, 255, 0.05)',
  surface: '#1E2115',
  surfaceLow: '#1A1D11',
  surfaceHigh: '#292B1F',
  surfaceHighest: '#333629',
  outline: '#8F937B',
  outlineVariant: '#444935',
  text: '#D7E3FA',
  textSecondary: '#C5C9AF',
  white: '#FFFFFF',
  green: '#3EE09D',
  blue: '#4F8CFF',
  paleBlue: '#AFC6FF',
  lime: '#C9F23B',
  onPrimary: '#576C00',
  error: '#FF6577',
  warning: '#F6BE4F',
} as const;

const PEOPLE = [
  { id: 'me', name: 'Moi', initials: 'M', color: '#4F8CFF', steps: 8450 },
  { id: 'rica', name: 'Rica', initials: 'R', color: '#F6C85F', steps: 9210 },
  { id: 'mario', name: 'Mario', initials: 'MA', color: '#29D391', steps: 7640 },
  { id: 'sophie', name: 'Sophie', initials: 'S', color: '#F2679D', steps: 6880 },
] as const;

const WEEK = [
  { day: 'L', ratio: 0.60 },
  { day: 'M', ratio: 0.85 },
  { day: 'M', ratio: 0.45 },
  { day: 'J', ratio: 0.95, highlight: true },
  { day: 'V', ratio: 0.70 },
  { day: 'S', ratio: 0.55 },
  { day: 'D', ratio: 0.30 },
] as const;

export function ActivityScreen() {
  const { language, t } = useLanguage();
  const [period, setPeriod] = useState<Period>('today');
  const [selectedPerson, setSelectedPerson] = useState('me');
  const [hasNotification, setHasNotification] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const copy = getCopy(language);
  const person = PEOPLE.find((item) => item.id === selectedPerson) ?? PEOPLE[0];

  const displaySteps = useMemo(() => {
    const periodMultiplier = period === 'today' ? 1 : period === 'week' ? 6.8 : 27.4;
    return Math.round(person.steps * periodMultiplier);
  }, [period, person.steps]);
  const progress = Math.min(displaySteps / (period === 'today' ? 10000 : period === 'week' ? 70000 : 300000), 1);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerIdentity}>
          <Avatar backgroundColor="#253B63" initials="M" name={t('common.me')} ringColor="rgba(255, 255, 255, 0.20)" size={48} />
          <Text accessibilityRole="header" style={styles.headerTitle}>{t('nav.activity')}</Text>
        </View>
        <Pressable
          accessibilityLabel={copy.notifications}
          accessibilityRole="button"
          onPress={() => setHasNotification(false)}
          style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
          <SymbolView name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }} size={22} tintColor={COLORS.paleBlue} weight="medium" />
          {hasNotification ? <View style={styles.notificationDot} /> : null}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PeriodSelector copy={copy} onChange={setPeriod} value={period} />
        <PeopleSelector
          copy={copy}
          language={language}
          onInvite={() => setFeedback(copy.inviteFeedback)}
          onSelect={setSelectedPerson}
          selectedId={selectedPerson}
        />

        <Animated.View key={`${period}-${selectedPerson}`} entering={FadeIn.duration(250)} style={styles.dashboardContent}>
          <GoalCard
            copy={copy}
            displaySteps={displaySteps}
            period={period}
            progress={progress}
            stepsLabel={t('common.steps')}
          />

          <WeeklyChart copy={copy} period={period} />

          <View style={styles.tripsSection}>
            <Text style={styles.sectionEyebrow}>{copy.tripDetails}</Text>
            <TripRow
              accent={COLORS.paleBlue}
              description={copy.morningWalkDescription}
              icon="walk"
              onPress={() => setFeedback(copy.tripFeedback)}
              reward="+140 pts"
              time="08:15"
              title={copy.morningWalk}
            />
            <TripRow
              accent={COLORS.green}
              description={copy.workTripDescription}
              icon="commute"
              onPress={() => setFeedback(copy.tripFeedback)}
              reward="verified"
              time="09:00"
              title={copy.workTrip}
            />
          </View>
        </Animated.View>

        {feedback ? <Animated.Text entering={FadeInDown.duration(250)} style={styles.feedback}>{feedback}</Animated.Text> : null}
      </ScrollView>
    </View>
  );
}

function PeriodSelector({ copy, onChange, value }: { copy: ReturnType<typeof getCopy>; onChange: (period: Period) => void; value: Period }) {
  const options: { id: Period; label: string }[] = [
    { id: 'today', label: copy.today },
    { id: 'week', label: copy.week },
    { id: 'month', label: copy.month },
  ];
  return (
    <View style={styles.periodSelector}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={option.id}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [styles.periodButton, active && styles.periodButtonActive, pressed && styles.pressed]}>
            <Text style={[styles.periodLabel, active && styles.periodLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PeopleSelector({ copy, language, onInvite, onSelect, selectedId }: { copy: ReturnType<typeof getCopy>; language: 'fr' | 'mg'; onInvite: () => void; onSelect: (id: string) => void; selectedId: string }) {
  return (
    <View style={styles.peopleSection}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionEyebrow}>{copy.protectionCircle}</Text>
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={17} tintColor={COLORS.outline} weight="medium" />
      </View>
      <ScrollView contentContainerStyle={styles.peopleContent} horizontal showsHorizontalScrollIndicator={false}>
        {PEOPLE.map((person) => {
          const selected = selectedId === person.id;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={person.id}
              onPress={() => onSelect(person.id)}
              style={({ pressed }) => [styles.personButton, !selected && styles.personMuted, pressed && styles.pressed]}>
              <View style={styles.personAvatarWrap}>
                <Avatar backgroundColor={person.color} initials={person.initials} name={person.name} ringColor={selected ? COLORS.paleBlue : COLORS.surfaceHighest} size={64} />
                {selected ? <View style={styles.activePersonDot}><View style={styles.activePersonDotCore} /></View> : null}
              </View>
              <Text style={[styles.personName, selected && styles.personNameActive]}>{person.id === 'me' ? (language === 'fr' ? 'Moi' : 'Izaho') : person.name}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" onPress={onInvite} style={({ pressed }) => [styles.personButton, pressed && styles.pressed]}>
          <View style={styles.inviteCircle}>
            <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={24} tintColor={COLORS.outline} weight="medium" />
          </View>
          <Text style={styles.personName}>{copy.invite}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function GoalCard({ copy, displaySteps, period, progress, stepsLabel }: { copy: ReturnType<typeof getCopy>; displaySteps: number; period: Period; progress: number; stepsLabel: string }) {
  const locale = copy.locale;
  const target = period === 'today' ? 10000 : period === 'week' ? 70000 : 300000;
  const percent = Math.round(progress * 100);
  return (
    <View style={styles.goalCard}>
      <View style={styles.goalGlow} />
      <View style={styles.goalHeader}>
        <View style={styles.goalNumbers}>
          <Text style={styles.goalLabel}>{period === 'today' ? copy.stepsToday : copy.stepsForPeriod}</Text>
          <View style={styles.goalValueRow}>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.goalValue}>{displaySteps.toLocaleString(locale)}</Text>
            <Text style={styles.goalTarget}>/ {target.toLocaleString(locale)}</Text>
          </View>
        </View>
        <View style={styles.progressRing}>
          <View style={[styles.progressRingFill, { borderTopColor: percent > 25 ? COLORS.green : 'transparent', borderRightColor: percent > 50 ? COLORS.green : COLORS.surfaceHighest, borderBottomColor: percent > 75 ? COLORS.green : COLORS.surfaceHighest }]} />
          <Text style={styles.progressPercent}>{percent}%</Text>
        </View>
      </View>
      <Text style={styles.goalReached}>{copy.goalReached}</Text>
      <View style={styles.metricsGrid}>
        <MetricCard accent={COLORS.paleBlue} icon="walk" label={copy.walked} unit="km" value="6,2" />
        <MetricCard accent={COLORS.green} icon="car" label={copy.motorized} unit="km" value="14,8" />
        <MetricCard accent={COLORS.error} icon="fire" label={copy.calories} unit="kcal" value="432" />
        <MetricCard accent={COLORS.green} icon="trophy" label={copy.ranking} unit="/ 12" value="#2" />
      </View>
      <Text style={styles.accessibilityOnly}>{displaySteps.toLocaleString(locale)} {stepsLabel}</Text>
    </View>
  );
}

function MetricCard({ accent, icon, label, unit, value }: { accent: string; icon: 'walk' | 'car' | 'fire' | 'trophy'; label: string; unit: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeading}>
        <SymbolView
          name={{
            ios: icon === 'walk' ? 'figure.walk' : icon === 'car' ? 'car.fill' : icon === 'fire' ? 'flame.fill' : 'trophy.fill',
            android: icon === 'walk' ? 'directions_walk' : icon === 'car' ? 'directions_car' : icon === 'fire' ? 'local_fire_department' : 'emoji_events',
            web: icon === 'walk' ? 'directions_walk' : icon === 'car' ? 'directions_car' : icon === 'fire' ? 'local_fire_department' : 'emoji_events',
          }}
          size={17}
          tintColor={accent}
          weight="medium"
        />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, icon === 'trophy' && { color: accent }]}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function WeeklyChart({ copy, period }: { copy: ReturnType<typeof getCopy>; period: Period }) {
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{copy.weekSummary}</Text>
        <Text style={styles.chartAverage}>{copy.average}</Text>
      </View>
      <View style={styles.chart}>
        {WEEK.map((item, index) => <ChartBar delay={index * 70} item={item} key={`${period}-${item.day}-${index}`} />)}
      </View>
    </View>
  );
}

function ChartBar({ delay, item }: { delay: number; item: (typeof WEEK)[number] }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? item.ratio : 0);
  useEffect(() => {
    progress.value = reduceMotion ? item.ratio : withDelay(delay, withTiming(item.ratio, { duration: 900 }));
  }, [delay, item.ratio, progress, reduceMotion]);
  const barStyle = useAnimatedStyle(() => ({ height: `${Math.max(8, progress.value * 100)}%` }));
  const highlighted = 'highlight' in item && item.highlight;
  return (
    <View style={styles.barColumn}>
      <View style={styles.barTrack}><Animated.View style={[styles.barFill, highlighted && styles.barHighlight, barStyle]} /></View>
      <Text style={[styles.dayLabel, highlighted && styles.dayLabelActive]}>{item.day}</Text>
    </View>
  );
}

function TripRow({ accent, description, icon, onPress, reward, time, title }: { accent: string; description: string; icon: 'walk' | 'commute'; onPress: () => void; reward: string; time: string; title: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.tripRow, pressed && styles.pressed]}>
      <View style={[styles.tripIcon, { backgroundColor: `${accent}18` }]}>
        <SymbolView name={{ ios: icon === 'walk' ? 'figure.walk' : 'car.fill', android: icon === 'walk' ? 'directions_walk' : 'commute', web: icon === 'walk' ? 'directions_walk' : 'commute' }} size={21} tintColor={accent} weight="medium" />
      </View>
      <View style={styles.tripCopy}>
        <View style={styles.tripTitleRow}><Text style={styles.tripTitle}>{title}</Text><Text style={styles.tripTime}>{time}</Text></View>
        <Text style={styles.tripDescription}>{description}</Text>
      </View>
      {reward === 'verified' ? (
        <SymbolView name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} size={19} tintColor={COLORS.green} weight="bold" />
      ) : <Text style={styles.tripReward}>{reward}</Text>}
    </Pressable>
  );
}

function getCopy(language: 'fr' | 'mg') {
  return language === 'mg'
    ? {
        locale: 'mg-MG', notifications: 'Fampandrenesana', today: 'Anio', week: 'Herinandro', month: 'Volana', protectionCircle: 'VONDRONA FIAROVANA', invite: 'Hanasa', inviteFeedback: 'Fanasana santatra ihany.', stepsToday: 'Dingana androany', stepsForPeriod: 'Dingana amin’ity vanim-potoana ity', goalReached: 'Tratra ny tanjona', walked: 'An-tongotra', motorized: 'Amin’ny fiara', calories: 'Kaloria', ranking: 'Laharana', weekSummary: 'Famintinana ny herinandro', average: 'Salan’isa: dingana 7,2k', tripDetails: 'ANTSIPIRIAN’NY DIA', morningWalk: 'Dia an-tongotra maraina', morningWalkDescription: 'Parc de Bercy • 2,4 km', workTrip: 'Dia ho any am-piasana', workTripDescription: 'Fiara • 12,5 km', tripFeedback: 'Antsipirian’ny dia santatra.',
      }
    : {
        locale: 'fr-FR', notifications: 'Notifications', today: "Aujourd'hui", week: 'Semaine', month: 'Mois', protectionCircle: 'CERCLE DE PROTECTION', invite: 'Inviter', inviteFeedback: 'Invitation fictive uniquement.', stepsToday: "Pas aujourd'hui", stepsForPeriod: 'Pas sur la période', goalReached: 'Objectif atteint', walked: 'À pied', motorized: 'Motorisé', calories: 'Calories', ranking: 'Classement', weekSummary: 'Résumé de la semaine', average: 'Moyenne : 7,2k pas', tripDetails: 'DÉTAIL DES TRAJETS', morningWalk: 'Marche matinale', morningWalkDescription: 'Parc de Bercy • 2,4 km', workTrip: 'Trajet travail', workTripDescription: 'Voiture • 12,5 km', tripFeedback: 'Détail du trajet fictif.',
      };
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background, flex: 1 },
  header: { alignItems: 'center', backgroundColor: 'rgba(30, 33, 21, 0.82)', borderBottomColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 64, paddingHorizontal: spacing[5], paddingVertical: spacing[2] },
  headerIdentity: { alignItems: 'center', flexDirection: 'row', gap: spacing[3] },
  headerTitle: { ...typography.titleLarge, color: COLORS.green, fontSize: 24, fontWeight: '800' },
  notificationButton: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: radius.circle, height: 48, justifyContent: 'center', width: 48 },
  notificationDot: { backgroundColor: COLORS.green, borderColor: COLORS.surface, borderRadius: radius.circle, borderWidth: 2, height: 9, position: 'absolute', right: 8, top: 8, width: 9 },
  content: { gap: spacing[8], paddingBottom: spacing[10], paddingHorizontal: spacing[5], paddingTop: spacing[5] },
  periodSelector: { alignSelf: 'center', backgroundColor: COLORS.surfaceLow, borderRadius: radius.pill, flexDirection: 'row', padding: spacing[1], width: '100%' },
  periodButton: { alignItems: 'center', borderRadius: radius.pill, flex: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: spacing[3] },
  periodButtonActive: { backgroundColor: COLORS.lime, shadowColor: COLORS.blue, shadowOpacity: 0.18, shadowRadius: 8 },
  periodLabel: { ...typography.labelMedium, color: COLORS.textSecondary },
  periodLabelActive: { color: COLORS.onPrimary, fontWeight: '800' },
  peopleSection: { gap: spacing[4] },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionEyebrow: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, lineHeight: 16 },
  peopleContent: { gap: spacing[4], paddingBottom: spacing[2] },
  personButton: { alignItems: 'center', gap: spacing[2], minWidth: 72 },
  personMuted: { opacity: 0.58 },
  personAvatarWrap: { position: 'relative' },
  activePersonDot: { alignItems: 'center', backgroundColor: COLORS.green, borderColor: COLORS.background, borderRadius: radius.circle, borderWidth: 2, bottom: -2, height: 17, justifyContent: 'center', position: 'absolute', right: -2, width: 17 },
  activePersonDotCore: { backgroundColor: COLORS.white, borderRadius: radius.circle, height: 5, width: 5 },
  personName: { ...typography.caption, color: COLORS.outline, fontWeight: '600' },
  personNameActive: { color: COLORS.paleBlue, fontWeight: '800' },
  inviteCircle: { alignItems: 'center', borderColor: COLORS.outlineVariant, borderRadius: radius.circle, borderStyle: 'dashed', borderWidth: 2, height: 64, justifyContent: 'center', width: 64 },
  dashboardContent: { gap: spacing[8] },
  goalCard: { backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderRadius: 32, borderWidth: 1, overflow: 'hidden', padding: spacing[6], position: 'relative' },
  goalGlow: { backgroundColor: 'rgba(175, 198, 255, 0.08)', borderRadius: radius.circle, height: 150, position: 'absolute', right: -60, top: -70, width: 150 },
  goalHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  goalNumbers: { flex: 1 },
  goalLabel: { ...typography.labelMedium, color: COLORS.textSecondary },
  goalValueRow: { alignItems: 'baseline', flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[1] },
  goalValue: { color: COLORS.text, fontSize: 40, fontWeight: '700', letterSpacing: -0.8, lineHeight: 48 },
  goalTarget: { ...typography.labelMedium, color: COLORS.outline },
  progressRing: { alignItems: 'center', height: 56, justifyContent: 'center', position: 'relative', width: 56 },
  progressRingFill: { ...StyleSheet.absoluteFill, borderColor: COLORS.surfaceHighest, borderLeftColor: COLORS.green, borderRadius: radius.circle, borderWidth: 5, transform: [{ rotate: '25deg' }] },
  progressPercent: { color: COLORS.green, fontSize: 10, fontWeight: '800' },
  goalReached: { ...typography.caption, alignSelf: 'flex-end', color: COLORS.green, marginTop: -spacing[2] },
  accessibilityOnly: { height: 1, opacity: 0, position: 'absolute', width: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4], marginTop: spacing[6] },
  metricCard: { backgroundColor: COLORS.surfaceLow, borderColor: COLORS.glassBorder, borderRadius: radius.large, borderWidth: 1, flexBasis: '46%', flexGrow: 1, gap: spacing[2], minWidth: 140, padding: spacing[4] },
  metricHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing[2] },
  metricLabel: { ...typography.caption, color: COLORS.outline, flexShrink: 1 },
  metricValueRow: { alignItems: 'baseline', flexDirection: 'row', gap: spacing[1] },
  metricValue: { color: COLORS.text, fontSize: 27, fontWeight: '700', lineHeight: 34 },
  metricUnit: { ...typography.caption, color: COLORS.outline },
  chartCard: { backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderRadius: 32, borderWidth: 1, padding: spacing[6] },
  chartHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[6] },
  chartTitle: { ...typography.labelMedium, color: COLORS.text },
  chartAverage: { ...typography.caption, color: COLORS.outline },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: spacing[2], height: 160, justifyContent: 'space-between' },
  barColumn: { alignItems: 'center', flex: 1, gap: spacing[3], height: '100%', justifyContent: 'flex-end' },
  barTrack: { backgroundColor: COLORS.surfaceHighest, borderRadius: radius.pill, flex: 1, justifyContent: 'flex-end', maxWidth: 34, overflow: 'hidden', width: '100%' },
  barFill: { backgroundColor: 'rgba(175, 198, 255, 0.42)', borderRadius: radius.pill, width: '100%' },
  barHighlight: { backgroundColor: COLORS.green, shadowColor: COLORS.green, shadowOpacity: 0.5, shadowRadius: 12 },
  dayLabel: { ...typography.caption, color: COLORS.outline, fontWeight: '600' },
  dayLabelActive: { color: COLORS.green, fontWeight: '800' },
  tripsSection: { gap: spacing[3] },
  tripRow: { alignItems: 'center', backgroundColor: COLORS.surfaceLow, borderColor: COLORS.glassBorder, borderRadius: radius.large, borderWidth: 1, flexDirection: 'row', gap: spacing[3], minHeight: 72, padding: spacing[4] },
  tripIcon: { alignItems: 'center', borderRadius: radius.circle, height: 42, justifyContent: 'center', width: 42 },
  tripCopy: { flex: 1, gap: spacing[1] },
  tripTitleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  tripTitle: { ...typography.bodyMedium, color: COLORS.text, fontWeight: '600' },
  tripTime: { ...typography.caption, color: COLORS.outline },
  tripDescription: { ...typography.caption, color: COLORS.outline },
  tripReward: { color: COLORS.text, fontSize: 11, fontWeight: '700', marginLeft: spacing[1] },
  feedback: { ...typography.caption, color: COLORS.textSecondary, marginTop: -spacing[4], textAlign: 'center' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
