import { useAuth } from '../useAuth';

/** Profil applicatif (public.profiles) de l'utilisateur connecté, ou null. */
export function useProfile() {
  return useAuth().profile;
}
