import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { darkColors, radius, spacing, typography } from '@/theme';

import { getActiveMemberCount, SPACES, Space } from './spaces-data';

type SpacesScreenProps = {
  onCreateSpace: () => void;
  onSelectSpace: (space: Space) => void;
};

export function SpacesScreen({ onCreateSpace, onSelectSpace }: SpacesScreenProps) {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>VOS PROCHES, BIEN ORGANISÉS</Text>
          <Text accessibilityRole="header" style={styles.title}>Espaces</Text>
          <Text style={styles.subtitle}>Choisissez qui peut voir quoi, groupe par groupe.</Text>
        </View>
        <Pressable
          accessibilityLabel="Créer un espace"
          accessibilityRole="button"
          onPress={onCreateSpace}
          style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
          <Text style={styles.createPlus}>＋</Text>
          <Text style={styles.createText}>Créer</Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <SummaryItem value="3" label="espaces" />
        <View style={styles.summaryDivider} />
        <SummaryItem value="14" label="membres" />
        <View style={styles.summaryDivider} />
        <SummaryItem value="6" label="actifs" live />
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
  const activeCount = getActiveMemberCount(space);

  return (
    <Pressable
      accessibilityHint="Ouvre le détail de cet espace"
      accessibilityLabel={`${space.name}, ${space.members.length} membres, ${activeCount} actifs`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderColor: `${space.color}52` }, pressed && styles.cardPressed]}>
      <View style={[styles.accent, { backgroundColor: space.color }]} />
      <View style={styles.cardHeader}>
        <View style={[styles.spaceIcon, { backgroundColor: `${space.color}24` }]}>
          <Text style={[styles.spaceIconText, { color: space.color }]}>{space.icon}</Text>
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{space.name}</Text>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{activeCount} actifs maintenant</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{space.members.length}</Text>
          <Text style={styles.statLabel}>membres</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.locationBlock}>
          <Text style={styles.detailLabel}>LIEU PRINCIPAL</Text>
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
          <Text style={[styles.sharingText, { color: space.color }]}>◉  {space.sharingLevel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: darkColors.background },
  content: { paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[10], gap: spacing[4] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  headerCopy: { flex: 1 },
  eyebrow: { ...typography.caption, color: darkColors.accent, fontWeight: '700', letterSpacing: 1.1 },
  title: { ...typography.titleLarge, color: darkColors.textPrimary, marginTop: spacing[1] },
  subtitle: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  createButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[3], borderRadius: radius.medium, backgroundColor: darkColors.primary },
  createPlus: { color: darkColors.textPrimary, fontSize: 20, fontWeight: '600' },
  createText: { ...typography.labelMedium, color: darkColors.textPrimary },
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
