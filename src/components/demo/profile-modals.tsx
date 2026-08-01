import { ReactNode, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { darkColors, radius, spacing, typography } from '@/theme';
import { useLanguage } from '@/contexts/language-context';

export type ProfileDetails = {
  name: string;
  email: string;
  initials: string;
};

export type SpacePermissionSettings = {
  position: boolean;
  activity: boolean;
  lastPosition: boolean;
  schedule?: string;
};

type BaseModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function EditProfileModal({
  profile,
  visible,
  onClose,
  onSave,
}: BaseModalProps & { profile: ProfileDetails; onSave: (profile: ProfileDetails) => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState(profile.name);
  const [initials, setInitials] = useState(profile.initials);

  useEffect(() => {
    if (visible) {
      setName(profile.name);
      setInitials(profile.initials);
    }
  }, [profile, visible]);

  function save() {
    if (!name.trim()) return;
    onSave({ ...profile, name: name.trim(), initials });
    onClose();
  }

  return (
    <ModalShell onClose={onClose} title={t('profile.editTitle')} visible={visible}>
      <View style={styles.avatarEditor}>
        <View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>{initials}</Text></View>
        <View style={styles.avatarChoices}>
          {['RR', 'RA', 'RM'].map((item) => (
            <Pressable
              accessibilityLabel={`Choisir l’avatar ${item}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: initials === item }}
              key={item}
              onPress={() => setInitials(item)}
              style={[styles.avatarChoice, initials === item && styles.avatarChoiceActive]}>
              <Text style={styles.avatarChoiceText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helpText}>{t('profile.fakePhotos')}</Text>
      </View>
      <Text style={styles.fieldLabel}>{t('profile.fullName')}</Text>
      <TextInput
        accessibilityLabel={t('profile.fullName')}
        onChangeText={setName}
        placeholder={t('profile.yourName')}
        placeholderTextColor={darkColors.textMuted}
        style={styles.input}
        value={name}
      />
      <Text style={styles.fieldLabel}>{t('profile.fakeGoogle')}</Text>
      <View style={styles.readOnlyField}><Text style={styles.googleMark}>G</Text><Text style={styles.readOnlyText}>{profile.email}</Text></View>
      <Pressable
        accessibilityState={{ disabled: !name.trim() }}
        disabled={!name.trim()}
        onPress={save}
        style={({ pressed }) => [styles.primaryButton, !name.trim() && styles.disabledButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>{t('common.save')}</Text>
      </Pressable>
    </ModalShell>
  );
}

export function SpacePermissionsModal({
  color,
  initialSettings,
  spaceName,
  visible,
  onClose,
  onSave,
}: BaseModalProps & {
  color: string;
  initialSettings: SpacePermissionSettings;
  spaceName: string;
  onSave: (settings: SpacePermissionSettings) => void;
}) {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    if (visible) setSettings(initialSettings);
  }, [initialSettings, visible]);

  function toggle(key: 'position' | 'activity' | 'lastPosition') {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <ModalShell onClose={onClose} title={t('profile.permissions', { space: spaceName })} visible={visible}>
      <View style={[styles.spaceIntro, { backgroundColor: `${color}18`, borderColor: `${color}50` }]}>
        <View style={[styles.spaceDot, { backgroundColor: color }]} />
        <Text style={styles.spaceIntroText}>{t('profile.permissionsHelp')}</Text>
      </View>
      <ModalSwitch label={t('profile.myPosition')} value={settings.position} onValueChange={() => toggle('position')} />
      <ModalSwitch label={t('profile.myActivity')} value={settings.activity} onValueChange={() => toggle('activity')} />
      <ModalSwitch label={t('profile.myLastPosition')} value={settings.lastPosition} onValueChange={() => toggle('lastPosition')} />
      {settings.schedule !== undefined && (
        <>
          <Text style={styles.fieldLabel}>{t('profile.sharingHours')}</Text>
          <View style={styles.scheduleChoices}>
            {['08:00 – 18:00', 'Toujours', 'Jamais'].map((item) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: settings.schedule === item }}
                key={item}
                onPress={() => setSettings((current) => ({ ...current, schedule: item }))}
                style={[styles.scheduleChoice, settings.schedule === item && styles.scheduleChoiceActive]}>
                <Text style={[styles.scheduleChoiceText, settings.schedule === item && styles.scheduleChoiceTextActive]}>{item === 'Toujours' ? t('profile.always') : item === 'Jamais' ? t('profile.never') : item}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      <Pressable onPress={() => { onSave(settings); onClose(); }} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>{t('profile.savePermissions')}</Text>
      </Pressable>
    </ModalShell>
  );
}

export function PauseSharingModal({
  visible,
  onClose,
  onConfirm,
}: BaseModalProps & { onConfirm: (duration: '1 heure' | 'Jusqu’à réactivation') => void }) {
  const { t } = useLanguage();
  const [duration, setDuration] = useState<'1 heure' | 'Jusqu’à réactivation'>('1 heure');

  return (
    <ModalShell onClose={onClose} title={t('profile.pauseSharing')} visible={visible}>
      <Text style={styles.modalDescription}>{t('profile.pauseDescription')}</Text>
      {(['1 heure', 'Jusqu’à réactivation'] as const).map((item) => (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: duration === item }}
          key={item}
          onPress={() => setDuration(item)}
          style={[styles.radioRow, duration === item && styles.radioRowActive]}>
          <View style={[styles.radioCircle, duration === item && styles.radioCircleActive]}>{duration === item && <View style={styles.radioCenter} />}</View>
          <View style={styles.radioCopy}><Text style={styles.radioTitle}>{item === '1 heure' ? t('profile.oneHour') : t('profile.untilResume')}</Text><Text style={styles.helpText}>{item === '1 heure' ? t('profile.autoResume') : t('profile.manualResume')}</Text></View>
        </Pressable>
      ))}
      <Pressable onPress={() => { onConfirm(duration); onClose(); }} style={({ pressed }) => [styles.warningButton, pressed && styles.pressed]}>
        <Text style={styles.warningButtonText}>{t('profile.pauseNow')}</Text>
      </Pressable>
    </ModalShell>
  );
}

export function LogoutConfirmationModal({ visible, onClose, onConfirm }: BaseModalProps & { onConfirm: () => void }) {
  const { t } = useLanguage();
  return (
    <ModalShell onClose={onClose} title={t('profile.logoutQuestion')} visible={visible} compact>
      <View style={styles.logoutIcon}><Text style={styles.logoutIconText}>↪</Text></View>
      <Text style={styles.modalDescription}>{t('profile.logoutDescription')}</Text>
      <View style={styles.buttonRow}>
        <Pressable onPress={onClose} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>{t('common.cancel')}</Text></Pressable>
        <Pressable onPress={() => { onConfirm(); onClose(); }} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}><Text style={styles.dangerButtonText}>{t('profile.logout')}</Text></Pressable>
      </View>
    </ModalShell>
  );
}

function ModalShell({ children, compact = false, onClose, title, visible }: BaseModalProps & { children: ReactNode; compact?: boolean; title: string }) {
  const { t } = useLanguage();
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable accessibilityLabel={t('common.close')} onPress={onClose} style={styles.backdrop} />
        <View style={[styles.sheet, compact && styles.compactSheet]}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}><Text accessibilityRole="header" style={styles.modalTitle}>{title}</Text><Pressable accessibilityLabel={t('common.close')} onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable></View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ModalSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: () => void }) {
  return (
    <View style={styles.modalSwitchRow}><Text style={styles.modalSwitchLabel}>{label}</Text><Switch accessibilityLabel={label} onValueChange={onValueChange} thumbColor={darkColors.textPrimary} trackColor={{ false: darkColors.disabledSurface, true: darkColors.success }} value={value} /></View>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: darkColors.overlayStrong },
  sheet: { maxHeight: '90%', paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[6], borderTopLeftRadius: radius.extraLarge, borderTopRightRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.backgroundElevated },
  compactSheet: { maxHeight: '70%' },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: radius.pill, backgroundColor: darkColors.borderStrong },
  modalHeader: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] },
  modalTitle: { flex: 1, ...typography.titleLarge, color: darkColors.textPrimary },
  closeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surface },
  closeText: { color: darkColors.textPrimary, fontSize: 27 },
  modalContent: { gap: spacing[3], paddingTop: spacing[2] },
  avatarEditor: { alignItems: 'center', gap: spacing[2] },
  largeAvatar: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 2, borderColor: darkColors.accent, backgroundColor: darkColors.primarySoft },
  largeAvatarText: { ...typography.titleMedium, color: darkColors.textPrimary },
  avatarChoices: { flexDirection: 'row', gap: spacing[2] },
  avatarChoice: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  avatarChoiceActive: { borderColor: darkColors.accent, backgroundColor: darkColors.primarySoft },
  avatarChoiceText: { ...typography.labelMedium, color: darkColors.textPrimary },
  helpText: { ...typography.caption, color: darkColors.textMuted },
  fieldLabel: { ...typography.labelMedium, color: darkColors.textSecondary },
  input: { minHeight: 48, paddingHorizontal: spacing[3], borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface, color: darkColors.textPrimary, ...typography.bodyMedium },
  readOnlyField: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingHorizontal: spacing[3], borderRadius: radius.medium, backgroundColor: darkColors.surface },
  googleMark: { width: 24, height: 24, textAlign: 'center', textAlignVertical: 'center', borderRadius: radius.circle, backgroundColor: darkColors.textPrimary, color: darkColors.primary, fontWeight: '800' },
  readOnlyText: { ...typography.bodyMedium, color: darkColors.textSecondary },
  primaryButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.primary },
  primaryButtonText: { ...typography.labelLarge, color: darkColors.textPrimary },
  disabledButton: { backgroundColor: darkColors.disabledSurface },
  spaceIntro: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3], borderRadius: radius.large, borderWidth: 1 },
  spaceDot: { width: 12, height: 12, borderRadius: radius.circle },
  spaceIntroText: { flex: 1, ...typography.bodyMedium, color: darkColors.textSecondary },
  modalSwitchRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3], paddingHorizontal: spacing[3], borderRadius: radius.medium, backgroundColor: darkColors.surface },
  modalSwitchLabel: { flex: 1, ...typography.bodyMedium, color: darkColors.textPrimary },
  scheduleChoices: { gap: spacing[2] },
  scheduleChoice: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  scheduleChoiceActive: { borderColor: darkColors.primary, backgroundColor: darkColors.primarySoft },
  scheduleChoiceText: { ...typography.labelMedium, color: darkColors.textMuted },
  scheduleChoiceTextActive: { color: darkColors.textPrimary },
  modalDescription: { ...typography.bodyMedium, color: darkColors.textSecondary, textAlign: 'center' },
  radioRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3], borderRadius: radius.large, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  radioRowActive: { borderColor: darkColors.warning, backgroundColor: darkColors.warningSoft },
  radioCircle: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 2, borderColor: darkColors.textMuted },
  radioCircleActive: { borderColor: darkColors.warning },
  radioCenter: { width: 10, height: 10, borderRadius: radius.circle, backgroundColor: darkColors.warning },
  radioCopy: { flex: 1 },
  radioTitle: { ...typography.labelLarge, color: darkColors.textPrimary },
  warningButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.warning },
  warningButtonText: { ...typography.labelLarge, color: darkColors.textInverse },
  logoutIcon: { alignSelf: 'center', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.errorSoft },
  logoutIconText: { color: darkColors.error, fontSize: 27, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: spacing[3] },
  secondaryButton: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.borderStrong, backgroundColor: darkColors.surface },
  secondaryButtonText: { ...typography.labelLarge, color: darkColors.textSecondary },
  dangerButton: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.error },
  dangerButtonText: { ...typography.labelLarge, color: darkColors.textPrimary },
  pressed: { opacity: 0.76 },
});
