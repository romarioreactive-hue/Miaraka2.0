import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import { AppBackground } from '@/components/ui/app-background';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/language-context';
import { useLocationRealtime } from '@/hooks/use-location-realtime';
import { useMembersLocations, type MembersLocationsStatus } from '@/hooks/use-members-locations';
import type { TranslationKey } from '@/i18n';
import { LocationProvider, useLocation, useLocationSync, type LocationSyncState } from '@/lib/location';
import type { LocationRealtimeConnectionStatus } from '@/services/location-realtime-service';
import type { SpaceType } from '@/services/spaces-service';
import { darkColors, radius, spacing, typography } from '@/theme';
import type { LocationServiceError, LocationStatus } from '@/types/location';
import { getLocationFreshness } from '@/utils/location-freshness';

import { getLocationErrorMessage } from './location-error-messages';
import { LocationMapView } from './location-map-view';
import type { LocationMapViewHandle, VisibleMemberMarker } from './location-map-view.types';
import { LocationPermissionPrompt } from './location-permission-prompt';
import { LocationStatusView } from './location-status-view';
import { MemberSheet } from './member-sheet';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type MapFilter = 'tous' | 'famille' | 'amis' | 'equipe';
const FILTERS: MapFilter[] = ['tous', 'famille', 'amis', 'equipe'];
const FILTER_SPACE_TYPE: Record<Exclude<MapFilter, 'tous'>, SpaceType> = {
  famille: 'family',
  amis: 'friends',
  equipe: 'team',
};

/**
 * Contenu réel de l'onglet Carte : ma position (avatar réel comme marqueur)
 * + les membres de mes espaces qui ont activé le partage (RLS filtre déjà
 * aux positions autorisées — voir src/services/members-location-service.ts).
 * Aucun Realtime à cette étape : rechargement périodique (voir
 * use-members-locations.ts) + bouton "Actualiser".
 *
 * LocationProvider est monté ICI, localement à cet écran, pas dans
 * src/app/_layout.tsx : la permission de localisation n'est demandée que
 * lorsque l'utilisateur ouvre réellement l'onglet Carte, et le suivi GPS
 * s'arrête automatiquement quand il le quitte (démontage du Provider).
 */
export function MyLocationScreen() {
  return (
    <LocationProvider>
      <MyLocationScreenContent />
    </LocationProvider>
  );
}

function MyLocationScreenContent() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { status, permission, sample, error, requestPermission, refresh } = useLocation();
  const sync = useLocationSync();
  const membersLocations = useMembersLocations();
  const realtimeStatus = useLocationRealtime({
    userId: profile?.id ?? null,
    enabled: profile !== null,
    onChange: membersLocations.refresh,
  });
  const mapRef = useRef<LocationMapViewHandle>(null);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('tous');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const markerLabel = profile?.fullName || profile?.email || t('common.me');

  const filteredMembers = useMemo(() => {
    if (activeFilter === 'tous') return membersLocations.members;
    const type = FILTER_SPACE_TYPE[activeFilter];
    return membersLocations.members.filter((member) => member.spaces.some((space) => space.type === type));
  }, [activeFilter, membersLocations.members]);

  const memberMarkers = useMemo<VisibleMemberMarker[]>(
    () =>
      filteredMembers.map((member) => ({
        id: member.profileId,
        coordinates: { latitude: member.latitude, longitude: member.longitude },
        imageUrl: member.avatarUrl,
        label: member.fullName || t('location.member.unknownName'),
        freshness: getLocationFreshness(member.updatedAt) as VisibleMemberMarker['freshness'],
        updatedAt: member.updatedAt,
      })),
    [filteredMembers, t],
  );

  const selectedMember = selectedMemberId
    ? (membersLocations.members.find((member) => member.profileId === selectedMemberId) ?? null)
    : null;

  function handleAllow() {
    void requestPermission();
  }

  function handleRecenter() {
    if (sample) mapRef.current?.recenter(sample.coords);
  }

  async function handleMyLocation() {
    const fresh = await refresh();
    if (fresh) mapRef.current?.recenter(fresh.coords);
  }

  const showPrompt = status === 'permission_undetermined' && !promptDismissed;
  const showLater = status === 'permission_undetermined' && promptDismissed;

  return (
    <AppBackground variant="map">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <View style={styles.topBarCopy}>
            <Text accessibilityRole="header" style={styles.title}>{t('location.screenTitle')}</Text>
            <RealtimeIndicator membersStatus={membersLocations.status} realtimeStatus={realtimeStatus} />
          </View>
          <Pressable
            accessibilityLabel={t('location.refresh')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => void membersLocations.refresh()}
            style={styles.refreshButton}>
            <SymbolView name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }} size={20} tintColor={darkColors.primary} weight="medium" />
          </Pressable>
        </View>

        <ShareLocationCard canEnable={sample !== null} sync={sync} />

        <FilterRow activeFilter={activeFilter} onChangeFilter={setActiveFilter} />

        <MembersStatusBanner status={membersLocations.status} />

        <View style={styles.mapWrap}>
          {sample ? (
            <>
              <LocationMapView
                accuracyMeters={sample.accuracy}
                marker={{
                  id: profile?.id ?? 'me',
                  coordinates: sample.coords,
                  imageUrl: profile?.avatarUrl,
                  label: markerLabel,
                }}
                members={memberMarkers}
                myLocation={sample.coords}
                onSelectMember={setSelectedMemberId}
                ref={mapRef}
              />

              {status !== 'available' ? (
                <LocationBanner error={error} onRetry={requestPermission} status={status} />
              ) : sample.accuracy != null ? (
                <View style={styles.accuracyBadge}>
                  <Text style={styles.accuracyText}>{t('location.accuracyLabel', { value: Math.round(sample.accuracy) })}</Text>
                </View>
              ) : null}

              <View style={styles.controls}>
                <MapButton
                  accessibilityLabel={t('location.recenter')}
                  icon={{ ios: 'scope', android: 'center_focus_strong', web: 'center_focus_strong' }}
                  onPress={handleRecenter}
                />
                <MapButton
                  accessibilityLabel={t('location.myLocation')}
                  icon={{ ios: 'location.fill', android: 'my_location', web: 'my_location' }}
                  onPress={() => void handleMyLocation()}
                />
              </View>
            </>
          ) : showPrompt ? (
            <LocationPermissionPrompt onAllow={handleAllow} onLater={() => setPromptDismissed(true)} />
          ) : showLater ? (
            <EmptyState
              actionLabel={t('location.laterEnable')}
              description={t('location.laterDescription')}
              icon={<SymbolView name={{ ios: 'location.slash', android: 'location_disabled', web: 'location_disabled' }} size={28} tintColor={darkColors.primary} weight="medium" />}
              onAction={() => setPromptDismissed(false)}
              style={styles.state}
              title={t('location.laterTitle')}
            />
          ) : (
            <LocationStatusView error={error} onRetry={requestPermission} permission={permission} status={status} />
          )}
        </View>
      </SafeAreaView>

      <MemberSheet member={selectedMember} myCoordinates={sample?.coords ?? null} onClose={() => setSelectedMemberId(null)} />
    </AppBackground>
  );
}

/**
 * Interrupteur "Partager ma position" : envoie la position vers Supabase
 * (voir src/services/location-sync-service.ts) tant qu'il est actif.
 * Désactivé tant qu'aucune position réelle n'est disponible (canEnable),
 * conformément à la règle "jamais de position envoyée avant permission GPS
 * accordée".
 */
function ShareLocationCard({ canEnable, sync }: { canEnable: boolean; sync: LocationSyncState & { setEnabled: (value: boolean) => void } }) {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(interval);
  }, []);

  const isStale = sync.status === 'active' && getLocationFreshness(sync.lastSyncedAt, now) !== 'live';
  const effectiveStatus = isStale ? 'stale' : sync.status;

  const { key, variant } = STATUS_COPY[effectiveStatus];
  const isOn = sync.status !== 'disabled';

  return (
    <View style={styles.shareCard}>
      <Switch
        accessibilityLabel={t('location.share.title')}
        disabled={!canEnable && !isOn}
        label={t('location.share.title')}
        onValueChange={sync.setEnabled}
        value={isOn}
      />
      <View style={styles.shareStatusRow}>
        <Badge label={t(key)} variant={variant} />
        {sync.status === 'active' && sync.lastSyncedAt ? (
          <Text style={styles.shareFreshness}>{formatFreshness(sync.lastSyncedAt, now, t)}</Text>
        ) : null}
      </View>
    </View>
  );
}

const STATUS_COPY: Record<LocationSyncState['status'] | 'stale', { key: TranslationKey; variant: BadgeVariant }> = {
  disabled: { key: 'location.share.disabled', variant: 'neutral' },
  enabling: { key: 'location.share.enabling', variant: 'neutral' },
  active: { key: 'location.share.active', variant: 'success' },
  stale: { key: 'location.share.stale', variant: 'warning' },
  permission_required: { key: 'location.share.permissionRequired', variant: 'warning' },
  sync_failed: { key: 'location.share.syncFailed', variant: 'error' },
  offline: { key: 'location.share.offline', variant: 'neutral' },
};

function formatFreshness(updatedAt: string, now: number, t: (key: TranslationKey, params?: Record<string, string | number>) => string): string {
  const elapsedMs = now - new Date(updatedAt).getTime();
  if (elapsedMs < 10_000) return t('location.share.updatedJustNow');
  if (elapsedMs < 60_000) return t('location.share.updatedSecondsAgo');
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 60) return t('location.share.updatedMinutesAgo', { value: minutes });
  return t('location.share.updatedOverHourAgo');
}

/** Filtre réellement les membres affichés par type d'espace (family/friends/team) — voir mission "Activer réellement". Ma propre position n'est jamais filtrée. */
function FilterRow({ activeFilter, onChangeFilter }: { activeFilter: MapFilter; onChangeFilter: (filter: MapFilter) => void }) {
  const { t } = useLanguage();

  return (
    <View style={styles.filtersRow}>
      <View style={styles.filtersContent}>
        {FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          const label = t(
            filter === 'tous' ? 'groups.all' : filter === 'famille' ? 'groups.family' : filter === 'amis' ? 'groups.friends' : 'groups.team',
          );
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={filter}
              onPress={() => onChangeFilter(filter)}
              style={[styles.filter, isActive && styles.filterActive]}>
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Indicateur discret d'état Realtime, sous le titre. `membersStatus ===
 * 'error'` prime sur tout : impossible d'obtenir des données fraîches, peu
 * importe l'état du canal Realtime — c'est plus grave qu'une simple perte de
 * temps réel. Rien n'est affiché lors de la toute première connexion
 * (évite un "Reconnexion…" trompeur avant même la première tentative).
 */
function RealtimeIndicator({ realtimeStatus, membersStatus }: { realtimeStatus: LocationRealtimeConnectionStatus; membersStatus: MembersLocationsStatus }) {
  const { t } = useLanguage();

  if (membersStatus === 'error') {
    return (
      <View style={styles.realtimeRow}>
        <View style={[styles.realtimeDot, { backgroundColor: darkColors.error }]} />
        <Text style={styles.realtimeText}>{t('location.realtime.syncFailed')}</Text>
      </View>
    );
  }

  if (realtimeStatus === 'connecting') return null;

  const copy: Record<Exclude<LocationRealtimeConnectionStatus, 'connecting'>, { key: TranslationKey; color: string }> = {
    connected: { key: 'location.realtime.active', color: darkColors.live },
    reconnecting: { key: 'location.realtime.reconnecting', color: darkColors.warning },
    closed: { key: 'location.realtime.offline', color: darkColors.textMuted },
  };
  const { key, color } = copy[realtimeStatus];

  return (
    <View style={styles.realtimeRow}>
      <View style={[styles.realtimeDot, { backgroundColor: color }]} />
      <Text style={styles.realtimeText}>{t(key)}</Text>
    </View>
  );
}

/** Bandeau informatif (pas de position à filtrer) pour les états "aucun espace" / "aucun membre" / "aucun membre qui partage" / "erreur". Silencieux pendant le chargement pour ne pas clignoter à chaque actualisation automatique. */
function MembersStatusBanner({ status }: { status: MembersLocationsStatus }) {
  const { t } = useLanguage();

  if (status === 'loading' || status === 'success') return null;

  const copy: Record<Exclude<MembersLocationsStatus, 'loading' | 'success'>, TranslationKey> = {
    no_spaces: 'location.membersEmpty.noSpaces',
    no_members: 'location.membersEmpty.noMembers',
    no_sharing_members: 'location.membersEmpty.noSharing',
    error: 'location.membersEmpty.error',
  };

  return (
    <View style={styles.membersBanner}>
      <SymbolView
        name={{ ios: 'person.2.slash', android: 'group_off', web: 'group_off' }}
        size={16}
        tintColor={darkColors.textMuted}
        weight="medium"
      />
      <Text style={styles.membersBannerText}>{t(copy[status])}</Text>
    </View>
  );
}

function MapButton({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: SymbolName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}>
      <SymbolView name={icon} size={22} tintColor={darkColors.primary} weight="medium" />
    </Pressable>
  );
}

/** Bandeau non bloquant affiché par-dessus la carte quand une position était déjà connue mais que le statut se dégrade (GPS perdu, permission révoquée en cours d'usage, actualisation). La dernière position connue reste affichée : voir mission "comprendre clairement si la localisation est refusée ou indisponible". */
function LocationBanner({
  status,
  error,
  onRetry,
}: {
  status: LocationStatus;
  error: LocationServiceError | null;
  onRetry: () => void;
}) {
  const { t } = useLanguage();

  if (status === 'locating' || status === 'requesting_permission') {
    return (
      <View style={styles.banner}>
        <ActivityIndicator color={darkColors.primary} size="small" />
        <Text style={styles.bannerText}>{t('location.locatingLabel')}</Text>
      </View>
    );
  }

  const description = status === 'permission_denied'
    ? t('location.permissionDeniedDescription')
    : status === 'services_disabled'
      ? t('location.servicesDisabledDescription')
      : error
        ? getLocationErrorMessage(t, error.code)
        : t('location.unavailableDescription');

  return (
    <View style={styles.banner}>
      <SymbolView
        name={{ ios: 'exclamationmark.triangle.fill', android: 'error_outline', web: 'error_outline' }}
        size={16}
        tintColor={darkColors.warning}
        weight="medium"
      />
      <Text numberOfLines={2} style={styles.bannerText}>{description}</Text>
      <Pressable
        accessibilityLabel={t('common.retry')}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onRetry}
        style={styles.bannerRetry}>
        <Text style={styles.bannerRetryText}>{t('common.retry')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  topBarCopy: { justifyContent: 'center' },
  title: { ...typography.titleLarge, color: darkColors.textPrimary },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circle,
  },
  realtimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: 2,
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.circle,
  },
  realtimeText: {
    ...typography.caption,
    color: darkColors.textMuted,
  },
  shareCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surfaceElevated,
  },
  shareStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingBottom: spacing[3],
    marginTop: -spacing[2],
  },
  shareFreshness: {
    ...typography.caption,
    color: darkColors.textMuted,
  },
  filtersRow: { paddingHorizontal: spacing[4], paddingTop: spacing[2], gap: spacing[1] },
  filtersContent: { flexDirection: 'row', gap: spacing[2] },
  filter: {
    alignItems: 'center',
    backgroundColor: darkColors.surfaceElevated,
    borderColor: darkColors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing[4],
  },
  filterActive: {
    backgroundColor: darkColors.primary,
    borderColor: darkColors.primary,
  },
  filterLabel: {
    ...typography.labelMedium,
    color: darkColors.textSecondary,
  },
  filterLabelActive: {
    color: darkColors.textInverse,
  },
  membersBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  membersBannerText: {
    ...typography.caption,
    color: darkColors.textMuted,
    flex: 1,
  },
  mapWrap: { flex: 1, margin: spacing[4], borderRadius: radius.extraLarge, overflow: 'hidden' },
  state: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
    borderRadius: radius.extraLarge,
    backgroundColor: darkColors.surface,
  },
  controls: {
    position: 'absolute',
    right: spacing[3],
    bottom: spacing[3],
    gap: spacing[2],
  },
  control: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circle,
    backgroundColor: darkColors.surfaceElevated,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  controlPressed: {
    opacity: 0.78,
  },
  accuracyBadge: {
    position: 'absolute',
    left: spacing[3],
    top: spacing[3],
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
    borderRadius: radius.pill,
    backgroundColor: darkColors.overlay,
  },
  accuracyText: { ...typography.caption, color: darkColors.textInverse },
  banner: {
    position: 'absolute',
    left: spacing[3],
    right: spacing[3],
    top: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 40,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.medium,
    backgroundColor: darkColors.overlayStrong,
  },
  bannerText: {
    ...typography.caption,
    color: darkColors.textInverse,
    flex: 1,
  },
  bannerRetry: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  bannerRetryText: {
    ...typography.labelMedium,
    color: darkColors.primary,
  },
});
