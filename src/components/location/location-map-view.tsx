import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, Map as MapLibreMap, Marker, type CameraRef } from '@maplibre/maplibre-react-native';
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

/** ~ niveau de rue (même valeur que le repli web, voir location-map-view.web.tsx). */
const DEFAULT_ZOOM = 15.5;
const RECENTER_ZOOM = 16;
const RECENTER_DURATION_MS = 400;

/**
 * Tuiles vectorielles OpenFreeMap (https://openfreemap.org) : projet gratuit
 * et open-source, sans clé API et sans quota, bâti sur les données
 * OpenStreetMap — la même source que le repli web (location-map-view.web.tsx).
 * Aucune clé secrète à protéger.
 */
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

function toLngLat(coordinates: Coordinates): [number, number] {
  return [coordinates.longitude, coordinates.latitude];
}

/**
 * Rendu natif (Android/iOS) via MapLibre Native
 * (@maplibre/maplibre-react-native) : mêmes tuiles OpenFreeMap que le repli
 * web, sans clé Google Maps à fournir/facturer. Un marqueur personnalisé
 * (avatar réel + halo) est utilisé à la place du point natif — voir
 * MeMarker plus bas.
 *
 * Contrairement à react-native-maps (abandonné ici, voir historique git),
 * les marqueurs MapLibre sont de vraies Views natives positionnées sur la
 * carte, pas des captures bitmap régénérées à chaque frame (`tracksViewChanges`)
 * — l'animation de pulsation peut donc rester continue sans risque de geler
 * l'app (c'était la cause du gel au chargement de la carte avant ce changement).
 *
 * Ce fichier n'est jamais chargé sur le web : voir location-map-view.web.tsx.
 */
export const LocationMapView = forwardRef<LocationMapViewHandle, LocationMapViewProps>(
  function LocationMapView({ myLocation, marker, members, onSelectMember, style }, ref) {
    const cameraRef = useRef<CameraRef>(null);

    useImperativeHandle(ref, () => ({
      recenter: (coordinates: Coordinates) => {
        cameraRef.current?.easeTo({ center: toLngLat(coordinates), zoom: RECENTER_ZOOM, duration: RECENTER_DURATION_MS });
      },
    }));

    return (
      <View style={[styles.fill, style]}>
        <MapLibreMap attribution={false} compass={false} logo={false} mapStyle={MAP_STYLE_URL} scaleBar={false} style={styles.fill}>
          <Camera ref={cameraRef} initialViewState={{ center: toLngLat(myLocation), zoom: DEFAULT_ZOOM }} />
          <Marker anchor="center" id="me" lngLat={toLngLat(marker.coordinates)}>
            <MeMarker imageUrl={marker.imageUrl} label={marker.label} />
          </Marker>
          {(members ?? []).map((member) => (
            <Marker
              anchor="center"
              id={member.id}
              key={member.id}
              lngLat={toLngLat(member.coordinates)}
              onPress={onSelectMember ? () => onSelectMember(member.id) : undefined}>
              <MemberMarker freshness={member.freshness} imageUrl={member.imageUrl} label={member.label} />
            </Marker>
          ))}
        </MapLibreMap>
      </View>
    );
  },
);

function MeMarker({ imageUrl, label }: { imageUrl?: string | null; label: string }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false);
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
}: {
  imageUrl?: string | null;
  label: string;
  freshness: VisibleMemberMarker['freshness'];
}) {
  const reduceMotion = useReducedMotion();
  const isLive = freshness === 'live';
  const isStale = freshness === 'stale';
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !isLive) return;
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false);
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
