import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DemoModeBanner } from '@/components/ui/demo-mode-banner';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

import { INITIAL_PLACES, PHOTO_TONES, PLACE_TYPE_ICON, Place, PlaceType } from './places-data';

type PlacesSheetProps = { visible: boolean; onClose: () => void };

export function PlacesSheet({ visible, onClose }: PlacesSheetProps) {
  const { t } = useLanguage();
  const [places, setPlaces] = useState<Place[]>(INITIAL_PLACES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  function handleCreated(place: Place) {
    setPlaces((current) => [...current, place]);
    setIsCreateOpen(false);
  }

  return (
    <>
      <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible && !isCreateOpen}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
          <Pressable accessibilityLabel={t('common.close')} onPress={onClose} style={styles.backdrop} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>{t('places.subtitle')}</Text>
                <Text accessibilityRole="header" style={styles.title}>{t('places.title')}</Text>
              </View>
              <Pressable accessibilityLabel={t('common.close')} onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <DemoModeBanner style={styles.demoBanner} />

            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {places.map((place) => (
                <View key={place.id} style={styles.placeRow}>
                  <View style={[styles.placePhoto, { backgroundColor: `${place.photoTone}26`, borderColor: `${place.photoTone}55` }]}>
                    <Text style={[styles.placeIcon, { color: place.photoTone }]}>{PLACE_TYPE_ICON[place.type]}</Text>
                  </View>
                  <View style={styles.placeCopy}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text numberOfLines={1} style={styles.placeAddress}>⌖  {place.address}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>
              ))}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => setIsCreateOpen(true)}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
              <Text style={styles.addPlus}>＋</Text>
              <Text style={styles.addText}>{t('places.addPlace')}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CreatePlaceSheet onClose={() => setIsCreateOpen(false)} onCreated={handleCreated} visible={isCreateOpen} />
    </>
  );
}

type CreatePlaceSheetProps = { visible: boolean; onClose: () => void; onCreated: (place: Place) => void };

const TYPES: PlaceType[] = ['maison', 'bureau', 'personnalise'];

function CreatePlaceSheet({ visible, onClose, onCreated }: CreatePlaceSheetProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [type, setType] = useState<PlaceType>('personnalise');
  const [address, setAddress] = useState('');
  const [photoTone, setPhotoTone] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  function reset() {
    setName('');
    setType('personnalise');
    setAddress('');
    setPhotoTone(null);
    setCreated(false);
  }

  function close() {
    reset();
    onClose();
  }

  function capturePhoto() {
    const next = PHOTO_TONES[Math.floor(Math.random() * PHOTO_TONES.length)];
    setPhotoTone(next);
  }

  function save() {
    if (!name.trim()) return;
    onCreated({
      id: `place-${Date.now()}`,
      name: name.trim(),
      type,
      address: address.trim() || t('places.addressFallback'),
      photoTone: photoTone ?? PHOTO_TONES[0],
    });
    setCreated(true);
  }

  return (
    <Modal animationType="slide" onRequestClose={close} transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable accessibilityLabel={t('common.close')} onPress={close} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {created ? (
            <View style={styles.confirmation}>
              <View style={styles.confirmationIcon}><Text style={styles.confirmationIconText}>✓</Text></View>
              <Text accessibilityRole="header" style={styles.title}>{t('places.created')}</Text>
              <Text style={styles.confirmationText}>{t('places.createdMessage', { name })}</Text>
              <Pressable onPress={close} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{t('common.finish')}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text accessibilityRole="header" style={styles.title}>{t('places.createTitle')}</Text>
                <Pressable accessibilityLabel={t('common.close')} onPress={close} style={styles.closeButton}>
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.photoSection}>
                  <Pressable
                    accessibilityLabel={t('places.takePhoto')}
                    onPress={capturePhoto}
                    style={[styles.photoCircle, photoTone ? { backgroundColor: `${photoTone}30`, borderColor: photoTone } : null]}>
                    {photoTone ? (
                      <Text style={[styles.photoCheck, { color: photoTone }]}>✓</Text>
                    ) : (
                      <SymbolView
                        name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                        size={26}
                        tintColor={darkColors.textMuted}
                        weight="medium"
                      />
                    )}
                  </Pressable>
                  <Text style={styles.photoLabel}>{photoTone ? t('places.photoCaptured') : t('places.takePhoto')}</Text>
                  <Text style={styles.photoHint}>{t('places.photoFake')}</Text>
                </View>

                <Text style={styles.label}>{t('places.name')}</Text>
                <TextInput
                  onChangeText={setName}
                  placeholder={t('places.namePlaceholder')}
                  placeholderTextColor={darkColors.textMuted}
                  style={styles.input}
                  value={name}
                />

                <Text style={styles.label}>{t('places.type')}</Text>
                <View style={styles.typeRow}>
                  {TYPES.map((item) => {
                    const selected = item === type;
                    return (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        key={item}
                        onPress={() => setType(item)}
                        style={[styles.typeButton, selected && styles.typeButtonActive]}>
                        <Text style={styles.typeIcon}>{PLACE_TYPE_ICON[item]}</Text>
                        <Text style={[styles.typeText, selected && styles.typeTextActive]}>
                          {item === 'maison' ? t('places.home') : item === 'bureau' ? t('places.office') : t('places.custom')}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.label}>{t('places.address')}</Text>
                <TextInput
                  onChangeText={setAddress}
                  placeholder={t('places.addressPlaceholder')}
                  placeholderTextColor={darkColors.textMuted}
                  style={styles.input}
                  value={address}
                />
              </ScrollView>

              <Pressable
                accessibilityState={{ disabled: !name.trim() }}
                disabled={!name.trim()}
                onPress={save}
                style={({ pressed }) => [styles.primaryButton, !name.trim() && styles.disabledButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>{t('common.save')}</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: darkColors.overlayStrong },
  sheet: {
    maxHeight: '90%',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[6],
    borderTopLeftRadius: radius.extraLarge,
    borderTopRightRadius: radius.extraLarge,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.backgroundElevated,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: radius.pill, backgroundColor: darkColors.borderStrong, marginBottom: spacing[3] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3], minHeight: 48, marginBottom: spacing[2] },
  demoBanner: { marginBottom: spacing[3] },
  headerCopy: { flex: 1 },
  eyebrow: { ...typography.caption, color: darkColors.accent, fontWeight: '700', letterSpacing: 1.1 },
  title: { ...typography.titleLarge, color: darkColors.textPrimary },
  closeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, backgroundColor: darkColors.surface },
  closeText: { color: darkColors.textPrimary, fontSize: 27 },
  list: { gap: spacing[2], paddingBottom: spacing[3] },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 72,
    padding: spacing[3],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surface,
  },
  placePhoto: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.large, borderWidth: 1 },
  placeIcon: { fontSize: 20, fontWeight: '800' },
  placeCopy: { flex: 1, minWidth: 0 },
  placeName: { ...typography.labelLarge, color: darkColors.textPrimary },
  placeAddress: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  chevron: { color: darkColors.textMuted, fontSize: 26, fontWeight: '300' },
  addButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.pill,
    backgroundColor: darkColors.primary,
  },
  addPlus: { color: darkColors.textInverse, fontSize: 20, fontWeight: '700' },
  addText: { ...typography.labelLarge, color: darkColors.textInverse },
  pressed: { opacity: 0.78 },
  form: { gap: spacing[4], paddingBottom: spacing[2] },
  photoSection: { alignItems: 'center', gap: spacing[1] },
  photoCircle: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circle,
    borderWidth: 2,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surface,
  },
  photoCheck: { fontSize: 30, fontWeight: '900' },
  photoLabel: { ...typography.labelMedium, color: darkColors.textPrimary, marginTop: spacing[2] },
  photoHint: { ...typography.caption, color: darkColors.textMuted },
  label: { ...typography.labelMedium, color: darkColors.textSecondary },
  input: {
    minHeight: 48,
    marginTop: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surface,
    color: darkColors.textPrimary,
    ...typography.bodyMedium,
  },
  typeRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[1] },
  typeButton: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surface,
  },
  typeButtonActive: { borderColor: darkColors.primary, backgroundColor: darkColors.primarySoft },
  typeIcon: { fontSize: 18, color: darkColors.textPrimary },
  typeText: { ...typography.caption, color: darkColors.textMuted, fontWeight: '700' },
  typeTextActive: { color: darkColors.primary },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: darkColors.primary, marginTop: spacing[2] },
  primaryButtonText: { ...typography.labelLarge, color: darkColors.textInverse },
  disabledButton: { backgroundColor: darkColors.disabledSurface },
  confirmation: { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[8] },
  confirmationIcon: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circle,
    backgroundColor: darkColors.successSoft,
    borderWidth: 1,
    borderColor: darkColors.success,
  },
  confirmationIconText: { color: darkColors.success, fontSize: 29, fontWeight: '900' },
  confirmationText: { ...typography.bodyMedium, color: darkColors.textSecondary, textAlign: 'center' },
});
