import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { LocationSample } from '@/types/location';

/**
 * Aligné strictement sur database.sql : public.locations (une seule ligne
 * par profil — contrainte "unique" sur profile_id, voir section 1.5) et
 * public.user_settings.share_location (section 1.10). Aucune colonne
 * inventée : `battery` existe dans le schéma mais n'est jamais envoyée
 * ici — aucune source de données réelle n'est encore branchée (voir
 * docs/LOCATION.md "Évolutions prévues" : expo-battery, non installé).
 */

export type LocationSyncErrorCode =
  | 'not_authenticated'
  | 'validation_failed'
  | 'network_error'
  | 'unknown';

export interface LocationSyncServiceError {
  code: LocationSyncErrorCode;
  message: string;
  cause?: unknown;
}

/** Ligne public.locations, normalisée en camelCase pour l'application. */
export interface SyncedLocation {
  profileId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  /** Toujours `null` tant qu'aucune source de batterie réelle n'est branchée : voir saveCurrentLocation(). */
  battery: number | null;
  isMoving: boolean;
  updatedAt: string;
}

function createError(code: LocationSyncErrorCode, message: string, cause?: unknown): LocationSyncServiceError {
  return { code, message, cause };
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error &&
    'hint' in error
  );
}

function toLocationSyncError(error: unknown): LocationSyncServiceError {
  if (isPostgrestError(error)) {
    return createError('unknown', error.message, error);
  }
  if (error instanceof TypeError && /network|fetch/i.test(error.message)) {
    return createError('network_error', 'Connexion au serveur impossible. Vérifiez votre réseau.', error);
  }
  if (error instanceof Error) {
    return createError('unknown', error.message, error);
  }
  return createError('unknown', 'Une erreur inattendue est survenue.', error);
}

// -----------------------------------------------------------------------------
// Mapping snake_case (DB) -> camelCase (app)
// -----------------------------------------------------------------------------

interface LocationRow {
  profile_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  battery: number | null;
  is_moving: boolean;
  updated_at: string;
}

function mapLocationRow(row: LocationRow): SyncedLocation {
  return {
    profileId: row.profile_id,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracy: row.accuracy,
    altitude: row.altitude,
    heading: row.heading,
    speed: row.speed,
    battery: row.battery,
    isMoving: row.is_moving,
    updatedAt: row.updated_at,
  };
}

const LOCATION_COLUMNS = 'profile_id, latitude, longitude, accuracy, altitude, heading, speed, battery, is_moving, updated_at';

/** Vitesse (m/s) au-dessus de laquelle la position est considérée "en mouvement". ~1 m/s ≈ marche lente : évite de marquer "en mouvement" à cause du seul bruit GPS à l'arrêt. */
const MOVING_SPEED_THRESHOLD_MS = 1;

// -----------------------------------------------------------------------------
// Réglage de partage (user_settings.share_location)
// -----------------------------------------------------------------------------

/**
 * État actuel du partage. `false` par défaut (colonne "not null default
 * false" dans database.sql) : le partage est désactivé tant que
 * l'utilisateur ne l'a jamais activé explicitement.
 */
export async function getLocationSharingSetting(userId: string): Promise<boolean> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');

  const { data, error } = await supabase
    .from('user_settings')
    .select('share_location')
    .eq('profile_id', userId)
    .maybeSingle();

  if (error) throw toLocationSyncError(error);
  // Ligne absente : handle_new_user() la crée normalement à l'inscription,
  // mais on ne suppose jamais sa présence. false = comportement par défaut du schéma.
  return data?.share_location ?? false;
}

/**
 * Active ou désactive le partage. upsert (pas un simple update) : la ligne
 * user_settings existe normalement déjà (créée par handle_new_user), mais
 * upsert reste sûr si elle manquait — les policies user_settings_insert_self
 * et user_settings_update_self couvrent les deux cas, toutes deux
 * restreintes à profile_id = auth.uid().
 */
export async function setLocationSharingSetting(userId: string, enabled: boolean): Promise<boolean> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ profile_id: userId, share_location: enabled }, { onConflict: 'profile_id' })
    .select('share_location')
    .single();

  if (error) throw toLocationSyncError(error);
  return data.share_location;
}

/**
 * Désactive le partage (raccourci sémantique de setLocationSharingSetting).
 * Ne touche jamais à public.locations : la dernière position connue reste
 * en base (voir mission "ne pas supprimer automatiquement... sauf si le
 * modèle produit l'exige" — non exigé à cette étape).
 */
export async function stopLocationSharing(userId: string): Promise<void> {
  await setLocationSharingSetting(userId, false);
}

// -----------------------------------------------------------------------------
// Position (public.locations)
// -----------------------------------------------------------------------------

/**
 * Enregistre la position actuelle. upsert sur profile_id (contrainte
 * "unique" de public.locations) : met à jour la ligne existante au lieu
 * d'en créer une nouvelle — aucun doublon possible.
 *
 * `battery` n'est jamais inclus dans le payload envoyé : PostgREST ne
 * modifie que les colonnes présentes dans l'upsert, donc cette colonne
 * reste intacte (NULL à la création, jamais écrasée ensuite) tant qu'aucune
 * source de batterie réelle n'est branchée à l'application.
 *
 * `updated_at` n'est pas non plus envoyé : la colonne a son propre défaut
 * ("default now()") à la création et le trigger set_updated_at la met à
 * jour à chaque modification — la laisser au serveur évite de dépendre de
 * l'horloge de l'appareil.
 */
export async function saveCurrentLocation(userId: string, sample: LocationSample): Promise<SyncedLocation> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');

  const { data, error } = await supabase
    .from('locations')
    .upsert(
      {
        profile_id: userId,
        latitude: sample.coords.latitude,
        longitude: sample.coords.longitude,
        accuracy: sample.accuracy,
        altitude: sample.altitude,
        heading: sample.heading,
        speed: sample.speed,
        is_moving: typeof sample.speed === 'number' && sample.speed > MOVING_SPEED_THRESHOLD_MS,
      },
      { onConflict: 'profile_id' },
    )
    .select(LOCATION_COLUMNS)
    .single();

  if (error) throw toLocationSyncError(error);
  return mapLocationRow(data as LocationRow);
}

/** Dernière position enregistrée pour l'utilisateur connecté, ou `null` si aucune n'existe encore. */
export async function getMyCurrentLocation(userId: string): Promise<SyncedLocation | null> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');

  const { data, error } = await supabase
    .from('locations')
    .select(LOCATION_COLUMNS)
    .eq('profile_id', userId)
    .maybeSingle();

  if (error) throw toLocationSyncError(error);
  return data ? mapLocationRow(data as LocationRow) : null;
}
