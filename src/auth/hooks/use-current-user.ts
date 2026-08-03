import { useAuth } from '../useAuth';

/** Identité Supabase Auth de l'utilisateur connecté, ou null. */
export function useCurrentUser() {
  return useAuth().user;
}
