import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Route vers laquelle rediriger un visiteur non connecté. */
  redirectTo?: Href;
}

/**
 * Enveloppe un écran qui nécessite une session active. Redirige vers
 * `redirectTo` si l'utilisateur n'est pas connecté.
 *
 * Le spinner plein écran ne s'affiche que le temps de la toute première
 * résolution de session (démarrage de l'app). status repasse à 'loading'
 * plus tard aussi pendant signOut()/refreshSession() : sans ce garde, les
 * écrans protégés seraient démontés puis remontés à chaque fois, perdant
 * leur état local. Une fois la session initiale résolue, l'écran reste
 * monté et se contente de réagir à un passage à 'unauthenticated'.
 */
export function ProtectedRoute({ children, redirectTo = '/' }: ProtectedRouteProps) {
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

  if (status === 'unauthenticated' || status === 'error') {
    return <Redirect href={redirectTo} />;
  }

  return <>{children}</>;
}
