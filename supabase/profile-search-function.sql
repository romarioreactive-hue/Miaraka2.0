-- =============================================================================
-- MIARAKA — FONCTION DE RECHERCHE DE PROFILS (POUR LES INVITATIONS)
-- =============================================================================
-- CE FICHIER N'EST PAS EXÉCUTÉ AUTOMATIQUEMENT. À auditer, puis exécuter
-- manuellement dans l'éditeur SQL Supabase si vous validez l'audit.
--
-- POURQUOI CE FICHIER EXISTE
-- La policy RLS existante sur public.profiles ("profiles_select_self_or_shared_space",
-- voir database.sql) n'autorise un utilisateur à lire que son propre profil,
-- ou celui d'un profil avec qui il partage déjà un espace. C'est exactement
-- ce qu'il faut pour le reste de l'application, mais cela rend impossible
-- toute recherche "trouver quelqu'un pour l'inviter" : par définition, la
-- personne qu'on cherche à inviter ne partage encore aucun espace avec
-- l'utilisateur. Rendre la table profiles lisible plus largement casserait
-- la confidentialité (n'importe qui pourrait lister tous les utilisateurs).
--
-- La solution : une fonction SECURITY DEFINER étroite, qui ne renvoie que
-- les quatre colonnes strictement nécessaires à un résultat de recherche,
-- jamais la ligne complète, avec des garde-fous contre l'énumération.
--
-- CE QUE CETTE FONCTION RENVOIE (et rien d'autre)
--   - id            (nécessaire pour envoyer l'invitation)
--   - full_name
--   - avatar_url
--   - masked_email  (ex. "ri***@gmail.com" — jamais l'adresse complète)
--
-- Elle NE renvoie jamais : phone, birth_date, gender, status, language,
-- is_online, last_seen, created_at, updated_at, ni l'e-mail complet.
-- =============================================================================

create or replace function public.search_profiles(
  search_query text,
  limit_count integer default 20
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  masked_email text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  trimmed_query text := btrim(coalesce(search_query, ''));
  safe_limit integer := greatest(least(coalesce(limit_count, 20), 20), 1);
begin
  -- Anti-énumération : une recherche trop courte ne renvoie rien plutôt que
  -- de permettre de lister la table par petits bouts (ex. une lettre à la fois).
  if char_length(trimmed_query) < 2 then
    return;
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.avatar_url,
    case
      when char_length(split_part(p.email, '@', 1)) <= 2
        then left(split_part(p.email, '@', 1), 1) || '***'
      else left(split_part(p.email, '@', 1), 2) || '***'
    end || '@' || split_part(p.email, '@', 2) as masked_email
  from public.profiles p
  where p.id <> auth.uid()
    and p.status = 'active'
    and (
      p.full_name ilike '%' || trimmed_query || '%'
      or p.email ilike '%' || trimmed_query || '%'
    )
  order by p.full_name nulls last, p.id
  limit safe_limit;
end;
$$;

comment on function public.search_profiles(text, integer) is
  'Recherche de profils par nom ou e-mail, pour inviter quelqu''un dans un '
  'espace. Ne renvoie que id, full_name, avatar_url et un e-mail masqué. '
  'Exclut l''appelant, exige au moins 2 caractères, limite à 20 résultats '
  'maximum quelle que soit la valeur demandée par l''appelant.';

-- Accès strictement réservé aux utilisateurs authentifiés. "anon" (visiteur
-- non connecté) ne peut jamais appeler cette fonction, y compris via
-- l'API RPC publique de Supabase.
revoke all on function public.search_profiles(text, integer) from public, anon;
grant execute on function public.search_profiles(text, integer) to authenticated;

-- =============================================================================
-- FIN
-- =============================================================================
