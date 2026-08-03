-- =============================================================================
-- MIARAKA — CORRECTIF DE SÉCURITÉ : ENVOI D'INVITATIONS
-- =============================================================================
-- CE FICHIER N'EST PAS EXÉCUTÉ AUTOMATIQUEMENT. À auditer, puis exécuter
-- manuellement dans l'éditeur SQL Supabase si vous validez l'audit.
--
-- À exécuter APRÈS database.sql (déjà fait) ET APRÈS
-- supabase/profile-search-function.sql, dans cet ordre précis. Voir la note
-- d'ordre d'exécution à la fin de ce fichier.
--
-- CE QUE CE CORRECTIF CHANGE
--   A. Remplace la policy INSERT de public.invitations : seuls owner et
--      admin d'un espace peuvent désormais envoyer une invitation (avant :
--      n'importe quel membre le pouvait).
--   B. Ajoute un trigger BEFORE INSERT sur public.invitations qui refuse
--      d'inviter une personne déjà membre de l'espace. Ce trigger s'applique
--      à TOUTE tentative d'insertion, quel que soit le rôle appelant (y
--      compris service_role, qui contourne RLS) : c'est une seconde barrière
--      indépendante de la policy, pas juste une reformulation.
--
-- CE QUE CE CORRECTIF NE TOUCHE PAS (déjà correct, vérifié ci-dessous)
--   - L'auto-invitation reste bloquée par la contrainte
--     check(sender_id <> receiver_id) de database.sql.
--   - Les doublons "pending" restent bloqués par l'index unique
--     invitations_unique_pending_idx de database.sql.
--   - Seul le destinataire peut accepter/refuser (policy
--     invitations_update_receiver_only, inchangée).
--   - Seul l'expéditeur peut annuler une invitation pending (policy
--     invitations_delete_sender_pending, inchangée).
--   - Le trigger handle_invitation_update (database.sql) continue d'ajouter
--     automatiquement le membre après acceptation, sans changement.
--
-- RÉ-EXÉCUTABLE : chaque policy est supprimée avant d'être recréée, la
-- fonction trigger utilise "create or replace", le trigger est supprimé
-- avant d'être recréé. Relancer ce script plusieurs fois est sans danger.
-- =============================================================================


-- =============================================================================
-- A. POLICY INSERT — owner/admin uniquement, receveur pas déjà membre
-- =============================================================================
-- Ancienne policy supprimée : "invitations_insert_member_of_space"
-- (with check (sender_id = auth.uid() and private.is_space_member(space_id)))
-- — autorisait n'importe quel membre à inviter, sans vérifier si le
-- destinataire était déjà dans l'espace.

drop policy if exists "invitations_insert_member_of_space" on public.invitations;
drop policy if exists "invitations_insert_admin_only" on public.invitations;

create policy "invitations_insert_admin_only"
  on public.invitations for insert
  to authenticated
  with check (
    -- Redondant avec "to authenticated" mais explicite : auth.uid() doit
    -- correspondre à un utilisateur authentifié réel.
    auth.uid() is not null
    and sender_id = auth.uid()
    and receiver_id <> auth.uid()
    -- Seuls owner et admin de l'espace peuvent inviter (private.is_space_admin
    -- couvre les deux rôles, voir database.sql section 3.2).
    and private.is_space_admin(space_id)
    -- Le destinataire ne doit pas déjà être membre de cet espace.
    and not private.is_space_member(space_id, receiver_id)
  );

comment on policy "invitations_insert_admin_only" on public.invitations is
  'Seuls owner/admin de l''espace peuvent inviter ; jamais soi-même, jamais '
  'un membre déjà présent.';

-- Le "pas de doublon pending" n'est volontairement pas répété ici : l'index
-- unique invitations_unique_pending_idx (database.sql) garantit déjà cette
-- règle de façon strictement plus robuste qu'une condition RLS (il
-- s'applique à toute écriture, y compris via service_role, qu'aucune policy
-- ne peut jamais concerner). Le reproduire dans le WITH CHECK ci-dessus
-- aurait nécessité une sous-requête corrélée sur invitations elle-même,
-- avec un risque réel d'ambiguïté de portée SQL entre les colonnes de la
-- nouvelle ligne et celles de la sous-requête (même nom de colonnes, même
-- table) — un risque non nécessaire puisque l'index fait déjà le travail.


-- =============================================================================
-- B. TRIGGER — barrière indépendante contre l'invitation d'un membre existant
-- =============================================================================
-- Fonctionne même pour un appel qui contournerait RLS (ex. service_role),
-- puisqu'un trigger s'exécute pour toute écriture sur la table, quel que
-- soit le rôle à l'origine de l'INSERT.

create or replace function public.prevent_invite_existing_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.space_members sm
    where sm.space_id = new.space_id
      and sm.profile_id = new.receiver_id
  ) then
    raise exception 'Cette personne est déjà membre de cet espace.';
  end if;

  return new;
end;
$$;

comment on function public.prevent_invite_existing_member() is
  'Bloque toute invitation vers un profil déjà membre de l''espace, quel que '
  'soit le rôle ayant exécuté l''INSERT (barrière indépendante des policies RLS).';

drop trigger if exists prevent_invite_existing_member on public.invitations;

create trigger prevent_invite_existing_member
  before insert on public.invitations
  for each row execute function public.prevent_invite_existing_member();


-- =============================================================================
-- C. AUDIT DES FONCTIONS SECURITY DEFINER CONCERNÉES (aucun changement requis)
-- =============================================================================
-- Vérifié, pas de correction nécessaire :
--
--   private.is_space_member(uuid, uuid) et private.is_space_admin(uuid, uuid)
--     - search_path explicitement fixé à "public" (database.sql, 3.1/3.2) ;
--     - EXECUTE révoqué de public/anon, accordé uniquement à authenticated ;
--     - vivent dans le schéma "private", jamais exposé par l'API PostgREST :
--       impossible de les appeler directement comme "oracle" pour sonder
--       l'appartenance à un espace privé, même avec le droit EXECUTE.
--
--   public.search_profiles(text, integer) (profile-search-function.sql)
--     - search_path explicitement fixé ;
--     - EXECUTE révoqué de public/anon, accordé uniquement à authenticated ;
--     - ne renvoie aucune information d'appartenance à un espace : seulement
--       id/full_name/avatar_url/masked_email d'un profil, jamais de quel
--       espace il fait partie.
--
--   public.prevent_invite_existing_member() (ce fichier)
--     - search_path explicitement fixé ;
--     - fonction de trigger ("returns trigger") : PostgREST n'expose jamais
--       les fonctions de ce type comme point d'accès RPC, donc pas
--       d'appel direct possible par un client, avec ou sans droit EXECUTE.
--
-- =============================================================================
-- D. VÉRIFICATION DE RÉCURSION RLS (aucune trouvée)
-- =============================================================================
-- La policy A appelle private.is_space_admin(space_id) et
-- private.is_space_member(space_id, receiver_id) : toutes deux SECURITY
-- DEFINER, donc leur lecture de space_members s'exécute avec les droits du
-- propriétaire de la fonction (contourne RLS), pas en ré-évaluant les
-- policies de space_members — aucune boucle possible. Le trigger B interroge
-- lui aussi space_members directement en tant que fonction SECURITY
-- DEFINER, donc sans passer par les policies RLS de space_members non plus.
-- Ni la policy A ni le trigger B ne relisent la table invitations
-- elle-même : aucune chaîne circulaire ne se forme.
-- =============================================================================


-- =============================================================================
-- ORDRE D'EXÉCUTION
-- =============================================================================
-- 1. database.sql (déjà fait).
-- 2. supabase/profile-search-function.sql (si pas encore fait).
-- 3. supabase/invitations-security-patch.sql (ce fichier).
--
-- Ce fichier ne dépend pas techniquement de profile-search-function.sql
-- (aucune référence croisée), mais l'exécuter dans cet ordre garde une
-- progression cohérente avec le reste du projet.
-- =============================================================================

