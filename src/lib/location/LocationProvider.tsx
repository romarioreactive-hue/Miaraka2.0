import type { ReactNode } from 'react';

import { useCurrentLocation, type UseCurrentLocationOptions } from '@/hooks/use-current-location';

import { LocationContext } from './LocationContext';

export interface LocationProviderProps extends UseCurrentLocationOptions {
  children: ReactNode;
}

/**
 * Fournit UNE SEULE instance partagée de useCurrentLocation() à tous ses
 * descendants via le contexte, pour éviter que chaque composant qui a
 * besoin de la position déclenche son propre abonnement GPS et sa propre
 * demande de permission.
 *
 * Volontairement NON monté dans src/app/_layout.tsx : la localisation ne
 * doit être demandée que sur les écrans qui en ont réellement besoin (voir
 * docs/LOCATION.md "Pourquoi ne pas monter LocationProvider globalement").
 * À englober localement autour de l'écran carte.
 */
export function LocationProvider({ children, watch }: LocationProviderProps) {
  const location = useCurrentLocation({ watch });

  return <LocationContext.Provider value={location}>{children}</LocationContext.Provider>;
}
