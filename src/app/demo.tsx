import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityScreen } from '@/components/demo/activity-screen';
import { ChallengesScreen } from '@/components/demo/challenges-screen';
import { DemoHeader } from '@/components/demo/demo-header';
import { DemoMap } from '@/components/demo/demo-map';
import { DemoTab, DemoTabBar } from '@/components/demo/demo-tab-bar';
import { CreateSpaceSheet } from '@/components/demo/create-space-sheet';
import { InvitePersonSheet } from '@/components/demo/invite-person-sheet';
import { InviteSpaceMemberSheet } from '@/components/demo/invite-space-member-sheet';
import { PEOPLE, PersonGroup } from '@/components/demo/people-data';
import { PersonSheet } from '@/components/demo/person-sheet';
import { SpaceDetailScreen } from '@/components/demo/space-detail-screen';
import { Space } from '@/components/demo/spaces-data';
import { SpacesScreen } from '@/components/demo/spaces-screen';

type FilterId = 'tous' | PersonGroup;

const TAB_PLACEHOLDERS: Record<Exclude<DemoTab, 'carte' | 'activite' | 'defis' | 'espaces'>, { icon: string; text: string }> = {
  profil: { icon: '👤', text: "L'écran Profil arrive dans une prochaine étape." },
};

export default function DemoScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterId>('tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DemoTab>('carte');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [isSpaceInviteOpen, setIsSpaceInviteOpen] = useState(false);

  const visiblePeople = activeFilter === 'tous' ? PEOPLE : PEOPLE.filter((p) => p.group === activeFilter);
  const selectedPerson = PEOPLE.find((p) => p.id === selectedId) ?? null;

  function handleChangeTab(tab: DemoTab) {
    setActiveTab(tab);
    setSelectedId(null);
    setIsInviteOpen(false);
    setSelectedSpace(null);
    setIsCreateSpaceOpen(false);
    setIsSpaceInviteOpen(false);
  }

  function handleOpenInvite() {
    setSelectedId(null);
    setIsInviteOpen(true);
  }

  return (
    <View style={styles.screenRoot}>
      <View style={styles.phoneFrame}>
        <SafeAreaView style={styles.safeArea}>
          {activeTab === 'activite' ? (
            <ActivityScreen />
          ) : activeTab === 'defis' ? (
            <ChallengesScreen />
          ) : activeTab === 'espaces' ? (
            selectedSpace ? (
              <SpaceDetailScreen
                onBack={() => setSelectedSpace(null)}
                onInviteMember={() => setIsSpaceInviteOpen(true)}
                space={selectedSpace}
              />
            ) : (
              <SpacesScreen
                onCreateSpace={() => setIsCreateSpaceOpen(true)}
                onSelectSpace={setSelectedSpace}
              />
            )
          ) : (
            <>
              <DemoHeader
                activeFilter={activeFilter}
                onChangeFilter={setActiveFilter}
                onPressAddPerson={activeTab === 'carte' ? handleOpenInvite : undefined}
              />

              {activeTab === 'carte' ? (
                <DemoMap
                  people={visiblePeople}
                  selectedId={selectedId}
                  onSelectPerson={setSelectedId}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderIcon}>{TAB_PLACEHOLDERS[activeTab].icon}</Text>
                  <Text style={styles.placeholderText}>{TAB_PLACEHOLDERS[activeTab].text}</Text>
                </View>
              )}
            </>
          )}

          <DemoTabBar activeTab={activeTab} onChangeTab={handleChangeTab} />
        </SafeAreaView>

        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {selectedPerson && <PersonSheet person={selectedPerson} onClose={() => setSelectedId(null)} />}
        </View>

        <InvitePersonSheet visible={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
        <CreateSpaceSheet visible={isCreateSpaceOpen} onClose={() => setIsCreateSpaceOpen(false)} />
        <InviteSpaceMemberSheet
          space={selectedSpace}
          visible={isSpaceInviteOpen}
          onClose={() => setIsSpaceInviteOpen(false)}
        />
      </View>
    </View>
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
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A9B4D0',
    textAlign: 'center',
    maxWidth: 240,
  },
});
