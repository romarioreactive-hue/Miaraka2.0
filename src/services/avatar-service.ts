import * as ImagePicker from 'expo-image-picker';

import { updateProfile } from '@/lib/auth/profile';
import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
const EXTENSION_BY_MIME: Record<(typeof ALLOWED_MIME_TYPES)[number], string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export type AvatarPickSource = 'library' | 'camera';

export type AvatarErrorCode =
  | 'permission_denied'
  | 'invalid_type'
  | 'too_large'
  | 'upload_failed'
  | 'update_failed'
  | 'not_authenticated'
  | 'unknown';

export interface AvatarServiceError {
  code: AvatarErrorCode;
  message: string;
  cause?: unknown;
}

export interface UploadAvatarResult {
  /** URL publique canonique, telle que stockée dans profiles.avatar_url. */
  publicUrl: string;
  /** Chemin dans le bucket : <user_id>/avatar.<extension>. */
  path: string;
  /** updated_at du profil après écriture, utile pour invalider le cache d'affichage. */
  updatedAt: string;
}

function createError(code: AvatarErrorCode, message: string, cause?: unknown): AvatarServiceError {
  return { code, message, cause };
}

function isAllowedMimeType(mimeType: string): mimeType is (typeof ALLOWED_MIME_TYPES)[number] {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Détermine le type MIME du fichier choisi. Le picker le fournit presque
 * toujours (asset.mimeType), mais certaines plateformes/certains chemins
 * peuvent l'omettre : on retombe alors sur l'extension du nom de fichier.
 */
function resolveMimeType(asset: ImagePicker.ImagePickerAsset): string | null {
  if (asset.mimeType) return asset.mimeType.toLowerCase();

  const source = asset.fileName ?? asset.uri;
  const match = /\.([a-zA-Z0-9]+)(?:\?.*)?$/.exec(source);
  const extension = match?.[1]?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  return null;
}

/**
 * Demande la permission nécessaire puis ouvre la galerie ou l'appareil
 * photo. Renvoie `null` si l'utilisateur annule la sélection.
 */
export async function pickAvatarImage(source: AvatarPickSource): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw createError('permission_denied', source === 'camera'
      ? "L'accès à l'appareil photo a été refusé."
      : "L'accès à la galerie a été refusé.");
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    allowsMultipleSelection: false,
  };

  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0];
}

interface PreparedAsset {
  arrayBuffer: ArrayBuffer;
  mimeType: (typeof ALLOWED_MIME_TYPES)[number];
  extension: string;
}

/**
 * Valide le fichier (type, taille) et le convertit en ArrayBuffer.
 *
 * IMPORTANT : sur React Native, envoyer directement le Blob renvoyé par
 * `fetch(uri).blob()` (ou un FormData construit autour) à Supabase Storage
 * produit régulièrement des fichiers de 0 octet ou corrompus, car
 * l'implémentation de Blob de React Native ne transporte pas correctement
 * les données binaires jusqu'à `supabase-js`. `fetch(uri).arrayBuffer()`
 * n'a pas ce problème et fonctionne de façon fiable sur iOS, Android et Web.
 */
async function prepareAssetForUpload(asset: ImagePicker.ImagePickerAsset): Promise<PreparedAsset> {
  const mimeType = resolveMimeType(asset);
  if (!mimeType || !isAllowedMimeType(mimeType)) {
    throw createError('invalid_type', "Ce type d'image n'est pas pris en charge. Utilisez un PNG, un JPEG ou un WebP.");
  }

  if (typeof asset.fileSize === 'number' && asset.fileSize > MAX_FILE_SIZE_BYTES) {
    throw createError('too_large', "L'image dépasse la taille maximale autorisée (5 Mo).");
  }

  let arrayBuffer: ArrayBuffer;
  try {
    const response = await fetch(asset.uri);
    arrayBuffer = await response.arrayBuffer();
  } catch (error) {
    throw createError('unknown', 'Impossible de lire le fichier sélectionné.', error);
  }

  if (arrayBuffer.byteLength === 0) {
    throw createError('unknown', 'Le fichier sélectionné est vide.');
  }
  if (arrayBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw createError('too_large', "L'image dépasse la taille maximale autorisée (5 Mo).");
  }

  return { arrayBuffer, mimeType, extension: EXTENSION_BY_MIME[mimeType] };
}

/**
 * Supprime les anciens fichiers "avatar.*" du dossier de l'utilisateur qui
 * ne correspondent pas au chemin sur le point d'être écrit (ex. l'ancienne
 * photo était un .png, la nouvelle est un .jpg). Best-effort : un échec ici
 * ne doit jamais bloquer l'envoi de la nouvelle photo.
 */
async function removeStaleAvatarFiles(userId: string, uploadPath: string): Promise<void> {
  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).list(userId, { limit: 20 });
  if (error || !data) return;

  const staleFiles = data
    .filter((file) => file.name.startsWith('avatar.') && `${userId}/${file.name}` !== uploadPath)
    .map((file) => `${userId}/${file.name}`);

  if (staleFiles.length > 0) {
    await supabase.storage.from(AVATAR_BUCKET).remove(staleFiles);
  }
}

/**
 * Envoie la photo choisie dans le bucket "avatars" au chemin
 * <user_id>/avatar.<extension>, remplace l'ancienne image le cas échéant,
 * puis met à jour profiles.avatar_url. Ne connaît jamais la service_role :
 * tout passe par le client Supabase authentifié de l'utilisateur, protégé
 * par les policies RLS de supabase/avatar-storage-policies.sql.
 */
export async function uploadAvatar(userId: string, asset: ImagePicker.ImagePickerAsset): Promise<UploadAvatarResult> {
  if (!userId) {
    throw createError('not_authenticated', 'Vous devez être connecté pour changer votre photo de profil.');
  }

  const { arrayBuffer, mimeType, extension } = await prepareAssetForUpload(asset);
  const path = `${userId}/avatar.${extension}`;

  await removeStaleAvatarFiles(userId, path);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, arrayBuffer, { contentType: mimeType, upsert: true, cacheControl: '3600' });

  if (uploadError) {
    throw createError('upload_failed', "L'envoi de la photo a échoué. Réessayez.", uploadError);
  }

  const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const publicUrl = publicUrlData.publicUrl;

  try {
    const profile = await updateProfile(userId, { avatarUrl: publicUrl });
    return { publicUrl, path, updatedAt: profile.updatedAt };
  } catch (error) {
    throw createError(
      'update_failed',
      "La photo a été envoyée, mais l'enregistrement sur votre profil a échoué. Réessayez.",
      error,
    );
  }
}

/**
 * URL à utiliser pour AFFICHER un avatar : ajoute un paramètre basé sur
 * updated_at pour invalider le cache image (navigateur ou composant
 * <Image>) après un remplacement de photo au même chemin de fichier.
 * profiles.avatar_url reste lui-même toujours stocké "propre", sans ce
 * paramètre.
 */
export function getAvatarDisplayUrl(
  avatarUrl: string | null | undefined,
  updatedAt: string | null | undefined,
): string | undefined {
  if (!avatarUrl) return undefined;
  if (!updatedAt) return avatarUrl;
  const separator = avatarUrl.includes('?') ? '&' : '?';
  return `${avatarUrl}${separator}v=${encodeURIComponent(updatedAt)}`;
}
