-- =============================================================================
-- MIARAKA — ACTIVER SUPABASE REALTIME POUR LA CARTE (membres visibles)
-- =============================================================================
-- Objectif : permettre à src/services/location-realtime-service.ts de
-- recevoir les changements de public.locations (et, de façon limitée,
-- public.user_settings) via Supabase Realtime (postgres_changes).
--
-- NE PAS EXÉCUTER AUTOMATIQUEMENT. À lancer manuellement, une seule fois,
-- dans l'éditeur SQL Supabase (SQL Editor -> New query -> Run). Idempotent :
-- peut être relancé sans erreur si les tables sont déjà publiées (vérifie
-- pg_publication_tables avant chaque ALTER PUBLICATION, qui n'a pas de
-- clause "IF NOT EXISTS" native).
--
-- SÉCURITÉ : ajouter une table à la publication supabase_realtime n'ouvre
-- PAS l'accès à ses données. Supabase Realtime respecte les policies RLS
-- déjà définies dans database.sql (locations_select_self_or_shared,
-- user_settings_select_self) pour décider quels abonnés reçoivent quels
-- événements. Ce fichier ne crée, ne modifie ni ne supprime AUCUNE policy.
--
-- Pourquoi public.user_settings, malgré une portée limitée : ce canal ne
-- sert qu'à garder L'APPAREIL DE L'UTILISATEUR CONNECTÉ synchronisé avec
-- SES PROPRES changements de share_location (ex. bascule depuis un autre
-- onglet ou un autre appareil). La policy user_settings_select_self limite
-- structurellement ce canal au profil de l'utilisateur connecté : il est
-- IMPOSSIBLE d'y détecter qu'un AUTRE membre vient de couper son partage —
-- cela reste le rôle du rechargement périodique côté client
-- (src/hooks/use-members-locations.ts), indépendant de ce fichier.
--
-- La publication "supabase_realtime" elle-même est créée automatiquement
-- par Supabase à la création du projet : ce fichier ne la crée pas, il
-- n'ajoute que des tables à une publication déjà existante.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'locations'
  ) then
    alter publication supabase_realtime add table public.locations;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_settings'
  ) then
    alter publication supabase_realtime add table public.user_settings;
  end if;
end $$;

-- Vérification manuelle après exécution :
--   select schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime';
-- Doit lister public.locations et public.user_settings.
