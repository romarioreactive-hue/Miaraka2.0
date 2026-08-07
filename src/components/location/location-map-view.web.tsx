import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';
// Feuille de style officielle de MapLibre GL JS (halo de sélection, popup,
// contrôles de navigation…). Un simple import CSS : jamais exécuté au
// rendu serveur, jamais dépendant de `window` (voir déclaration ambiante
// `declare module '*.css'` dans expo/types).
import 'maplibre-gl/dist/maplibre-gl.css';

import { useLanguage } from '@/contexts/language-context';
import { darkColors } from '@/theme';
import type { Coordinates } from '@/types/location';

import { LocationMapListFallback } from './location-map-list-fallback';
import type { LocationMapViewHandle, LocationMapViewProps, VisibleMemberMarker } from './location-map-view.types';

/**
 * Carte web réelle via MapLibre GL JS (WebGL, tuiles vectorielles
 * OpenFreeMap — gratuites, sans clé API, voir docs/LOCATION.md §8). Le
 * contrat (props/ref) reste identique à la version native
 * (location-map-view.tsx) : l'écran appelant n'a jamais besoin de savoir
 * laquelle des deux implémentations est active.
 *
 * `maplibre-gl` n'est chargé qu'au moment de l'effet (jamais au niveau
 * module) : ni `window`, ni `document`, ni `navigator` ne sont touchés
 * pendant l'évaluation du module, seulement à l'intérieur de l'effet,
 * garanti client-only par React. Si l'import échoue, si WebGL n'est pas
 * disponible, ou si la carte remonte une erreur avant d'avoir fini de
 * charger, on bascule silencieusement sur le repli liste existant — la
 * carte ne bloque jamais l'application.
 */
export const LocationMapView = forwardRef<LocationMapViewHandle, LocationMapViewProps>(
  function LocationMapView({ myLocation, marker, members, onSelectMember, style }, ref) {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const maplibreModuleRef = useRef<typeof import('maplibre-gl') | null>(null);
    const mapReadyRef = useRef(false);
    const meMarkerRef = useRef<{ marker: MapLibreMarker; parts: AvatarMarkerHandle } | null>(null);
    const memberMarkersRef = useRef<Map<string, { marker: MapLibreMarker; parts: AvatarMarkerHandle }>>(new Map());
    const onSelectMemberRef = useRef(onSelectMember);
    // Dernière position "Moi" connue, lue par l'effet de cadrage ci-dessous
    // sans figurer dans ses dépendances : la position GPS change en
    // continu, et on ne veut recadrer la caméra que quand la composition du
    // groupe de membres change — jamais à chaque tick GPS.
    const markerRef = useRef(marker);
    // Empêche de recadrer plusieurs fois pour le même groupe de membres
    // (ex. simple mise à jour de position) : ne se déclenche que quand
    // l'ensemble des membres visibles change réellement (arrivée/départ),
    // pas à chaque déplacement d'un membre déjà visible.
    const lastFitMemberIdsRef = useRef<string>('');
    // Passe à `true` dès que l'utilisateur déplace ou zoome la carte à la
    // main (voir `dragstart`/`zoomstart` à la création de la carte) : le
    // cadrage automatique "moi + membres" ne doit plus jamais reprendre la
    // main après ça, pour ne pas contrarier un zoom/déplacement volontaire.
    // Le bouton "Ma position" reste toujours disponible séparément
    // (useImperativeHandle.recenter, au-dessus) et n'est pas concerné par
    // ce garde-fou.
    const userInteractedRef = useRef(false);
    const [mapState, setMapState] = useState<'loading' | 'ready' | 'unavailable'>(
      typeof window === 'undefined' ? 'unavailable' : 'loading',
    );

    useEffect(() => {
      devLog('membres reçus', members?.length ?? 0);
    }, [members]);

    useEffect(() => {
      devLog('coordonnées personnelles reçues', marker.coordinates);
    }, [marker.coordinates]);

    useEffect(() => {
      onSelectMemberRef.current = onSelectMember;
    }, [onSelectMember]);

    useEffect(() => {
      markerRef.current = marker;
    }, [marker]);

    useImperativeHandle(
      ref,
      () => ({
        recenter: (coordinates: Coordinates) => {
          const map = mapRef.current;
          if (!map) return;
          map.easeTo({
            center: [coordinates.longitude, coordinates.latitude],
            zoom: Math.max(map.getZoom(), RECENTER_ZOOM),
            duration: 400,
          });
        },
      }),
      [],
    );

    // Initialisation unique de la carte (import dynamique + garde SSR/WebGL).
    // Les mises à jour de position/marqueurs sont gérées par les effets
    // suivants, jamais ici : on ne veut recréer l'instance MapLibre à aucun
    // moment après le montage.
    useEffect(() => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      if (!containerRef.current) return;
      let cancelled = false;
      let resizeObserver: ResizeObserver | null = null;

      // Vérification proactive AVANT de charger MapLibre : si le contexte
      // WebGL ne peut pas être créé du tout, inutile de télécharger ~1,1 Mo
      // de JS + le CSS pour rien, et ça évite surtout un piège réel de
      // MapLibre GL JS — quand la création du contexte WebGL échoue à
      // l'intérieur du constructeur `new maplibregl.Map(...)`, l'événement
      // 'error' est émis DE FAÇON SYNCHRONE, avant même que ce composant
      // ait pu attacher son propre écouteur `map.on('error', ...)` sur
      // l'instance à peine créée. Sans ce garde-fou, un appareil sans WebGL
      // utilisable resterait bloqué indéfiniment sur le spinner de
      // chargement au lieu de basculer sur le repli liste.
      if (!isWebGLAvailable()) {
        devLog('WebGL indisponible — repli liste sans charger MapLibre');
        setMapState('unavailable');
        return;
      }

      devLog('WebGL disponible, chargement de maplibre-gl…');

      // Filet de sécurité : si, pour une raison quelconque (réseau lent,
      // tuiles qui ne répondent jamais, échec silencieux non couvert par
      // 'error'), la carte ne devient jamais prête, on ne laisse jamais un
      // spinner tourner indéfiniment — voir mission "ne jamais laisser une
      // zone vide".
      const timeoutId = setTimeout(() => {
        if (cancelled || mapReadyRef.current) return;
        devLog('délai de chargement dépassé — repli liste');
        cancelled = true;
        try {
          mapRef.current?.remove();
        } catch {
          // Instance déjà partiellement détruite : rien à faire de plus.
        }
        mapRef.current = null;
        setMapState('unavailable');
      }, MAP_LOAD_TIMEOUT_MS);

      import('maplibre-gl')
        .then((module) => {
          if (cancelled || !containerRef.current) return;
          devLog('maplibre-gl importé');
          // maplibre-gl n'expose que des exports nommés (pas d'export par
          // défaut) : le module importé dynamiquement EST déjà le namespace.
          const maplibregl = module;
          maplibreModuleRef.current = maplibregl;

          const map = new maplibregl.Map({
            container: containerRef.current,
            style: MAP_STYLE_URL,
            center: [myLocation.longitude, myLocation.latitude],
            zoom: DEFAULT_ZOOM,
          });
          devLog('instance de carte créée');
          map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), 'bottom-right');

          // `originalEvent` n'est présent que pour un geste réel de
          // l'utilisateur (souris, tactile, molette) — jamais pour un appel
          // programmatique comme notre propre fitBounds/easeTo. C'est le
          // seul moyen fiable de distinguer "l'utilisateur a pris la main"
          // d'un mouvement que ce composant a lui-même déclenché.
          const markUserInteracted = (event: { originalEvent?: unknown }) => {
            if (event.originalEvent) userInteractedRef.current = true;
          };
          map.on('dragstart', markUserInteracted);
          map.on('zoomstart', markUserInteracted);

          map.once('load', () => {
            if (cancelled) return;
            devLog('style chargé, carte prête');
            clearTimeout(timeoutId);
            mapReadyRef.current = true;
            setMapState('ready');
          });

          map.on('error', (event) => {
            // Style/tuiles indisponibles (réseau, service tiers en panne…).
            // Ignoré une fois la carte déjà affichée avec succès : une
            // erreur transitoire (ex. une tuile isolée en 404) ne doit
            // jamais faire disparaître une carte qui fonctionne déjà.
            console.warn('[LocationMapView] MapLibre error', event.error);
            if (mapReadyRef.current) return;
            clearTimeout(timeoutId);
            cancelled = true;
            try {
              map.remove();
            } catch {
              // Instance déjà partiellement détruite : rien à faire de plus.
            }
            mapRef.current = null;
            setMapState('unavailable');
          });

          mapRef.current = map;

          // Le conteneur peut changer de taille APRÈS la création de la
          // carte sans que la fenêtre elle-même ne se redimensionne : barre
          // d'adresse mobile qui se rétracte/réapparaît au défilement,
          // rotation d'écran, ou conteneur pas encore à sa taille finale au
          // moment exact de la création (transition d'onglet). MapLibre ne
          // le détecte pas tout seul — sans resize(), le canvas WebGL garde
          // les dimensions figées à la création et le rendu déborde ou
          // laisse une bande vide.
          if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            resizeObserver = new ResizeObserver(() => {
              mapRef.current?.resize();
            });
            resizeObserver.observe(containerRef.current);
          }
        })
        .catch((error) => {
          console.warn('[LocationMapView] MapLibre indisponible, repli liste', error);
          clearTimeout(timeoutId);
          if (!cancelled) setMapState('unavailable');
        });

      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
        resizeObserver?.disconnect();
        mapReadyRef.current = false;
        meMarkerRef.current?.marker.remove();
        meMarkerRef.current = null;
        // memberMarkersRef n'est pas un ref DOM React : c'est un registre
        // que ce composant maintient lui-même au fil des rendus (voir
        // l'effet "Marqueurs des membres" plus bas). Lire sa valeur la plus
        // récente ici, au démontage, est le comportement voulu — pas une
        // valeur figée au montage.
        memberMarkersRef.current.forEach((entry) => entry.marker.remove());
        // eslint-disable-next-line react-hooks/exhaustive-deps -- voir commentaire ci-dessus
        memberMarkersRef.current.clear();
        mapRef.current?.remove();
        mapRef.current = null;
      };
      // Initialisation unique : les props utilisées ici (myLocation au
      // premier rendu) ne doivent pas redéclencher un remontage complet de
      // la carte — voir les effets dédiés plus bas pour les mises à jour.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Mon propre marqueur (avatar réel + halo « en direct » permanent,
    // badge « Moi ») : jamais cliquable, jamais filtré.
    useEffect(() => {
      const map = mapRef.current;
      const maplibregl = maplibreModuleRef.current;
      if (!map || !maplibregl || mapState !== 'ready') return;

      if (!meMarkerRef.current) {
        const parts = createAvatarMarkerElement();
        const mk = new maplibregl.Marker({ element: parts.element, anchor: 'center' })
          .setLngLat([marker.coordinates.longitude, marker.coordinates.latitude])
          .addTo(map);
        meMarkerRef.current = { marker: mk, parts };
      } else {
        meMarkerRef.current.marker.setLngLat([marker.coordinates.longitude, marker.coordinates.latitude]);
      }

      meMarkerRef.current.parts.update({
        imageUrl: marker.imageUrl,
        label: marker.label,
        size: 64,
        ringColor: darkColors.primary,
        pulse: !prefersReducedMotion(),
        badgeText: t('common.me'),
      });
    }, [mapState, marker.coordinates.latitude, marker.coordinates.longitude, marker.imageUrl, marker.label, t]);

    // Marqueurs des membres visibles (déjà filtrés par RLS + le filtre actif
    // dans my-location-screen.tsx). Réconciliation par id : création des
    // nouveaux, mise à jour en place des existants (position/avatar/halo),
    // suppression de ceux qui ont disparu (partage désactivé, filtre
    // changé, membre hors de portée après revalidation RLS…).
    useEffect(() => {
      const map = mapRef.current;
      const maplibregl = maplibreModuleRef.current;
      if (!map || !maplibregl || mapState !== 'ready') return;

      const visibleIds = new Set(members?.map((member) => member.id));
      memberMarkersRef.current.forEach((entry, id) => {
        if (!visibleIds.has(id)) {
          entry.marker.remove();
          memberMarkersRef.current.delete(id);
        }
      });

      (members ?? []).forEach((member) => {
        let entry = memberMarkersRef.current.get(member.id);
        if (!entry) {
          const parts = createAvatarMarkerElement();
          parts.element.setAttribute('role', 'button');
          parts.element.style.cursor = 'pointer';
          parts.element.addEventListener('click', () => onSelectMemberRef.current?.(member.id));
          const mk = new maplibregl.Marker({ element: parts.element, anchor: 'center' })
            .setLngLat([member.coordinates.longitude, member.coordinates.latitude])
            .addTo(map);
          entry = { marker: mk, parts };
          memberMarkersRef.current.set(member.id, entry);
        } else {
          entry.marker.setLngLat([member.coordinates.longitude, member.coordinates.latitude]);
        }

        entry.parts.update({
          imageUrl: member.imageUrl,
          label: member.label,
          size: 48,
          ringColor: ringColorForFreshness(member.freshness),
          pulse: member.freshness === 'live' && !prefersReducedMotion(),
          muted: member.freshness === 'stale',
        });
      });
    }, [mapState, members]);

    // Cadrage automatique "moi + tous les membres visibles" : sans ça, la
    // caméra reste au zoom rue centrée uniquement sur "moi"
    // (DEFAULT_ZOOM), et un membre géographiquement éloigné reste hors
    // champ bien que son marqueur soit réellement créé sur la carte —
    // c'est le symptôme "je ne vois que ma position". Se déclenche quand le
    // GROUPE de membres visibles change (arrivée/départ, y compris les
    // données initiales), jamais sur un simple déplacement d'un membre déjà
    // visible, et plus du tout après une interaction manuelle de
    // l'utilisateur (voir userInteractedRef, posé par dragstart/zoomstart
    // à la création de la carte).
    useEffect(() => {
      const map = mapRef.current;
      const maplibregl = maplibreModuleRef.current;
      if (!map || !maplibregl || mapState !== 'ready') return;
      if (userInteractedRef.current) return;
      if (!members || members.length === 0) return;

      const memberIdsKey = members.map((member) => member.id).sort().join(',');
      if (memberIdsKey === lastFitMemberIdsRef.current) return;
      lastFitMemberIdsRef.current = memberIdsKey;

      const selfCoords = markerRef.current.coordinates;
      const bounds = new maplibregl.LngLatBounds(
        [selfCoords.longitude, selfCoords.latitude],
        [selfCoords.longitude, selfCoords.latitude],
      );
      members.forEach((member) => bounds.extend([member.coordinates.longitude, member.coordinates.latitude]));

      map.fitBounds(bounds, { padding: 72, maxZoom: DEFAULT_ZOOM, duration: 600 });
    }, [mapState, members]);

    if (mapState === 'unavailable') {
      return (
        <View style={[styles.fill, style]}>
          <LocationMapListFallback marker={marker} members={members} myLocation={myLocation} onSelectMember={onSelectMember} reason="unavailable" />
        </View>
      );
    }

    return (
      <View style={[styles.fill, style]}>
        {/* Élément DOM natif requis : MapLibre GL JS s'attache directement à un noeud du DOM. Ce fichier n'est jamais chargé hors web (voir location-map-view.tsx), où le rendu passe par react-dom, donc un tag HTML brut est valide ici. */}
        <div ref={containerRef} style={mapContainerStyle} />
        {mapState === 'loading' ? (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <ActivityIndicator color={darkColors.primary} />
          </View>
        ) : null}
      </View>
    );
  },
);

/** ~ niveau de rue. */
const DEFAULT_ZOOM = 15.5;
const RECENTER_ZOOM = 16;

/**
 * Tuiles vectorielles OpenFreeMap (https://openfreemap.org) : projet gratuit
 * et open-source, sans clé API et sans quota, bâti sur les données
 * OpenStreetMap. Aucune clé secrète à protéger — voir docs/LOCATION.md §8.
 * HTTPS public, sans clé, jamais localhost ni URL privée : accessible
 * depuis n'importe quel déploiement (Vercel inclus), pas seulement en local.
 */
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Si la carte n'est pas prête au-delà de ce délai (réseau très lent, tuiles qui ne répondent jamais…), on bascule sur le repli liste plutôt que de laisser un spinner indéfiniment — voir l'effet d'initialisation plus haut. */
const MAP_LOAD_TIMEOUT_MS = 10_000;

/** Respecte le réglage système « réduire les animations », comme la version native (`useReducedMotion` de Reanimated) — voir MeMarker/MemberMarker dans location-map-view.tsx. */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * Détection proactive AVANT de charger MapLibre, avec le même test que son
 * propre constructeur (canvas.getContext('webgl2')) : évite de télécharger
 * ~1,1 Mo de JS pour rien si WebGL est indisponible (GPU bloqué, matériel
 * trop ancien, contexte désactivé par une politique du navigateur…), et
 * surtout évite un piège réel de MapLibre GL JS — quand la création du
 * contexte échoue DANS le constructeur `new maplibregl.Map(...)`,
 * l'événement 'error' est émis de façon SYNCHRONE, avant que ce composant
 * ait pu attacher son propre `map.on('error', ...)` sur l'instance à peine
 * créée. Ce test se fait sur un canvas jetable, jamais ajouté au DOM.
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Logs de diagnostic pour cette carte, actifs UNIQUEMENT en développement :
 * `__DEV__` est remplacé par une constante statique au moment du build
 * (Metro), donc ces appels — et le message qu'ils construisent — sont
 * entièrement retirés du bundle de production, pas seulement rendus
 * silencieux à l'exécution.
 */
function devLog(...args: unknown[]): void {
  if (__DEV__) console.log('[LocationMapView]', ...args);
}

function ringColorForFreshness(freshness: VisibleMemberMarker['freshness']): string {
  if (freshness === 'stale') return darkColors.offline;
  if (freshness === 'live') return darkColors.live;
  return darkColors.accent;
}

const mapContainerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

// -----------------------------------------------------------------------------
// Marqueur avatar (DOM natif, requis par l'API Marker de MapLibre) : reproduit
// visuellement l'avatar + halo pulsé + badge du marqueur natif
// (location-map-view.tsx / MeMarker, MemberMarker), sans dépendance
// supplémentaire — Web Animations API native du navigateur pour le pulse.
// -----------------------------------------------------------------------------

interface AvatarMarkerUpdate {
  imageUrl?: string | null;
  label: string;
  size: number;
  ringColor: string;
  pulse: boolean;
  muted?: boolean;
  /** Badge textuel permanent sous l'avatar (utilisé uniquement pour « Moi »). */
  badgeText?: string;
}

interface AvatarMarkerHandle {
  element: HTMLDivElement;
  update(options: AvatarMarkerUpdate): void;
}

function createAvatarMarkerElement(): AvatarMarkerHandle {
  const el = document.createElement('div');
  Object.assign(el.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  } satisfies Partial<CSSStyleDeclaration>);

  const ringWrap = document.createElement('div');
  Object.assign(ringWrap.style, {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
  el.appendChild(ringWrap);

  const pulseEl = document.createElement('div');
  Object.assign(pulseEl.style, {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    display: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  ringWrap.appendChild(pulseEl);

  const ring = document.createElement('div');
  Object.assign(ring.style, {
    position: 'relative',
    borderRadius: '50%',
    overflow: 'hidden',
    borderStyle: 'solid',
    boxSizing: 'border-box',
    backgroundColor: darkColors.surfaceElevated,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
  ringWrap.appendChild(ring);

  const img = document.createElement('img');
  Object.assign(img.style, {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  ring.appendChild(img);

  const initials = document.createElement('span');
  Object.assign(initials.style, {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'system-ui, sans-serif',
  } satisfies Partial<CSSStyleDeclaration>);
  ring.appendChild(initials);

  const badge = document.createElement('div');
  Object.assign(badge.style, {
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'none',
    backgroundColor: darkColors.surfaceElevated,
    border: `1px solid ${darkColors.border}`,
    color: darkColors.textPrimary,
    whiteSpace: 'nowrap',
    fontFamily: 'system-ui, sans-serif',
  } satisfies Partial<CSSStyleDeclaration>);
  el.appendChild(badge);

  let pulseAnimation: Animation | null = null;

  return {
    element: el,
    update({ imageUrl, label, size, ringColor, pulse, muted, badgeText }) {
      el.setAttribute('aria-label', label);
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.borderWidth = '2px';
      ring.style.borderColor = ringColor;
      ring.style.opacity = muted ? '0.6' : '1';

      if (imageUrl) {
        if (img.src !== imageUrl) img.src = imageUrl;
        img.style.display = 'block';
        initials.style.display = 'none';
        img.onerror = () => {
          img.style.display = 'none';
          initials.style.display = 'flex';
        };
      } else {
        img.style.display = 'none';
        initials.style.display = 'flex';
        initials.textContent = getInitials(label);
        initials.style.fontSize = `${Math.max(12, Math.round(size * 0.34))}px`;
      }

      pulseEl.style.width = `${size}px`;
      pulseEl.style.height = `${size}px`;
      pulseEl.style.backgroundColor = ringColor;
      if (pulse) {
        pulseEl.style.display = 'block';
        if (!pulseAnimation) {
          pulseAnimation = pulseEl.animate(
            [
              { transform: 'scale(1)', opacity: 0.4 },
              { transform: 'scale(1.6)', opacity: 0 },
            ],
            { duration: 2000, iterations: Infinity, easing: 'ease-out' },
          );
        }
      } else {
        pulseAnimation?.cancel();
        pulseAnimation = null;
        pulseEl.style.display = 'none';
      }

      if (badgeText) {
        badge.textContent = badgeText;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    },
  };
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkColors.surface,
  },
});
