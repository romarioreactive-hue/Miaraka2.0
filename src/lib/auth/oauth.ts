import type { AuthError, Session, SignInWithOAuthInput } from '@/auth/types';

/**
 * Connexion via un fournisseur OAuth (Google, Apple).
 *
 * NON CONNECTE : cette fonction est un point d'extension prêt à l'emploi.
 * Elle conserve la signature finale attendue par AuthProvider pour qu'aucun
 * autre fichier n'ait à changer quand un fournisseur sera réellement câblé
 * (ex. Google Sign-In natif + supabase.auth.signInWithIdToken côté mobile,
 * ou supabase.auth.signInWithOAuth côté web). Tant qu'un fournisseur n'est
 * pas implémenté ci-dessous, l'appel échoue avec un AuthError explicite.
 */
export async function signInWithOAuth(input: SignInWithOAuthInput): Promise<Session> {
  const error: AuthError = {
    code: 'provider_not_connected',
    message: `La connexion via ${input.provider} n'est pas encore configurée.`,
  };
  throw error;
}
