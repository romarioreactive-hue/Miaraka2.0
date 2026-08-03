import type { Session, SignUpWithEmailInput } from '@/auth/types';
import { supabase } from '@/lib/supabase';

import { toAuthError } from './errors';
import { mapSession } from './session';

/**
 * Crée un compte par e-mail/mot de passe. Retourne `null` si le projet
 * Supabase exige une confirmation par e-mail avant l'ouverture de session
 * (aucune session n'est alors disponible tant que l'utilisateur n'a pas
 * cliqué sur le lien de confirmation).
 */
export async function signUpWithEmail(input: SignUpWithEmailInput): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: input.fullName ? { data: { full_name: input.fullName } } : undefined,
  });

  if (error) throw toAuthError(error);
  return data.session ? mapSession(data.session) : null;
}
