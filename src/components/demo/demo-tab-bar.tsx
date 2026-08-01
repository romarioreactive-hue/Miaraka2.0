import { Pressable, StyleSheet, Text, View } from 'react-native';

export type DemoTab = 'carte' | 'activite' | 'defis' | 'espaces' | 'profil';

const TABS: { id: DemoTab; label: string; icon: string }[] = [
  { id: 'carte', label: 'Carte', icon: '🗺️' },
  { id: 'activite', label: 'Activité', icon: '📈' },
  { id: 'defis', label: 'Défis', icon: '🏆' },
  { id: 'espaces', label: 'Espaces', icon: '🌐' },
  { id: 'profil', label: 'Profil', icon: '👤' },
];

type DemoTabBarProps = {
  activeTab: DemoTab;
  onChangeTab: (tab: DemoTab) => void;
  onPressMia?: () => void;
};

export function DemoTabBar({ activeTab, onChangeTab, onPressMia }: DemoTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPressMia} style={styles.fab} hitSlop={8}>
        <Text style={styles.fabText}>MIA</Text>
      </Pressable>

      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onChangeTab(tab.id)}
              style={styles.tabButton}
              hitSlop={6}>
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              {isActive && <View style={styles.activeDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    top: -26,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    experimental_backgroundImage: 'linear-gradient(135deg, #22C55E 0%, #22D3EE 55%, #3B82F6 100%)',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 3,
    borderColor: '#060C1F',
  },
  fabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#0B1836',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 56,
    minHeight: 48,
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.55,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C88A8',
  },
  tabLabelActive: {
    color: '#F8FAFC',
  },
  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22D3EE',
  },
});
