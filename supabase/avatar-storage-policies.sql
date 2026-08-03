-- =============================================================================
-- MIARAKA — POLICIES STORAGE POUR LE BUCKET "avatars"
-- =============================================================================
-- Ce script NE CRÉE PAS le bucket "avatars" : il suppose qu'il existe déjà
-- (créé manuellement dans Supabase Storage). Il ajoute uniquement les
-- policies Row Level Security sur storage.objects nécessaires pour que :
--
--   - tout le monde puisse LIRE un avatar (nécessaire pour l'afficher dans
--     l'application via son URL publique, y compris pour un visiteur non
--     connecté) ;
--   - un utilisateur authentifié ne puisse écrire (déposer, remplacer,
--     supprimer) QUE dans son propre dossier <user_id>/... ;
--   - un utilisateur ne puisse jamais toucher au dossier d'un autre
--     utilisateur.
--
-- Convention de chemin : <user_id>/avatar.<extension>
-- Exemple : 123e4567-e89b-12d3-a456-426614174000/avatar.jpg
--
-- Le premier segment du chemin (avant le premier "/") doit être strictement
-- égal à auth.uid() de l'utilisateur qui écrit. C'est ce que vérifie
-- storage.foldername(name), une fonction utilitaire fournie par Supabase :
-- pour un chemin "abc/avatar.jpg", storage.foldername(name) renvoie le
-- tableau ['abc'] (uniquement le(s) dossier(s), sans le nom de fichier).
--
-- Ce script est ré-exécutable sans erreur : chaque policy est supprimée
-- (si elle existe déjà) avant d'être recréée.
-- =============================================================================

-- Vérification défensive : le script échoue explicitement si le bucket
-- "avatars" n'existe pas, plutôt que de créer des policies qui ne
-- s'appliqueraient à rien.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'avatars') then
    raise exception 'Le bucket "avatars" n''existe pas. Créez-le dans Supabase Storage avant d''exécuter ce script.';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Lecture : accès public en lecture seule sur le bucket "avatars".
-- Nécessaire pour que les URLs publiques (getPublicUrl) fonctionnent dans
-- l'application (l'affichage d'un avatar ne passe pas par un jeton
-- d'authentification côté client). Les photos de profil ne sont pas des
-- données sensibles comme la position : les rendre lisibles publiquement
-- est un choix volontaire, cohérent avec le reste de l'application.
-- -----------------------------------------------------------------------------
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- -----------------------------------------------------------------------------
-- Écriture (insert) : un utilisateur authentifié ne peut déposer un fichier
-- que dans son propre dossier <user_id>/...
-- -----------------------------------------------------------------------------
drop policy if exists "avatars_insert_own_folder" on storage.objects;
create policy "avatars_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- Mise à jour : un utilisateur authentifié ne peut modifier (upsert) que les
-- fichiers de son propre dossier. Nécessaire si le client utilise
-- `upload(..., { upsert: true })` pour remplacer une photo au même chemin.
-- -----------------------------------------------------------------------------
drop policy if exists "avatars_update_own_folder" on storage.objects;
create policy "avatars_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- Suppression : un utilisateur authentifié ne peut supprimer que les
-- fichiers de son propre dossier (utilisé pour nettoyer une ancienne photo
-- dont l'extension a changé, ex. avatar.png remplacé par avatar.jpg).
-- -----------------------------------------------------------------------------
drop policy if exists "avatars_delete_own_folder" on storage.objects;
create policy "avatars_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- FIN
-- =============================================================================
-- Aucun accès général en écriture n'est accordé : sans policy INSERT/UPDATE/
-- DELETE correspondante, toute tentative d'écriture est refusée par défaut
-- (RLS est déjà activé sur storage.objects par Supabase, cette table n'est
-- pas modifiée ici). service_role n'est jamais utilisé ni requis par
-- l'application : ces policies suffisent au client authentifié normal.
-- =============================================================================
