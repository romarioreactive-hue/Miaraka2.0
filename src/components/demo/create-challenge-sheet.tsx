import { useState } from 'react';
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

const COLORS = {
  background: '#060C1F',
  surface: '#0D1933',
  surfaceLight: '#142342',
  text: '#F7FAFF',
  muted: '#8D9AB8',
  border: 'rgba(255,255,255,0.10)',
  green: '#39D98A',
  cyan: '#35D7E8',
  blue: '#5B8DEF',
} as const;

type Group = 'Famille' | 'Amis' | 'Équipe';
type ChallengeType = 'Individuel' | 'Collectif' | 'Classement';

const GROUPS: Group[] = ['Famille', 'Amis', 'Équipe'];
const TYPES: ChallengeType[] = ['Individuel', 'Collectif', 'Classement'];
const PEOPLE = [
  { name: 'Moi', initials: 'M' },
  { name: 'Rica', initials: 'R' },
  { name: 'Mario', initials: 'MA' },
  { name: 'Taratra', initials: 'T' },
] as const;

type CreateChallengeSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CreateChallengeSheet({ visible, onClose }: CreateChallengeSheetProps) {
  const [title, setTitle] = useState('Défi marche du mois');
  const [group, setGroup] = useState<Group>('Équipe');
  const [startDate, setStartDate] = useState('03/08/2026');
  const [endDate, setEndDate] = useState('09/08/2026');
  const [goal, setGoal] = useState('40');
  const [type, setType] = useState<ChallengeType>('Collectif');
  const [selectedPeople, setSelectedPeople] = useState<string[]>(PEOPLE.map((person) => person.name));
  const [created, setCreated] = useState(false);

  function togglePerson(name: string) {
    setSelectedPeople((current) =>
      current.includes(name) ? current.filter((person) => person !== name) : [...current, name],
    );
  }

  function resetAndClose() {
    setCreated(false);
    onClose();
  }

  return (
    <Modal animationType="slide" onRequestClose={resetAndClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}>
        <Pressable accessibilityLabel="Fermer la création du défi" onPress={resetAndClose} style={styles.backdrop} />

        <View style={styles.sheet}>
          <View style={styles.handle} />
          {created ? (
            <View style={styles.confirmation}>
              <View style={styles.confirmationIcon}><Text style={styles.confirmationIconText}>✓</Text></View>
              <Text accessibilityRole="header" style={styles.confirmationTitle}>Défi créé !</Text>
              <Text style={styles.confirmationText}>{title} est prêt pour {selectedPeople.length} participants.</Text>
              <Pressable onPress={resetAndClose} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Terminer</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>NOUVEAU</Text>
                  <Text accessibilityRole="header" style={styles.title}>Créer un défi</Text>
                </View>
                <Pressable accessibilityLabel="Fermer" onPress={resetAndClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.form}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <Field label="Titre du défi" value={title} onChangeText={setTitle} />

                <ChoiceBlock label="Groupe">
                  {GROUPS.map((item) => (
                    <ChoiceButton key={item} label={item} selected={item === group} onPress={() => setGroup(item)} />
                  ))}
                </ChoiceBlock>

                <View style={styles.dateRow}>
                  <View style={styles.halfField}><Field label="Date de début" value={startDate} onChangeText={setStartDate} /></View>
                  <View style={styles.halfField}><Field label="Date de fin" value={endDate} onChangeText={setEndDate} /></View>
                </View>

                <View>
                  <Text style={styles.label}>Objectif en kilomètres</Text>
                  <View style={styles.goalInputRow}>
                    <TextInput
                      accessibilityLabel="Objectif en kilomètres"
                      keyboardType="decimal-pad"
                      onChangeText={setGoal}
                      style={styles.goalInput}
                      value={goal}
                    />
                    <Text style={styles.goalUnit}>km</Text>
                  </View>
                </View>

                <ChoiceBlock label="Type de défi">
                  {TYPES.map((item) => (
                    <ChoiceButton key={item} label={item} selected={item === type} onPress={() => setType(item)} compact />
                  ))}
                </ChoiceBlock>

                <View>
                  <Text style={styles.label}>Participants fictifs</Text>
                  <View style={styles.peopleRow}>
                    {PEOPLE.map((person) => {
                      const selected = selectedPeople.includes(person.name);
                      return (
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: selected }}
                          key={person.name}
                          onPress={() => togglePerson(person.name)}
                          style={styles.personButton}>
                          <View style={[styles.personAvatar, selected && styles.personAvatarSelected]}>
                            <Text style={[styles.personInitials, selected && styles.personInitialsSelected]}>{person.initials}</Text>
                            {selected && <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>}
                          </View>
                          <Text style={[styles.personName, selected && styles.personNameSelected]}>{person.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              <Pressable
                accessibilityRole="button"
                onPress={() => setCreated(true)}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Créer</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type FieldProps = { label: string; value: string; onChangeText: (text: string) => void };

function Field({ label, value, onChangeText }: FieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput onChangeText={onChangeText} style={styles.input} value={value} />
    </View>
  );
}

type ChoiceBlockProps = { label: string; children: React.ReactNode };

function ChoiceBlock({ label, children }: ChoiceBlockProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceRow}>{children}</View>
    </View>
  );
}

type ChoiceButtonProps = { label: string; selected: boolean; onPress: () => void; compact?: boolean };

function ChoiceButton({ label, selected, onPress, compact }: ChoiceButtonProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choiceButton, compact && styles.choiceButtonCompact, selected && styles.choiceButtonSelected]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,4,15,0.76)' },
  sheet: {
    maxHeight: '91%',
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 28,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  eyebrow: { color: COLORS.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: COLORS.text, fontSize: 23, fontWeight: '900' },
  closeButton: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceLight },
  closeText: { color: COLORS.text, fontSize: 22, lineHeight: 24 },
  form: { gap: 14, paddingBottom: 16 },
  label: { color: COLORS.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 },
  input: {
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 13,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  choiceRow: { flexDirection: 'row', gap: 7 },
  choiceButton: {
    flex: 1,
    minHeight: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  choiceButtonCompact: { paddingHorizontal: 3 },
  choiceButtonSelected: { backgroundColor: 'rgba(53,215,232,0.12)', borderColor: 'rgba(53,215,232,0.55)' },
  choiceText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  choiceTextSelected: { color: COLORS.cyan },
  dateRow: { flexDirection: 'row', gap: 8 },
  halfField: { flex: 1 },
  goalInputRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalInput: { flex: 1, color: COLORS.text, fontSize: 20, fontWeight: '900', paddingVertical: 8 },
  goalUnit: { color: COLORS.green, fontSize: 12, fontWeight: '900' },
  peopleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  personButton: { alignItems: 'center', gap: 5, width: 58 },
  personAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  personAvatarSelected: { backgroundColor: 'rgba(91,141,239,0.17)', borderColor: COLORS.blue },
  personInitials: { color: COLORS.muted, fontSize: 10, fontWeight: '900' },
  personInitialsSelected: { color: COLORS.text },
  personName: { color: COLORS.muted, fontSize: 9, fontWeight: '700' },
  personNameSelected: { color: COLORS.text },
  check: {
    position: 'absolute',
    right: -3,
    top: -3,
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  checkText: { color: COLORS.background, fontSize: 7, fontWeight: '900' },
  primaryButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    backgroundColor: COLORS.cyan,
  },
  primaryButtonText: { color: COLORS.background, fontSize: 13, fontWeight: '900' },
  primaryButtonArrow: { color: COLORS.background, fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  confirmation: { alignItems: 'center', gap: 14, paddingVertical: 28 },
  confirmationIcon: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(57,217,138,0.14)',
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  confirmationIconText: { color: COLORS.green, fontSize: 29, fontWeight: '900' },
  confirmationTitle: { color: COLORS.text, fontSize: 23, fontWeight: '900' },
  confirmationText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginBottom: 6 },
});
