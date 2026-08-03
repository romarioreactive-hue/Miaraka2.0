import { isAuthApiError, isAuthError, isAuthRetryableFetchError } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';

import type { AuthError, AuthErrorCode } from '@/auth/types';

/** Codes d'erreur Supabase Auth (https://supabase.com/docs/guides/auth/debugging/error-codes) mappés vers nos codes internes. */
const SUPABASE_AUTH_CODE_MAP: Record<string, AuthErrorCode> = {
  invalid_credentials: 'invalid_credentials',
  email_exists: 'email_already_in_use',
  user_already_exists: 'email_already_in_use',
  weak_password: 'weak_password',
  session_not_found: 'session_expired',
  session_expired: 'session_expired',
  refresh_token_not_found: 'session_expired',
  refresh_token_already_used: 'session_expired',
};

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error &&
    'hint' in error
  );
}

/** Convertit n'importe quelle erreur (Supabase Auth, Postgrest, réseau, inconnue) en AuthError normalisée. */
export function toAuthError(error: unknown): AuthError {
  if (isAuthError(error)) {
    if (isAuthRetryableFetchError(error)) {
      return { code: 'network_error', message: 'Connexion au serveur impossible. Vérifiez votre réseau.', cause: error };
    }

    if (isAuthApiError(error) && error.code && SUPABASE_AUTH_CODE_MAP[error.code]) {
      return { code: SUPABASE_AUTH_CODE_MAP[error.code], message: error.message, cause: error };
    }

    return { code: 'unknown', message: error.message, cause: error };
  }

  if (isPostgrestError(error)) {
    if (error.code === 'PGRST116') {
      return { code: 'profile_not_found', message: 'Profil introuvable.', cause: error };
    }
    return { code: 'unknown', message: error.message, cause: error };
  }

  if (isAuthErrorLike(error)) {
    return error;
  }

  if (error instanceof Error) {
    return { code: 'unknown', message: error.message, cause: error };
  }

  return { code: 'unknown', message: 'Une erreur inattendue est survenue.', cause: error };
}

/** Vrai si l'erreur est déjà une AuthError normalisée (pour éviter de la re-wrapper). */
function isAuthErrorLike(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}
