import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { darkColors, groupColors, radius, spacing, typography } from '@/theme';
import { useLanguage } from '@/contexts/language-context';

import { SharingLevel, SPACE_TYPE_LABELS, SpaceType } from './spaces-data';

type CreateSpaceSheetProps = { visible: boolean; onClose: () => void };

const TYPES: SpaceType[] = ['famille', 'amis', 'equipe'];
const ICONS = ['⌂', '✦', '◆', '●'];
const COLORS = [groupColors.family, groupColors.friends, groupColors.team, darkColors.warning];
const SHARING_LEVELS: SharingLevel[] = ['Position précise', 'Zone approximative', 'Activité uniquement'];

export function CreateSpaceSheet({ visible, onClose }: CreateSpaceSheetProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [type, setType] = useState<SpaceType>('famille');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [sharing, setSharing] = useState<SharingLevel>('Position précise');
  const [created, setCreated] = useState(false);

  function close() {
    setName(''); setType('famille'); setIcon(ICONS[0]); setColor(COLORS[0]); setSharing('Position précise'); setCreated(false); onClose();
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable accessibilityLabel={t('common.close')} onPress={close} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {created ? (
            <View style={styles.confirmation}>
              <View style={[styles.confirmationIcon, { borderColor: color, backgroundColor: `${color}20` }]}><Text style={[styles.confirmationIconText, { color }]}>✓</Text></View>
              <Text accessibilityRole="header" style={styles.title}>{t('spaces.created')}</Text>
              <Text style={styles.subtitle}>{t('spaces.createdMessage', { name: name.trim() })}</Text>
              <Pressable onPress={close} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{t('common.finish')}</Text></Pressable>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.header}><View style={styles.headerCopy}><Text accessibilityRole="header" style={styles.title}>{t('spaces.create')}</Text><Text style={styles.subtitle}>{t('spaces.createSubtitle')}</Text></View><Pressable accessibilityLabel={t('common.close')} onPress={close} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable></View>
              <FieldLabel text={t('spaces.name')} />
              <TextInput accessibilityLabel={t('spaces.name')} onChangeText={setName} placeholder={t('spaces.namePlaceholder')} placeholderTextColor={darkColors.textMuted} style={styles.input} value={name} />
              <FieldLabel text={t('spaces.type')} />
              <View style={styles.optionRow}>{TYPES.map((item) => <Choice key={item} label={t(item === 'famille' ? 'groups.family' : item === 'amis' ? 'groups.friends' : 'groups.team')} selected={type === item} onPress={() => setType(item)} />)}</View>
              <FieldLabel text={t('spaces.icon')} />
              <View style={styles.iconRow}>{ICONS.map((item) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: icon === item }} key={item} onPress={() => setIcon(item)} style={[styles.iconChoice, icon === item && styles.choiceSelected]}><Text style={[styles.iconText, icon === item && styles.choiceTextSelected]}>{item}</Text></Pressable>)}</View>
              <FieldLabel text={t('spaces.color')} />
              <View style={styles.colorRow}>{COLORS.map((item) => <Pressable accessibilityLabel={`Choisir la couleur ${item}`} accessibilityRole="radio" accessibilityState={{ checked: color === item }} key={item} onPress={() => setColor(item)} style={[styles.colorChoice, { backgroundColor: item }, color === item && styles.colorSelected]} />)}</View>
              <FieldLabel text={t('spaces.defaultSharing')} />
              <View style={styles.sharingList}>{SHARING_LEVELS.map((item) => <Choice key={item} label={t(item === 'Position précise' ? 'spaces.precise' : item === 'Zone approximative' ? 'spaces.approximate' : 'spaces.activityOnly')} selected={sharing === item} onPress={() => setSharing(item)} full />)}</View>
              <Pressable accessibilityState={{ disabled: !name.trim() }} disabled={!name.trim()} onPress={() => setCreated(true)} style={({ pressed }) => [styles.primaryButton, !name.trim() && styles.buttonDisabled, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{t('spaces.create')}</Text></Pressable>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ text }: { text: string }) { return <Text style={styles.fieldLabel}>{text}</Text>; }
function Choice({ label, selected, onPress, full = false }: { label: string; selected: boolean; onPress: () => void; full?: boolean }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.choice, full && styles.choiceFull, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: darkColors.overlayStrong },
  sheet: { maxHeight: '92%', paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[6], borderTopLeftRadius: radius.extraLarge, borderTopRightRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.backgroundElevated },
  handle: { alignSelf: 'center', width: 40, height: 4, marginBottom: spacing[3], borderRadius: radius.pill, backgroundColor: darkColors.borderStrong },
  form: { gap: spacing[3] }, header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] }, headerCopy: { flex: 1 },
  title: { ...typography.titleLarge, color: darkColors.textPrimary }, subtitle: { ...typography.bodyMedium, color: darkColors.textMuted, marginTop: 2 },
  closeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surface }, closeText: { color: darkColors.textPrimary, fontSize: 27 },
  fieldLabel: { ...typography.labelMedium, color: darkColors.textSecondary, marginBottom: -6 },
  input: { minHeight: 48, paddingHorizontal: spacing[3], borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface, color: darkColors.textPrimary, ...typography.bodyMedium },
  optionRow: { flexDirection: 'row', gap: spacing[2] }, choice: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[2], borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  choiceFull: { flex: 0, width: '100%' }, choiceSelected: { borderColor: darkColors.primary, backgroundColor: darkColors.primarySoft }, choiceText: { ...typography.labelMedium, color: darkColors.textMuted, textAlign: 'center' }, choiceTextSelected: { color: darkColors.textPrimary },
  iconRow: { flexDirection: 'row', gap: spacing[2] }, iconChoice: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface }, iconText: { fontSize: 20, color: darkColors.textMuted },
  colorRow: { flexDirection: 'row', gap: spacing[3] }, colorChoice: { width: 48, height: 48, borderRadius: radius.circle, borderWidth: 4, borderColor: darkColors.backgroundElevated }, colorSelected: { borderColor: darkColors.textPrimary }, sharingList: { gap: spacing[2] },
  primaryButton: { width: '100%', minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.primary }, primaryButtonText: { ...typography.labelLarge, color: darkColors.textPrimary }, buttonDisabled: { backgroundColor: darkColors.disabledSurface }, pressed: { opacity: 0.78 },
  confirmation: { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[6] }, confirmationIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 1 }, confirmationIconText: { fontSize: 30, fontWeight: '800' },
});
