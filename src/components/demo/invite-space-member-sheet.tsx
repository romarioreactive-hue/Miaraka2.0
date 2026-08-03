import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PrimaryButton } from '@/components/ui/buttons';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { SearchBar } from '@/components/ui/search-bar';
import { Toast, type ToastVariant } from '@/components/ui/toast';
import { useLanguage } from '@/contexts/language-context';
import {
  searchProfiles,
  sendInvitation,
  type InvitationsServiceError,
  type SearchedProfile,
} from '@/services/invitations-service';
import { darkColors, radius, spacing, typography } from '@/theme';

import { getInvitationsErrorMessage } from './invitations-error-messages';

type InviteSpaceMemberSheetProps = {
  visible: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
};

const SEARCH_DEBOUNCE_MS = 350;

export function InviteSpaceMemberSheet({ visible, onClose, spaceId, spaceName }: InviteSpaceMemberSheetProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [results, setResults] = useState<SearchedProfile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ variant: ToastVariant; message: string } | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setStatus('idle');
      setErrorMessage(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !user) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    const timer = setTimeout(() => {
      searchProfiles(trimmed, spaceId, user.id)
        .then((found) => {
          setResults(found);
          setStatus('ready');
        })
        .catch((error) => {
          setErrorMessage(getInvitationsErrorMessage(t, (error as InvitationsServiceError).code));
          setStatus('error');
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, visible, spaceId, user, t]);

  async function handleInvite(profile: SearchedProfile) {
    if (!user) return;
    setSendingId(profile.id);
    try {
      await sendInvitation({ senderId: user.id, receiverId: profile.id, spaceId });
      setResults((current) => current.map((item) => (item.id === profile.id ? { ...item, status: 'pending' } : item)));
      setToast({ variant: 'success', message: t('invitations.sent') });
    } catch (error) {
      setToast({ variant: 'error', message: getInvitationsErrorMessage(t, (error as InvitationsServiceError).code) });
    } finally {
      setSendingId(null);
    }
  }

  return (
    <BottomSheet
      description={t('spaces.inviteSubtitle', { space: spaceName })}
      onClose={onClose}
      title={t('spaces.inviteMember')}
      visible={visible}>
      <View style={styles.body}>
        <SearchBar
          accessibilityLabel={t('invitations.searchPlaceholder')}
          autoCapitalize="none"
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder={t('invitations.searchPlaceholder')}
          value={query}
        />

        {status === 'idle' ? (
          <Text style={styles.hint}>{t('invitations.searchHint')}</Text>
        ) : status === 'loading' ? (
          <Loading label={t('spaces.loading')} style={styles.stateBlock} />
        ) : status === 'error' ? (
          <EmptyState description={errorMessage ?? ''} style={styles.stateBlock} title={t('invitations.errorTitle')} />
        ) : results.length === 0 ? (
          <EmptyState
            description={t('invitations.searchNoResultsHint')}
            style={styles.stateBlock}
            title={t('invitations.searchNoResults')}
          />
        ) : (
          <View style={styles.results}>
            {results.map((profile) => (
              <ResultRow
                key={profile.id}
                onInvite={() => handleInvite(profile)}
                profile={profile}
                sending={sendingId === profile.id}
              />
            ))}
          </View>
        )}
      </View>

      <Toast message={toast?.message ?? ''} onDismiss={() => setToast(null)} variant={toast?.variant ?? 'info'} visible={Boolean(toast)} />
    </BottomSheet>
  );
}

function ResultRow({
  profile,
  onInvite,
  sending,
}: {
  profile: SearchedProfile;
  onInvite: () => void;
  sending: boolean;
}) {
  const { t } = useLanguage();
  const displayName = profile.fullName || profile.maskedEmail;

  return (
    <View style={styles.resultRow}>
      <Avatar imageUrl={profile.avatarUrl} name={displayName} size={48} />
      <View style={styles.resultCopy}>
        <Text numberOfLines={1} style={styles.resultName}>{displayName}</Text>
        <Text numberOfLines={1} style={styles.resultEmail}>{profile.maskedEmail}</Text>
      </View>
      {profile.status === 'member' ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{t('invitations.alreadyMember')}</Text>
        </View>
      ) : profile.status === 'pending' ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{t('invitations.alreadyInvited')}</Text>
        </View>
      ) : (
        <PrimaryButton label={t('common.invite')} loading={sending} onPress={onInvite} size="compact" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing[3] },
  hint: { ...typography.caption, color: darkColors.textMuted, textAlign: 'center', paddingVertical: spacing[4] },
  stateBlock: { paddingVertical: spacing[2] },
  results: { gap: spacing[2] },
  resultRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[2], borderRadius: radius.large, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  resultCopy: { flex: 1, minWidth: 0 },
  resultName: { ...typography.labelLarge, color: darkColors.textPrimary },
  resultEmail: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  statusBadge: { minHeight: 32, justifyContent: 'center', paddingHorizontal: spacing[2], borderRadius: radius.pill, backgroundColor: darkColors.disabledSurface },
  statusBadgeText: { fontSize: 10, lineHeight: 14, fontWeight: '700', color: darkColors.textMuted },
});
