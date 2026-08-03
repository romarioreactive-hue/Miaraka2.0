import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useLanguage } from '@/contexts/language-context';
import type { AvatarPickSource } from '@/services/avatar-service';
import { darkColors, radius, spacing, typography } from '@/theme';

interface AvatarPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPick: (source: AvatarPickSource) => void;
}

/**
 * Choix de la source d'une nouvelle photo de profil. La prise de photo par
 * l'appareil n'est proposée que sur mobile (iOS/Android) : sur le web, seule
 * la sélection depuis la galerie/l'explorateur de fichiers est pertinente.
 */
export function AvatarPickerSheet({ visible, onClose, onPick }: AvatarPickerSheetProps) {
  const { t } = useLanguage();

  return (
    <BottomSheet
      dismissible
      onClose={onClose}
      scrollable={false}
      title={t('profile.photoOptionsTitle')}
      visible={visible}>
      <View style={styles.options}>
        <OptionRow
          icon={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }}
          label={t('profile.chooseFromLibrary')}
          onPress={() => onPick('library')}
        />
        {Platform.OS !== 'web' ? (
          <OptionRow
            icon={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
            label={t('profile.takePhotoOption')}
            onPress={() => onPick('camera')}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}

function OptionRow({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof SymbolView>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.rowIcon}>
        <SymbolView name={icon} size={20} tintColor={darkColors.primary} weight="medium" />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  options: { gap: spacing[2], paddingBottom: spacing[2] },
  row: {
    alignItems: 'center',
    borderRadius: radius.medium,
    flexDirection: 'row',
    gap: spacing[3],
    minHeight: 56,
    paddingHorizontal: spacing[3],
  },
  rowPressed: { backgroundColor: darkColors.disabledSurface },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: darkColors.primarySoft,
    borderRadius: radius.medium,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowLabel: { ...typography.labelLarge, color: darkColors.textPrimary },
});
