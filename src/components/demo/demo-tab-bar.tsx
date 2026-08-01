import { SymbolView } from 'expo-symbols';
import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useLanguage } from '@/contexts/language-context';
import { alpha, darkColors, radius, spacing, typography } from '@/theme';

export type DemoTab = 'carte' | 'activite' | 'defis' | 'espaces' | 'profil';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

const TABS: { id: DemoTab; labelKey: 'nav.map' | 'nav.activity' | 'nav.challenges' | 'nav.spaces' | 'nav.profile'; icon: SymbolName }[] = [
  { id: 'carte', labelKey: 'nav.map', icon: { ios: 'map.fill', android: 'map', web: 'map' } },
  { id: 'activite', labelKey: 'nav.activity', icon: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' } },
  { id: 'defis', labelKey: 'nav.challenges', icon: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' } },
  { id: 'espaces', labelKey: 'nav.spaces', icon: { ios: 'person.3.fill', android: 'groups', web: 'groups' } },
  { id: 'profil', labelKey: 'nav.profile', icon: { ios: 'person.fill', android: 'person', web: 'person' } },
];

const TAB_COUNT = TABS.length;

type DemoTabBarProps = {
  activeTab: DemoTab;
  onChangeTab: (tab: DemoTab) => void;
  onPressMia?: () => void;
};

export function DemoTabBar({ activeTab, onChangeTab, onPressMia }: DemoTabBarProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [barWidth, setBarWidth] = useState(0);
  const activeIndex = Math.max(0, TABS.findIndex((tab) => tab.id === activeTab));
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (!barWidth) return;
    indicatorX.value = withTiming((barWidth / TAB_COUNT) * activeIndex, {
      duration: reduceMotion ? 0 : 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, barWidth, indicatorX, reduceMotion]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={styles.bar}>
        {barWidth > 0 ? (
          <Animated.View
            style={[styles.indicator, { width: barWidth / TAB_COUNT }, indicatorStyle]}
          />
        ) : null}

        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TabButton
              icon={tab.icon}
              isActive={isActive}
              key={tab.id}
              label={t(tab.labelKey)}
              onPress={() => onChangeTab(tab.id)}
            />
          );
        })}
      </View>

      <MiaFab onPress={onPressMia} />
    </View>
  );
}

function TabButton({ icon, isActive, label, onPress }: { icon: SymbolName; isActive: boolean; label: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      hitSlop={6}
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.88, { duration: 90 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 140 }); }}
      style={styles.tabButton}>
      <Animated.View style={[styles.tabContent, pressStyle]}>
        <SymbolView
          name={icon}
          size={22}
          tintColor={isActive ? darkColors.accent : darkColors.textMuted}
          weight={isActive ? 'semibold' : 'regular'}
        />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function MiaFab({ onPress }: { onPress?: () => void }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.4 }],
  }));

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }), withTiming(0, { duration: 0 })),
      -1,
    );
  }, [pulse, reduceMotion]);

  return (
    <Pressable
      accessibilityLabel="MIA"
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.9, { duration: 90 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 140 }); }}
      style={styles.fabWrap}>
      <Animated.View pointerEvents="none" style={[styles.fabPulse, pulseStyle]} />
      <Animated.View style={[styles.fab, pressStyle]}>
        <SymbolView
          name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
          size={24}
          tintColor={darkColors.textPrimary}
          weight="semibold"
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    backgroundColor: darkColors.backgroundElevated,
    borderTopLeftRadius: radius.extraLarge,
    borderTopRightRadius: radius.extraLarge,
    borderTopWidth: 1,
    borderColor: darkColors.border,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: radius.large,
    backgroundColor: alpha.primary12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: darkColors.textMuted,
  },
  tabLabelActive: {
    color: darkColors.accent,
    fontWeight: '800',
  },
  fabWrap: {
    position: 'absolute',
    right: spacing[4],
    bottom: 68,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: radius.circle,
    backgroundColor: darkColors.accent,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkColors.primary,
    experimental_backgroundImage: `linear-gradient(135deg, ${darkColors.success} 0%, ${darkColors.accent} 55%, ${darkColors.primary} 100%)`,
    borderWidth: 3,
    borderColor: darkColors.background,
    shadowColor: darkColors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
});
