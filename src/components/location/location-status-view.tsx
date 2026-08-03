import { SymbolView } from 'expo-symbols';
import { Linking, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing } from '@/theme';
import type { LocationPermission, LocationServiceError, LocationStatus } from '@/types/location';

import { getLocationErrorMessage } from './location-error-messages';

interface LocationStatusViewProps {
  status: LocationStatus;
  permission: LocationPermission;
  error: LocationServiceError | null;
  onRetry: () => void;
}

/**
 * Couvre tous les états autres que "position disponible" : demande de
 * permission, permission refusée ou bloquée, GPS désactivé, recherche en
 * cours, position indisponible/erreur. L'écran appelant n'affiche la carte
 * que lorsqu'une mesure existe ; pour tout le reste, il délègue ici (voir
 * my-location-screen.tsx).
 */
export function LocationStatusView({ status, permission, error, onRetry }: LocationStatusViewProps) {
  const { t } = useLanguage();

  if (status === 'available') {
    // L'écran appelant n'affiche jamais LocationStatusView dans ce cas ;
    // ce garde-fou évite juste un état incohérent si jamais il l'était.
    return null;
  }

  if (status === 'idle' || status === 'permission_undetermined' || status === 'requesting_permission') {
    return <Loading fullScreen label={t('location.requestingPermissionLabel')} />;
  }

  if (status === 'locating') {
    return <Loading fullScreen label={t('location.locatingLabel')} />;
  }

  if (status === 'permission_denied') {
    // "Bloquée" (canAskAgain: false) : l'OS ne réaffichera plus jamais la
    // boîte de dialogue, seuls les réglages système permettent de corriger.
    if (!permission.canAskAgain) {
      return (
        <EmptyState
          actionLabel={t('location.openSettings')}
          description={t('location.permissionBlockedDescription')}
          icon={<SymbolView name={{ ios: 'location.slash.fill', android: 'location_disabled', web: 'location_disabled' }} size={28} tintColor={darkColors.primary} weight="medium" />}
          onAction={() => void Linking.openSettings()}
          style={styles.state}
          title={t('location.permissionBlockedTitle')}
        />
      );
    }

    return (
      <EmptyState
        actionLabel={t('common.retry')}
        description={t('location.permissionDeniedDescription')}
        icon={<SymbolView name={{ ios: 'location.slash.fill', android: 'location_disabled', web: 'location_disabled' }} size={28} tintColor={darkColors.primary} weight="medium" />}
        onAction={onRetry}
        onSecondaryAction={() => void Linking.openSettings()}
        secondaryActionLabel={t('location.openSettings')}
        style={styles.state}
        title={t('location.permissionDeniedTitle')}
      />
    );
  }

  if (status === 'services_disabled') {
    return (
      <EmptyState
        actionLabel={t('common.retry')}
        description={t('location.servicesDisabledDescription')}
        icon={<SymbolView name={{ ios: 'location.slash', android: 'gps_off', web: 'gps_off' }} size={28} tintColor={darkColors.primary} weight="medium" />}
        onAction={onRetry}
        style={styles.state}
        title={t('location.servicesDisabledTitle')}
      />
    );
  }

  // status === 'error' || status === 'unavailable'
  return (
    <EmptyState
      actionLabel={t('common.retry')}
      description={error ? getLocationErrorMessage(t, error.code) : t('location.unavailableDescription')}
      icon={<SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'error_outline', web: 'error_outline' }} size={28} tintColor={darkColors.primary} weight="medium" />}
      onAction={onRetry}
      style={styles.state}
      title={t('location.errorTitle')}
    />
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
    borderRadius: radius.extraLarge,
    backgroundColor: darkColors.surface,
  },
});
