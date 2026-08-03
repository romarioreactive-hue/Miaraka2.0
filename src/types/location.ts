/** Coordonnées géographiques brutes. */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Une mesure de position, normalisée à partir de expo-location.
 * Tous les champs autres que coords/timestamp peuvent être `null` si
 * l'appareil ou la plateforme ne les fournit pas.
 */
export interface LocationSample {
  coords: Coordinates;
  /** Rayon d'incertitude horizontal, en mètres. */
  accuracy: number | null;
  /** Altitude en mètres au-dessus du niveau de la mer. */
  altitude: number | null;
  /** Précision verticale de l'altitude, en mètres. */
  altitudeAccuracy: number | null;
  /** Direction du déplacement en degrés depuis le nord (0-360). */
  heading: number | null;
  /** Vitesse instantanée en mètres/seconde. */
  speed: number | null;
  /** Horodatage de la mesure, en millisecondes depuis epoch. */
  timestamp: number;
  /**
   * Niveau de batterie (0 à 1). Réservé pour une étape ultérieure : toujours
   * `null` pour l'instant. Voir docs/LOCATION.md "Évolutions prévues".
   */
  batteryLevel: number | null;
}

export type LocationPermissionState = 'undetermined' | 'granted' | 'denied';

/** Permission de localisation au premier plan, avec l'info nécessaire pour choisir "réessayer" vs "ouvrir les réglages". */
export interface LocationPermission {
  state: LocationPermissionState;
  /** Si `false`, l'OS ne réaffichera plus la demande : il faut passer par les réglages système. */
  canAskAgain: boolean;
}

/**
 * État global du cycle de vie de la localisation, affiché par
 * LocationStatusView (voir src/components/location/).
 */
export type LocationStatus =
  /** Vérification initiale de la permission en cours (très bref, avant le premier rendu utile). */
  | 'idle'
  /** Permission jamais demandée : en attente de l'action de l'utilisateur sur l'explication Miaraka. */
  | 'permission_undetermined'
  /** L'utilisateur a appuyé sur "Autoriser" : la boîte de dialogue système est affichée. */
  | 'requesting_permission'
  | 'permission_denied'
  | 'services_disabled'
  | 'locating'
  | 'available'
  | 'unavailable'
  | 'error';

export type LocationErrorCode =
  | 'permission_denied'
  | 'services_disabled'
  | 'unavailable'
  | 'timeout'
  | 'unknown';

export interface LocationServiceError {
  code: LocationErrorCode;
  message: string;
  cause?: unknown;
}

/** État exposé par useCurrentLocation() et par LocationContext. */
export interface LocationState {
  status: LocationStatus;
  permission: LocationPermission;
  sample: LocationSample | null;
  error: LocationServiceError | null;
}

/** Valeur exposée par useLocation() (src/lib/location) : l'état + les actions. */
export interface LocationContextValue extends LocationState {
  /** Affiche la boîte de dialogue système (à appeler seulement après l'explication Miaraka), puis démarre la localisation. */
  requestPermission: () => Promise<void>;
  /** Relit la position une seule fois, sans toucher à la permission ni au suivi en continu. Renvoie la nouvelle mesure (ou `null` en cas d'échec), pratique pour recentrer la carte immédiatement. */
  refresh: () => Promise<LocationSample | null>;
}
