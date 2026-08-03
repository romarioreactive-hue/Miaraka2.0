import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { DangerButton, GhostButton, PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { Modal } from '@/components/ui/modal';
import { Toast, type ToastVariant } from '@/components/ui/toast';
import { useLanguage } from '@/contexts/language-context';
import {
  acceptInvitation,
  cancelInvitation,
  declineInvitation,
  getReceivedInvitations,
  getSentInvitations,
  type Invitation,
  type InvitationsServiceError,
} from '@/services/invitations-service';
import { darkColors, radius, spacing, typography } from '@/theme';

import { getInvitationsErrorMessage } from './invitations-error-messages';

type InvitationsScreenProps = {
  visible: boolean;
  onClose: () => void;
  /** Appelé après une acceptation réussie, pour permettre au parent d'ouvrir l'onglet Espaces. */
  onAccepted?: () => void;
};

type Tab = 'received' | 'sent';
type LoadStatus = 'loading' | 'ready' | 'error';

function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function spaceLabel(space: Invitation['space']): string {
  return space?.name ?? '';
}

export function InvitationsScreen({ visible, onClose, onAccepted }: InvitationsScreenProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [tab, setTab] = useState<Tab>('received');

  const [received, setReceived] = useState<Invitation[]>([]);
  const [receivedStatus, setReceivedStatus] = useState<LoadStatus>('loading');
  const [receivedError, setReceivedError] = useState<string | null>(null);

  const [sent, setSent] = useState<Invitation[]>([]);
  const [sentStatus, setSentStatus] = useState<LoadStatus>('loading');
  const [sentError, setSentError] = useState<string | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Invitation | null>(null);
  const [toast, setToast] = useState<{ variant: ToastVariant; message: string } | null>(null);

  const loadReceived = useCallback(async () => {
    if (!user) return;
    setReceivedStatus('loading');
    setReceivedError(null);
    try {
      const result = await getReceivedInvitations(user.id);
      setReceived(result.filter((invitation) => invitation.status === 'pending'));
      setReceivedStatus('ready');
    } catch (error) {
      setReceivedError(getInvitationsErrorMessage(t, (error as InvitationsServiceError).code));
      setReceivedStatus('error');
    }
  }, [user, t]);

  const loadSent = useCallback(async () => {
    if (!user) return;
    setSentStatus('loading');
    setSentError(null);
    try {
      const result = await getSentInvitations(user.id);
      setSent(result);
      setSentStatus('ready');
    } catch (error) {
      setSentError(getInvitationsErrorMessage(t, (error as InvitationsServiceError).code));
      setSentStatus('error');
    }
  }, [user, t]);

  useEffect(() => {
    if (!visible) return;
    void loadReceived();
    void loadSent();
  }, [visible, loadReceived, loadSent]);

  async function handleAccept(invitation: Invitation) {
    setBusyId(invitation.id);
    try {
      await acceptInvitation(invitation.id);
      setReceived((current) => current.filter((item) => item.id !== invitation.id));
      setToast({ variant: 'success', message: `${t('invitations.accepted')} ${t('invitations.acceptedHint')}` });
      onAccepted?.();
    } catch (error) {
      setToast({ variant: 'error', message: getInvitationsErrorMessage(t, (error as InvitationsServiceError).code) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(invitation: Invitation) {
    setBusyId(invitation.id);
    try {
      await declineInvitation(invitation.id);
      setReceived((current) => current.filter((item) => item.id !== invitation.id));
      setToast({ variant: 'info', message: t('invitations.declined') });
    } catch (error) {
      setToast({ variant: 'error', message: getInvitationsErrorMessage(t, (error as InvitationsServiceError).code) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setBusyId(cancelTarget.id);
    try {
      await cancelInvitation(cancelTarget.id);
      setSent((current) => current.filter((item) => item.id !== cancelTarget.id));
      setToast({ variant: 'info', message: t('invitations.cancelled') });
    } catch (error) {
      setToast({ variant: 'error', message: getInvitationsErrorMessage(t, (error as InvitationsServiceError).code) });
    } finally {
      setBusyId(null);
      setCancelTarget(null);
    }
  }

  return (
    <BottomSheet onClose={onClose} title={t('invitations.title')} visible={visible}>
      <View style={styles.body}>
        <View style={styles.tabs}>
          <TabButton active={tab === 'received'} label={t('invitations.receivedTab')} onPress={() => setTab('received')} />
          <TabButton active={tab === 'sent'} label={t('invitations.sentTab')} onPress={() => setTab('sent')} />
        </View>

        {tab === 'received' ? (
          receivedStatus === 'loading' ? (
            <Loading label={t('invitations.loading')} style={styles.stateBlock} />
          ) : receivedStatus === 'error' ? (
            <EmptyState
              actionLabel={t('common.retry')}
              description={receivedError ?? ''}
              onAction={loadReceived}
              style={styles.stateBlock}
              title={t('invitations.errorTitle')}
            />
          ) : received.length === 0 ? (
            <EmptyState
              description={t('invitations.receivedEmptyDescription')}
              style={styles.stateBlock}
              title={t('invitations.receivedEmptyTitle')}
            />
          ) : (
            <View style={styles.list}>
              {received.map((invitation) => (
                <ReceivedCard
                  busy={busyId === invitation.id}
                  invitation={invitation}
                  key={invitation.id}
                  onAccept={() => handleAccept(invitation)}
                  onDecline={() => handleDecline(invitation)}
                />
              ))}
            </View>
          )
        ) : sentStatus === 'loading' ? (
          <Loading label={t('invitations.loading')} style={styles.stateBlock} />
        ) : sentStatus === 'error' ? (
          <EmptyState
            actionLabel={t('common.retry')}
            description={sentError ?? ''}
            onAction={loadSent}
            style={styles.stateBlock}
            title={t('invitations.errorTitle')}
          />
        ) : sent.length === 0 ? (
          <EmptyState
            description={t('invitations.sentEmptyDescription')}
            style={styles.stateBlock}
            title={t('invitations.sentEmptyTitle')}
          />
        ) : (
          <View style={styles.list}>
            {sent.map((invitation) => (
              <SentCard invitation={invitation} key={invitation.id} onCancel={() => setCancelTarget(invitation)} />
            ))}
          </View>
        )}
      </View>

      <Modal
        description={cancelTarget ? t('invitations.cancelConfirmDescription', {
          name: cancelTarget.receiver?.fullName || cancelTarget.receiver?.email || '',
        }) : ''}
        footer={
          <View style={styles.confirmFooter}>
            <GhostButton label={t('common.cancel')} onPress={() => setCancelTarget(null)} style={styles.confirmButton} />
            <DangerButton
              label={t('invitations.cancelConfirmButton')}
              loading={Boolean(cancelTarget && busyId === cancelTarget.id)}
              onPress={handleCancel}
              style={styles.confirmButton}
            />
          </View>
        }
        onClose={() => setCancelTarget(null)}
        title={t('invitations.cancelConfirmTitle')}
        visible={Boolean(cancelTarget)}
      />

      <Toast message={toast?.message ?? ''} onDismiss={() => setToast(null)} variant={toast?.variant ?? 'info'} visible={Boolean(toast)} />
    </BottomSheet>
  );
}

function TabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ReceivedCard({
  invitation,
  busy,
  onAccept,
  onDecline,
}: {
  invitation: Invitation;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useLanguage();
  const senderName = invitation.sender?.fullName || invitation.sender?.email || '—';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar imageUrl={invitation.sender?.avatarUrl} name={senderName} size={48} />
        <View style={styles.cardCopy}>
          <Text style={styles.cardText}>
            <Text style={styles.cardTextStrong}>{senderName}</Text> {t('invitations.invitedTo', { space: spaceLabel(invitation.space) })}
          </Text>
          <Text style={styles.cardDate}>{formatDate(invitation.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <SecondaryButton label={t('invitations.decline')} onPress={onDecline} style={styles.cardActionButton} />
        <PrimaryButton label={t('invitations.accept')} loading={busy} onPress={onAccept} style={styles.cardActionButton} />
      </View>
    </View>
  );
}

function SentCard({ invitation, onCancel }: { invitation: Invitation; onCancel: () => void }) {
  const { t } = useLanguage();
  const receiverName = invitation.receiver?.fullName || invitation.receiver?.email || '—';
  const statusLabel = t(
    invitation.status === 'pending' ? 'invitations.statusPending'
      : invitation.status === 'accepted' ? 'invitations.statusAccepted'
        : 'invitations.statusDeclined',
  );
  const statusColor = invitation.status === 'pending' ? darkColors.warning
    : invitation.status === 'accepted' ? darkColors.success
      : darkColors.textMuted;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar imageUrl={invitation.receiver?.avatarUrl} name={receiverName} size={48} />
        <View style={styles.cardCopy}>
          <Text style={styles.cardTextStrong}>{receiverName}</Text>
          <Text style={styles.cardDate}>{t('invitations.sentToSpace', { space: spaceLabel(invitation.space) })} · {formatDate(invitation.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      {invitation.status === 'pending' ? (
        <View style={styles.cardActions}>
          <GhostButton label={t('invitations.cancel')} onPress={onCancel} style={styles.cardActionButton} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing[3] },
  tabs: { flexDirection: 'row', padding: 3, borderRadius: radius.pill, backgroundColor: darkColors.disabledSurface },
  tabButton: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  tabButtonActive: { backgroundColor: darkColors.primary },
  tabButtonText: { ...typography.labelMedium, color: darkColors.textMuted },
  tabButtonTextActive: { color: darkColors.textInverse },
  stateBlock: { paddingVertical: spacing[4] },
  list: { gap: spacing[3] },
  card: { gap: spacing[3], padding: spacing[3], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  cardCopy: { flex: 1, minWidth: 0 },
  cardText: { ...typography.bodyMedium, color: darkColors.textSecondary },
  cardTextStrong: { color: darkColors.textPrimary, fontWeight: '700' },
  cardDate: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: spacing[2] },
  cardActionButton: { flex: 1 },
  statusBadge: { minHeight: 26, justifyContent: 'center', paddingHorizontal: spacing[2], borderRadius: radius.pill },
  statusBadgeText: { fontSize: 10, lineHeight: 14, fontWeight: '700' },
  confirmFooter: { flexDirection: 'row', gap: spacing[3] },
  confirmButton: { flex: 1 },
});
