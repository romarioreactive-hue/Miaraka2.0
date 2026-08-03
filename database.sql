-- =============================================================================
-- MIARAKA — SCHEMA DE BASE DE DONNEES SUPABASE (POSTGRESQL)
-- =============================================================================
-- Ce fichier crée l'intégralité de la base de données de l'application Miaraka :
-- tables, relations, index, Row Level Security (RLS), policies, triggers et
-- fonctions utilitaires.
--
-- Compatible avec Supabase PostgreSQL (Postgres 15+).
--
-- ATTENTION — SCRIPT A EXECUTER UNE SEULE FOIS
-- Ce fichier N'EST PAS ré-exécutable : il crée des tables, policies, triggers
-- et index sans clause "if not exists" (sauf extensions et schéma). Le lancer
-- une seconde fois sur une base déjà initialisée provoquera des erreurs
-- "already exists". Il doit être exécuté UNE SEULE FOIS, en entier, du début
-- à la fin, dans l'éditeur SQL de Supabase (SQL Editor -> New query -> Run),
-- sur un projet neuf.
--
-- PRINCIPE DE CONFIDENTIALITE (voir docs/PRODUCT.md)
-- Personne n'est visible par défaut. Un membre d'un espace ne voit la
-- position, l'activité ou la dernière connexion d'un autre membre que si :
--   1. les deux profils partagent au moins un espace commun (space_members) ;
--   2. le propriétaire de la donnée a explicitement activé le partage
--      correspondant dans user_settings (share_location, share_activity,
--      share_last_seen, share_battery).
--
-- JOURNAL D'AUDIT DE SECURITE (voir docs/DATABASE.md section 10 pour le détail)
-- Ce fichier a été revu et corrigé après un audit de sécurité complet. Les
-- corrections suivantes ont été appliquées avant la première exécution :
--   - cleanup_old_location_history() n'est plus exécutable par un client
--     (anon/authenticated) : elle pouvait effacer l'historique GPS de TOUS
--     les utilisateurs.
--   - Les invitations ne peuvent plus être modifiées que par leur
--     destinataire, et leurs colonnes sender_id/receiver_id/space_id sont
--     désormais immuables (empêchait de rejoindre un espace sans invitation).
--   - challenge_members.rank est désormais protégé côté serveur, quelle que
--     soit la requête envoyée par le client.
--   - spaces.owner_id et challenges.owner_id/space_id sont immuables après
--     création (empêchait une prise de contrôle silencieuse).
--   - Les fonctions utilisées par les policies RLS (is_space_member,
--     is_space_admin, shares_space_with, is_challenge_visible) sont déplacées
--     dans un schéma "private" non exposé par l'API, avec des permissions
--     EXECUTE restreintes, pour empêcher leur appel direct comme "oracle"
--     d'information.
--   - profiles.email est protégé contre toute modification directe par le
--     client et normalisé en minuscules.
--   - Toutes les policies sont explicitement restreintes au rôle
--     "authenticated" (aucune ne s'applique au rôle "anon").
--   - Les distances (activities, challenges, challenge_members) sont
--     désormais stockées en mètres (entiers) plutôt qu'en kilomètres.
-- =============================================================================


-- =============================================================================
-- SECTION 0 — EXTENSIONS ET SCHEMA PRIVE
-- =============================================================================

-- gen_random_uuid() pour des clés primaires UUID générées côté base de données.
create extension if not exists pgcrypto;

-- Schéma dédié aux fonctions internes utilisées uniquement par les policies
-- RLS. Contrairement au schéma "public", "private" n'est jamais exposé par
-- l'API Supabase (PostgREST) : ses fonctions ne peuvent donc pas être
-- appelées directement par un client, seulement depuis une policy RLS
-- évaluée côté serveur.
create schema if not exists private;
comment on schema private is
  'Fonctions internes utilisées par les policies RLS. Jamais exposé par l''API Supabase (PostgREST).';

revoke all on schema private from public;
grant usage on schema private to authenticated;


-- =============================================================================
-- SECTION 1 — TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1.1 profiles
-- Un profil par utilisateur Supabase Auth (relation 1-1 avec auth.users).
-- -----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  -- L'e-mail est toujours stocké en minuscules (voir handle_new_user et
  -- protect_profile_email) : cette contrainte garantit qu'aucune ligne ne
  -- peut être insérée ou modifiée hors de cette convention.
  email         text not null unique check (email = lower(email)),
  full_name     text,
  phone         text,
  avatar_url    text,
  language      text not null default 'fr'
                  check (language in ('fr', 'mg')),
  birth_date    date,
  gender        text
                  check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  -- État général du compte (distinct de is_online, qui reflète la présence en temps réel).
  status        text not null default 'active'
                  check (status in ('active', 'suspended', 'deleted')),
  is_online     boolean not null default false,
  last_seen     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is
  'Profil applicatif d''un utilisateur, en relation 1-1 avec auth.users.';
comment on column public.profiles.id is 'Référence auth.users.id.';
comment on column public.profiles.email is
  'Copie normalisée (minuscules) de auth.users.email. Non modifiable directement par le client, voir protect_profile_email().';
comment on column public.profiles.status is 'État du compte : active, suspended ou deleted.';
comment on column public.profiles.is_online is 'Présence en temps réel, mise à jour par le client.';
comment on column public.profiles.last_seen is 'Horodatage de la dernière activité connue de l''utilisateur.';


-- -----------------------------------------------------------------------------
-- 1.2 spaces
-- Un espace privé (Famille, Amis, Équipe) créé et administré par ses membres.
-- -----------------------------------------------------------------------------
create table public.spaces (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles (id) on delete cascade,
  name          text not null check (char_length(btrim(name)) > 0),
  type          text not null check (type in ('family', 'friends', 'team')),
  description   text,
  color         text,
  icon          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.spaces is
  'Espace privé (Famille, Amis ou Équipe) regroupant plusieurs profils.';
comment on column public.spaces.type is 'Type d''espace : family, friends ou team.';
comment on column public.spaces.owner_id is
  'Propriétaire de l''espace. Immuable après création, voir protect_space_owner().';


-- -----------------------------------------------------------------------------
-- 1.3 space_members
-- Table d'association profils <-> espaces, avec un rôle par membre.
-- -----------------------------------------------------------------------------
create table public.space_members (
  id            uuid primary key default gen_random_uuid(),
  space_id      uuid not null references public.spaces (id) on delete cascade,
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  role          text not null default 'member'
                  check (role in ('owner', 'admin', 'member')),
  joined_at     timestamptz not null default now(),
  unique (space_id, profile_id)
);

comment on table public.space_members is
  'Appartenance d''un profil à un espace, avec son rôle (owner, admin, member). '
  'L''appartenance est binaire : quitter un espace supprime la ligne (pas de statut "inactif").';


-- -----------------------------------------------------------------------------
-- 1.4 invitations
-- Invitation d'un profil à rejoindre un espace, envoyée par un membre.
-- -----------------------------------------------------------------------------
create table public.invitations (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references public.profiles (id) on delete cascade,
  receiver_id   uuid not null references public.profiles (id) on delete cascade,
  space_id      uuid not null references public.spaces (id) on delete cascade,
  status        text not null default 'pending'
                  check (status in ('pending', 'accepted', 'declined')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

comment on table public.invitations is
  'Invitation envoyée par sender_id à receiver_id pour rejoindre space_id. '
  'sender_id, receiver_id, space_id et created_at sont immuables, voir handle_invitation_update().';

-- Empêche l'envoi de plusieurs invitations en attente à la même personne
-- pour le même espace.
create unique index invitations_unique_pending_idx
  on public.invitations (space_id, receiver_id)
  where (status = 'pending');


-- -----------------------------------------------------------------------------
-- 1.5 locations
-- Position en direct : une seule ligne par profil, mise à jour en continu.
-- -----------------------------------------------------------------------------
create table public.locations (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null unique references public.profiles (id) on delete cascade,
  latitude      double precision not null check (latitude between -90 and 90),
  longitude     double precision not null check (longitude between -180 and 180),
  accuracy      double precision,
  altitude      double precision,
  heading       double precision,
  speed         double precision,
  battery       smallint check (battery between 0 and 100),
  is_moving     boolean not null default false,
  updated_at    timestamptz not null default now()
);

comment on table public.locations is
  'Dernière position connue (en direct) de chaque profil. Une ligne par profil (contrainte unique sur profile_id).';
comment on column public.locations.battery is 'Niveau de batterie du téléphone, de 0 à 100.';


-- -----------------------------------------------------------------------------
-- 1.6 activities
-- Résumé quotidien de l'activité physique d'un profil.
-- -----------------------------------------------------------------------------
create table public.activities (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles (id) on delete cascade,
  activity_date       date not null default current_date,
  steps               integer not null default 0 check (steps >= 0),
  -- Distances exprimées en mètres (entiers).
  walking_distance    integer not null default 0 check (walking_distance >= 0),
  running_distance    integer not null default 0 check (running_distance >= 0),
  cycling_distance    integer not null default 0 check (cycling_distance >= 0),
  driving_distance    integer not null default 0 check (driving_distance >= 0),
  calories            numeric(10, 2) not null default 0 check (calories >= 0),
  active_minutes      integer not null default 0 check (active_minutes >= 0),
  floors              integer not null default 0 check (floors >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (profile_id, activity_date)
);

comment on table public.activities is
  'Résumé quotidien de l''activité physique (pas, distances en mètres, calories) d''un profil.';
comment on column public.activities.driving_distance is
  'Distance motorisée en mètres. Ne compte jamais comme distance à pied.';


-- -----------------------------------------------------------------------------
-- 1.7 challenges
-- Défi collectif (marche, vélo, course) créé au sein d'un espace.
-- -----------------------------------------------------------------------------
create table public.challenges (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references public.profiles (id) on delete cascade,
  space_id          uuid not null references public.spaces (id) on delete cascade,
  title             text not null check (char_length(btrim(title)) > 0),
  description       text,
  type              text not null check (type in ('walking', 'cycling', 'running')),
  -- Distance cible en mètres.
  target_distance   integer not null check (target_distance > 0),
  start_date        date not null,
  end_date          date not null check (end_date >= start_date),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.challenges is
  'Défi collectif rattaché à un espace, avec une mesure et un objectif (target_distance en mètres). '
  'owner_id et space_id sont immuables après création, voir protect_challenge_ownership().';


-- -----------------------------------------------------------------------------
-- 1.8 challenge_members
-- Participation d'un profil à un défi, avec sa progression et son classement.
-- -----------------------------------------------------------------------------
create table public.challenge_members (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges (id) on delete cascade,
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  -- Distance parcourue en mètres.
  distance      integer not null default 0 check (distance >= 0),
  steps         integer not null default 0 check (steps >= 0),
  -- rank est recalculé automatiquement par un trigger : toute valeur envoyée
  -- par le client est ignorée, voir protect_challenge_member_rank().
  rank          integer,
  joined_at     timestamptz not null default now(),
  unique (challenge_id, profile_id)
);

comment on table public.challenge_members is
  'Participation et progression (distance en mètres) d''un profil dans un défi. rank est géré uniquement par trigger.';


-- -----------------------------------------------------------------------------
-- 1.9 notifications
-- Notification applicative destinée à un profil.
-- -----------------------------------------------------------------------------
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  type          text not null,
  title         text not null,
  body          text,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

comment on table public.notifications is
  'Notification destinée à un profil (invitation, défi, activité, système...). '
  'Créée uniquement côté serveur : aucune policy INSERT n''est ouverte au client.';


-- -----------------------------------------------------------------------------
-- 1.10 user_settings
-- Réglages de confidentialité et de préférences, une ligne par profil.
-- -----------------------------------------------------------------------------
create table public.user_settings (
  id                      uuid primary key default gen_random_uuid(),
  profile_id              uuid not null unique references public.profiles (id) on delete cascade,
  share_location          boolean not null default false,
  share_activity          boolean not null default false,
  share_last_seen         boolean not null default false,
  share_battery           boolean not null default false,
  language                text not null default 'fr'
                            check (language in ('fr', 'mg')),
  theme                   text not null default 'system'
                            check (theme in ('light', 'dark', 'system')),
  notifications_enabled   boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.user_settings is
  'Réglages de confidentialité et de préférences d''un profil. Tout est désactivé par défaut (invisible par défaut).';


-- -----------------------------------------------------------------------------
-- 1.11 location_history
-- Historique brut des positions, strictement privé (voir docs/PRODUCT.md §6.1.8).
-- -----------------------------------------------------------------------------
create table public.location_history (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  latitude      double precision not null check (latitude between -90 and 90),
  longitude     double precision not null check (longitude between -180 and 180),
  recorded_at   timestamptz not null default now()
);

comment on table public.location_history is
  'Historique privé des positions d''un profil. Visible uniquement par son propriétaire, jamais par un autre membre. '
  'Purge périodique recommandée via public.cleanup_old_location_history() (réservée au rôle de service).';


-- =============================================================================
-- SECTION 2 — INDEX
-- =============================================================================

-- profiles
create index profiles_email_idx on public.profiles (email);
create index profiles_status_idx on public.profiles (status);

-- spaces
create index spaces_owner_id_idx on public.spaces (owner_id);
create index spaces_created_at_idx on public.spaces (created_at);

-- space_members (l'index unique (space_id, profile_id) existe déjà via la contrainte unique)
create index space_members_space_id_idx on public.space_members (space_id);
create index space_members_profile_id_idx on public.space_members (profile_id);

-- invitations
create index invitations_sender_id_idx on public.invitations (sender_id);
create index invitations_receiver_id_idx on public.invitations (receiver_id);
create index invitations_space_id_idx on public.invitations (space_id);
create index invitations_created_at_idx on public.invitations (created_at);

-- locations (profile_id est déjà indexé via la contrainte unique)
create index locations_updated_at_idx on public.locations (updated_at);

-- activities
create index activities_profile_id_idx on public.activities (profile_id);
create index activities_activity_date_idx on public.activities (activity_date);

-- challenges
create index challenges_space_id_idx on public.challenges (space_id);
create index challenges_owner_id_idx on public.challenges (owner_id);
create index challenges_dates_idx on public.challenges (start_date, end_date);

-- challenge_members
create index challenge_members_challenge_id_idx on public.challenge_members (challenge_id);
create index challenge_members_profile_id_idx on public.challenge_members (profile_id);
create index challenge_members_rank_idx on public.challenge_members (challenge_id, rank);

-- notifications
create index notifications_profile_id_idx on public.notifications (profile_id);
create index notifications_created_at_idx on public.notifications (created_at);
-- Accélère la requête la plus fréquente : "mes notifications non lues".
create index notifications_unread_idx
  on public.notifications (profile_id, created_at desc)
  where (is_read = false);

-- location_history
create index location_history_profile_id_idx on public.location_history (profile_id);
create index location_history_recorded_at_idx on public.location_history (recorded_at);
create index location_history_profile_recorded_idx
  on public.location_history (profile_id, recorded_at desc);


-- =============================================================================
-- SECTION 3 — FONCTIONS INTERNES (schéma private, utilisées par les policies RLS)
-- =============================================================================
-- Ces fonctions sont SECURITY DEFINER pour pouvoir être appelées depuis les
-- policies RLS de space_members/challenges sans provoquer de récursion
-- infinie (une policy sur une table ne peut pas se relire elle-même). Elles
-- vivent dans le schéma "private", jamais exposé par PostgREST, et leur
-- EXECUTE est explicitement limité au rôle "authenticated" : impossible de
-- les appeler directement comme "oracle" (ex. deviner qui est membre de quel
-- espace) via l'API REST/RPC.

-- -----------------------------------------------------------------------------
-- 3.1 is_space_member(p_space_id, p_profile_id)
-- -----------------------------------------------------------------------------
create or replace function private.is_space_member(
  p_space_id uuid,
  p_profile_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.space_members sm
    where sm.space_id = p_space_id
      and sm.profile_id = p_profile_id
  );
$$;

comment on function private.is_space_member(uuid, uuid) is
  'Vrai si p_profile_id est membre de l''espace p_space_id. Usage interne RLS uniquement.';

revoke execute on function private.is_space_member(uuid, uuid) from public, anon, authenticated;
grant execute on function private.is_space_member(uuid, uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- 3.2 is_space_admin(p_space_id, p_profile_id)
-- -----------------------------------------------------------------------------
create or replace function private.is_space_admin(
  p_space_id uuid,
  p_profile_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.space_members sm
    where sm.space_id = p_space_id
      and sm.profile_id = p_profile_id
      and sm.role in ('owner', 'admin')
  );
$$;

comment on function private.is_space_admin(uuid, uuid) is
  'Vrai si p_profile_id est owner ou admin de l''espace p_space_id. Usage interne RLS uniquement.';

revoke execute on function private.is_space_admin(uuid, uuid) from public, anon, authenticated;
grant execute on function private.is_space_admin(uuid, uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- 3.3 shares_space_with(p_profile_id)
-- -----------------------------------------------------------------------------
create or replace function private.shares_space_with(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.space_members mine
    join public.space_members theirs
      on theirs.space_id = mine.space_id
    where mine.profile_id = auth.uid()
      and theirs.profile_id = p_profile_id
  );
$$;

comment on function private.shares_space_with(uuid) is
  'Vrai si l''utilisateur connecté partage au moins un espace avec p_profile_id. Usage interne RLS uniquement.';

revoke execute on function private.shares_space_with(uuid) from public, anon, authenticated;
grant execute on function private.shares_space_with(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- 3.4 is_challenge_visible(p_challenge_id)
-- -----------------------------------------------------------------------------
create or replace function private.is_challenge_visible(p_challenge_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.challenges c
    where c.id = p_challenge_id
      and private.is_space_member(c.space_id)
  );
$$;

comment on function private.is_challenge_visible(uuid) is
  'Vrai si l''utilisateur connecté est membre de l''espace du défi p_challenge_id. Usage interne RLS uniquement.';

revoke execute on function private.is_challenge_visible(uuid) from public, anon, authenticated;
grant execute on function private.is_challenge_visible(uuid) to authenticated;


-- =============================================================================
-- SECTION 4 — FONCTIONS PUBLIQUES ET TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4.1 set_updated_at()
-- Met à jour automatiquement la colonne updated_at de n'importe quelle table
-- qui possède cette colonne.
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger générique : met à jour updated_at à chaque modification de ligne.';

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.spaces
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.invitations
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.locations
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.activities
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.challenges
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.user_settings
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 4.2 handle_new_user()
-- Crée automatiquement un profil et des réglages par défaut lors de
-- l'inscription d'un utilisateur (auth.users). Lit les métadonnées fournies
-- par le fournisseur d'authentification (ex. Google) quand elles existent.
-- L'e-mail est systématiquement normalisé en minuscules.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    lower(new.email),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Crée automatiquement profiles + user_settings lors de l''inscription (auth.users).';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 4.3 protect_profile_email()
-- Empêche toute modification de profiles.email par le client : l'e-mail est
-- une donnée d'identité qui ne doit provenir que de auth.users (via
-- handle_new_user). Sans cette protection, un utilisateur pourrait modifier
-- librement son propre e-mail affiché et bloquer l'inscription d'un tiers
-- possédant réellement cette adresse (contrainte unique).
-- -----------------------------------------------------------------------------
create or replace function public.protect_profile_email()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.email := old.email;
  return new;
end;
$$;

comment on function public.protect_profile_email() is
  'Empêche la modification de profiles.email par le client (immuable, synchronisé uniquement via auth.users).';

create trigger protect_profile_email before update on public.profiles
  for each row execute function public.protect_profile_email();


-- -----------------------------------------------------------------------------
-- 4.4 handle_new_space()
-- Ajoute automatiquement le créateur d'un espace comme membre "owner".
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_space()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.space_members (space_id, profile_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (space_id, profile_id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_space() is
  'Ajoute automatiquement le propriétaire d''un espace dans space_members.';

create trigger on_space_created
  after insert on public.spaces
  for each row execute function public.handle_new_space();


-- -----------------------------------------------------------------------------
-- 4.5 protect_space_owner()
-- Empêche tout changement de spaces.owner_id après création. La version 1
-- ne propose pas de transfert de propriété : sans cette protection, un
-- simple admin pourrait s'attribuer la propriété de l'espace via une mise à
-- jour directe (la policy spaces_update_admins autorise les admins à
-- modifier la ligne, mais pas à changer son propriétaire).
-- -----------------------------------------------------------------------------
create or replace function public.protect_space_owner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.owner_id <> old.owner_id then
    raise exception 'Le transfert de propriété d''un espace n''est pas pris en charge.';
  end if;
  return new;
end;
$$;

comment on function public.protect_space_owner() is
  'Empêche toute modification de spaces.owner_id (pas de transfert de propriété en version 1).';

create trigger protect_space_owner before update on public.spaces
  for each row execute function public.protect_space_owner();


-- -----------------------------------------------------------------------------
-- 4.6 handle_invitation_update()
-- Sécurise le cycle de vie d'une invitation :
--   - sender_id, receiver_id, space_id et created_at sont immuables (sans
--     cela, le destinataire légitime pourrait réécrire space_id pour
--     rejoindre un espace privé auquel il n'a jamais été invité) ;
--   - une invitation déjà traitée (accepted/declined) ne peut plus changer
--     de statut ;
--   - l'acceptation ajoute automatiquement le destinataire à l'espace.
-- -----------------------------------------------------------------------------
create or replace function public.handle_invitation_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sender_id <> old.sender_id
     or new.receiver_id <> old.receiver_id
     or new.space_id <> old.space_id
     or new.created_at <> old.created_at then
    raise exception 'sender_id, receiver_id, space_id et created_at d''une invitation sont immuables.';
  end if;

  if old.status <> 'pending' and new.status <> old.status then
    raise exception 'Une invitation déjà traitée ne peut plus changer de statut.';
  end if;

  if new.status = 'accepted' and old.status = 'pending' then
    insert into public.space_members (space_id, profile_id, role)
    values (new.space_id, new.receiver_id, 'member')
    on conflict (space_id, profile_id) do nothing;
  end if;

  return new;
end;
$$;

comment on function public.handle_invitation_update() is
  'Protège les colonnes immuables d''une invitation, valide les transitions de statut '
  'et ajoute le destinataire à l''espace si acceptée.';

create trigger on_invitation_update
  before update on public.invitations
  for each row execute function public.handle_invitation_update();


-- -----------------------------------------------------------------------------
-- 4.7 protect_challenge_ownership()
-- Empêche tout changement de challenges.owner_id ou challenges.space_id
-- après création (sans cela, le créateur d'un défi pourrait le réassigner à
-- un espace qu'il n'administre pas, l'y rendant visible sans autorisation).
-- -----------------------------------------------------------------------------
create or replace function public.protect_challenge_ownership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.owner_id <> old.owner_id or new.space_id <> old.space_id then
    raise exception 'Un défi ne peut pas changer de propriétaire ou d''espace après sa création.';
  end if;
  return new;
end;
$$;

comment on function public.protect_challenge_ownership() is
  'Empêche toute modification de challenges.owner_id et challenges.space_id après création.';

create trigger protect_challenge_ownership before update on public.challenges
  for each row execute function public.protect_challenge_ownership();


-- -----------------------------------------------------------------------------
-- 4.8 protect_challenge_member_rank()
-- Empêche un participant de définir lui-même son classement. Cette
-- protection est indépendante du trigger de recalcul ci-dessous : elle agit
-- avant l'écriture, quelle que soit la liste de colonnes envoyée par le
-- client (y compris si seule la colonne rank est modifiée, ce que le
-- trigger de recalcul "on update of distance, steps" ne détecterait pas).
-- -----------------------------------------------------------------------------
create or replace function public.protect_challenge_member_rank()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.rank := null;
  else
    new.rank := old.rank;
  end if;
  return new;
end;
$$;

comment on function public.protect_challenge_member_rank() is
  'Empêche toute écriture cliente de challenge_members.rank : seul le trigger de recalcul peut le définir.';

create trigger protect_challenge_member_rank
  before insert or update on public.challenge_members
  for each row execute function public.protect_challenge_member_rank();


-- -----------------------------------------------------------------------------
-- 4.9 recalculate_challenge_ranks()
-- Recalcule automatiquement le classement (rank) de tous les participants
-- d'un défi lorsque la distance ou les pas d'un participant changent, ou
-- lorsqu'un participant quitte le défi.
-- -----------------------------------------------------------------------------
create or replace function public.recalculate_challenge_ranks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_challenge_id uuid := coalesce(new.challenge_id, old.challenge_id);
begin
  update public.challenge_members cm
  set rank = ranked.rank
  from (
    select id, rank() over (order by distance desc, steps desc) as computed_rank
    from public.challenge_members
    where challenge_id = affected_challenge_id
  ) as ranked (id, rank)
  where cm.id = ranked.id
    and cm.rank is distinct from ranked.rank;

  return coalesce(new, old);
end;
$$;

comment on function public.recalculate_challenge_ranks() is
  'Recalcule le rank de tous les membres d''un défi (rank() sur distance puis steps).';

create trigger on_challenge_member_progress
  after insert or update of distance, steps on public.challenge_members
  for each row execute function public.recalculate_challenge_ranks();

create trigger on_challenge_member_removed
  after delete on public.challenge_members
  for each row execute function public.recalculate_challenge_ranks();


-- =============================================================================
-- SECTION 5 — ROW LEVEL SECURITY (RLS) ET POLICIES
-- =============================================================================
-- Règle générale : toute table exposée à l'API est protégée par RLS et
-- n'autorise que ce qui est explicitement listé ci-dessous. Rien d'autre
-- n'est accessible. Chaque policy est explicitement restreinte au rôle
-- "authenticated" : le rôle "anon" ne correspond à aucune policy et n'a donc
-- structurellement accès à aucune ligne d'aucune table, quel que soit le
-- contenu de la requête.

alter table public.profiles          enable row level security;
alter table public.spaces            enable row level security;
alter table public.space_members     enable row level security;
alter table public.invitations       enable row level security;
alter table public.locations         enable row level security;
alter table public.activities        enable row level security;
alter table public.challenges        enable row level security;
alter table public.challenge_members enable row level security;
alter table public.notifications     enable row level security;
alter table public.user_settings     enable row level security;
alter table public.location_history  enable row level security;

-- -----------------------------------------------------------------------------
-- 5.1 profiles
-- Un utilisateur voit son propre profil et le profil des membres avec qui
-- il partage au moins un espace (nécessaire pour les listes de membres,
-- les invitations et la carte).
-- -----------------------------------------------------------------------------
create policy "profiles_select_self_or_shared_space"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or private.shares_space_with(id));

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Aucune policy DELETE : un profil est supprimé uniquement via la
-- suppression du compte auth.users (cascade).


-- -----------------------------------------------------------------------------
-- 5.2 spaces
-- -----------------------------------------------------------------------------
create policy "spaces_select_members"
  on public.spaces for select
  to authenticated
  using (private.is_space_member(id));

create policy "spaces_insert_owner"
  on public.spaces for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "spaces_update_admins"
  on public.spaces for update
  to authenticated
  using (private.is_space_admin(id))
  with check (private.is_space_admin(id));

create policy "spaces_delete_owner"
  on public.spaces for delete
  to authenticated
  using (owner_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 5.3 space_members
-- L'ajout initial (owner) est géré par le trigger on_space_created ; l'ajout
-- après invitation est géré par le trigger on_invitation_update. Les deux
-- s'exécutent en SECURITY DEFINER et ne dépendent donc pas des policies
-- INSERT ci-dessous.
-- -----------------------------------------------------------------------------
create policy "space_members_select_members"
  on public.space_members for select
  to authenticated
  using (private.is_space_member(space_id));

create policy "space_members_insert_admins"
  on public.space_members for insert
  to authenticated
  with check (private.is_space_admin(space_id));

create policy "space_members_update_admins"
  on public.space_members for update
  to authenticated
  using (private.is_space_admin(space_id))
  with check (private.is_space_admin(space_id));

create policy "space_members_delete_self_or_admin"
  on public.space_members for delete
  to authenticated
  using (profile_id = auth.uid() or private.is_space_admin(space_id));


-- -----------------------------------------------------------------------------
-- 5.4 invitations
-- -----------------------------------------------------------------------------
create policy "invitations_select_sender_or_receiver"
  on public.invitations for select
  to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "invitations_insert_member_of_space"
  on public.invitations for insert
  to authenticated
  with check (sender_id = auth.uid() and private.is_space_member(space_id));

-- Seul le destinataire peut faire évoluer le statut (accepter/refuser).
-- L'expéditeur ne peut pas modifier une invitation ; il peut seulement
-- l'annuler tant qu'elle est en attente (voir la policy DELETE ci-dessous).
create policy "invitations_update_receiver_only"
  on public.invitations for update
  to authenticated
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

create policy "invitations_delete_sender_pending"
  on public.invitations for delete
  to authenticated
  using (sender_id = auth.uid() and status = 'pending');


-- -----------------------------------------------------------------------------
-- 5.5 locations
-- Visible par son propriétaire, ou par un membre d'un espace commun si le
-- propriétaire a activé share_location.
-- -----------------------------------------------------------------------------
create policy "locations_select_self_or_shared"
  on public.locations for select
  to authenticated
  using (
    profile_id = auth.uid()
    or (
      private.shares_space_with(profile_id)
      and exists (
        select 1 from public.user_settings us
        where us.profile_id = locations.profile_id
          and us.share_location = true
      )
    )
  );

create policy "locations_insert_self"
  on public.locations for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "locations_update_self"
  on public.locations for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "locations_delete_self"
  on public.locations for delete
  to authenticated
  using (profile_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 5.6 activities
-- Visible par son propriétaire, ou par un membre d'un espace commun si le
-- propriétaire a activé share_activity.
-- -----------------------------------------------------------------------------
create policy "activities_select_self_or_shared"
  on public.activities for select
  to authenticated
  using (
    profile_id = auth.uid()
    or (
      private.shares_space_with(profile_id)
      and exists (
        select 1 from public.user_settings us
        where us.profile_id = activities.profile_id
          and us.share_activity = true
      )
    )
  );

create policy "activities_insert_self"
  on public.activities for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "activities_update_self"
  on public.activities for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "activities_delete_self"
  on public.activities for delete
  to authenticated
  using (profile_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 5.7 challenges
-- -----------------------------------------------------------------------------
create policy "challenges_select_space_members"
  on public.challenges for select
  to authenticated
  using (private.is_space_member(space_id));

create policy "challenges_insert_member_of_space"
  on public.challenges for insert
  to authenticated
  with check (owner_id = auth.uid() and private.is_space_member(space_id));

create policy "challenges_update_owner_or_admin"
  on public.challenges for update
  to authenticated
  using (owner_id = auth.uid() or private.is_space_admin(space_id))
  with check (owner_id = auth.uid() or private.is_space_admin(space_id));

create policy "challenges_delete_owner_or_admin"
  on public.challenges for delete
  to authenticated
  using (owner_id = auth.uid() or private.is_space_admin(space_id));


-- -----------------------------------------------------------------------------
-- 5.8 challenge_members
-- -----------------------------------------------------------------------------
create policy "challenge_members_select_space_members"
  on public.challenge_members for select
  to authenticated
  using (private.is_challenge_visible(challenge_id));

create policy "challenge_members_insert_self"
  on public.challenge_members for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and private.is_challenge_visible(challenge_id)
  );

-- Un participant peut mettre à jour sa propre progression (distance, steps).
-- rank n'est jamais fourni par le client : protect_challenge_member_rank()
-- l'ignore systématiquement et recalculate_challenge_ranks() le recalcule.
create policy "challenge_members_update_self"
  on public.challenge_members for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "challenge_members_delete_self"
  on public.challenge_members for delete
  to authenticated
  using (profile_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 5.9 notifications
-- Aucune policy INSERT pour les utilisateurs authentifiés : les
-- notifications sont créées par des fonctions SECURITY DEFINER ou par le
-- rôle de service (Edge Functions), qui contournent RLS.
-- -----------------------------------------------------------------------------
create policy "notifications_select_self"
  on public.notifications for select
  to authenticated
  using (profile_id = auth.uid());

create policy "notifications_update_self"
  on public.notifications for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "notifications_delete_self"
  on public.notifications for delete
  to authenticated
  using (profile_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 5.10 user_settings
-- Strictement privé : jamais visible par un autre profil, même dans un
-- espace commun (seuls les booléens share_* sont interrogés en interne par
-- les policies de locations/activities via une sous-requête exécutée côté
-- serveur, jamais exposés directement à un autre utilisateur).
-- -----------------------------------------------------------------------------
create policy "user_settings_select_self"
  on public.user_settings for select
  to authenticated
  using (profile_id = auth.uid());

create policy "user_settings_insert_self"
  on public.user_settings for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "user_settings_update_self"
  on public.user_settings for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "user_settings_delete_self"
  on public.user_settings for delete
  to authenticated
  using (profile_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 5.11 location_history
-- Historique privé : visible uniquement par son propriétaire, jamais par un
-- autre membre d'espace (voir docs/PRODUCT.md §6.1.8). Pas de policy UPDATE :
-- table strictement en ajout (append-only).
-- -----------------------------------------------------------------------------
create policy "location_history_select_self"
  on public.location_history for select
  to authenticated
  using (profile_id = auth.uid());

create policy "location_history_insert_self"
  on public.location_history for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "location_history_delete_self"
  on public.location_history for delete
  to authenticated
  using (profile_id = auth.uid());


-- =============================================================================
-- SECTION 6 — FONCTIONS DE MAINTENANCE
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 6.1 cleanup_old_location_history(retention_days)
-- Supprime les positions historiques plus anciennes que retention_days
-- (30 jours par défaut), pour TOUS les profils.
--
-- SECURITE : cette fonction contourne intentionnellement RLS (SECURITY
-- DEFINER) pour pouvoir nettoyer les données de tous les utilisateurs en une
-- seule opération planifiée. Elle n'est donc PAS exposée aux rôles "anon" et
-- "authenticated" : seul le rôle de service (service_role, utilisé par
-- pg_cron ou une Edge Function planifiée) peut l'exécuter. Un utilisateur
-- normal qui l'appellerait pourrait sinon effacer l'historique GPS de
-- l'ensemble des utilisateurs de l'application.
--
-- Exemple de planification avec l'extension pg_cron si elle est activée sur
-- le projet Supabase :
--
--   select cron.schedule(
--     'cleanup-location-history',
--     '0 3 * * *', -- tous les jours à 3h
--     $$ select public.cleanup_old_location_history(30); $$
--   );
-- -----------------------------------------------------------------------------
create or replace function public.cleanup_old_location_history(retention_days integer default 30)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count bigint;
begin
  delete from public.location_history
  where recorded_at < now() - make_interval(days => retention_days);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

comment on function public.cleanup_old_location_history(integer) is
  'Supprime les positions de location_history plus anciennes que retention_days (30 par défaut), pour tous les profils. '
  'Réservée au rôle de service (service_role / pg_cron) : aucun accès anon ou authenticated.';

revoke execute on function public.cleanup_old_location_history(integer) from public, anon, authenticated;

-- =============================================================================
-- FIN DU SCHEMA
-- =============================================================================
