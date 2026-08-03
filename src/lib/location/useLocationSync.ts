import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/auth';
import {
  getLocationSharingSetting,
  saveCurrentLocation,
  setLocationSharingSetting,
  stopLocationSharing,
  type LocationSyncServiceError,
} from '@/services/location-sync-service';
import type { Coordinates } from '@/types/location';
import { distanceMeters } from '@/utils/geo-distance';

import { useLocation } from './useLocation';

export type LocationSyncStatus =
  | 'disabled'
  | 'enabling'
  | 'active'
  | 'permission_required'
  | 'sync_failed'
  | 'offline';

export interface LocationSyncState {
  status: LocationSyncStatus;
  /** Horodatage (updated_at) de la dernière écriture réussie dans public.locations. */
  lastSyncedAt: string | null;
  error: LocationSyncServiceError | null;
}

export interface UseLocationSyncResult extends LocationSyncState {
  /** Active ou désactive le partage (interrupteur "Partager ma position"). */
  setEnabled: (enabled: boolean) => void;
}

/** Fenêtre minimale entre deux écritures Supabase, même si la position change à chaque échantillon GPS. */
const MIN_SYNC_INTERVAL_MS = 15_000;
/** Déplacement minimal (mètres) pour justifier une resynchronisation avant l'expiration de MIN_SYNC_INTERVAL_MS. */
const MIN_SYNC_DISTANCE_METERS = 15;
/** Au-delà de cette imprécision (mètres), la mesure est ignorée : ni envoyée, ni comptée comme un échec. */
const MAX_ACCEPTABLE_ACCURACY_METERS = 100;

/**
 * Synchronise vers Supabase la position DÉJÀ fournie par useCurrentLocation
 * (via useLocation()) quand le partage est actif — n'ouvre jamais son
 * propre watchPositionAsync. Doit donc être utilisé à l'intérieur d'un
 * <LocationProvider> (voir my-location-screen.tsx, seul endroit où le GPS
 * est suivi au premier plan).
 *
 * Aucun timer : entièrement réactif aux changements de `sample` produits
 * par le suivi GPS existant, donc rien à nettoyer explicitement au
 * démontage au-delà de l'abonnement React habituel (mountedRef).
 *
 * Anti-spam : une écriture au minimum toutes les MIN_SYNC_INTERVAL_MS, ou
 * plus tôt si l'utilisateur s'est déplacé d'au moins MIN_SYNC_DISTANCE_METERS.
 * Les mesures trop imprécises (accuracy > MAX_ACCEPTABLE_ACCURACY_METERS)
 * sont ignorées. Une écriture en cours bloque la suivante (pas d'appels
 * Supabase en parallèle).
 *
 * Reconnexion réseau : un échec ne déclenche aucune boucle de nouvelle
 * tentative — le prochain échantillon GPS (throttlé normalement) retente
 * naturellement, sans timer dédié.
 */
export function useLocationSync(): UseLocationSyncResult {
  const { user, status: authStatus } = useAuth();
  const { sample } = useLocation();
  const userId = user?.id ?? null;

  const [enabled, setEnabledState] = useState(false);
  const [state, setState] = useState<LocationSyncState>({ status: 'disabled', lastSyncedAt: null, error: null });

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const lastSyncRef = useRef<{ at: number; coords: Coordinates } | null>(null);
  const inFlightRef = useRef(false);

  // Reflète un partage déjà activé lors d'une session précédente (share_location persiste en base).
  useEffect(() => {
    if (authStatus !== 'authenticated' || !userId) return;

    getLocationSharingSetting(userId)
      .then((shared) => {
        if (mountedRef.current) setEnabledState(shared);
      })
      .catch(() => {
        // Reste désactivé par défaut si la lecture échoue : ne jamais partager sans confirmation explicite.
      });
  }, [authStatus, userId]);

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'disabled', lastSyncedAt: null, error: null });
      lastSyncRef.current = null;
      return;
    }

    if (authStatus !== 'authenticated' || !userId) {
      setState({ status: 'disabled', lastSyncedAt: null, error: null });
      return;
    }

    if (!sample) {
      setState((current) => ({ status: 'permission_required', lastSyncedAt: current.lastSyncedAt, error: null }));
      return;
    }

    if (inFlightRef.current) return;

    const accuracyOk = sample.accuracy == null || sample.accuracy <= MAX_ACCEPTABLE_ACCURACY_METERS;
    if (!accuracyOk) return;

    const previous = lastSyncRef.current;
    const elapsedMs = previous ? Date.now() - previous.at : Infinity;
    const movedMeters = previous ? distanceMeters(previous.coords, sample.coords) : Infinity;
    const shouldSync = !previous || elapsedMs >= MIN_SYNC_INTERVAL_MS || movedMeters >= MIN_SYNC_DISTANCE_METERS;
    if (!shouldSync) return;

    inFlightRef.current = true;
    setState((current) => ({ status: current.status === 'active' ? 'active' : 'enabling', lastSyncedAt: current.lastSyncedAt, error: null }));

    saveCurrentLocation(userId, sample)
      .then((saved) => {
        if (!mountedRef.current) return;
        lastSyncRef.current = { at: Date.now(), coords: sample.coords };
        setState({ status: 'active', lastSyncedAt: saved.updatedAt, error: null });
      })
      .catch((error: LocationSyncServiceError) => {
        if (!mountedRef.current) return;
        setState((current) => ({
          status: error.code === 'network_error' ? 'offline' : 'sync_failed',
          lastSyncedAt: current.lastSyncedAt,
          error,
        }));
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [enabled, authStatus, userId, sample]);

  const setEnabled = useCallback(
    (next: boolean) => {
      if (!userId) return;
      setEnabledState(next);
      setState((current) => ({ status: next ? 'enabling' : 'disabled', lastSyncedAt: current.lastSyncedAt, error: null }));

      const persist = next ? setLocationSharingSetting(userId, true) : stopLocationSharing(userId);
      persist.catch((error: LocationSyncServiceError) => {
        if (!mountedRef.current) return;
        // Le réglage n'a pas pu être écrit dans Supabase : on revient à l'état
        // précédent plutôt que de laisser l'interrupteur mentir sur l'état réel.
        setEnabledState(!next);
        setState({ status: next ? 'sync_failed' : 'disabled', lastSyncedAt: null, error });
      });
    },
    [userId],
  );

  return { ...state, setEnabled };
}
