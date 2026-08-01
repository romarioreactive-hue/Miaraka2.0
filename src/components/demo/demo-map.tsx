import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/contexts/language-context';
import { radius, spacing, typography } from '@/theme';

import { PALETTE, Person, PersonGroup } from './people-data';

export type MapFilter = 'tous' | PersonGroup;

type DemoMapProps = {
  people: Person[];
  selectedId: string | null;
  activeFilter: MapFilter;
  onChangeFilter: (filter: MapFilter) => void;
  onPressAddPerson: () => void;
  onSelectPerson: (id: string) => void;
};

const COLORS = {
  background: '#06142B',
  map: '#071A31',
  mapDeep: '#041121',
  road: 'rgba(56, 214, 232, 0.24)',
  roadStrong: 'rgba(79, 140, 255, 0.42)',
  glass: 'rgba(30, 33, 21, 0.80)',
  glassStrong: 'rgba(41, 43, 31, 0.92)',
  border: 'rgba(255, 255, 255, 0.10)',
  text: '#E2E4D1',
  textSecondary: '#C5C9AF',
  outline: '#8F937B',
  primary: '#FFFFFF',
  onPrimary: '#293500',
  lime: '#C9F23B',
  green: '#29D391',
  cyan: '#38D6E8',
  blue: '#4F8CFF',
  paleBlue: '#AFC6FF',
} as const;

const FILTERS: MapFilter[] = ['tous', 'famille', 'amis', 'equipe'];

const ROADS = [
  { top: '18%', left: '-12%', width: '126%', rotate: '-8deg', strong: true },
  { top: '34%', left: '-22%', width: '138%', rotate: '17deg' },
  { top: '51%', left: '-15%', width: '132%', rotate: '-21deg', strong: true },
  { top: '68%', left: '-20%', width: '140%', rotate: '8deg' },
  { top: '82%', left: '-12%', width: '126%', rotate: '-13deg' },
  { top: '42%', left: '-22%', width: '135%', rotate: '68deg', strong: true },
  { top: '48%', left: '-18%', width: '128%', rotate: '88deg' },
  { top: '46%', left: '-16%', width: '130%', rotate: '112deg' },
] as const;

const LANDMARKS = [
  { label: 'Ankorondrano', top: '20%', left: '42%' },
  { label: 'Ivandry', top: '35%', left: '8%' },
  { label: 'Analakely', top: '58%', left: '38%' },
  { label: 'Ambohipo', top: '78%', left: '16%' },
] as const;

export function DemoMap({
  people,
  selectedId,
  activeFilter,
  onChangeFilter,
  onPressAddPerson,
  onSelectPerson,
}: DemoMapProps) {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [hasNotification, setHasNotification] = useState(true);
  const [gpsError, setGpsError] = useState(false);
  const copy = getCopy(language);

  const visiblePeople = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language === 'fr' ? 'fr-FR' : 'mg-MG');
    if (!normalizedQuery) return people;
    return people.filter((person) =>
      `${person.name} ${person.location} ${person.movementStatus}`
        .toLocaleLowerCase(language === 'fr' ? 'fr-FR' : 'mg-MG')
        .includes(normalizedQuery),
    );
  }, [language, people, query]);
  const familyCluster = visiblePeople.filter((person) => person.id === 'papa' || person.id === 'maman');
  const markerPeople = familyCluster.length === 2
    ? visiblePeople.filter((person) => person.id !== 'papa' && person.id !== 'maman')
    : visiblePeople;

  return (
    <View style={styles.root}>
      <MapArtwork />

      <View style={styles.topOverlay}>
        <View style={styles.searchShell}>
          <Avatar
            backgroundColor="#253B63"
            initials="M"
            name={t('common.me')}
            ringColor="rgba(255, 255, 255, 0.20)"
            size={48}
          />
          <View accessibilityRole="search" style={styles.searchField}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={20}
              tintColor={COLORS.outline}
              weight="medium"
            />
            <TextInput
              accessibilityLabel={copy.search}
              onChangeText={setQuery}
              placeholder={copy.search}
              placeholderTextColor={COLORS.outline}
              returnKeyType="search"
              selectionColor={COLORS.blue}
              style={styles.searchInput}
              value={query}
            />
            {query ? (
              <Pressable
                accessibilityLabel={copy.clearSearch}
                accessibilityRole="button"
                hitSlop={4}
                onPress={() => setQuery('')}
                style={styles.clearSearch}>
                <SymbolView
                  name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                  size={18}
                  tintColor={COLORS.textSecondary}
                  weight="medium"
                />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            accessibilityLabel={copy.notifications}
            accessibilityRole="button"
            onPress={() => setHasNotification(false)}
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
              size={22}
              tintColor={COLORS.primary}
              weight="medium"
            />
            {hasNotification ? <View style={styles.notificationDot} /> : null}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.filtersContent}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            const label = t(
              filter === 'tous'
                ? 'groups.all'
                : filter === 'famille'
                  ? 'groups.family'
                  : filter === 'amis'
                    ? 'groups.friends'
                    : 'groups.team',
            );

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                key={filter}
                onPress={() => onChangeFilter(filter)}
                style={({ pressed }) => [
                  styles.filter,
                  isActive && styles.filterActive,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {markerPeople.map((person, index) => (
          <MapMarker
            delay={index * 120}
            isSelected={person.id === selectedId}
            key={person.id}
            onPress={() => onSelectPerson(person.id)}
            person={person}
          />
        ))}
        {familyCluster.length === 2 ? (
          <FamilyCluster
            language={language}
            onPress={() => onSelectPerson('papa')}
            people={familyCluster}
          />
        ) : null}
      </View>

      {visiblePeople.length === 0 && !gpsError ? (
        <Animated.View entering={FadeIn.duration(250)} style={styles.emptyStateOverlay}>
          <EmptyState
            actionLabel={t('map.addPerson')}
            description={t('states.noPeopleDescription')}
            icon={
              <SymbolView
                name={{ ios: 'person.2.badge.plus', android: 'group_add', web: 'group_add' }}
                size={30}
                tintColor={COLORS.primary}
              />
            }
            onAction={onPressAddPerson}
            style={styles.emptyStateCard}
            title={t('states.noPeopleTitle')}
          />
        </Animated.View>
      ) : null}

      {gpsError ? (
        <Animated.View entering={FadeIn.duration(250)} style={styles.emptyStateOverlay}>
          <EmptyState
            actionLabel={t('common.retry')}
            description={t('states.gpsUnavailableDescription')}
            icon={
              <SymbolView
                name={{ ios: 'antenna.radiowaves.left.and.right.slash', android: 'satellite_alt', web: 'satellite_alt' }}
                size={30}
                tintColor={COLORS.cyan}
              />
            }
            onAction={() => setGpsError(false)}
            onSecondaryAction={() => setGpsError(false)}
            secondaryActionLabel={t('common.help')}
            style={styles.emptyStateCard}
            title={t('states.gpsUnavailableTitle')}
          />
        </Animated.View>
      ) : null}

      <View style={styles.controls}>
        <MapControl accessibilityLabel={copy.recenter} icon="center_focus_strong" />
        <MapControl accessibilityLabel={copy.myLocation} icon="my_location" onPress={() => setGpsError(true)} />
        <MapControl
          accessibilityLabel={t('map.addPerson')}
          accent
          icon="add"
          onPress={onPressAddPerson}
        />
      </View>
    </View>
  );
}

function MapArtwork() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.mapBase} />
      <View style={[styles.district, styles.districtOne]} />
      <View style={[styles.district, styles.districtTwo]} />
      <View style={[styles.district, styles.districtThree]} />
      {ROADS.map((road, index) => (
        <View
          key={index}
          style={[
            styles.road,
            'strong' in road && road.strong && styles.roadStrong,
            {
              left: road.left,
              top: road.top,
              transform: [{ rotate: road.rotate }],
              width: road.width,
            },
          ]}
        />
      ))}
      {LANDMARKS.map((landmark) => (
        <Text key={landmark.label} style={[styles.landmark, { left: landmark.left, top: landmark.top }]}>
          {landmark.label}
        </Text>
      ))}
      <View style={styles.mapVignette} />
    </View>
  );
}

type MapMarkerProps = {
  person: Person;
  isSelected: boolean;
  delay: number;
  onPress: () => void;
};

function MapMarker({ person, isSelected, delay, onPress }: MapMarkerProps) {
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const scale = useSharedValue(isSelected ? 1.08 : 1);

  useEffect(() => {
    scale.value = withTiming(isSelected ? 1.08 : 1, { duration: reduceMotion ? 1 : 180 });
  }, [isSelected, reduceMotion, scale]);

  useEffect(() => {
    if (reduceMotion || !person.isMe) return;
    pulse.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false),
    );
  }, [delay, person.isMe, pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.4 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.55 }],
  }));
  const markerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const location = getMarkerLocation(person, language);

  return (
    <Animated.View
      entering={reduceMotion ? FadeIn.duration(1) : FadeIn.delay(delay).duration(300)}
      style={[styles.markerWrapper, getMarkerPosition(person)]}>
      <Pressable
        accessibilityLabel={`${person.isMe ? t('common.me') : person.name}, ${location}`}
        accessibilityRole="button"
        hitSlop={10}
        onPress={onPress}
        style={({ pressed }) => [styles.markerHit, pressed && styles.pressed]}>
        <View style={styles.avatarArea}>
          {person.isMe ? (
            <Animated.View pointerEvents="none" style={[styles.livePulse, pulseStyle]} />
          ) : null}
          <Animated.View style={markerStyle}>
            <Avatar
              backgroundColor={person.color}
              initials={person.initials}
              name={person.name}
              ringColor={person.isMe ? COLORS.primary : person.color}
              size={person.isMe ? 64 : 48}
            />
            {person.isMe ? <View style={styles.liveDot} /> : null}
          </Animated.View>
        </View>
        <View style={[styles.markerLabel, person.isMe && styles.meLabel, isSelected && styles.markerLabelSelected]}>
          <Text numberOfLines={1} style={[styles.markerName, person.isMe && styles.meLabelText]}>
            {person.isMe ? t('common.me') : person.name}
          </Text>
          {!person.isMe ? <Text numberOfLines={1} style={styles.markerLocation}>{location}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function FamilyCluster({
  language,
  onPress,
  people,
}: {
  language: 'fr' | 'mg';
  onPress: () => void;
  people: Person[];
}) {
  return (
    <Animated.View entering={FadeIn.delay(420).duration(300)} style={styles.familyCluster}>
      <Pressable
        accessibilityLabel={language === 'fr' ? 'Papa et Maman, à la maison' : 'Dada sy Neny, ao an-trano'}
        accessibilityRole="button"
        hitSlop={10}
        onPress={onPress}
        style={({ pressed }) => [styles.markerHit, pressed && styles.pressed]}>
        <View style={styles.clusterAvatars}>
          {people.map((person, index) => (
            <Avatar
              backgroundColor={person.color}
              initials={person.initials}
              key={person.id}
              name={person.name}
              ringColor={COLORS.outline}
              size={48}
              style={{ marginLeft: index === 0 ? 0 : -14, zIndex: people.length - index }}
            />
          ))}
        </View>
        <View style={styles.markerLabel}>
          <Text style={styles.markerName}>{language === 'fr' ? 'Papa, Maman' : 'Dada, Neny'}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

type MapControlProps = {
  accessibilityLabel: string;
  icon: 'center_focus_strong' | 'my_location' | 'add';
  accent?: boolean;
  onPress?: () => void;
};

function MapControl({ accessibilityLabel, accent = false, icon, onPress }: MapControlProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.control, accent && styles.controlAccent, pressed && styles.pressed]}>
      <SymbolView
        name={{
          ios: icon === 'add' ? 'plus' : icon === 'my_location' ? 'location.fill' : 'scope',
          android: icon,
          web: icon,
        }}
        size={24}
        tintColor={accent ? COLORS.onPrimary : COLORS.primary}
        weight="bold"
      />
    </Pressable>
  );
}

function getMarkerLocation(person: Person, language: 'fr' | 'mg') {
  if (person.id === 'rica') return 'Jumbo Score Ankorondrano';
  if (person.id === 'mario') return language === 'fr' ? 'En route vers le bureau' : 'Eny an-dalana ho any amin’ny birao';
  if (person.id === 'taratra') return 'Bureau XR Technologies';
  if (person.id === 'papa' || person.id === 'maman') return language === 'fr' ? 'À la maison' : 'Ao an-trano';
  return person.location;
}

function getMarkerPosition(person: Person) {
  const positions: Record<string, { left: `${number}%`; top: `${number}%` }> = {
    moi: { left: '50%', top: '47%' },
    rica: { left: '25%', top: '31%' },
    mario: { left: '22%', top: '63%' },
    taratra: { left: '78%', top: '27%' },
  };
  return positions[person.id] ?? person.position;
}

function getCopy(language: 'fr' | 'mg') {
  if (language === 'mg') {
    return {
      search: 'Hikaroka...',
      clearSearch: 'Hamafa ny fikarohana',
      notifications: 'Fampandrenesana',
      recenter: 'Hampifantoka indray ny sarintany',
      myLocation: 'Ny toerana misy ahy',
      noResult: 'Tsy misy olona hita',
    };
  }

  return {
    search: 'Rechercher...',
    clearSearch: 'Effacer la recherche',
    notifications: 'Notifications',
    recenter: 'Recentrer la carte',
    myLocation: 'Ma position',
    noResult: 'Aucune personne trouvée',
  };
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.map,
    experimental_backgroundImage: `linear-gradient(145deg, ${COLORS.mapDeep} 0%, ${COLORS.map} 52%, #0A2940 100%)`,
  },
  district: {
    backgroundColor: 'rgba(56, 214, 232, 0.045)',
    borderColor: 'rgba(56, 214, 232, 0.08)',
    borderRadius: 40,
    borderWidth: 1,
    position: 'absolute',
    transform: [{ rotate: '18deg' }],
  },
  districtOne: { height: 190, left: -20, top: 140, width: 180 },
  districtTwo: { height: 220, right: -40, top: 240, width: 210 },
  districtThree: { bottom: 40, height: 180, left: 90, width: 250 },
  road: {
    backgroundColor: COLORS.road,
    borderColor: 'rgba(7, 20, 36, 0.50)',
    borderWidth: 1,
    height: 5,
    position: 'absolute',
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  roadStrong: {
    backgroundColor: COLORS.roadStrong,
    height: 7,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.30,
    shadowRadius: 8,
  },
  landmark: {
    color: 'rgba(197, 201, 175, 0.42)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.7,
    position: 'absolute',
    textTransform: 'uppercase',
  },
  mapVignette: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'radial-gradient(circle at center, transparent 15%, rgba(6, 20, 43, 0.42) 100%)',
  },
  topOverlay: {
    left: spacing[5],
    position: 'absolute',
    right: spacing[5],
    top: spacing[4],
    zIndex: 30,
  },
  searchShell: {
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderColor: COLORS.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing[3],
    minHeight: 64,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    shadowColor: '#000000',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 10, 0.42)',
    borderColor: 'rgba(68, 73, 53, 0.30)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingLeft: spacing[3],
  },
  searchInput: {
    ...typography.bodyMedium,
    color: COLORS.text,
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing[2],
    paddingVertical: 0,
  },
  clearSearch: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(51, 54, 41, 0.48)',
    borderRadius: radius.circle,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  notificationDot: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.background,
    borderRadius: radius.circle,
    borderWidth: 2,
    height: 9,
    position: 'absolute',
    right: 9,
    top: 9,
    width: 9,
  },
  filtersContent: {
    gap: spacing[2],
    paddingBottom: spacing[2],
    paddingTop: spacing[4],
  },
  filter: {
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderColor: 'rgba(68, 73, 53, 0.28)',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing[6],
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.paleBlue,
    shadowOpacity: 0.20,
    shadowRadius: 8,
  },
  filterLabel: {
    ...typography.labelMedium,
    color: COLORS.textSecondary,
  },
  filterLabelActive: {
    color: COLORS.onPrimary,
  },
  markerWrapper: {
    alignItems: 'center',
    marginLeft: -74,
    marginTop: -32,
    position: 'absolute',
    width: 148,
    zIndex: 10,
  },
  familyCluster: {
    alignItems: 'center',
    left: '80%',
    marginLeft: -74,
    marginTop: -28,
    position: 'absolute',
    top: '61%',
    width: 148,
    zIndex: 10,
  },
  clusterAvatars: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  markerHit: {
    alignItems: 'center',
    minHeight: 64,
    minWidth: 64,
  },
  avatarArea: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  livePulse: {
    backgroundColor: COLORS.paleBlue,
    borderRadius: radius.circle,
    height: 64,
    position: 'absolute',
    width: 64,
  },
  liveDot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.background,
    borderRadius: radius.circle,
    borderWidth: 2,
    bottom: 0,
    height: 16,
    position: 'absolute',
    right: 0,
    width: 16,
  },
  markerLabel: {
    backgroundColor: COLORS.glassStrong,
    borderColor: 'rgba(68, 73, 53, 0.25)',
    borderRadius: radius.medium,
    borderWidth: 1,
    marginTop: spacing[2],
    maxWidth: 148,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  markerLabelSelected: {
    borderColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  meLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderColor: COLORS.primary,
  },
  markerName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  meLabelText: {
    color: COLORS.onPrimary,
  },
  markerLocation: {
    color: COLORS.textSecondary,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 1,
    textAlign: 'center',
  },
  emptyStateOverlay: {
    alignItems: 'center',
    left: spacing[5],
    position: 'absolute',
    right: spacing[5],
    top: '32%',
    zIndex: 25,
  },
  emptyStateCard: {
    backgroundColor: COLORS.glassStrong,
    borderColor: COLORS.border,
    borderRadius: radius.extraLarge,
    borderWidth: 1,
    maxWidth: 340,
    paddingVertical: spacing[5],
  },
  controls: {
    bottom: spacing[5],
    gap: spacing[3],
    position: 'absolute',
    right: spacing[5],
    zIndex: 30,
  },
  control: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 33, 21, 0.92)',
    borderColor: 'rgba(68, 73, 53, 0.30)',
    borderRadius: radius.circle,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    width: 48,
  },
  controlAccent: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.paleBlue,
    shadowOpacity: 0.42,
    shadowRadius: 14,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.95 }],
  },
});
