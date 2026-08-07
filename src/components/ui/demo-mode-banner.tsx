import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

export type DemoModeBannerProps = {
  style?: StyleProp<ViewStyle>;
};

/**
 * Bandeau explicite « données de démonstration » : à poser en tête de tout
 * écran dont le contenu n'est pas (encore) relié à une vraie source
 * (Supabase, capteur…), pour ne jamais laisser un utilisateur réellement
 * connecté croire qu'une valeur fictive (pas, calories, défis, suggestions
 * de lieux…) le concerne vraiment. Voir la mission « audit des données
 * fictives » : catégorie C — isoler clairement le mode démo plutôt que de
 * supprimer une interface pour laquelle aucune vraie source n'existe encore.
 */
export function DemoModeBanner({ style }: DemoModeBannerProps) {
  const { t } = useLanguage();

  return (
    <View style={[styles.banner, style]}>
      <SymbolView name={{ ios: 'wand.and.stars', android: 'auto_awesome', web: 'auto_awesome' }} size={16} tintColor={darkColors.warning} weight="medium" />
      <View style={styles.copy}>
        <Text style={styles.title}>{t('common.demoModeTitle')}</Text>
        <Text style={styles.hint}>{t('common.demoModeHint')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: darkColors.warningSoft,
    backgroundColor: darkColors.warningSoft,
  },
  copy: { flex: 1, gap: 2 },
  title: { ...typography.labelMedium, color: darkColors.textPrimary },
  hint: { ...typography.caption, color: darkColors.textSecondary },
});
