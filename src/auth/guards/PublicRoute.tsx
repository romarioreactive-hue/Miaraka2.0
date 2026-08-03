import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../useAuth';

interface PublicRouteProps {
  children: ReactNode;
  /** Route vers laquelle rediriger un utilisateur déjà connecté (ex. écran de connexion). */
  redirectTo?: Href;
}

/**
 * Enveloppe un écran réservé aux visiteurs non connectés (connexion,
 * inscription...). Redirige vers `redirectTo` si une session est déjà
 * active.
 *
 * Le spinner plein écran ne s'affiche que le temps de la toute première
 * résolution de session (démarrage de l'app), pas à chaque passage de
 * status à 'loading' (ex. pendant signInWithEmail()) : sinon un écran de
 * connexion en cours de saisie serait démonté puis remonté vide à chaque
 * tentative.
 */
export function PublicRoute({ children, redirectTo = '/demo' }: PublicRouteProps) {
  const { status } = useAuth();
  const [hasResolvedOnce, setHasResolvedOnce] = useState(status !== 'loading');

  useEffect(() => {
    if (status !== 'loading') setHasResolvedOnce(true);
  }, [status]);

  if (!hasResolvedOnce) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href={redirectTo} />;
  }

  return <>{children}</>;
}
