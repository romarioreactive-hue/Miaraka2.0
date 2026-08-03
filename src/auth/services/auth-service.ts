import {
  getCurrentSession,
  getProfile,
  onAuthStateChange,
  refreshCurrentSession,
  signInWithEmail,
  signInWithOAuth,
  signOut,
  signUpWithEmail,
  updateProfile,
} from '@/lib/auth';

import type {
  Profile,
  Session,
  SignInWithEmailInput,
  SignInWithOAuthInput,
  SignUpWithEmailInput,
  UpdateProfileInput,
} from '../types';

export interface AuthenticatedResult {
  session: Session;
  profile: Profile;
}

async function authenticate(session: Session): Promise<AuthenticatedResult> {
  const profile = await getProfile(session.user.id);
  return { session, profile };
}

/**
 * Couche d'orchestration entre AuthProvider (état React) et
 * `@/lib/auth` (appels Supabase bruts). Combine plusieurs appels bas
 * niveau en opérations complètes du point de vue du domaine (ex. "se
 * connecter" implique aussi de charger le profil applicatif associé).
 */
export const authService = {
  getSession: getCurrentSession,
  refreshSession: refreshCurrentSession,
  onSessionChange: onAuthStateChange,
  signOut,

  async loadProfile(session: Session): Promise<Profile> {
    return getProfile(session.user.id);
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
    return updateProfile(userId, input);
  },

  async signInWithEmail(input: SignInWithEmailInput): Promise<AuthenticatedResult> {
    const session = await signInWithEmail(input);
    return authenticate(session);
  },

  async signUpWithEmail(input: SignUpWithEmailInput): Promise<AuthenticatedResult | null> {
    const session = await signUpWithEmail(input);
    return session ? authenticate(session) : null;
  },

  async signInWithOAuth(input: SignInWithOAuthInput): Promise<AuthenticatedResult> {
    const session = await signInWithOAuth(input);
    return authenticate(session);
  },
};
