import type { StyleProp, ViewStyle } from 'react-native';

import type { Coordinates } from '@/types/location';
import type { LocationFreshness } from '@/utils/location-freshness';

/**
 * Types partagés entre location-map-view.tsx (natif,
 * @maplibre/maplibre-react-native) et location-map-view.web.tsx (repli
 * web, maplibre-gl). Ce fichier ne doit JAMAIS importer
 * @maplibre/maplibre-react-native : c'est justement ce qui permet au bundle
 * web de ne jamais charger ce module natif (voir docs/LOCATION.md "Pourquoi
 * deux fichiers").
 */
export interface LocationMapMarker {
  id: string;
  coordinates: Coordinates;
  /** URL de la photo de profil à afficher comme icône du marqueur, si disponible. */
  imageUrl?: string | null;
  /** Nom affiché dans l'infobulle du marqueur et utilisé pour l'accessibilité. */
  label: string;
}

/** Marqueur d'un membre d'espace (jamais "moi" : voir LocationMapMarker pour ça). `freshness` ne vaut jamais 'unavailable' ici : un membre sans position connue n'est simplement jamais inclus dans ce tableau. */
export interface VisibleMemberMarker {
  id: string;
  coordinates: Coordinates;
  imageUrl?: string | null;
  label: string;
  freshness: Exclude<LocationFreshness, 'unavailable'>;
  /** Horodatage (locations.updated_at) de la dernière position connue. Ignoré par le rendu natif (le halo/style suffit) ; affiché explicitement dans le repli web (voir location-map-view.web.tsx). */
  updatedAt: string;
}

export interface LocationMapViewProps {
  myLocation: Coordinates;
  marker: LocationMapMarker;
  /** Rayon d'incertitude GPS en mètres, pour le cercle de précision. `null`/`undefined` : pas de cercle. */
  accuracyMeters?: number | null;
  /** Membres d'espaces visibles (position autorisée). Jamais dupliqués : un membre de plusieurs espaces communs n'apparaît qu'une fois. */
  members?: VisibleMemberMarker[];
  /** Appelé quand l'utilisateur touche un marqueur de membre (natif) ou une ligne de la liste (web) — ouvre la fiche membre. */
  onSelectMember?: (memberId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export interface LocationMapViewHandle {
  /** Recentre la caméra sur les coordonnées données (utilisé par les boutons Recentrer / Ma position). */
  recenter: (coordinates: Coordinates) => void;
}
