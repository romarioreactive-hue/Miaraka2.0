import type { AccountStatus, AppLanguage, Gender, Profile, UpdateProfileInput } from '@/auth/types';
import { supabase } from '@/lib/supabase';

import { toAuthError } from './errors';

/** Forme brute d'une ligne public.profiles (snake_case, voir database.sql). */
interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  language: AppLanguage;
  birth_date: string | null;
  gender: Gender | null;
  status: AccountStatus;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    language: row.language,
    birthDate: row.birth_date,
    gender: row.gender,
    status: row.status,
    isOnline: row.is_online,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw toAuthError(error);
  return mapProfileRow(data as ProfileRow);
}

/**
 * Met à jour le profil. `email` n'est volontairement pas modifiable ici :
 * database.sql verrouille cette colonne côté serveur (trigger
 * protect_profile_email), l'e-mail ne provient que de auth.users.
 */
export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
  const payload: Record<string, unknown> = {};
  if (input.fullName !== undefined) payload.full_name = input.fullName;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl;
  if (input.language !== undefined) payload.language = input.language;
  if (input.birthDate !== undefined) payload.birth_date = input.birthDate;
  if (input.gender !== undefined) payload.gender = input.gender;

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw toAuthError(error);
  return mapProfileRow(data as ProfileRow);
}
