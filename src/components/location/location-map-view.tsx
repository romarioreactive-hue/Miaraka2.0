import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, type Region } from 'react-native-maps';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';
import type { Coordinates } from '@/types/location';

import type { LocationMapViewHandle, LocationMapViewProps, VisibleMemberMarker } from './location-map-view.types';

/** ~ niveau de rue. Valeur fixe : pas de "niveau de zoom" distinct côté react-native-maps (région = delta lat/lng). */
const DEFAULT_DELTA = 0.006;
const RECENTER_DURATION_MS = 400;
/** Durée d'un cycle de pulsation (voir MeMarker/MemberMarker) — doit rester alignée avec PULSE_REPS × PULSE_DURATION_MS ci-dessous. */
const PULSE_DURATION_MS = 2000;
const PULSE_REPS = 2;
/** Petite marge après la fin des `PULSE_REPS` cycles avant de figer le marqueur (voir useSettlingTrackViewChanges). */
const SETTLE_MARGIN_MS = 300;

function regionFromCoordinates(coordinates: Coordinates): Region {
  return { ...coordinates, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA };
}

/**
 * `tracksViewChanges={true}` en continu force react-native-maps à
 * régénérer un bitmap natif du marqueur à CHAQUE frame — avec une
 * pulsation Reanimated infinie (`withRepeat(..., -1)`) sur un marqueur
 * toujours affiché (Moi), ça sature le rendu natif et peut geler l'app au
 * chargement de la carte (symptôme observé : "l'app cesse de répondre").
 *
 * Ce hook ne suit les changements que pendant les `PULSE_REPS` premiers
 * cycles de pulsation (le temps de capturer l'avatar + le halo), puis fige
 * le marqueur en bitmap statique. Se réarme si `active` redevient vrai
 * (ex. un membre repasse "en direct").
 */
function useSettlingTrackViewChanges(active: boolean): boolean {
  const [tracking, setTracking] = useState(active);

  useEffect(() => {
    if (!active) {
      setTracking(false);
      return;
    }
    setTracking(true);
    const timeout = setTimeout(() => setTracking(false), PULSE_DURATION_MS * PULSE_REPS + SETTLE_MARGIN_MS);
    return () => clearTimeout(timeout);
  }, [active]);

  return tracking;
}

/**
 * Rendu natif (Android/iOS) via react-native-maps : Google Maps sur
 * Android, Apple Maps sur iOS par défaut (aucune clé requise). Un marqueur
 * personnalisé (avatar réel + halo) est utilisé à la place du point bleu
 * natif — voir MeMarker plus bas.
 *
 * Ce fichier n'est jamais chargé sur le web : voir location-map-view.web.tsx.
 */
export const LocationMapView = forwardRef<LocationMapViewHandle, LocationMapViewProps>(
  function LocationMapView({ myLocation, marker, accuracyMeters, members, onSelectMember, style }, ref) {
    const mapRef = useRef<MapView>(null);
    const reduceMotion = useReducedMotion();
    const meTracksViewChanges = useSettlingTrackViewChanges(!reduceMotion);

    useImperativeHandle(ref, () => ({
      recenter: (coordinates: Coordinates) => {
        mapRef.current?.animateToRegion(regionFromCoordinates(coordinates), RECENTER_DURATION_MS);
      },
    }));

    return (
      <View style={[styles.fill, style]}>
        <MapView
          initialRegion={regionFromCoordinates(myLocation)}
          ref={mapRef}
          showsCompass={false}
          showsMyLocationButton={false}
          showsUserLocation={false}
          style={styles.fill}
          toolbarEnabled={false}>
          {accuracyMeters != null && accuracyMeters > 0 ? (
            <Circle
              center={myLocation}
              fillColor="rgba(108, 99, 255, 0.12)"
              radius={accuracyMeters}
              strokeColor="rgba(108, 99, 255, 0.45)"
              strokeWidth={1}
            />
          ) : null}
          <Marker
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={marker.coordinates}
            title={marker.label}
            tracksViewChanges={meTracksViewChanges}>
            <MeMarker imageUrl={marker.imageUrl} label={marker.label} reduceMotion={reduceMotion} />
          </Marker>
          {(members ?? []).map((member) => (
            <MemberMapMarker
              key={member.id}
              member={member}
              onSelect={onSelectMember}
              reduceMotion={reduceMotion}
            />
          ))}
        </MapView>
      </View>
    );
  },
);

function MemberMapMarker({
  member,
  onSelect,
  reduceMotion,
}: {
  member: VisibleMemberMarker;
  onSelect?: (memberId: string) => void;
  reduceMotion: boolean;
}) {
  const isLive = member.freshness === 'live';
  const tracksViewChanges = useSettlingTrackViewChanges(isLive && !reduceMotion);

  return (
    <Marker
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={member.coordinates}
      onPress={onSelect ? () => onSelect(member.id) : undefined}
      title={member.label}
      tracksViewChanges={tracksViewChanges}>
      <MemberMarker freshness={member.freshness} imageUrl={member.imageUrl} label={member.label} reduceMotion={reduceMotion} />
    </Marker>
  );
}

function MeMarker({
  imageUrl,
  label,
  reduceMotion,
}: {
  imageUrl?: string | null;
  label: string;
  reduceMotion: boolean;
}) {
  const { t } = useLanguage();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: PULSE_DURATION_MS, easing: Easing.out(Easing.ease) }), PULSE_REPS, false);
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.4 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.55 }],
  }));

  return (
    <View style={styles.markerWrap}>
      {!reduceMotion ? <Animated.View pointerEvents="none" style={[styles.pulse, pulseStyle]} /> : null}
      <Avatar imageUrl={imageUrl} name={label} ringColor={darkColors.primary} size={64} />
      <View style={styles.meBadge}>
        <Text style={styles.meBadgeText}>{t('common.me')}</Text>
      </View>
    </View>
  );
}

/**
 * Marqueur d'un membre (jamais "moi"). Halo uniquement si `freshness ===
 * 'live'` ; opacité réduite si 'stale' — jamais de badge de nom persistant
 * ici (contrairement à "Moi") pour ne pas surcharger la carte à plusieurs
 * membres : le nom complet et le statut détaillé sont dans la fiche membre
 * (ouverte au clic).
 */
function MemberMarker({
  imageUrl,
  label,
  freshness,
  reduceMotion,
}: {
  imageUrl?: string | null;
  label: string;
  freshness: VisibleMemberMarker['freshness'];
  reduceMotion: boolean;
}) {
  const isLive = freshness === 'live';
  const isStale = freshness === 'stale';
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !isLive) return;
    pulse.value = withRepeat(withTiming(1, { duration: PULSE_DURATION_MS, easing: Easing.out(Easing.ease) }), PULSE_REPS, false);
  }, [pulse, reduceMotion, isLive]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.5 }],
  }));

  const ringColor = isStale ? darkColors.offline : isLive ? darkColors.live : darkColors.accent;

  return (
    <View style={[styles.memberMarkerWrap, isStale && styles.memberMarkerMuted]}>
      {isLive && !reduceMotion ? <Animated.View pointerEvents="none" style={[styles.memberPulse, pulseStyle]} /> : null}
      <Avatar imageUrl={imageUrl} name={label} ringColor={ringColor} size={48} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  markerWrap: { alignItems: 'center', justifyContent: 'center', width: 84 },
  pulse: {
    backgroundColor: darkColors.primary,
    borderRadius: radius.circle,
    height: 64,
    position: 'absolute',
    width: 64,
  },
  meBadge: {
    backgroundColor: darkColors.surfaceElevated,
    borderColor: darkColors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  meBadgeText: {
    ...typography.caption,
    color: darkColors.textPrimary,
  },
  memberMarkerWrap: { alignItems: 'center', justifyContent: 'center', width: 56, height: 56 },
  memberMarkerMuted: { opacity: 0.6 },
  memberPulse: {
    backgroundColor: darkColors.live,
    borderRadius: radius.circle,
    height: 48,
    position: 'absolute',
    width: 48,
  },
});
