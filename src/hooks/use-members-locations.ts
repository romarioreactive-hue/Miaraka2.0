import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/auth';
import {
  getVisibleMembersLocations,
  type MembersLocationServiceError,
  type VisibleMemberLocation,
} from '@/services/members-location-service';
import { getMySpaces } from '@/services/spaces-service';

export type MembersLocationsStatus =
  | 'loading'
  | 'no_spaces'
  | 'no_members'
  | 'no_sharing_members'
  | 'success'
  | 'error';

export interface UseMembersLocationsResult {
  status: MembersLocationsStatus;
  members: VisibleMemberLocation[];
  error: MembersLocationServiceError | null;
  lastFetchedAt: number | null;
  refresh: () => Promise<void>;
}

/** Pas de Supabase Realtime à cette étape : rechargement périodique raisonnable tant que l'écran reste ouvert. */
const AUTO_REFRESH_INTERVAL_MS = 60_000;

/**
 * Charge les membres visibles (position autorisée) de tous mes espaces, au
 * montage puis toutes les AUTO_REFRESH_INTERVAL_MS (+ refresh() manuel pour
 * le bouton "Actualiser"). Réutilise getMySpaces() (déjà utilisé par
 * l'onglet Espaces) pour distinguer "aucun espace" de "aucun membre" de
 * "aucun membre qui partage sa position", sans requête supplémentaire dédiée.
 */
export function useMembersLocations(): UseMembersLocationsResult {
  const { user, status: authStatus } = useAuth();
  const userId = user?.id ?? null;

  const [status, setStatus] = useState<MembersLocationsStatus>('loading');
  const [members, setMembers] = useState<VisibleMemberLocation[]>([]);
  const [error, setError] = useState<MembersLocationServiceError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const inFlightRef = useRef(false);

  const load = useCallback(async () => {
    if (!userId || inFlightRef.current) return;
    inFlightRef.current = true;
    setStatus((current) => (current === 'success' ? 'success' : 'loading'));

    try {
      const [spaces, visibleMembers] = await Promise.all([getMySpaces(userId), getVisibleMembersLocations(userId)]);
      if (!mountedRef.current) return;

      setMembers(visibleMembers);
      setError(null);
      setLastFetchedAt(Date.now());

      if (spaces.length === 0) {
        setStatus('no_spaces');
      } else if (spaces.every((space) => space.memberCount <= 1)) {
        setStatus('no_members');
      } else if (visibleMembers.length === 0) {
        setStatus('no_sharing_members');
      } else {
        setStatus('success');
      }
    } catch (caughtError) {
      if (!mountedRef.current) return;
      setError(caughtError as MembersLocationServiceError);
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !userId) return;

    void load();
    const interval = setInterval(() => void load(), AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [authStatus, userId, load]);

  return { status, members, error, lastFetchedAt, refresh: load };
}
