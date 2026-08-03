import type { AuthSession as SupabaseSession, AuthUser as SupabaseUser } from '@supabase/supabase-js';

import type { AuthUser, Session } from '@/auth/types';
import { supabase } from '@/lib/supabase';

import { toAuthError } from './errors';

export function mapAuthUser(user: SupabaseUser): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    phone: user.phone ?? null,
    provider: user.app_metadata?.provider ?? null,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

export function mapSession(session: SupabaseSession): Session {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
    user: mapAuthUser(session.user),
  };
}

/** Session actuelle, si l'utilisateur est déjà connecté (lecture locale, sans appel réseau si le token est encore valide). */
export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toAuthError(error);
  return data.session ? mapSession(data.session) : null;
}

/** Force le renouvellement de la session à partir du refresh token. */
export async function refreshCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw toAuthError(error);
  return data.session ? mapSession(data.session) : null;
}

/** S'abonne aux changements de session (connexion, déconnexion, refresh automatique). Retourne une fonction de désinscription. */
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ? mapSession(session) : null);
  });

  return () => data.subscription.unsubscribe();
}
