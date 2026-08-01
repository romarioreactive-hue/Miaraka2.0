import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { darkColors, radius, spacing, typography } from '@/theme';

import { getActiveMemberCount, MemberStatus, Space, SpaceMember } from './spaces-data';

type SpaceDetailScreenProps = {
  space: Space;
  onBack: () => void;
  onInviteMember: () => void;
};

const STATUS_COLORS: Record<MemberStatus, string> = {
  'En direct': darkColors.live,
  'Dernière position': darkColors.warning,
  'Hors ligne': darkColors.offline,
};

export function SpaceDetailScreen({ space, onBack, onInviteMember }: SpaceDetailScreenProps) {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Retour aux espaces" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>Détail de l’espace</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={[styles.hero, { borderColor: `${space.color}52` }]}>
        <View style={[styles.heroIcon, { backgroundColor: `${space.color}24` }]}>
          <Text style={[styles.heroIconText, { color: space.color }]}>{space.icon}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text accessibilityRole="header" style={styles.title}>{space.name}</Text>
          <Text style={styles.heroMeta}>{space.members.length} membres · {getActiveMemberCount(space)} actifs</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: `${space.color}18` }]}>
          <Text style={[styles.typeBadgeText, { color: space.color }]}>{space.sharingLevel}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onInviteMember}
        style={({ pressed }) => [styles.inviteButton, pressed && styles.pressed]}>
        <Text style={styles.invitePlus}>＋</Text>
        <Text style={styles.inviteText}>Inviter un membre</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Membres</Text>
        <Text style={styles.sectionMeta}>{space.members.length} personnes</Text>
      </View>

      <View style={styles.memberList}>
        {space.members.map((member, index) => (
          <MemberRow
            key={member.id}
            member={member}
            color={space.color}
            withDivider={index < space.members.length - 1}
          />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cette semaine</Text>
      </View>
      <View style={styles.activityCard}>
        <View>
          <Text style={styles.cardEyebrow}>ACTIVITÉ DE L’ESPACE</Text>
          <Text style={styles.activityValue}>{space.weeklyActivity}</Text>
          <Text style={styles.activityHint}>Mise à jour avec les données fictives des membres</Text>
        </View>
        <View style={styles.activityBars}>
          {[52, 76, 61, 88, 72, 94, 68].map((height, index) => (
            <View key={index} style={styles.barTrack}>
              <View style={[styles.barFill, { height: `${height}%`, backgroundColor: space.color }]} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Défi en cours</Text>
      </View>
      <View style={styles.challengeCard}>
        <View style={styles.challengeTop}>
          <View style={styles.challengeCopy}>
            <Text style={styles.cardEyebrow}>OBJECTIF COLLECTIF</Text>
            <Text style={styles.challengeName}>{space.challenge.name}</Text>
          </View>
          <Text style={[styles.challengePercent, { color: space.color }]}>{space.challenge.progress} %</Text>
        </View>
        <View accessibilityLabel={`Progression du défi : ${space.challenge.progress} pour cent`} style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${space.challenge.progress}%`, backgroundColor: space.color }]} />
        </View>
        <Text style={styles.challengeDetail}>{space.challenge.detail}</Text>
      </View>
    </ScrollView>
  );
}

function MemberRow({ member, color, withDivider }: { member: SpaceMember; color: string; withDivider: boolean }) {
  const statusColor = STATUS_COLORS[member.status];
  return (
    <View style={[styles.memberRow, withDivider && styles.memberDivider]}>
      <View style={[styles.avatar, { backgroundColor: `${color}28` }]}>
        <Text style={[styles.avatarText, { color }]}>{member.initials}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      <View style={styles.memberCopy}>
        <View style={styles.memberTitleRow}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={[styles.statusText, { color: statusColor }]}>{member.status}</Text>
        </View>
        <Text numberOfLines={1} style={styles.position}>⌖  {member.position} · {member.updatedAt}</Text>
      </View>
      <View style={styles.memberActivity}>
        <Text style={styles.memberActivityValue}>{member.weeklyActivity}</Text>
        <Text style={styles.memberActivityLabel}>cette semaine</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: darkColors.background },
  content: { paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[10], gap: spacing[3] },
  topBar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surface },
  backIcon: { color: darkColors.textPrimary, fontSize: 34, lineHeight: 36, fontWeight: '300' },
  topTitle: { ...typography.labelMedium, color: darkColors.textSecondary },
  topSpacer: { width: 48 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, backgroundColor: darkColors.surface },
  heroIcon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.large },
  heroIconText: { fontSize: 26, fontWeight: '800' },
  heroCopy: { flex: 1 },
  title: { ...typography.titleLarge, color: darkColors.textPrimary },
  heroMeta: { ...typography.caption, color: darkColors.textMuted },
  typeBadge: { maxWidth: 102, paddingHorizontal: spacing[2], paddingVertical: 6, borderRadius: radius.pill },
  typeBadgeText: { fontSize: 9, lineHeight: 13, fontWeight: '700', textAlign: 'center' },
  inviteButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.primary },
  invitePlus: { color: darkColors.textPrimary, fontSize: 20, fontWeight: '600' },
  inviteText: { ...typography.labelLarge, color: darkColors.textPrimary },
  pressed: { opacity: 0.78 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing[2] },
  sectionTitle: { ...typography.titleMedium, color: darkColors.textPrimary },
  sectionMeta: { ...typography.caption, color: darkColors.textMuted },
  memberList: { paddingHorizontal: spacing[3], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  memberRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[3] },
  memberDivider: { borderBottomWidth: 1, borderBottomColor: darkColors.border },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle },
  avatarText: { fontSize: 11, fontWeight: '800' },
  statusDot: { position: 'absolute', right: 0, bottom: 1, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: darkColors.surface },
  memberCopy: { flex: 1, minWidth: 0 },
  memberTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { ...typography.labelLarge, color: darkColors.textPrimary },
  statusText: { flexShrink: 1, fontSize: 9, lineHeight: 13, fontWeight: '700' },
  position: { ...typography.caption, color: darkColors.textMuted, marginTop: 3 },
  memberActivity: { alignItems: 'flex-end' },
  memberActivityValue: { ...typography.labelMedium, color: darkColors.textSecondary },
  memberActivityLabel: { fontSize: 8, lineHeight: 12, color: darkColors.textMuted },
  activityCard: { minHeight: 148, padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  cardEyebrow: { fontSize: 9, lineHeight: 13, fontWeight: '700', letterSpacing: 0.8, color: darkColors.textMuted },
  activityValue: { ...typography.titleMedium, color: darkColors.textPrimary, marginTop: 3 },
  activityHint: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  activityBars: { height: 48, flexDirection: 'row', alignItems: 'flex-end', gap: 7, marginTop: spacing[4] },
  barTrack: { flex: 1, height: '100%', justifyContent: 'flex-end', borderRadius: radius.small, backgroundColor: darkColors.surfaceElevated, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: radius.small, opacity: 0.8 },
  challengeCard: { padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  challengeTop: { flexDirection: 'row', alignItems: 'center' },
  challengeCopy: { flex: 1 },
  challengeName: { ...typography.titleMedium, color: darkColors.textPrimary, marginTop: 2 },
  challengePercent: { ...typography.titleMedium },
  progressTrack: { height: 8, marginTop: spacing[4], borderRadius: radius.pill, backgroundColor: darkColors.surfaceElevated, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill },
  challengeDetail: { ...typography.caption, color: darkColors.textMuted, marginTop: spacing[2] },
});
