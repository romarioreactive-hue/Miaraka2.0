import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProtectedRoute } from '@/auth';
import { ActivityScreen } from '@/components/demo/activity-screen';
import { ChallengesScreen } from '@/components/demo/challenges-screen';
import { DashboardLoadingState } from '@/components/demo/dashboard-loading-state';
import { DemoTab, DemoTabBar } from '@/components/demo/demo-tab-bar';
import { MiaAssistantScreen } from '@/components/demo/mia-assistant-screen';
import { ProfileScreen } from '@/components/demo/profile-screen';
import { SpaceDetailScreen } from '@/components/demo/space-detail-screen';
import { SpacesScreen } from '@/components/demo/spaces-screen';
import { MyLocationScreen } from '@/components/location/my-location-screen';

const BOOT_DURATION_MS = 1400;

export default function DemoScreen() {
  const [activeTab, setActiveTab] = useState<DemoTab>('carte');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [isMiaOpen, setIsMiaOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), BOOT_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  function handleChangeTab(tab: DemoTab) {
    setActiveTab(tab);
    setSelectedSpaceId(null);
    setIsMiaOpen(false);
    setIsBooting(false);
  }

  return (
    <ProtectedRoute redirectTo="/">
      <View style={styles.screenRoot}>
        <View style={styles.phoneFrame}>
          <SafeAreaView style={styles.safeArea}>
            {isBooting ? (
              <DashboardLoadingState
                activeTab={activeTab}
                onChangeTab={handleChangeTab}
                onPressMia={() => setIsMiaOpen(true)}
              />
            ) : activeTab === 'activite' ? (
              <ActivityScreen />
            ) : activeTab === 'defis' ? (
              <ChallengesScreen />
            ) : activeTab === 'espaces' ? (
              selectedSpaceId ? (
                <SpaceDetailScreen
                  onBack={() => setSelectedSpaceId(null)}
                  onDeleted={() => setSelectedSpaceId(null)}
                  onLeft={() => setSelectedSpaceId(null)}
                  spaceId={selectedSpaceId}
                />
              ) : (
                <SpacesScreen onSelectSpace={setSelectedSpaceId} />
              )
            ) : activeTab === 'profil' ? (
              <ProfileScreen onNavigateToSpaces={() => handleChangeTab('espaces')} />
            ) : (
              <MyLocationScreen />
            )}

            {!isBooting && <DemoTabBar activeTab={activeTab} onChangeTab={handleChangeTab} onPressMia={() => setIsMiaOpen(true)} />}
          </SafeAreaView>

          {isMiaOpen && (
            <View style={StyleSheet.absoluteFill}>
              <MiaAssistantScreen
                activeTab={activeTab}
                onClose={() => setIsMiaOpen(false)}
                onNavigate={handleChangeTab}
              />
            </View>
          )}
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000814',
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#060C1F',
    position: 'relative',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
});
