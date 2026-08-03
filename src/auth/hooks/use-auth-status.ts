import { useAuth } from '../useAuth';
import type { AuthStatus } from '../types';

/** Statut courant : 'loading' | 'authenticated' | 'unauthenticated' | 'error'. */
export function useAuthStatus(): AuthStatus {
  return useAuth().status;
}
