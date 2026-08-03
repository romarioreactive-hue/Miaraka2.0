import type { Session, SignInWithEmailInput } from '@/auth/types';
import { supabase } from '@/lib/supabase';

import { toAuthError } from './errors';
import { mapSession } from './session';

export async function signInWithEmail(input: SignInWithEmailInput): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) throw toAuthError(error);
  if (!data.session) {
    throw toAuthError(new Error('Aucune session retournée après la connexion.'));
  }

  return mapSession(data.session);
}
