import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth';
import { useLanguage } from '@/contexts/language-context';
import {
  createSpace,
  updateSpace,
  type Space,
  type SpaceType,
  type SpacesServiceError,
} from '@/services/spaces-service';
import { darkColors, groupColors, radius, spacing, typography } from '@/theme';

import { getSpacesErrorMessage } from './spaces-error-messages';

type SpaceFormSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Présent = mode édition de cet espace ; absent = mode création. */
  space?: Space | null;
  onCreated?: (space: Space) => void;
  onUpdated?: (space: Space) => void;
};

const TYPES: SpaceType[] = ['family', 'friends', 'team'];
const ICONS = ['⌂', '✦', '◆', '●'];
const COLORS = [groupColors.family, groupColors.friends, groupColors.team, darkColors.warning];

function typeLabelKey(type: SpaceType): 'groups.family' | 'groups.friends' | 'groups.team' {
  return type === 'family' ? 'groups.family' : type === 'friends' ? 'groups.friends' : 'groups.team';
}

export function SpaceFormSheet({ visible, onClose, space = null, onCreated, onUpdated }: SpaceFormSheetProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isEditMode = Boolean(space);

  const [name, setName] = useState('');
  const [type, setType] = useState<SpaceType>('family');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<string>(ICONS[0]);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setFormError(null);
    if (space) {
      setName(space.name);
      setType(space.type);
      setDescription(space.description ?? '');
      setIcon(space.icon || ICONS[0]);
      setColor(space.color || COLORS[0]);
    } else {
      setName('');
      setType('family');
      setDescription('');
      setIcon(ICONS[0]);
      setColor(COLORS[0]);
    }
  }, [visible, space]);

  function close() {
    if (submitting) return;
    onClose();
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setFormError(t('spaces.error.validation'));
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (space) {
        const updated = await updateSpace(space.id, {
          name,
          type,
          description: description.trim() || null,
          color,
          icon,
        });
        onUpdated?.(updated);
      } else {
        if (!user) throw { code: 'not_authenticated', message: 'not authenticated' } satisfies SpacesServiceError;
        const created = await createSpace(user.id, {
          name,
          type,
          description: description.trim() || null,
          color,
          icon,
        });
        onCreated?.(created);
      }
    } catch (error) {
      setFormError(getSpacesErrorMessage(t, (error as SpacesServiceError).code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable accessibilityLabel={t('common.close')} onPress={close} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text accessibilityRole="header" style={styles.title}>
                  {isEditMode ? t('spaces.editTitle') : t('spaces.create')}
                </Text>
                <Text style={styles.subtitle}>{isEditMode ? t('spaces.editSubtitle') : t('spaces.createSubtitle')}</Text>
              </View>
              <Pressable accessibilityLabel={t('common.close')} onPress={close} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            {formError ? <Text accessibilityRole="alert" style={styles.formError}>{formError}</Text> : null}

            <FieldLabel text={t('spaces.name')} />
            <TextInput
              accessibilityLabel={t('spaces.name')}
              editable={!submitting}
              onChangeText={setName}
              placeholder={t('spaces.namePlaceholder')}
              placeholderTextColor={darkColors.textMuted}
              style={styles.input}
              value={name}
            />

            <FieldLabel text={t('spaces.descriptionLabel')} />
            <TextInput
              accessibilityLabel={t('spaces.descriptionLabel')}
              editable={!submitting}
              multiline
              numberOfLines={3}
              onChangeText={setDescription}
              placeholder={t('spaces.descriptionPlaceholder')}
              placeholderTextColor={darkColors.textMuted}
              style={[styles.input, styles.multilineInput]}
              value={description}
            />

            <FieldLabel text={t('spaces.type')} />
            <View style={styles.optionRow}>
              {TYPES.map((item) => (
                <Choice
                  key={item}
                  disabled={submitting}
                  label={t(typeLabelKey(item))}
                  onPress={() => setType(item)}
                  selected={type === item}
                />
              ))}
            </View>

            <FieldLabel text={t('spaces.icon')} />
            <View style={styles.iconRow}>
              {ICONS.map((item) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: icon === item, disabled: submitting }}
                  disabled={submitting}
                  key={item}
                  onPress={() => setIcon(item)}
                  style={[styles.iconChoice, icon === item && styles.choiceSelected]}>
                  <Text style={[styles.iconText, icon === item && styles.choiceTextSelected]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <FieldLabel text={t('spaces.color')} />
            <View style={styles.colorRow}>
              {COLORS.map((item) => (
                <Pressable
                  accessibilityLabel={`Choisir la couleur ${item}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: color === item, disabled: submitting }}
                  disabled={submitting}
                  key={item}
                  onPress={() => setColor(item)}
                  style={[styles.colorChoice, { backgroundColor: item }, color === item && styles.colorSelected]}
                />
              ))}
            </View>

            <Pressable
              accessibilityState={{ disabled: !name.trim() || submitting, busy: submitting }}
              disabled={!name.trim() || submitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                (!name.trim() || submitting) && styles.buttonDisabled,
                pressed && styles.pressed,
              ]}>
              {submitting ? (
                <ActivityIndicator color={darkColors.textPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>{isEditMode ? t('spaces.editAction') : t('spaces.create')}</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

function Choice({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: darkColors.overlayStrong },
  sheet: { maxHeight: '92%', paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[6], borderTopLeftRadius: radius.extraLarge, borderTopRightRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.backgroundElevated },
  handle: { alignSelf: 'center', width: 40, height: 4, marginBottom: spacing[3], borderRadius: radius.pill, backgroundColor: darkColors.borderStrong },
  form: { gap: spacing[3] },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  headerCopy: { flex: 1 },
  title: { ...typography.titleLarge, color: darkColors.textPrimary },
  subtitle: { ...typography.bodyMedium, color: darkColors.textMuted, marginTop: 2 },
  closeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surface },
  closeText: { color: darkColors.textPrimary, fontSize: 27 },
  formError: { ...typography.caption, color: darkColors.error, backgroundColor: darkColors.errorSoft, borderRadius: radius.medium, padding: spacing[3] },
  fieldLabel: { ...typography.labelMedium, color: darkColors.textSecondary, marginBottom: -6 },
  input: { minHeight: 48, paddingHorizontal: spacing[3], paddingVertical: spacing[3], borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface, color: darkColors.textPrimary, ...typography.bodyMedium },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', gap: spacing[2] },
  choice: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[2], borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  choiceSelected: { borderColor: darkColors.primary, backgroundColor: darkColors.primarySoft },
  choiceText: { ...typography.labelMedium, color: darkColors.textMuted, textAlign: 'center' },
  choiceTextSelected: { color: darkColors.textPrimary },
  iconRow: { flexDirection: 'row', gap: spacing[2] },
  iconChoice: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  iconText: { fontSize: 20, color: darkColors.textMuted },
  colorRow: { flexDirection: 'row', gap: spacing[3] },
  colorChoice: { width: 48, height: 48, borderRadius: radius.circle, borderWidth: 4, borderColor: darkColors.backgroundElevated },
  colorSelected: { borderColor: darkColors.textPrimary },
  primaryButton: { width: '100%', minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.primary },
  primaryButtonText: { ...typography.labelLarge, color: darkColors.textPrimary },
  buttonDisabled: { backgroundColor: darkColors.disabledSurface },
  pressed: { opacity: 0.78 },
});
