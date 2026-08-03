import { REALTIME_SUBSCRIBE_STATES, type RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/**
 * Abonnements Supabase Realtime (postgres_changes) pour l'onglet Carte.
 * Aucun payload n'est jamais fait confiance directement : chaque événement
 * ne sert qu'à déclencher un rechargement via
 * src/services/members-location-service.ts (getVisibleMembersLocations),
 * qui repasse par les policies RLS — seule autorité sur ce qui est visible.
 *
 * Les deux tables écoutées doivent être ajoutées à la publication
 * "supabase_realtime" côté base (voir supabase/enable-location-realtime.sql,
 * non exécuté automatiquement). Tant que ce n'est pas fait, les canaux
 * restent ouverts mais ne reçoivent jamais d'événement — le rechargement
 * périodique existant (use-members-locations.ts) reste alors le seul moyen
 * de voir les changements, sans que rien ne casse.
 */

export type LocationRealtimeConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'closed';

export interface LocationRealtimeCallbacks {
  /**
   * Appelé après un événement INSERT/UPDATE/DELETE sur la table écoutée.
   * Ne reçoit JAMAIS le contenu de la ligne modifiée : uniquement un signal
   * "quelque chose a changé, recharge les membres visibles".
   */
  onChange: () => void;
  onStatusChange: (status: LocationRealtimeConnectionStatus) => void;
}

function mapSubscribeState(state: REALTIME_SUBSCRIBE_STATES): LocationRealtimeConnectionStatus {
  switch (state) {
    case REALTIME_SUBSCRIBE_STATES.SUBSCRIBED:
      return 'connected';
    case REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR:
    case REALTIME_SUBSCRIBE_STATES.TIMED_OUT:
      // Transitoire : le client Realtime retente lui-même de rejoindre le
      // canal. On le présente comme "reconnexion", pas comme un échec
      // définitif — voir useLocationRealtime / LOCATION.md.
      return 'reconnecting';
    case REALTIME_SUBSCRIBE_STATES.CLOSED:
    default:
      return 'closed';
  }
}

/**
 * Abonnement aux changements de public.locations (INSERT/UPDATE/DELETE),
 * sans filtre `filter:` : la table est protégée par RLS
 * (locations_select_self_or_shared), donc Supabase Realtime n'achemine déjà
 * que les lignes que l'utilisateur connecté est autorisé à lire (sa propre
 * position, et celle des membres qui partagent un espace avec lui et ont
 * activé share_location). C'est le canal principal de l'onglet Carte.
 */
export function subscribeToVisibleLocations({ onChange, onStatusChange }: LocationRealtimeCallbacks): RealtimeChannel {
  return supabase
    .channel('realtime:locations-visible')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
      onChange();
    })
    .subscribe((status) => {
      onStatusChange(mapSubscribeState(status));
    });
}

/**
 * Abonnement aux changements de MES PROPRES réglages de partage
 * (public.user_settings, filtré à profile_id = userId). La policy
 * user_settings_select_self limite structurellement ce canal au profil de
 * l'utilisateur connecté : ce canal garde seulement CET appareil synchronisé
 * si le réglage change ailleurs (autre onglet/appareil) — il ne permet PAS
 * de détecter qu'un autre membre a coupé son partage (voir
 * supabase/enable-location-realtime.sql pour le détail).
 */
export function subscribeToLocationSharingChanges(userId: string, { onChange, onStatusChange }: LocationRealtimeCallbacks): RealtimeChannel {
  return supabase
    .channel(`realtime:user-settings-sharing:${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'user_settings', filter: `profile_id=eq.${userId}` },
      () => {
        onChange();
      },
    )
    .subscribe((status) => {
      onStatusChange(mapSubscribeState(status));
    });
}

/**
 * Désabonne et ferme un ou plusieurs canaux — utilisé au démontage de
 * l'écran Carte, à la déconnexion, et juste avant d'ouvrir un nouvel
 * abonnement (jamais deux canaux actifs pour le même flux).
 */
export function unsubscribeFromLocationRealtime(channels: (RealtimeChannel | null | undefined)[]): void {
  channels.forEach((channel) => {
    if (channel) void supabase.removeChannel(channel);
  });
}
