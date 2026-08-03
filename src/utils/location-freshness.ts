export type LocationFreshness = 'live' | 'recent' | 'stale' | 'unavailable';

/**
 * Seuils (millisecondes) utilisés pour classer l'ancienneté d'une position.
 * Regroupés ici pour rester faciles à ajuster — aucune autre partie du code
 * ne doit redéfinir ces valeurs.
 */
export const LOCATION_FRESHNESS_THRESHOLDS_MS = {
  /** < 60 s : "en direct". */
  live: 60_000,
  /** < 5 min : "récente". Au-delà : "ancienne". */
  recent: 5 * 60_000,
} as const;

/**
 * Classe l'ancienneté d'une position à partir de son `updated_at`.
 * `updatedAt` absent (`null`/`undefined`) => 'unavailable' (aucune position
 * connue ou autorisée). Ne jamais renvoyer 'live' pour une mesure ancienne :
 * c'est la seule fonction qui doit décider si "En direct" peut être affiché.
 */
export function getLocationFreshness(updatedAt: string | null | undefined, now: number = Date.now()): LocationFreshness {
  if (!updatedAt) return 'unavailable';
  const elapsedMs = Math.max(0, now - new Date(updatedAt).getTime());
  if (elapsedMs < LOCATION_FRESHNESS_THRESHOLDS_MS.live) return 'live';
  if (elapsedMs < LOCATION_FRESHNESS_THRESHOLDS_MS.recent) return 'recent';
  return 'stale';
}
