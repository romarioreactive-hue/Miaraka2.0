import * as Location from 'expo-location';

import type {
  Coordinates,
  LocationErrorCode,
  LocationPermission,
  LocationSample,
  LocationServiceError,
} from '@/types/location';

function createError(code: LocationErrorCode, message: string, cause?: unknown): LocationServiceError {
  return { code, message, cause };
}

function mapPermission(response: Location.LocationPermissionResponse): LocationPermission {
  const state = response.status === Location.PermissionStatus.GRANTED
    ? 'granted'
    : response.status === Location.PermissionStatus.DENIED
      ? 'denied'
      : 'undetermined';
  return { state, canAskAgain: response.canAskAgain };
}

/** Permission actuelle, sans déclencher de demande à l'utilisateur. */
export async function getForegroundPermission(): Promise<LocationPermission> {
  const response = await Location.getForegroundPermissionsAsync();
  return mapPermission(response);
}

/** Demande la permission de localisation au premier plan (affiche la boîte de dialogue système si nécessaire). */
export async function requestForegroundPermission(): Promise<LocationPermission> {
  const response = await Location.requestForegroundPermissionsAsync();
  return mapPermission(response);
}

/** Vrai si le GPS/les services de localisation sont activés au niveau de l'appareil (indépendamment de la permission accordée à l'app). */
export async function isLocationServicesEnabled(): Promise<boolean> {
  return Location.hasServicesEnabledAsync();
}

function mapLocationObject(location: Location.LocationObject): LocationSample {
  return {
    coords: { latitude: location.coords.latitude, longitude: location.coords.longitude },
    accuracy: location.coords.accuracy,
    altitude: location.coords.altitude,
    altitudeAccuracy: location.coords.altitudeAccuracy,
    heading: location.coords.heading,
    speed: location.coords.speed,
    timestamp: location.timestamp,
    // Réservé pour une étape ultérieure (expo-battery). Voir docs/LOCATION.md.
    batteryLevel: null,
  };
}

/**
 * Lecture unique de la position actuelle. Suppose que la permission est déjà
 * accordée : appeler getForegroundPermission()/requestForegroundPermission()
 * avant (c'est le rôle de useCurrentLocation, pas de cette fonction).
 */
export async function getCurrentLocation(): Promise<LocationSample> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.LocationAccuracy.Balanced,
    });
    return mapLocationObject(location);
  } catch (error) {
    throw createError('unavailable', "Impossible d'obtenir votre position actuelle.", error);
  }
}

export interface LocationWatchHandle {
  remove: () => void;
}

/**
 * Abonnement continu aux mises à jour de position (tant que l'app est au
 * premier plan). `onUpdate` est appelé à chaque nouvelle mesure, `onError`
 * si la plateforme signale un problème pendant le suivi (ex. GPS perdu).
 */
export async function watchLocation(
  onUpdate: (sample: LocationSample) => void,
  onError: (error: LocationServiceError) => void,
): Promise<LocationWatchHandle> {
  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.LocationAccuracy.Balanced,
      timeInterval: 4000,
      distanceInterval: 10,
    },
    (location) => onUpdate(mapLocationObject(location)),
    (reason) => onError(createError('unknown', reason)),
  );

  return { remove: () => subscription.remove() };
}

export type { Coordinates };
