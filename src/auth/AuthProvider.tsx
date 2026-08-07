import { ReactNode, useCallback, useEffect, useReducer, useRef } from 'react';

import { toAuthError } from '@/lib/auth';

import { AuthContext } from './AuthContext';
import { authService } from './services';
import type {
  AuthContextValue,
  AuthError,
  AuthState,
  Profile,
  Session,
  SignInWithEmailInput,
  SignInWithOAuthInput,
  SignUpWithEmailInput,
  UpdateProfileInput,
} from './types';

type Action =
  | { type: 'LOADING' }
  | { type: 'AUTHENTICATED'; session: Session; profile: Profile }
  | { type: 'UNAUTHENTICATED' }
  | { type: 'ERROR'; error: AuthError }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  status: 'loading',
  user: null,
  profile: null,
  session: null,
  error: null,
};

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading', error: null };
    case 'AUTHENTICATED':
      return {
        status: 'authenticated',
        session: action.session,
        user: action.session.user,
        profile: action.profile,
        error: null,
      };
    case 'UNAUTHENTICATED':
      return { status: 'unauthenticated', session: null, user: null, profile: null, error: null };
    case 'ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const mountedRef = useRef(true);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const settle = useCallback(async (session: Session | null) => {
    if (!session) {
      dispatch({ type: 'UNAUTHENTICATED' });
      return;
    }
    // Rebind `const` : contrairement au paramètre `session`, cette liaison
    // garde son type affiné (Session, non-null) à l'intérieur de la fonction
    // imbriquée ci-dessous.
    const authenticatedSession = session;

    // Fonction locale (pas `settle` lui-même) : une valeur mémoïsée par
    // useCallback ne doit jamais se référencer elle-même dans son propre
    // corps (incompatible avec React Compiler). `attemptLoadProfile` est une
    // déclaration hoistée ordinaire, donc l'auto-référence pour la
    // nouvelle tentative est sans risque.
    async function attemptLoadProfile() {
      try {
        const profile = await authService.loadProfile(authenticatedSession);
        if (mountedRef.current) dispatch({ type: 'AUTHENTICATED', session: authenticatedSession, profile });
      } catch (error) {
        if (!mountedRef.current) return;
        const authError = toAuthError(error);
        if (authError.code === 'network_error') {
          // La session elle-même est valide : seul le chargement du profil a
          // échoué temporairement (réseau). On ne déconnecte jamais pour ça —
          // ni ne remplace un état déjà authentifié affiché à l'écran par une
          // erreur — on réessaie simplement en tâche de fond.
          setTimeout(() => {
            if (mountedRef.current) void attemptLoadProfile();
          }, 3000);
          return;
        }
        dispatch({ type: 'ERROR', error: authError });
      }
    }

    await attemptLoadProfile();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    // Résolution de la session au démarrage. Une erreur réseau temporaire
    // (ex. app rouverte hors connexion après une longue absence, le seul cas
    // où getSession() peut réellement échouer — Supabase préserve déjà la
    // session dans tous les autres cas) ne doit JAMAIS déconnecter
    // l'utilisateur : on reste en 'loading' (aucune redirection depuis
    // ProtectedRoute/PublicRoute tant que ce statut n'a pas changé) et on
    // réessaie, au lieu de traiter ça comme une session invalide.
    function resolveInitialSession() {
      authService
        .getSession()
        .then((session) => {
          if (mountedRef.current) void settle(session);
        })
        .catch((error) => {
          if (!mountedRef.current) return;
          const authError = toAuthError(error);
          if (authError.code === 'network_error') {
            retryTimeout = setTimeout(resolveInitialSession, 3000);
            return;
          }
          dispatch({ type: 'ERROR', error: authError });
        });
    }

    resolveInitialSession();

    const unsubscribe = authService.onSessionChange((session) => {
      if (mountedRef.current) void settle(session);
    });

    return () => {
      mountedRef.current = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      unsubscribe();
    };
  }, [settle]);

  const signInWithEmail = useCallback(async (input: SignInWithEmailInput) => {
    dispatch({ type: 'LOADING' });
    try {
      const { session, profile } = await authService.signInWithEmail(input);
      dispatch({ type: 'AUTHENTICATED', session, profile });
    } catch (error) {
      const authError = toAuthError(error);
      dispatch({ type: 'ERROR', error: authError });
      throw authError;
    }
  }, []);

  const signUpWithEmail = useCallback(async (input: SignUpWithEmailInput) => {
    dispatch({ type: 'LOADING' });
    try {
      const result = await authService.signUpWithEmail(input);
      if (result) {
        dispatch({ type: 'AUTHENTICATED', session: result.session, profile: result.profile });
      } else {
        // Aucune session : le projet Supabase exige une confirmation par e-mail.
        dispatch({ type: 'UNAUTHENTICATED' });
      }
    } catch (error) {
      const authError = toAuthError(error);
      dispatch({ type: 'ERROR', error: authError });
      throw authError;
    }
  }, []);

  const signInWithOAuth = useCallback(async (input: SignInWithOAuthInput) => {
    dispatch({ type: 'LOADING' });
    try {
      const { session, profile } = await authService.signInWithOAuth(input);
      dispatch({ type: 'AUTHENTICATED', session, profile });
    } catch (error) {
      const authError = toAuthError(error);
      dispatch({ type: 'ERROR', error: authError });
      throw authError;
    }
  }, []);

  const signOut = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      await authService.signOut();
      dispatch({ type: 'UNAUTHENTICATED' });
    } catch (error) {
      const authError = toAuthError(error);
      dispatch({ type: 'ERROR', error: authError });
      throw authError;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const session = await authService.refreshSession();
      await settle(session);
    } catch (error) {
      const authError = toAuthError(error);
      dispatch({ type: 'ERROR', error: authError });
      throw authError;
    }
  }, [settle]);

  const refreshProfile = useCallback(async () => {
    const currentSession = stateRef.current.session;
    if (!currentSession) return;
    await settle(currentSession);
  }, [settle]);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const currentSession = stateRef.current.session;
    if (!currentSession) {
      const authError: AuthError = { code: 'session_expired', message: 'Aucune session active.' };
      dispatch({ type: 'ERROR', error: authError });
      throw authError;
    }
    try {
      const profile = await authService.updateProfile(currentSession.user.id, input);
      dispatch({ type: 'AUTHENTICATED', session: currentSession, profile });
    } catch (error) {
      const authError = toAuthError(error);
      dispatch({ type: 'ERROR', error: authError });
      throw authError;
    }
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  const value: AuthContextValue = {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    refreshSession,
    refreshProfile,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
