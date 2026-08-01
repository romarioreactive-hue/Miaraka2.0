import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GROUP_COLORS, GROUP_LABELS, PALETTE, PersonGroup } from './people-data';

import { Spacing } from '@/constants/theme';

type InvitePersonSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type SearchResult = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

const SEARCH_RESULTS: SearchResult[] = [
  { id: 'sofia', name: 'Sofia Ranaivo', email: 'sofia.ranaivo@gmail.com', initials: 'SR' },
  { id: 'andry', name: 'Andry Rakoto', email: 'andry.rakoto@gmail.com', initials: 'AR' },
  { id: 'lina', name: 'Lina Razafy', email: 'lina.razafy@gmail.com', initials: 'LR' },
];

const GROUPS: PersonGroup[] = ['famille', 'amis', 'equipe'];

export function InvitePersonSheet({ visible, onClose }: InvitePersonSheetProps) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<PersonGroup>('amis');
  const [invitedPerson, setInvitedPerson] = useState<SearchResult | null>(null);

  const filteredResults = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr-FR');
    if (!normalizedQuery) return SEARCH_RESULTS;

    return SEARCH_RESULTS.filter((person) =>
      `${person.name} ${person.email}`.toLocaleLowerCase('fr-FR').includes(normalizedQuery),
    );
  }, [query]);

  function resetAndClose() {
    setQuery('');
    setGroup('amis');
    setInvitedPerson(null);
    onClose();
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={resetAndClose}
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Fermer la fenêtre d'invitation"
          onPress={resetAndClose}
          style={styles.backdrop}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {invitedPerson ? (
            <View style={styles.confirmation}>
              <View style={styles.confirmationIcon}>
                <Text style={styles.confirmationIconText}>✓</Text>
              </View>
              <Text accessibilityRole="header" style={styles.confirmationTitle}>
                Invitation envoyée
              </Text>
              <Text style={styles.confirmationText}>
                {invitedPerson.name} recevra une invitation pour rejoindre le groupe{' '}
                {GROUP_LABELS[group].toLocaleLowerCase('fr-FR')}.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={resetAndClose}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
                <Text style={styles.primaryButtonText}>Terminer</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.headerCopy}>
                  <Text accessibilityRole="header" style={styles.title}>
                    Ajouter une personne
                  </Text>
                  <Text style={styles.subtitle}>Recherchez un proche puis choisissez son groupe.</Text>
                </View>
                <Pressable
                  accessibilityLabel="Fermer"
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={resetAndClose}
                  style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  accessibilityLabel="Recherche par nom ou Gmail"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setQuery}
                  placeholder="Rechercher par nom ou Gmail"
                  placeholderTextColor={PALETTE.textSecondary}
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={query}
                />
              </View>

              <View style={styles.groupBlock}>
                <Text style={styles.sectionLabel}>Choisir un groupe</Text>
                <View style={styles.groupRow}>
                  {GROUPS.map((item) => {
                    const isSelected = item === group;
                    return (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        key={item}
                        onPress={() => setGroup(item)}
                        style={[
                          styles.groupButton,
                          isSelected && {
                            backgroundColor: `${GROUP_COLORS[item]}22`,
                            borderColor: GROUP_COLORS[item],
                          },
                        ]}>
                        <View style={[styles.groupDot, { backgroundColor: GROUP_COLORS[item] }]} />
                        <Text style={[styles.groupLabel, isSelected && styles.groupLabelSelected]}>
                          {GROUP_LABELS[item]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Text style={styles.sectionLabel}>Résultats fictifs</Text>
              <ScrollView
                contentContainerStyle={styles.results}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {filteredResults.map((person) => (
                  <View key={person.id} style={styles.resultRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{person.initials}</Text>
                    </View>
                    <View style={styles.personCopy}>
                      <Text style={styles.personName}>{person.name}</Text>
                      <Text numberOfLines={1} style={styles.personEmail}>
                        {person.email}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel={`Inviter ${person.name}`}
                      accessibilityRole="button"
                      onPress={() => setInvitedPerson(person)}
                      style={({ pressed }) => [styles.inviteButton, pressed && styles.buttonPressed]}>
                      <Text style={styles.inviteButtonText}>Inviter</Text>
                    </Pressable>
                  </View>
                ))}

                {filteredResults.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>Aucun résultat</Text>
                    <Text style={styles.emptyText}>Essayez un autre nom ou une autre adresse Gmail.</Text>
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 5, 18, 0.72)',
  },
  sheet: {
    maxHeight: '88%',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.1)',
    backgroundColor: PALETTE.navySurface,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(231,236,245,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.mist,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: PALETTE.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(231,236,245,0.08)',
  },
  closeButtonText: {
    marginTop: -2,
    fontSize: 24,
    color: PALETTE.mist,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.14)',
    backgroundColor: PALETTE.navy,
  },
  searchIcon: {
    fontSize: 22,
    color: PALETTE.textSecondary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: PALETTE.mist,
  },
  groupBlock: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  groupButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.1)',
    backgroundColor: 'rgba(231,236,245,0.04)',
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  groupLabelSelected: {
    color: PALETTE.mist,
  },
  results: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  resultRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(231,236,245,0.08)',
    backgroundColor: 'rgba(231,236,245,0.04)',
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: `${PALETTE.blueRegion}33`,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.mist,
  },
  personCopy: {
    flex: 1,
    gap: 2,
  },
  personName: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.mist,
  },
  personEmail: {
    fontSize: 11,
    color: PALETTE.textSecondary,
  },
  inviteButton: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    backgroundColor: PALETTE.blueRegion,
  },
  inviteButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.five,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.mist,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    color: PALETTE.textSecondary,
  },
  confirmation: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  confirmationIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: `${PALETTE.greenSafety}22`,
    borderWidth: 1,
    borderColor: PALETTE.greenSafety,
  },
  confirmationIconText: {
    fontSize: 30,
    fontWeight: '800',
    color: PALETTE.greenSafety,
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.mist,
  },
  confirmationText: {
    maxWidth: 310,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: PALETTE.textSecondary,
  },
  primaryButton: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.three,
    backgroundColor: PALETTE.blueRegion,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.82,
  },
});
