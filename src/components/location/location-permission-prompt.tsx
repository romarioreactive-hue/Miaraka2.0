import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { GhostButton, PrimaryButton } from '@/components/ui/buttons';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

interface LocationPermissionPromptProps {
  onAllow: () => void;
  onLater: () => void;
}

/**
 * Explication Miaraka affichée AVANT la boîte de dialogue système de
 * localisation. onAllow() est le seul endroit de l'app qui déclenche la
 * vraie demande de permission (useLocation().requestPermission) — jamais
 * automatique au montage de l'écran (voir use-current-location.ts).
 */
export function LocationPermissionPrompt({ onAllow, onLater }: LocationPermissionPromptProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <SymbolView
          name={{ ios: 'location.fill', android: 'my_location', web: 'my_location' }}
          size={28}
          tintColor={darkColors.primary}
          weight="medium"
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{t('location.permissionPromptTitle')}</Text>
        <Text style={styles.body}>{t('location.permissionPromptBody')}</Text>
      </View>
      <PrimaryButton accessibilityLabel={t('location.permissionPromptAllow')} fullWidth label={t('location.permissionPromptAllow')} onPress={onAllow} />
      <GhostButton accessibilityLabel={t('location.permissionPromptLater')} fullWidth label={t('location.permissionPromptLater')} onPress={onLater} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: darkColors.surface,
    borderColor: darkColors.border,
    borderRadius: radius.extraLarge,
    borderWidth: 1,
    flex: 1,
    gap: spacing[4],
    justifyContent: 'center',
    padding: spacing[6],
  },
  icon: {
    alignItems: 'center',
    backgroundColor: darkColors.primarySoft,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  copy: {
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    ...typography.titleMedium,
    color: darkColors.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMedium,
    color: darkColors.textSecondary,
    textAlign: 'center',
  },
});
