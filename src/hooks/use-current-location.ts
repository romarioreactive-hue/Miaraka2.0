import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getCurrentLocation,
  getForegroundPermission,
  isLocationServicesEnabled,
  requestForegroundPermission,
  watchLocation,
  type LocationWatchHandle,
} from '@/services/location-service';
import type { LocationPermission, LocationSample, LocationServiceError, LocationState } from '@/types/location';

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

    const sample = await getCurrentLocation();
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
