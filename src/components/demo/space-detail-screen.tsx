import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth';
import { Avatar } from '@/components/ui/avatar';
import { DangerButton, GhostButton, SecondaryButton } from '@/components/ui/buttons';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { Modal } from '@/components/ui/modal';
import { Toast, type ToastVariant } from '@/components/ui/toast';
import { useLanguage } from '@/contexts/language-context';
import {
  deleteSpace,
  getSpaceById,
  getSpaceMembers,
  leaveSpace,
  type Space,
  type SpaceMember,
  type SpacesServiceError,
} from '@/services/spaces-service';
import { darkColors, groupColors, radius, spacing, typography } from '@/theme';

import { InviteSpaceMemberSheet } from './invite-space-member-sheet';
import { SpaceFormSheet } from './space-form-sheet';
import { getSpacesErrorMessage } from './spaces-error-messages';

type SpaceDetailScreenProps = {
  spaceId: string;
  onBack: () => void;
  /** L'espace a été supprimé : le parent doit revenir à la liste. */
  onDeleted: () => void;
  /** L'utilisateur a quitté l'espace : le parent doit revenir à la liste. */
  onLeft: () => void;
};

const TYPE_COLOR: Record<Space['type'], string> = {
  family: groupColors.family,
  friends: groupColors.friends,
  team: groupColors.team,
};

const TYPE_ICON: Record<Space['type'], string> = { family: '⌂', friends: '✦', team: '◆' };

function typeLabelKey(type: Space['type']): 'groups.family' | 'groups.friends' | 'groups.team' {
  return type === 'family' ? 'groups.family' : type === 'friends' ? 'groups.friends' : 'groups.team';
}

function formatJoinedDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function SpaceDetailScreen({ spaceId, onBack, onDeleted, onLeft }: SpaceDetailScreenProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [space, setSpace] = useState<Space | null>(null);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState<{ variant: ToastVariant; message: string } | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const [spaceResult, membersResult] = await Promise.all([getSpaceById(spaceId), getSpaceMembers(spaceId)]);
      setSpace(spaceResult);
      setMembers(membersResult);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getSpacesErrorMessage(t, (error as SpacesServiceError).code));
      setStatus('error');
    }
  }, [spaceId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const isOwner = Boolean(space && user && space.ownerId === user.id);
  const myMembership = members.find((member) => member.profileId === user?.id);
  const canEdit = isOwner || myMembership?.role === 'admin';

  async function handleLeave() {
    if (!space || !user) return;
    setActionBusy(true);
    try {
      await leaveSpace({ id: space.id, ownerId: space.ownerId }, user.id);
      onLeft();
    } catch (error) {
      setLeaveConfirmOpen(false);
      setToast({ variant: 'error', message: getSpacesErrorMessage(t, (error as SpacesServiceError).code) });
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete() {
    if (!space) return;
    setActionBusy(true);
    try {
      await deleteSpace(space.id);
      onDeleted();
    } catch (error) {
      setDeleteConfirmOpen(false);
      setToast({ variant: 'error', message: getSpacesErrorMessage(t, (error as SpacesServiceError).code) });
    } finally {
      setActionBusy(false);
    }
  }

  const color = space ? space.color || TYPE_COLOR[space.type] : darkColors.primary;
  const icon = space ? space.icon || TYPE_ICON[space.type] : '⌂';

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel={t('common.back')} accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>{t('spaces.detail')}</Text>
        <View style={styles.topSpacer} />
      </View>

      {status === 'loading' ? (
        <Loading fullScreen label={t('spaces.loading')} />
      ) : status === 'error' || !space ? (
        <EmptyState
          actionLabel={t('common.retry')}
          description={errorMessage ?? ''}
          onAction={load}
          style={styles.stateBlock}
          title={t('spaces.errorTitle')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, { borderColor: `${color}52` }]}>
            <View style={[styles.heroIcon, { backgroundColor: `${color}24` }]}>
              <Text style={[styles.heroIconText, { color }]}>{icon}</Text>
            </View>
            <View style={styles.heroCopy}>
              <Text accessibilityRole="header" style={styles.title}>{space.name}</Text>
              <Text style={styles.heroMeta}>{members.length} {t('common.members')}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: `${color}18` }]}>
              <Text style={[styles.typeBadgeText, { color }]}>{t(typeLabelKey(space.type))}</Text>
            </View>
          </View>

          {space.description ? <Text style={styles.description}>{space.description}</Text> : null}

          {canEdit ? (
            <View style={styles.actionsRow}>
              <SecondaryButton label={t('spaces.editAction')} onPress={() => setEditOpen(true)} style={styles.actionButton} />
              <SecondaryButton label={t('spaces.inviteMember')} onPress={() => setInviteOpen(true)} style={styles.actionButton} />
            </View>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('common.members')}</Text>
            <Text style={styles.sectionMeta}>{t('spaces.people', { count: members.length })}</Text>
          </View>

          <View style={styles.memberList}>
            {members.map((member, index) => (
              <MemberRow key={member.id} member={member} withDivider={index < members.length - 1} />
            ))}
          </View>

          <View style={styles.dangerZone}>
            {isOwner ? (
              <DangerButton fullWidth label={t('spaces.delete')} onPress={() => setDeleteConfirmOpen(true)} />
            ) : (
              <DangerButton fullWidth label={t('spaces.leave')} onPress={() => setLeaveConfirmOpen(true)} />
            )}
          </View>
        </ScrollView>
      )}

      {space ? (
        <SpaceFormSheet
          onClose={() => setEditOpen(false)}
          onUpdated={(updated) => {
            setEditOpen(false);
            setSpace(updated);
            setToast({ variant: 'success', message: t('spaces.updated') });
          }}
          space={space}
          visible={editOpen}
        />
      ) : null}

      {space ? (
        <InviteSpaceMemberSheet
          onClose={() => setInviteOpen(false)}
          spaceId={space.id}
          spaceName={space.name}
          visible={inviteOpen}
        />
      ) : null}

      <Modal
        description={t('spaces.leaveConfirmDescription')}
        footer={
          <View style={styles.confirmFooter}>
            <GhostButton label={t('common.cancel')} onPress={() => setLeaveConfirmOpen(false)} style={styles.confirmButton} />
            <DangerButton label={t('spaces.leaveConfirmButton')} loading={actionBusy} onPress={handleLeave} style={styles.confirmButton} />
          </View>
        }
        onClose={() => setLeaveConfirmOpen(false)}
        title={t('spaces.leaveConfirmTitle')}
        visible={leaveConfirmOpen}
      />

      <Modal
        description={space ? t('spaces.deleteConfirmDescription', { name: space.name }) : ''}
        footer={
          <View style={styles.confirmFooter}>
            <GhostButton label={t('common.cancel')} onPress={() => setDeleteConfirmOpen(false)} style={styles.confirmButton} />
            <DangerButton label={t('spaces.deleteConfirmButton')} loading={actionBusy} onPress={handleDelete} style={styles.confirmButton} />
          </View>
        }
        onClose={() => setDeleteConfirmOpen(false)}
        title={t('spaces.deleteConfirmTitle')}
        visible={deleteConfirmOpen}
      />

      <Toast message={toast?.message ?? ''} onDismiss={() => setToast(null)} variant={toast?.variant ?? 'info'} visible={Boolean(toast)} />
    </View>
  );
}

function MemberRow({ member, withDivider }: { member: SpaceMember; withDivider: boolean }) {
  const { t } = useLanguage();
  const displayName = member.profile?.fullName || member.profile?.email || '—';
  const roleLabel = t(member.role === 'owner' ? 'spaces.roleOwner' : member.role === 'admin' ? 'spaces.roleAdmin' : 'spaces.roleMember');

  return (
    <View style={[styles.memberRow, withDivider && styles.memberDivider]}>
      <Avatar imageUrl={member.profile?.avatarUrl} name={displayName} size={48} />
      <View style={styles.memberCopy}>
        <Text numberOfLines={1} style={styles.memberName}>{displayName}</Text>
        <Text style={styles.memberJoined}>{t('spaces.joinedOn', { date: formatJoinedDate(member.joinedAt) })}</Text>
      </View>
      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>{roleLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: darkColors.background },
  content: { paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[10], gap: spacing[3] },
  stateBlock: { flex: 1 },
  topBar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4] },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surface },
  backIcon: { color: darkColors.textPrimary, fontSize: 34, lineHeight: 36, fontWeight: '300' },
  topTitle: { ...typography.labelMedium, color: darkColors.textSecondary },
  topSpacer: { width: 48 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, backgroundColor: darkColors.surface },
  heroIcon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.large },
  heroIconText: { fontSize: 26, fontWeight: '800' },
  heroCopy: { flex: 1, minWidth: 0 },
  title: { ...typography.titleLarge, color: darkColors.textPrimary },
  heroMeta: { ...typography.caption, color: darkColors.textMuted },
  typeBadge: { maxWidth: 102, paddingHorizontal: spacing[2], paddingVertical: 6, borderRadius: radius.pill },
  typeBadgeText: { fontSize: 9, lineHeight: 13, fontWeight: '700', textAlign: 'center' },
  description: { ...typography.bodyMedium, color: darkColors.textSecondary },
  actionsRow: { flexDirection: 'row', gap: spacing[3] },
  actionButton: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing[2] },
  sectionTitle: { ...typography.titleMedium, color: darkColors.textPrimary },
  sectionMeta: { ...typography.caption, color: darkColors.textMuted },
  memberList: { paddingHorizontal: spacing[3], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  memberRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] },
  memberDivider: { borderBottomWidth: 1, borderBottomColor: darkColors.border },
  memberCopy: { flex: 1, minWidth: 0 },
  memberName: { ...typography.labelLarge, color: darkColors.textPrimary },
  memberJoined: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  roleBadge: { minHeight: 26, justifyContent: 'center', paddingHorizontal: spacing[2], borderRadius: radius.pill, backgroundColor: darkColors.disabledSurface },
  roleBadgeText: { fontSize: 10, lineHeight: 14, fontWeight: '700', color: darkColors.textSecondary },
  dangerZone: { marginTop: spacing[2] },
  confirmFooter: { flexDirection: 'row', gap: spacing[3] },
  confirmButton: { flex: 1 },
});
