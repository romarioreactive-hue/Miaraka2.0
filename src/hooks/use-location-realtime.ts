import { useEffect, useRef, useState } from 'react';

import type { RealtimeChannel } from '@supabase/supabase-js';

import {
  subscribeToLocationSharingChanges,
  subscribeToVisibleLocations,
  unsubscribeFromLocationRealtime,
  type LocationRealtimeConnectionStatus,
} from '@/services/location-realtime-service';

export interface UseLocationRealtimeOptions {
  userId: string | null;
  /** Écran Carte actif et utilisateur authentifié. `false` désabonne immédiatement. */
  enabled: boolean;
  /** Appelé après chaque événement Realtime — typiquement membersLocations.refresh(). Ne reçoit jamais le contenu du payload. */
  onChange: () => void;
}

/**
 * Branche UN SEUL jeu d'abonnements Realtime (locations + mes propres
 * réglages de partage) tant que l'écran Carte est actif. Se désabonne
 * proprement au démontage, à la déconnexion (userId devient `null`), et
 * avant toute réouverture (cleanup de useEffect, exécuté avant chaque
 * nouvelle exécution de l'effet) — jamais deux canaux ouverts en parallèle
 * pour le même flux.
 *
 * Le statut retourné reflète uniquement le canal principal (locations) :
 * c'est celui qui détermine si "voir les membres en direct" fonctionne
 * réellement. Le canal secondaire (réglages de partage) reste best-effort
 * et silencieux.
 */
export function useLocationRealtime({ userId, enabled, onChange }: UseLocationRealtimeOptions): LocationRealtimeConnectionStatus {
  const [status, setStatus] = useState<LocationRealtimeConnectionStatus>('connecting');
  const channelsRef = useRef<RealtimeChannel[]>([]);

  // Toujours la dernière closure de onChange, sans faire de onChange une
  // dépendance de l'effet ci-dessous (qui ré-abonnerait à chaque render si
  // l'appelant passait une fonction inline plutôt qu'une référence stable).
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled || !userId) {
      unsubscribeFromLocationRealtime(channelsRef.current);
      channelsRef.current = [];
      setStatus('connecting');
      return;
    }

    const locationsChannel = subscribeToVisibleLocations({
      onChange: () => onChangeRef.current(),
      onStatusChange: setStatus,
    });
    const sharingChannel = subscribeToLocationSharingChanges(userId, {
      onChange: () => onChangeRef.current(),
      onStatusChange: () => {},
    });

    channelsRef.current = [locationsChannel, sharingChannel];

    return () => {
      unsubscribeFromLocationRealtime(channelsRef.current);
      channelsRef.current = [];
    };
  }, [enabled, userId]);

  return status;
}
