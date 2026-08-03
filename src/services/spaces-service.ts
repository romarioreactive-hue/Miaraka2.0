import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/**
 * Types alignés strictement sur database.sql : public.spaces et
 * public.space_members. Aucune colonne ni valeur n'est inventée ici.
 *   - spaces.type      check (type in ('family', 'friends', 'team'))
 *   - space_members.role check (role in ('owner', 'admin', 'member'))
 * Il n'existe pas de rôle "viewer" dans le schéma.
 */
export type SpaceType = 'family' | 'friends' | 'team';
export type SpaceRole = 'owner' | 'admin' | 'member';

export interface Space {
  id: string;
  ownerId: string;
  name: string;
  type: SpaceType;
  description: string | null;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Espace tel que renvoyé dans la liste "mes espaces" : inclut le rôle et le nombre de membres calculés côté client. */
export interface SpaceSummary extends Space {
  myRole: SpaceRole;
  memberCount: number;
}

export interface SpaceMemberProfile {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface SpaceMember {
  id: string;
  spaceId: string;
  profileId: string;
  role: SpaceRole;
  joinedAt: string;
  profile: SpaceMemberProfile | null;
}

export interface CreateSpaceInput {
  name: string;
  type: SpaceType;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

export interface UpdateSpaceInput {
  name?: string;
  type?: SpaceType;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

export type SpacesErrorCode =
  | 'not_authenticated'
  | 'not_found'
  | 'validation_failed'
  | 'owner_cannot_leave'
  | 'network_error'
  | 'unknown';

export interface SpacesServiceError {
  code: SpacesErrorCode;
  message: string;
  cause?: unknown;
}

function createError(code: SpacesErrorCode, message: string, cause?: unknown): SpacesServiceError {
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

function toSpacesError(error: unknown): SpacesServiceError {
  if (isPostgrestError(error)) {
    // PGRST116 : aucune ligne ne correspond au .single() attendu. RLS et
    // "absent" produisent volontairement la même réponse côté Supabase :
    // impossible (et pas souhaitable) de distinguer les deux ici.
    if (error.code === 'PGRST116') {
      return createError('not_found', "Espace introuvable, ou vous n'y avez plus accès.", error);
    }
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

interface SpaceRow {
  id: string;
  owner_id: string;
  name: string;
  type: SpaceType;
  description: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

interface SpaceMemberRow {
  id: string;
  space_id: string;
  profile_id: string;
  role: SpaceRole;
  joined_at: string;
}

interface SpaceMemberWithProfileRow extends SpaceMemberRow {
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

function mapSpaceRow(row: SpaceRow): Space {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    type: row.type,
    description: row.description,
    color: row.color,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSpaceMemberRow(row: SpaceMemberWithProfileRow): SpaceMember {
  return {
    id: row.id,
    spaceId: row.space_id,
    profileId: row.profile_id,
    role: row.role,
    joinedAt: row.joined_at,
    profile: row.profiles
      ? {
          id: row.profiles.id,
          fullName: row.profiles.full_name,
          email: row.profiles.email,
          avatarUrl: row.profiles.avatar_url,
        }
      : null,
  };
}

// -----------------------------------------------------------------------------
// Requêtes
// -----------------------------------------------------------------------------

/**
 * Les espaces de l'utilisateur connecté. RLS (spaces_select_members) filtre
 * déjà aux espaces dont il est membre : aucun filtre explicite nécessaire.
 * Le rôle et le nombre de membres sont calculés à partir de space_members,
 * inclus dans la même requête.
 */
export async function getMySpaces(userId: string): Promise<SpaceSummary[]> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');

  const { data, error } = await supabase
    .from('spaces')
    .select('*, space_members(id, profile_id, role)')
    .order('created_at', { ascending: false });

  if (error) throw toSpacesError(error);

  return (data ?? []).map((row) => {
    const space = mapSpaceRow(row as SpaceRow);
    const members = (row as unknown as { space_members: { profile_id: string; role: SpaceRole }[] }).space_members ?? [];
    const mine = members.find((member) => member.profile_id === userId);
    return {
      ...space,
      myRole: mine?.role ?? 'member',
      memberCount: members.length,
    };
  });
}

/** Un espace précis. Erreur 'not_found' si absent ou si l'utilisateur n'y a pas accès (RLS). */
export async function getSpaceById(spaceId: string): Promise<Space> {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .single();

  if (error) throw toSpacesError(error);
  return mapSpaceRow(data as SpaceRow);
}

/** Membres d'un espace, avec leur profil (nom, e-mail, photo). Triés par ancienneté (le propriétaire arrive en premier). */
export async function getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
  const { data, error } = await supabase
    .from('space_members')
    .select('id, space_id, profile_id, role, joined_at, profiles(id, full_name, email, avatar_url)')
    .eq('space_id', spaceId)
    .order('joined_at', { ascending: true });

  if (error) throw toSpacesError(error);
  return (data ?? []).map((row) => mapSpaceMemberRow(row as unknown as SpaceMemberWithProfileRow));
}

/**
 * Crée un espace. owner_id doit être l'utilisateur connecté (policy
 * spaces_insert_owner). Le trigger on_space_created ajoute automatiquement
 * le créateur dans space_members avec le rôle "owner" : aucune insertion
 * manuelle dans space_members n'est nécessaire ici.
 */
export async function createSpace(userId: string, input: CreateSpaceInput): Promise<Space> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');
  if (!input.name.trim()) throw createError('validation_failed', "Le nom de l'espace est obligatoire.");

  const { data, error } = await supabase
    .from('spaces')
    .insert({
      owner_id: userId,
      name: input.name.trim(),
      type: input.type,
      description: input.description?.trim() || null,
      color: input.color ?? null,
      icon: input.icon ?? null,
    })
    .select('*')
    .single();

  if (error) throw toSpacesError(error);
  return mapSpaceRow(data as SpaceRow);
}

/**
 * Met à jour un espace. Ne touche jamais owner_id (immuable côté base,
 * protégé par le trigger protect_space_owner). Autorisé pour owner ou admin
 * (policy spaces_update_admins) ; RLS reste l'autorité finale.
 */
export async function updateSpace(spaceId: string, input: UpdateSpaceInput): Promise<Space> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) {
    if (!input.name.trim()) throw createError('validation_failed', "Le nom de l'espace est obligatoire.");
    payload.name = input.name.trim();
  }
  if (input.type !== undefined) payload.type = input.type;
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.color !== undefined) payload.color = input.color;
  if (input.icon !== undefined) payload.icon = input.icon;

  const { data, error } = await supabase
    .from('spaces')
    .update(payload)
    .eq('id', spaceId)
    .select('*')
    .single();

  if (error) throw toSpacesError(error);
  return mapSpaceRow(data as SpaceRow);
}

/**
 * Quitte un espace (supprime sa propre ligne space_members). Le
 * propriétaire ne peut pas quitter ainsi : database.sql ne prévoit aucun
 * transfert de propriété (owner_id est immuable), donc un owner qui quitte
 * laisserait un espace orphelin qu'il ne pourrait plus ni voir ni gérer. La
 * seule sortie propre pour un owner est de supprimer l'espace
 * (deleteSpace), qui supprime aussi tous les membres (on delete cascade).
 */
export async function leaveSpace(space: { id: string; ownerId: string }, userId: string): Promise<void> {
  if (!userId) throw createError('not_authenticated', 'Vous devez être connecté.');
  if (space.ownerId === userId) {
    throw createError(
      'owner_cannot_leave',
      "En tant que propriétaire, vous ne pouvez pas quitter cet espace. Supprimez-le si vous ne souhaitez plus le garder.",
    );
  }

  const { data, error } = await supabase
    .from('space_members')
    .delete()
    .eq('space_id', space.id)
    .eq('profile_id', userId)
    .select('id');

  if (error) throw toSpacesError(error);
  if (!data || data.length === 0) {
    throw createError('not_found', "Vous n'êtes pas membre de cet espace.");
  }
}

/**
 * Supprime un espace. Réservé au propriétaire réel (policy
 * spaces_delete_owner : owner_id = auth.uid()). Un rôle "admin" dans
 * space_members ne suffit pas, conformément à la base. La suppression
 * entraîne la suppression en cascade de space_members, invitations et
 * challenges de l'espace (on delete cascade défini dans database.sql).
 */
export async function deleteSpace(spaceId: string): Promise<void> {
  const { data, error } = await supabase
    .from('spaces')
    .delete()
    .eq('id', spaceId)
    .select('id');

  if (error) throw toSpacesError(error);
  if (!data || data.length === 0) {
    throw createError('not_found', "Vous n'avez pas le droit de supprimer cet espace, ou il n'existe plus.");
  }
}
