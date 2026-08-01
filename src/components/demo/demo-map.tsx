import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PALETTE, Person } from './people-data';

type DemoMapProps = {
  people: Person[];
  selectedId: string | null;
  onSelectPerson: (id: string) => void;
};

export function DemoMap({ people, selectedId, onSelectPerson }: DemoMapProps) {
  return (
    <View style={styles.mapContainer}>
      <View pointerEvents="none" style={styles.mapBase} />
      <View pointerEvents="none" style={styles.mapGridH} />
      <View pointerEvents="none" style={styles.mapGridV} />
      <View pointerEvents="none" style={[styles.mapPark, styles.mapParkOne]} />
      <View pointerEvents="none" style={[styles.mapPark, styles.mapParkTwo]} />
      <View pointerEvents="none" style={styles.routeLine} />

      <View pointerEvents="none" style={styles.cityLabel}>
        <Text style={styles.cityLabelText}>Antananarivo · carte fictive</Text>
      </View>

      {people.map((person, index) => (
        <MapMarker
          key={person.id}
          person={person}
          isSelected={person.id === selectedId}
          delay={index * 180}
          onPress={() => onSelectPerson(person.id)}
        />
      ))}
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
  const pulse = useSharedValue(0);
  const color = person.color;

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }), -1, false),
    );
  }, [pulse, delay]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(isSelected ? 1.18 : 1, { duration: 200 }) }],
  }));

  return (
    <View style={[styles.markerWrapper, { top: person.position.top, left: person.position.left }]}>
      <Pressable onPress={onPress} hitSlop={10} style={styles.markerHit}>
        <View style={styles.markerDotBox}>
          <Animated.View pointerEvents="none" style={[styles.markerPulse, { backgroundColor: color }, pulseStyle]} />

          {person.isMe ? (
            <Animated.View style={[styles.meDot, isSelected && styles.markerSelectedGlow, scaleStyle]}>
              <Text style={styles.meDotText}>{person.initials}</Text>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.pinOuter, { backgroundColor: color }, scaleStyle]}>
              <View style={[styles.pinInner, isSelected && styles.markerSelectedGlow]}>
                <Text style={styles.pinInitials}>{person.initials}</Text>
              </View>
            </Animated.View>
          )}
        </View>
        <View style={styles.markerLabelPill}>
          <Text style={styles.markerLabelText} numberOfLines={1}>
            {person.isMe ? 'Toi' : person.name}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.08)',
    backgroundColor: PALETTE.navy,
  },
  mapBase: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: `linear-gradient(150deg, ${PALETTE.navy} 0%, #0C1730 55%, #0A2233 100%)`,
  },
  mapGridH: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage:
      'repeating-linear-gradient(0deg, rgba(231,236,245,0.05) 0px, rgba(231,236,245,0.05) 1px, transparent 1px, transparent 46px)',
  },
  mapGridV: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage:
      'repeating-linear-gradient(90deg, rgba(231,236,245,0.05) 0px, rgba(231,236,245,0.05) 1px, transparent 1px, transparent 46px)',
  },
  mapPark: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    experimental_backgroundImage: `radial-gradient(circle, ${PALETTE.greenSafety}33 0%, ${PALETTE.greenSafety}00 70%)`,
  },
  mapParkOne: {
    top: '8%',
    left: '55%',
  },
  mapParkTwo: {
    bottom: '4%',
    left: '5%',
  },
  routeLine: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '55%',
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${PALETTE.blueRegion}88`,
    transform: [{ rotate: '32deg' }],
  },
  cityLabel: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(7,16,34,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.1)',
  },
  cityLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  markerWrapper: {
    position: 'absolute',
    width: 72,
    marginLeft: -36,
    marginTop: -22,
    alignItems: 'center',
  },
  markerHit: {
    alignItems: 'center',
    gap: 4,
  },
  markerDotBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  pinOuter: {
    width: 32,
    height: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInner: {
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInitials: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  meDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PALETTE.mist,
    borderWidth: 2,
    borderColor: PALETTE.blueRegion,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meDotText: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  markerSelectedGlow: {
    shadowColor: PALETTE.mist,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  markerLabelPill: {
    backgroundColor: 'rgba(7,16,34,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  markerLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.mist,
  },
});
