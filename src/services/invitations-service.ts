import type { PostgrestError } from '@supabase/supabase-js';

import { getSpaceMembers, type SpaceType } from '@/services/spaces-service';
import { supabase } from '@/lib/supabase';

/**
 * Types alignés strictement sur database.sql : public.invitations.
 *   status check (status in ('pending', 'accepted', 'declined'))
 * sender_id, receiver_id, space_id et created_at sont immuables côté base
 * (trigger handle_invitation_update) : ce service ne tente jamais de les
 * modifier après création.
 */
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface InvitationProfile {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface InvitationSpace {
  id: string;
  name: string;
  type: SpaceType;
  color: string | null;
  icon: string | null;
}

export interface Invitation {
  id: string;
  senderId: string;
  receiverId: string;
  spaceId: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  sender: InvitationProfile | null;
  receiver: InvitationProfile | null;
  space: InvitationSpace | null;
}

/** Résultat de recherche via la fonction SQL public.search_profiles (voir supabase/profile-search-function.sql). */
export interface SearchedProfile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  maskedEmail: string;
  /** 'member' si déjà dans l'espace ciblé, 'pending' si une invitation est déjà en attente, sinon 'none'. */
  status: 'none' | 'pending' | 'member';
}

export interface SendInvitationInput {
  senderId: string;
  receiverId: string;
  spaceId: string;
}

export type InvitationsErrorCode =
  | 'not_authenticated'
  | 'self_invite'
  | 'duplicate_pending'
  | 'already_member'
  | 'not_authorized'
  | 'not_found'
  | 'already_processed'
  | 'validation_failed'
  | 'network_error'
  | 'unknown';

export interface InvitationsServiceError {
  code: InvitationsErrorCode;
  message: string;
  cause?: unknown;
}

function createError(code: InvitationsErrorCode, message: string, cause?: unknown): InvitationsServiceError {
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

function toInvitationsError(error: unknown): InvitationsServiceError {
  if (isPostgrestError(error)) {
    if (error.code === '23505') {
      return createError('duplicate_pending', 'Une invitation est déjà en attente pour cette personne dans cet espace.', error);
    }
    if (error.code === '23514') {
      return createError('self_invite', 'Vous ne pouvez pas vous inviter vous-même.', error);
    }
    if (error.code === 'PGRST116') {
      return createError('not_found', "Invitation introuvable, ou vous n'y avez plus accès.", error);
    }
    if (error.code === '42501') {
      return createError('not_authorized', "Vous n'avez pas le droit d'effectuer cette action.", error);
    }
    if (error.code === 'P0001' && /déjà membre/i.test(error.message)) {
      return createError('already_member', 'Cette personne est déjà membre de cet espace.', error);
    }
    if (error.code === 'P0001' && /(déjà traitée|immuables)/i.test(error.message)) {
      return createError('already_processed', 'Cette invitation a déjà été traitée.', error);
    }
    return createError('unknown', error.message, error);
  }

  if (error instanceof TypeError && /network|fetch/i.test(error.message)) {
    return createError('network_error', 'Connexion au serveur impossible. Vérifiez votre réseau.', error);
  }

  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    // Déjà une InvitationsServiceError (ex. levée volontairement par ce service).
    return error as InvitationsServiceError;
  }

  if (error instanceof Error) {
    return createError('unknown', error.message, error);
  }

  return createError('unknown', 'Une erreur inattendue est survenue.', error);
}

// -----------------------------------------------------------------------------
// Mapping snake_case (DB) -> camelCase (app)
// -----------------------------------------------------------------------------

interface InvitationProfileRow {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface InvitationSpaceRow {
  id: string;
  name: string;
  type: SpaceType;
  color: string | null;
  icon: string | null;
}

interface InvitationRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  space_id: string;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
  sender?: InvitationProfileRow | null;
  receiver?: InvitationProfileRow | null;
  space?: InvitationSpaceRow | null;
}

function mapProfile(row: InvitationProfileRow | null | undefined): InvitationProfile | null {
  if (!row) return null;
  return { id: row.id, fullName: row.full_name, email: row.email, avatarUrl: row.avatar_url };
}

function mapSpace(row: InvitationSpaceRow | null | undefined): InvitationSpace | null {
  if (!row) return null;
  return { id: row.id, name: row.name, type: row.type, color: row.color, icon: row.icon };
}

function mapInvitationRow(row: InvitationRow): Invitation {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    spaceId: row.space_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sender: mapProfile(row.sender),
    receiver: mapProfile(row.receiver),
    space: mapSpace(row.space),
  };
}

interface SearchProfileRpcRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  masked_email: string;
}

// -----------------------------------------------------------------------------
// Recherche de profils (pour inviter quelqu'un)
// -----------------------------------------------------------------------------

const SEARCH_MIN_LENGTH = 2;
const SEARCH_RESULT_LIMIT = 20;

/**
 * Recherche des profils par nom ou e-mail via la fonction SQL sécurisée
 * public.search_profiles (voir supabase/profile-search-function.sql).
 * Annote chaque résultat avec son statut vis-à-vis de l'espace ciblé
 * (déjà membre / invitation déjà en attente / aucun) en réutilisant les
 * membres déjà chargés (spaces-service.getSpaceMembers) et les invitations
 * déjà envoyées par l'utilisateur pour cet espace.
 *
 * Ne renvoie rien si la requête fait moins de 2 caractères (anti-énumération,
 * cohérent avec la garde côté fonction SQL).
 */
export async function searchProfiles(query: string, spaceId: string, userId: string): Promise<SearchedProfile[]> {
  const trimmed = query.trim();
  if (trimmed.length < SEARCH_MIN_LENGTH) return [];

  const [rpcResult, members, sentInvitations] = await Promise.all([
    supabase.rpc('search_profiles', { search_query: trimmed, limit_count: SEARCH_RESULT_LIMIT }),
    getSpaceMembers(spaceId),
    getSentInvitations(userId, { spaceId }),
  ]);

  if (rpcResult.error) throw toInvitationsError(rpcResult.error);

  const memberIds = new Set(members.map((member) => member.profileId));
  const pendingReceiverIds = new Set(
    sentInvitations.filter((invitation) => invitation.status === 'pending').map((invitation) => invitation.receiverId),
  );

  return ((rpcResult.data ?? []) as SearchProfileRpcRow[]).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    maskedEmail: row.masked_email,
    status: memberIds.has(row.id) ? 'member' : pendingReceiverIds.has(row.id) ? 'pending' : 'none',
  }));
}

// -----------------------------------------------------------------------------
// Lecture des invitations
// -----------------------------------------------------------------------------

/** Invitations reçues par l'utilisateur, avec l'expéditeur et l'espace concerné. */
export async function getReceivedInvitations(userId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, sender:sender_id(id, full_name, email, avatar_url), space:space_id(id, name, type, color, icon)')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw toInvitationsError(error);
  return (data ?? []).map((row) => mapInvitationRow(row as unknown as InvitationRow));
}

/** Invitations envoyées par l'utilisateur, avec le destinataire et l'espace concerné. Filtre optionnel par espace. */
export async function getSentInvitations(userId: string, options?: { spaceId?: string }): Promise<Invitation[]> {
  let query = supabase
    .from('invitations')
    .select('*, receiver:receiver_id(id, full_name, email, avatar_url), space:space_id(id, name, type, color, icon)')
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });

  if (options?.spaceId) {
    query = query.eq('space_id', options.spaceId);
  }

  const { data, error } = await query;
  if (error) throw toInvitationsError(error);
  return (data ?? []).map((row) => mapInvitationRow(row as unknown as InvitationRow));
}

// -----------------------------------------------------------------------------
// Écriture
// -----------------------------------------------------------------------------

/**
 * Envoie une invitation. La base refuse déjà, indépendamment de ce contrôle
 * client :
 *   - l'auto-invitation (contrainte check sender_id <> receiver_id) ;
 *   - les doublons "pending" pour le même espace/destinataire (index unique) ;
 *   - l'envoi par un simple membre : seuls owner et admin peuvent inviter
 *     (policy invitations_insert_admin_only, voir
 *     supabase/invitations-security-patch.sql) ;
 *   - l'invitation d'une personne déjà membre de l'espace, à la fois via
 *     cette même policy et via un trigger indépendant
 *     (prevent_invite_existing_member), qui s'applique même à un appel
 *     direct contournant RLS.
 * Ce contrôle client (auto-invitation) ne fait qu'anticiper l'erreur avec un
 * message clair avant l'aller-retour réseau ; searchProfiles filtre aussi
 * les profils déjà membres/déjà invités côté interface, en complément.
 *
 * IMPORTANT : ces protections owner/admin et anti-membre-existant ne
 * s'appliquent qu'après exécution de supabase/invitations-security-patch.sql.
 */
// NOTE POUR L'ÉTAPE "NOTIFICATIONS" : idéalement, l'envoi d'une invitation
// devrait aussi créer une ligne dans public.notifications pour le
// destinataire. Ce n'est PAS fait ici volontairement : la table
// notifications n'a aucune policy RLS "insert" pour le rôle authenticated
// (voir database.sql, section 5.9 — commentaire "Créée uniquement côté
// serveur"), donc un insert direct depuis ce service échouerait (et le
// contourner via une fonction SECURITY DEFINER n'a pas été demandé dans
// cette mission). À construire à l'étape Notifications, par exemple via une
// fonction SQL dédiée ou une Edge Function déclenchée par le trigger
// d'insertion sur invitations.
export async function sendInvitation(input: SendInvitationInput): Promise<Invitation> {
  if (!input.senderId) throw createError('not_authenticated', 'Vous devez être connecté.');
  if (input.senderId === input.receiverId) {
    throw createError('self_invite', 'Vous ne pouvez pas vous inviter vous-même.');
  }

  const { data, error } = await supabase
    .from('invitations')
    .insert({ sender_id: input.senderId, receiver_id: input.receiverId, space_id: input.spaceId })
    .select('*, receiver:receiver_id(id, full_name, email, avatar_url), space:space_id(id, name, type, color, icon)')
    .single();

  if (error) throw toInvitationsError(error);
  return mapInvitationRow(data as unknown as InvitationRow);
}

/**
 * Accepte une invitation reçue. Le trigger handle_invitation_update ajoute
 * automatiquement le destinataire dans space_members : aucune insertion
 * manuelle n'est nécessaire ici.
 */
export async function acceptInvitation(invitationId: string): Promise<Invitation> {
  const { data, error } = await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId)
    .select('*, sender:sender_id(id, full_name, email, avatar_url), space:space_id(id, name, type, color, icon)')
    .single();

  if (error) throw toInvitationsError(error);
  return mapInvitationRow(data as unknown as InvitationRow);
}

/** Refuse une invitation reçue. */
export async function declineInvitation(invitationId: string): Promise<Invitation> {
  const { data, error } = await supabase
    .from('invitations')
    .update({ status: 'declined' })
    .eq('id', invitationId)
    .select('*, sender:sender_id(id, full_name, email, avatar_url), space:space_id(id, name, type, color, icon)')
    .single();

  if (error) throw toInvitationsError(error);
  return mapInvitationRow(data as unknown as InvitationRow);
}

/** Annule une invitation envoyée, uniquement si elle est encore "pending" (imposé par la policy RLS de suppression). */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const { data, error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .select('id');

  if (error) throw toInvitationsError(error);
  if (!data || data.length === 0) {
    throw createError('not_authorized', "Cette invitation n'est plus annulable (déjà traitée, ou vous n'en êtes pas l'expéditeur).");
  }
}
