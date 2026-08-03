export type AppLanguage = 'fr' | 'mg';

export type AccountStatus = 'active' | 'suspended' | 'deleted';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

/**
 * Ligne `profiles` normalisée en camelCase pour l'application. Reflète
 * database.sql : public.profiles. email est en lecture seule côté client
 * (protégé par un trigger côté base de données).
 */
export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  language: AppLanguage;
  birthDate: string | null;
  gender: Gender | null;
  status: AccountStatus;
  isOnline: boolean;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Identité Supabase Auth (auth.users), distincte du profil applicatif. */
export interface AuthUser {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
  phone: string | null;
  /** Fournisseur utilisé à l'inscription (ex. "email", "google", "apple"). */
  provider: string | null;
  createdAt: string;
  lastSignInAt: string | null;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Timestamp Unix (secondes) d'expiration de l'access token, si connu. */
  expiresAt: number | null;
  user: AuthUser;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_already_in_use'
  | 'weak_password'
  | 'network_error'
  | 'session_expired'
  | 'profile_not_found'
  | 'provider_not_connected'
  | 'unknown';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  cause?: unknown;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  profile: Profile | null;
  session: Session | null;
  error: AuthError | null;
}

/** Fournisseurs pris en charge par l'architecture. Seul "email" est câblé pour l'instant. */
export type AuthProviderId = 'email' | 'google' | 'apple';

export interface SignInWithEmailInput {
  email: string;
  password: string;
}

export interface SignUpWithEmailInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInWithOAuthInput {
  provider: Extract<AuthProviderId, 'google' | 'apple'>;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  language?: AppLanguage;
  birthDate?: string;
  gender?: Gender;
}

export interface AuthContextValue extends AuthState {
  signInWithEmail: (input: SignInWithEmailInput) => Promise<void>;
  signUpWithEmail: (input: SignUpWithEmailInput) => Promise<void>;
  signInWithOAuth: (input: SignInWithOAuthInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  clearError: () => void;
}
