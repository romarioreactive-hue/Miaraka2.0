import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  getCurrentLocation,
  getForegroundPermission,
  isLocationServicesEnabled,
  requestForegroundPermission,
  watchLocation,
  type LocationWatchHandle,
} from '@/services/location-service';
import type { LocationPermission, LocationSample, LocationServiceError, LocationState } from '@/types/location';

/**
 * Instrumentation temporaire de diagnostic (voir demande "diagnostiquer
 * l'échec de navigator.geolocation") : contrairement aux logs habituels
 * gardés par `__DEV__`, ceux-ci restent volontairement dans le bundle de
 * production pour rester visibles dans la console du navigateur sur le
 * déploiement Vercel réel. À retirer une fois la cause confirmée.
 */
function geoLog(...args: unknown[]): void {
  console.log('[GEO]', ...args);
}

export interface UseCurrentLocationOptions {
  /** Suit la position en continu (watchPositionAsync) plutôt qu'une seule lecture. @default true */
  watch?: boolean;
}

const initialState: LocationState = {
  status: 'idle',
  permission: { state: 'undetermined', canAskAgain: true },
  sample: null,
  error: null,
};

/**
 * Hook autonome : gère à lui seul la permission, la lecture et (par défaut)
 * le suivi continu de la position de l'utilisateur. Utilisable directement
 * dans n'importe quel composant, sans dépendre de LocationProvider.
 *
 * Ne demande JAMAIS la permission système de lui-même au montage : il se
 * contente de vérifier l'état actuel (getForegroundPermission, sans boîte de
 * dialogue). C'est à l'écran appelant d'afficher sa propre explication
 * (voir LocationPermissionPrompt) puis d'appeler requestPermission() en
 * réponse à un geste explicite de l'utilisateur — c'est ce moment-là qui
 * déclenche la vraie demande système (requestForegroundPermissionsAsync).
 *
 * Plusieurs composants qui appellent chacun useCurrentLocation() démarrent
 * chacun leur propre abonnement GPS indépendant. Si plusieurs parties de
 * l'app doivent partager UNE SEULE position (éviter les abonnements GPS en
 * double, les demandes de permission redondantes), utiliser LocationProvider
 * + useLocation() à la place (src/lib/location) : LocationProvider appelle
 * ce hook une seule fois et redistribue son résultat via le contexte React.
 */
export function useCurrentLocation(options: UseCurrentLocationOptions = {}): LocationState & {
  requestPermission: () => Promise<void>;
  refresh: () => Promise<LocationSample | null>;
} {
  const { watch = true } = options;
  const [state, setState] = useState<LocationState>(initialState);
  const mountedRef = useRef(true);
  const watchHandleRef = useRef<LocationWatchHandle | null>(null);

  const stopWatch = useCallback(() => {
    watchHandleRef.current?.remove();
    watchHandleRef.current = null;
  }, []);

  /** Enchaîne services activés → lecture → suivi continu. Suppose la permission déjà accordée. */
  const proceedAfterPermission = useCallback(async (permission: LocationPermission) => {
    const servicesEnabled = await isLocationServicesEnabled();
    if (!mountedRef.current) return;
    if (!servicesEnabled) {
      setState({ status: 'services_disabled', permission, sample: null, error: null });
      return;
    }

    setState((current) => ({ ...current, status: 'locating', permission }));

    // Voir node_modules/expo-location/src/ExpoLocation.web.ts:
    // getCurrentPositionAsync({ accuracy: Balanced }) appelle
    // navigator.geolocation.getCurrentPosition avec
    // { maximumAge: Infinity, enableHighAccuracy: (accuracy > Balanced) = false, ...options }
    // — aucun `timeout` explicite n'est ajouté, donc le défaut navigateur
    // (aucune limite) s'applique. Valeurs déduites de la lecture du code
    // source, pas mesurées en direct (le navigateur n'expose pas les
    // options utilisées après coup).
    geoLog('requesting position — options (via expo-location, accuracy=Balanced): enableHighAccuracy=false, maximumAge=Infinity, timeout=non défini (défaut navigateur)');

    let sample: LocationSample;
    try {
      sample = await getCurrentLocation();
    } catch (error) {
      const serviceError = error as LocationServiceError;
      // `cause` porte l'objet GeolocationPositionError brut du navigateur :
      // voir location-service.ts (`createError('unavailable', ..., error)`)
      // et ExpoLocation.web.ts (`reject` passé tel quel comme error callback
      // de navigator.geolocation.getCurrentPosition).
      const rawError = serviceError?.cause as GeolocationPositionError | undefined;
      geoLog('error code:', rawError?.code);
      geoLog('error message:', rawError?.message ?? serviceError?.message);
      if (rawError?.code === 1) geoLog('error PERMISSION_DENIED');
      else if (rawError?.code === 2) geoLog('error POSITION_UNAVAILABLE');
      else if (rawError?.code === 3) geoLog('error TIMEOUT');
      throw error; // comportement inchangé : propage exactement comme avant, seul le log est ajouté.
    }
    geoLog('success:', sample.coords);

    if (!mountedRef.current) return;
    setState({ status: 'available', permission, sample, error: null });

    if (watch) {
      const handle = await watchLocation(
        (nextSample) => {
          if (mountedRef.current) {
            setState((current) => ({ ...current, status: 'available', sample: nextSample, error: null }));
          }
        },
        (watchError) => {
          if (mountedRef.current) {
            setState((current) => ({ ...current, status: 'error', error: watchError }));
          }
        },
      );
      if (mountedRef.current) {
        watchHandleRef.current = handle;
      } else {
        handle.remove();
      }
    }
  }, [watch]);

  /** Appelé au montage : vérifie la permission SANS afficher de boîte de dialogue système. */
  const checkOnly = useCallback(async () => {
    try {
      const permission = await getForegroundPermission();
      geoLog('permission (expo-location getForegroundPermissionsAsync):', permission.state, 'canAskAgain:', permission.canAskAgain);
      if (!mountedRef.current) return;

      if (permission.state === 'granted') {
        await proceedAfterPermission(permission);
        return;
      }

      setState({ status: 'permission_undetermined', permission, sample: null, error: null });
    } catch {
      // Plateforme sans API de vérification de permission (ex. anciens
      // navigateurs) : on retombe sur l'explication Miaraka, qui déclenchera
      // la vraie demande système via requestPermission().
      if (mountedRef.current) {
        setState({
          status: 'permission_undetermined',
          permission: { state: 'undetermined', canAskAgain: true },
          sample: null,
          error: null,
        });
      }
    }
  }, [proceedAfterPermission]);

  /** Appelé uniquement en réponse à un geste utilisateur (bouton "Autoriser") : affiche la boîte de dialogue système. */
  const requestPermission = useCallback(async () => {
    stopWatch();
    setState((current) => ({ ...current, status: 'requesting_permission', error: null }));

    try {
      const permission = await requestForegroundPermission();
      if (!mountedRef.current) return;

      if (permission.state !== 'granted') {
        setState({ status: 'permission_denied', permission, sample: null, error: null });
        return;
      }

      await proceedAfterPermission(permission);
    } catch (error) {
      if (mountedRef.current) {
        setState((current) => ({ ...current, status: 'error', error: error as LocationServiceError }));
      }
    }
  }, [proceedAfterPermission, stopWatch]);

  useEffect(() => {
    mountedRef.current = true;
    void checkOnly();

    return () => {
      mountedRef.current = false;
      stopWatch();
    };
  }, [checkOnly, stopWatch]);

  // ---- Instrumentation temporaire de diagnostic (voir demande) ----
  // Sonde directe des API navigateur, indépendante d'expo-location, pour
  // confirmer ce que le navigateur expose réellement sur ce déploiement.
  // Purement observationnel : ne déclenche aucune demande de position, ne
  // modifie aucun état de ce hook.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined') return;

    geoLog('navigator.geolocation:', 'geolocation' in navigator);
    geoLog('navigator.permissions:', 'permissions' in navigator);

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => geoLog('permission (navigator.permissions.query):', result.state))
        .catch((error) => geoLog('navigator.permissions.query a échoué:', error));
    }
  }, []);

  const refresh = useCallback(async (): Promise<LocationSample | null> => {
    setState((current) => ({ ...current, status: 'locating', error: null }));
    try {
      const sample = await getCurrentLocation();
      if (mountedRef.current) {
        setState((current) => ({ ...current, status: 'available', sample, error: null }));
      }
      return sample;
    } catch (error) {
      if (mountedRef.current) {
        setState((current) => ({ ...current, status: 'error', error: error as LocationServiceError }));
      }
      return null;
    }
  }, []);

  return { ...state, requestPermission, refresh };
}
