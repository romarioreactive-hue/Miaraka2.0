import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { GROUP_COLORS, GROUP_LABELS, PALETTE, Person } from './people-data';

import { Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/language-context';

type PersonSheetProps = {
  person: Person;
  onClose: () => void;
};

const QUICK_ACTIONS = [
  { icon: '🧭', key: 'map.route' as const }, { icon: '📞', key: 'map.call' as const },
  { icon: '💬', key: 'map.message' as const }, { icon: '⋯', key: 'map.more' as const },
];

function batteryColor(level: number) {
  if (level >= 50) return PALETTE.greenSafety;
  if (level >= 20) return PALETTE.amberRoute;
  return PALETTE.coralAlert;
}

export function PersonSheet({ person, onClose }: PersonSheetProps) {
  const { language, t } = useLanguage();
  const battColor = batteryColor(person.battery);
  const groupColor = GROUP_COLORS[person.group];
  const movementStatus = t(person.movementStatus === 'En ville' ? 'map.inTown' : person.movementStatus === 'En route' ? 'map.onTheWay' : person.movementStatus === "À l'école" ? 'map.atSchool' : person.movementStatus === 'Au bureau' ? 'map.atOffice' : 'map.atHome');

  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(220)}
        style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={[styles.avatar, { borderColor: person.color }]}>
            <Text style={styles.avatarText}>{person.initials}</Text>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{person.isMe ? `${person.name} (${t('map.youInformal')})` : person.name}</Text>
              <View style={[styles.groupBadge, { backgroundColor: `${groupColor}26` }]}>
                <Text style={[styles.groupBadgeText, { color: groupColor }]}>
                  {t(person.group === 'famille' ? 'groups.family' : person.group === 'amis' ? 'groups.friends' : 'groups.team')}
                </Text>
              </View>
            </View>
            <Text style={styles.subtitle} numberOfLines={1}>
              {movementStatus} · {person.location}
            </Text>
          </View>

          <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: `${battColor}22`, borderColor: `${battColor}55` }]}>
            <Text style={styles.badgeIcon}>🔋</Text>
            <Text style={[styles.badgeText, { color: battColor }]}>{person.battery}%</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>⚡</Text>
            <Text style={styles.badgeText}>{person.speedKmh} km/h</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>⏱️</Text>
            <Text style={styles.badgeText}>{person.eta}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🕒</Text>
            <Text style={styles.badgeText}>{person.lastUpdate}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable key={action.key} style={styles.actionButton}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{t(action.key)}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timelineBlock}>
          <Text style={styles.sectionLabel}>{t('common.today')}</Text>
          {person.timeline.map((event, index) => (
            <View key={`${event.time}-${index}`} style={styles.timelineRow}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: event.type === 'arrivee' ? PALETTE.greenSafety : PALETTE.amberRoute },
                ]}
              />
              <Text style={styles.timelineTime}>{event.time}</Text>
              <Text style={styles.timelineText} numberOfLines={1}>
                {person.isMe ? 'Tu' : person.name} {event.label} <Text style={styles.timelinePlace}>{event.place}</Text>
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>{t('map.stepsToday')}</Text>
            <Text style={styles.statValue}>{person.steps.toLocaleString(language === 'fr' ? 'fr-FR' : 'mg-MG')}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>{t('common.thisWeek')}</Text>
            <Text style={styles.statValue}>
              {person.weeklyKm.toLocaleString('fr-FR')}&nbsp;km
            </Text>
          </View>
        </View>

        <View style={styles.meterBlock}>
          <View style={styles.meterHeader}>
            <Text style={styles.meterLabel}>🏆 {person.challenge.name}</Text>
            <Text style={styles.meterValue}>{person.challenge.progress}%</Text>
          </View>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                { width: `${person.challenge.progress}%`, backgroundColor: PALETTE.blueRegion },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PALETTE.navySurface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.08)',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(231,236,245,0.2)',
    marginBottom: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.navy,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: PALETTE.mist,
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.mist,
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  groupBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: PALETTE.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(231,236,245,0.08)',
  },
  closeIcon: {
    fontSize: 14,
    color: PALETTE.mist,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(231,236,245,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.1)',
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.mist,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(231,236,245,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.08)',
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  timelineBlock: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.mist,
    width: 40,
  },
  timelineText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: PALETTE.textSecondary,
  },
  timelinePlace: {
    color: PALETTE.mist,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statTile: {
    flex: 1,
    gap: 4,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(231,236,245,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.08)',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: PALETTE.mist,
  },
  meterBlock: {
    gap: 6,
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  meterValue: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.mist,
  },
  meterTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(231,236,245,0.1)',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 999,
  },
});
