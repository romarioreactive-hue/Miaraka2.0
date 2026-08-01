import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { darkColors, radius, spacing, typography } from '@/theme';
import { useLanguage } from '@/contexts/language-context';

import { Space } from './spaces-data';

type InviteSpaceMemberSheetProps = { space: Space | null; visible: boolean; onClose: () => void };
type Contact = { id: string; name: string; email: string; initials: string };

const CONTACTS: Contact[] = [
  { id: 'sarah', name: 'Sarah Rakoto', email: 'sarah.rakoto@example.com', initials: 'SR' },
  { id: 'toky', name: 'Toky Ranaivo', email: 'toky.ranaivo@example.com', initials: 'TR' },
  { id: 'malala', name: 'Malala Rasoanaivo', email: 'malala.r@example.com', initials: 'MR' },
];

export function InviteSpaceMemberSheet({ space, visible, onClose }: InviteSpaceMemberSheetProps) {
  const { t } = useLanguage();
  const spaceName = space ? t(space.type === 'famille' ? 'groups.family' : space.type === 'amis' ? 'groups.friends' : 'groups.team') : '';
  const [query, setQuery] = useState('');
  const [invited, setInvited] = useState<Contact | null>(null);
  const results = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('fr-FR');
    return value ? CONTACTS.filter((contact) => `${contact.name} ${contact.email}`.toLocaleLowerCase('fr-FR').includes(value)) : CONTACTS;
  }, [query]);

  function close() { setQuery(''); setInvited(null); onClose(); }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable accessibilityLabel={t('common.close')} onPress={close} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {invited ? (
            <View style={styles.confirmation}>
              <View style={[styles.confirmationIcon, { borderColor: space?.color ?? darkColors.success }]}><Text style={styles.confirmationIconText}>✓</Text></View>
              <Text accessibilityRole="header" style={styles.title}>{t('map.invitationSent')}</Text>
              <Text style={styles.subtitle}>{t('spaces.memberInvited', { name: invited.name, space: spaceName })}</Text>
              <Pressable onPress={close} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{t('common.finish')}</Text></Pressable>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.headerCopy}><Text accessibilityRole="header" style={styles.title}>{t('spaces.inviteMember')}</Text><Text style={styles.subtitle}>{t('spaces.inviteSubtitle', { space: spaceName })}</Text></View>
                <Pressable accessibilityLabel={t('common.close')} onPress={close} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
              </View>
              <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput accessibilityLabel={t('spaces.searchMember')} autoCapitalize="none" onChangeText={setQuery} placeholder={t('spaces.searchMember')} placeholderTextColor={darkColors.textMuted} style={styles.searchInput} value={query} /></View>
              <Text style={styles.sectionLabel}>{t('spaces.contacts')}</Text>
              <ScrollView contentContainerStyle={styles.results} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {results.map((contact) => (
                  <View key={contact.id} style={styles.contactRow}>
                    <View style={[styles.avatar, { backgroundColor: `${space?.color ?? darkColors.primary}26` }]}><Text style={[styles.avatarText, { color: space?.color ?? darkColors.primary }]}>{contact.initials}</Text></View>
                    <View style={styles.contactCopy}><Text style={styles.contactName}>{contact.name}</Text><Text numberOfLines={1} style={styles.contactEmail}>{contact.email}</Text></View>
                    <Pressable accessibilityLabel={`${t('common.invite')} ${contact.name}`} onPress={() => setInvited(contact)} style={({ pressed }) => [styles.inviteButton, pressed && styles.pressed]}><Text style={styles.inviteText}>{t('common.invite')}</Text></Pressable>
                  </View>
                ))}
                {results.length === 0 && <View style={styles.empty}><Text style={styles.emptyTitle}>{t('spaces.noContact')}</Text><Text style={styles.subtitle}>{t('spaces.tryContact')}</Text></View>}
              </ScrollView>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: darkColors.overlayStrong },
  sheet: { maxHeight: '86%', gap: spacing[3], paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[6], borderTopLeftRadius: radius.extraLarge, borderTopRightRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.backgroundElevated },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: radius.pill, backgroundColor: darkColors.borderStrong },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] }, headerCopy: { flex: 1 }, title: { ...typography.titleLarge, color: darkColors.textPrimary }, subtitle: { ...typography.bodyMedium, color: darkColors.textMuted, marginTop: 2, textAlign: 'center' },
  closeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surface }, closeText: { color: darkColors.textPrimary, fontSize: 27 },
  searchBox: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingHorizontal: spacing[3], borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface }, searchIcon: { color: darkColors.textMuted, fontSize: 21 }, searchInput: { flex: 1, paddingVertical: spacing[3], color: darkColors.textPrimary, ...typography.bodyMedium },
  sectionLabel: { ...typography.caption, color: darkColors.textMuted, fontWeight: '700', letterSpacing: 0.8 }, results: { gap: spacing[2] },
  contactRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[2], padding: spacing[2], borderRadius: radius.large, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle }, avatarText: { fontSize: 11, fontWeight: '800' }, contactCopy: { flex: 1, minWidth: 0 }, contactName: { ...typography.labelLarge, color: darkColors.textPrimary }, contactEmail: { ...typography.caption, color: darkColors.textMuted },
  inviteButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing[3], borderRadius: radius.pill, backgroundColor: darkColors.primary }, inviteText: { ...typography.labelMedium, color: darkColors.textPrimary }, pressed: { opacity: 0.78 },
  empty: { alignItems: 'center', paddingVertical: spacing[6] }, emptyTitle: { ...typography.labelLarge, color: darkColors.textPrimary },
  confirmation: { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[6] }, confirmationIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 1, backgroundColor: darkColors.successSoft }, confirmationIconText: { color: darkColors.success, fontSize: 30, fontWeight: '800' },
  primaryButton: { width: '100%', minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.primary }, primaryButtonText: { ...typography.labelLarge, color: darkColors.textPrimary },
});
