import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GROUP_COLORS, PALETTE, PEOPLE, PersonGroup } from './people-data';

import { Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/language-context';

type FilterId = 'tous' | PersonGroup;

const FILTERS: FilterId[] = ['tous', 'famille', 'amis', 'equipe'];

const STACK_PEOPLE = PEOPLE.slice(0, 4);

type DemoHeaderProps = {
  activeFilter: FilterId;
  onChangeFilter: (filter: FilterId) => void;
  onPressAddPerson?: () => void;
};

export function DemoHeader({ activeFilter, onChangeFilter, onPressAddPerson }: DemoHeaderProps) {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Miaraka</Text>

        <View style={styles.topBarActions}>
          <Pressable style={styles.notifButton} hitSlop={10}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </Pressable>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusTextBlock}>
          <Text style={styles.statusTitle}>{t('map.everyoneSafe')}</Text>
          <Text style={styles.statusSubtitle}>{t('map.positionTwoMinutes')}</Text>
        </View>

        <View style={styles.avatarStack}>
          {STACK_PEOPLE.map((person, index) => (
            <View
              key={person.id}
              style={[
                styles.stackAvatar,
                { backgroundColor: person.color, marginLeft: index === 0 ? 0 : -10, zIndex: index },
              ]}>
              <Text style={styles.stackAvatarText}>{person.initials.slice(0, 1)}</Text>
            </View>
          ))}
        </View>
      </View>

      {onPressAddPerson && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('map.addPerson')}
          onPress={onPressAddPerson}
          style={({ pressed }) => [styles.addPersonButton, pressed && styles.buttonPressed]}
          hitSlop={6}>
          <View style={styles.addPersonIcon}>
            <Text style={styles.addPersonIconText}>+</Text>
          </View>
          <Text style={styles.addPersonLabel}>{t('map.addPerson')}</Text>
        </Pressable>
      )}

      <View style={styles.filtersRow}>
        {FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          const dotColor = filter === 'tous' ? PALETTE.mist : GROUP_COLORS[filter];
          return (
            <Pressable
              key={filter}
              onPress={() => onChangeFilter(filter)}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              hitSlop={6}>
              <View style={[styles.filterDot, { backgroundColor: dotColor }]} />
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                {t(filter === 'tous' ? 'groups.all' : filter === 'famille' ? 'groups.family' : filter === 'amis' ? 'groups.friends' : 'groups.team')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: PALETTE.mist,
    letterSpacing: 0.3,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.navySurface,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.08)',
  },
  notifIcon: {
    fontSize: 18,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.coralAlert,
    borderWidth: 1.5,
    borderColor: PALETTE.navy,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.blueRegion,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
    backgroundColor: PALETTE.navySurface,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.08)',
  },
  statusTextBlock: {
    gap: 2,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.mist,
  },
  statusSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: PALETTE.textSecondary,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PALETTE.navySurface,
  },
  stackAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  addPersonButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: PALETTE.blueRegion,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  addPersonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,16,34,0.2)',
  },
  addPersonIconText: {
    marginTop: -2,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  addPersonLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: PALETTE.navySurface,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.08)',
  },
  filterPillActive: {
    backgroundColor: `${PALETTE.blueRegion}26`,
    borderColor: `${PALETTE.blueRegion}88`,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  filterLabelActive: {
    color: PALETTE.mist,
  },
});
