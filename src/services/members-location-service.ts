import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { SpaceType } from '@/services/spaces-service';

/**
 * Aligné strictement sur database.sql : public.locations, public.profiles,
 * public.space_members, public.spaces. La policy "locations_select_self_or_shared"
 * est l'AUTORITÉ FINALE sur qui est visible : ce service ne fait que lire ce
 * que Supabase/RLS accepte déjà de renvoyer — jamais de re-filtrage "en
 * plus" côté client qui pourrait diverger de RLS, jamais de service_role.
 *
 * Champs exposés : profile_id, full_name, avatar_url, latitude, longitude,
 * accuracy, speed, heading, updated_at, et les espaces communs. Jamais
 * l'e-mail, le téléphone, ni public.location_history (historique).
 */

export type MembersLocationErrorCode = 'not_authenticated' | 'network_error' | 'unknown';

export interface MembersLocationServiceError {
  code: MembersLocationErrorCode;
  message: string;
  cause?: unknown;
}

export interface VisibleMemberSpace {
  id: string;
  name: string;
  type: SpaceType;
}

export interface VisibleMemberLocation {
  profileId: string;
  fullName: string | null;
  avatarUrl: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  updatedAt: string;
  /**
   * Tous les espaces partagés avec l'utilisateur connecté (jamais vide :
   * cette ligne n'existe que parce qu'au moins un espace est commun). Un
   * membre présent dans plusieurs espaces communs n'apparaît qu'une seule
   * fois dans les résultats, avec la liste complète ici.
   */
  spaces: VisibleMemberSpace[];
}

function createError(code: MembersLocationErrorCode, message: string, cause?: unknown): MembersLocationServiceError {
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

function toMembersLocationError(error: unknown): MembersLocationServiceError {
  if (isPostgrestError(error)) return createError('unknown', error.message, error);
  if (error instanceof TypeError && /network|fetch/i.test(error.message)) {
    return createError('network_error', 'Connexion au serveur impossible. Vérifiez votre réseau.', error);
  }
  if (error instanceof Error) return createError('unknown', error.message, error);
  return createError('unknown', 'Une erreur inattendue est survenue.', error);
}

// -----------------------------------------------------------------------------
// Lignes brutes (snake_case)
// -----------------------------------------------------------------------------

interface SpaceRef {
  id: string;
  name: string;
  type: SpaceType;
}

interface SpaceMembershipRow {
  space_id: string;
  spaces: SpaceRef | null;
}

interface MemberRow {
  profile_id: string;
  spaces: SpaceRef | null;
  profiles: { id: string; full_name: string | null; avatar_url: string | null } | null;
}

interface LocationRow {
  profile_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  updated_at: string;
}

const LOCATION_COLUMNS = 'profile_id, latitude, longitude, accuracy, heading, speed, updated_at';

/**
 * Espaces dont l'utilisateur connecté est membre. Base de tous les autres
 * appels de ce service : on ne regarde jamais les membres d'un espace
 * auquel on n'appartient pas (policy space_members_select_members :
 * private.is_space_member).
 */
async function getMySpaceRefs(userId: string): Promise<SpaceRef[]> {
  const { data, error } = await supabase
    .from('space_members')
    .select('space_id, spaces(id, name, type)')
    .eq('profile_id', userId);

  if (error) throw toMembersLocationError(error);

  return ((data ?? []) as unknown as SpaceMembershipRow[])
    .map((row) => row.spaces)
    .filter((space): space is SpaceRef => space !== null);
}

/**
 * Construit la liste des membres visibles pour un ensemble d'espaces déjà
 * connus comme "les miens". Deux requêtes seulement, quel que soit le
 * nombre de membres (pas de N+1) :
 *   1. tous les membres de ces espaces (avec profil et espace embarqués) ;
 *   2. leurs positions — RLS filtre déjà aux profils ayant activé
 *      share_location, aucune vérification manuelle nécessaire ici.
 */
async function buildVisibleMembers(userId: string, spaceIds: string[]): Promise<VisibleMemberLocation[]> {
  if (spaceIds.length === 0) return [];

  const { data: memberRows, error: memberError } = await supabase
    .from('space_members')
    .select('profile_id, spaces(id, name, type), profiles(id, full_name, avatar_url)')
    .in('space_id', spaceIds)
    .neq('profile_id', userId);

  if (memberError) throw toMembersLocationError(memberError);

  const byProfile = new Map<string, { fullName: string | null; avatarUrl: string | null; spaces: VisibleMemberSpace[] }>();
  for (const row of (memberRows ?? []) as unknown as MemberRow[]) {
    if (!row.profiles || !row.spaces) continue;
    const space: VisibleMemberSpace = { id: row.spaces.id, name: row.spaces.name, type: row.spaces.type };
    const existing = byProfile.get(row.profile_id);
    if (existing) {
      if (!existing.spaces.some((s) => s.id === space.id)) existing.spaces.push(space);
    } else {
      byProfile.set(row.profile_id, { fullName: row.profiles.full_name, avatarUrl: row.profiles.avatar_url, spaces: [space] });
    }
  }

  const profileIds = [...byProfile.keys()];
  if (profileIds.length === 0) return [];

  const { data: locationRows, error: locationError } = await supabase
    .from('locations')
    .select(LOCATION_COLUMNS)
    .in('profile_id', profileIds);

  if (locationError) throw toMembersLocationError(locationError);

  return ((locationRows ?? []) as unknown as LocationRow[])
    .map((row): VisibleMemberLocation | null => {
      const member = byProfile.get(row.profile_id);
      if (!member) return null;
      return {
        profileId: row.profile_id,
        fullName: member.fullName,
        avatarUrl: member.avatarUrl,
        latitude: row.latitude,
        longitude: row.longitude,
        accuracy: row.accuracy,
        speed: row.speed,
        heading: row.heading,
        updatedAt: row.updated_at,
        spaces: member.spaces,
      };
    })
    .filter((entry): entry is VisibleMemberLocation => entry !== null);
}

/**
 * Tous les membres visibles (position autorisée par RLS) de TOUS les
 * espaces de l'utilisateur connecté, dédupliqués — un membre présent dans
 * plusieurs espaces communs n'apparaît qu'une seule fois.
 */
export async function getVisibleMembersLocations(userId: string): Promise<VisibleMemberLocation[]> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');
  const mySpaces = await getMySpaceRefs(userId);
  return buildVisibleMembers(userId, mySpaces.map((space) => space.id));
}

/**
 * Membres visibles d'UN espace précis. Si l'utilisateur n'est pas membre de
 * cet espace, la policy space_members_select_members ne renverra aucune
 * ligne : liste vide, sans erreur.
 */
export async function getVisibleMembersBySpace(userId: string, spaceId: string): Promise<VisibleMemberLocation[]> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');
  return buildVisibleMembers(userId, [spaceId]);
}

/** Position d'un membre précis, ou `null` s'il n'est pas visible (aucun espace commun, ou partage désactivé). */
export async function getMemberLocationById(userId: string, memberProfileId: string): Promise<VisibleMemberLocation | null> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');
  const mySpaces = await getMySpaceRefs(userId);
  const members = await buildVisibleMembers(userId, mySpaces.map((space) => space.id));
  return members.find((member) => member.profileId === memberProfileId) ?? null;
}
