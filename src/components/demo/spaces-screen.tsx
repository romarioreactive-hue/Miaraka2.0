import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { alpha, darkColors, radius, spacing, typography } from '@/theme';
import { useLanguage } from '@/contexts/language-context';

import { getActiveMemberCount, SPACES, Space } from './spaces-data';

type SpacesScreenProps = {
  onCreateSpace: () => void;
  onInviteMember: () => void;
  onSelectSpace: (space: Space) => void;
};

export function SpacesScreen({ onCreateSpace, onInviteMember, onSelectSpace }: SpacesScreenProps) {
  const { t } = useLanguage();
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View style={styles.topBarIdentity}>
          <Avatar backgroundColor="#253B63" initials="M" name={t('common.me')} ringColor={alpha.white24} size={32} />
          <Text accessibilityRole="header" style={styles.topBarTitle}>{t('spaces.title')}</Text>
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

      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>{t('spaces.eyebrow')}</Text>
        <Text style={styles.subtitle}>{t('spaces.subtitle')}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityLabel={t('spaces.create')}
          accessibilityRole="button"
          onPress={onCreateSpace}
          style={({ pressed }) => [styles.actionButtonPrimary, pressed && styles.pressed]}>
          <Text style={styles.actionButtonPlus}>＋</Text>
          <Text style={styles.actionButtonPrimaryText}>{t('spaces.create')}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t('spaces.inviteMember')}
          accessibilityRole="button"
          onPress={onInviteMember}
          style={({ pressed }) => [styles.actionButtonSecondary, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }}
            size={18}
            tintColor={darkColors.accent}
            weight="medium"
          />
          <Text style={styles.actionButtonSecondaryText}>{t('spaces.inviteMember')}</Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <SummaryItem value="3" label={t('nav.spaces').toLocaleLowerCase()} />
        <View style={styles.summaryDivider} />
        <SummaryItem value="14" label={t('common.members')} />
        <View style={styles.summaryDivider} />
        <SummaryItem value="6" label={t('common.active')} live />
      </View>

      <View style={styles.cards}>
        {SPACES.map((space) => (
          <SpaceCard key={space.id} space={space} onPress={() => onSelectSpace(space)} />
        ))}
      </View>
    </ScrollView>
  );
}

function SummaryItem({ value, label, live = false }: { value: string; label: string; live?: boolean }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, live && styles.summaryValueLive]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function SpaceCard({ space, onPress }: { space: Space; onPress: () => void }) {
  const { t } = useLanguage();
  const activeCount = getActiveMemberCount(space);
  const name = t(space.type === 'famille' ? 'groups.family' : space.type === 'amis' ? 'groups.friends' : 'groups.team');
  const sharing = t(space.sharingLevel === 'Position précise' ? 'spaces.precise' : space.sharingLevel === 'Zone approximative' ? 'spaces.approximate' : 'spaces.activityOnly');

  return (
    <Pressable
      accessibilityHint="Ouvre le détail de cet espace"
      accessibilityLabel={`${name}, ${space.members.length} ${t('common.members')}, ${activeCount} ${t('common.active')}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderColor: `${space.color}52` }, pressed && styles.cardPressed]}>
      <View style={[styles.accent, { backgroundColor: space.color }]} />
      <View style={styles.cardHeader}>
        <View style={[styles.spaceIcon, { backgroundColor: `${space.color}24` }]}>
          <Text style={[styles.spaceIconText, { color: space.color }]}>{space.icon}</Text>
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{name}</Text>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t('spaces.activeNow', { count: activeCount })}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{space.members.length}</Text>
          <Text style={styles.statLabel}>{t('common.members')}</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.locationBlock}>
          <Text style={styles.detailLabel}>{t('spaces.mainPlace')}</Text>
          <Text numberOfLines={1} style={styles.detailValue}>⌖  {space.mainPlace}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.avatarStack}>
          {space.members.slice(0, 4).map((member, index) => (
            <View
              key={member.id}
              style={[styles.avatar, { marginLeft: index === 0 ? 0 : -9, borderColor: darkColors.surface, backgroundColor: `${space.color}35` }]}>
              <Text style={[styles.avatarText, { color: space.color }]}>{member.initials}</Text>
            </View>
          ))}
          {space.members.length > 4 && (
            <View style={[styles.avatar, styles.moreAvatar]}>
              <Text style={styles.moreAvatarText}>+{space.members.length - 4}</Text>
            </View>
          )}
        </View>
        <View style={[styles.sharingBadge, { backgroundColor: `${space.color}18` }]}>
          <Text style={[styles.sharingText, { color: space.color }]}>◉  {sharing}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: darkColors.background },
  content: { paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[10], gap: spacing[4] },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  topBarIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  topBarTitle: { ...typography.titleLarge, color: darkColors.textPrimary },
  notificationButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surfaceElevated },
  headerCopy: { marginTop: -spacing[2] },
  eyebrow: { ...typography.caption, color: darkColors.accent, fontWeight: '700', letterSpacing: 1.1 },
  subtitle: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: spacing[3] },
  actionButtonPrimary: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: spacing[3], borderRadius: radius.pill, backgroundColor: darkColors.primary },
  actionButtonPlus: { color: darkColors.textInverse, fontSize: 18, fontWeight: '700' },
  actionButtonPrimaryText: { ...typography.labelMedium, color: darkColors.textInverse },
  actionButtonSecondary: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: spacing[3], borderRadius: radius.pill, borderWidth: 1, borderColor: darkColors.accent, backgroundColor: darkColors.surface },
  actionButtonSecondaryText: { ...typography.labelMedium, color: darkColors.accent },
  pressed: { opacity: 0.78 },
  summary: { minHeight: 66, flexDirection: 'row', alignItems: 'center', borderRadius: radius.large, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { ...typography.titleMedium, color: darkColors.textPrimary },
  summaryValueLive: { color: darkColors.live },
  summaryLabel: { ...typography.caption, color: darkColors.textMuted },
  summaryDivider: { width: 1, height: 28, backgroundColor: darkColors.border },
  cards: { gap: spacing[3] },
  card: { minHeight: 216, padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, backgroundColor: darkColors.surface, overflow: 'hidden' },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  accent: { position: 'absolute', left: 0, top: 28, bottom: 28, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  spaceIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.large },
  spaceIconText: { fontSize: 23, fontWeight: '800' },
  cardTitleBlock: { flex: 1, marginLeft: spacing[3] },
  cardTitle: { ...typography.titleMedium, color: darkColors.textPrimary },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: darkColors.live },
  liveText: { ...typography.caption, color: darkColors.live },
  chevron: { color: darkColors.textMuted, fontSize: 30, fontWeight: '300' },
  statsRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', marginTop: spacing[4], paddingVertical: spacing[2], borderTopWidth: 1, borderBottomWidth: 1, borderColor: darkColors.border },
  statBlock: { width: 68 },
  statValue: { ...typography.titleMedium, color: darkColors.textPrimary },
  statLabel: { ...typography.caption, color: darkColors.textMuted },
  cardDivider: { width: 1, height: 32, backgroundColor: darkColors.border, marginRight: spacing[3] },
  locationBlock: { flex: 1 },
  detailLabel: { fontSize: 9, lineHeight: 13, fontWeight: '700', letterSpacing: 0.7, color: darkColors.textMuted },
  detailValue: { ...typography.labelMedium, color: darkColors.textSecondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2], marginTop: spacing[4] },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 2 },
  avatarText: { fontSize: 9, fontWeight: '800' },
  moreAvatar: { marginLeft: -9, borderColor: darkColors.surface, backgroundColor: darkColors.surfaceElevated },
  moreAvatarText: { fontSize: 9, fontWeight: '700', color: darkColors.textSecondary },
  sharingBadge: { flexShrink: 1, minHeight: 30, justifyContent: 'center', paddingHorizontal: spacing[2], borderRadius: radius.pill },
  sharingText: { fontSize: 10, lineHeight: 14, fontWeight: '700' },
});
