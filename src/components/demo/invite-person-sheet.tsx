import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
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
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/language-context';
import { radius, spacing, typography } from '@/theme';

type InvitePersonSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type InvitationTab = 'received' | 'sent';

type Invitation = {
  id: string;
  name: string;
  detail: string;
  initials: string;
  color: string;
  online?: boolean;
  state?: 'pending' | 'accepted';
};

const COLORS = {
  background: '#071424',
  shellBackground: '#000814',
  glass: 'rgba(12, 33, 71, 0.70)',
  glassBorder: 'rgba(255, 255, 255, 0.05)',
  surface: '#1E2115',
  surfaceLow: '#1A1D11',
  surfaceHigh: '#292B1F',
  outline: '#8F937B',
  outlineVariant: '#444935',
  text: '#D7E3FA',
  textSecondary: '#C5C9AF',
  white: '#FFFFFF',
  green: '#3EE09D',
  blue: '#4F8CFF',
  paleBlue: '#AFC6FF',
  lime: '#C9F23B',
  onPrimary: '#576C00',
} as const;

const RECEIVED: Invitation[] = [
  { id: 'rica', name: 'Rica Rakoto', detail: '@ricarakoto', initials: 'RR', color: '#7C6CF0', online: true },
  { id: 'mario', name: 'Mario R.', detail: 'mario.r@gmail.com', initials: 'MR', color: '#29D391' },
  { id: 'taratra', name: 'Taratra A.', detail: 'Dernier passage : 2 h', initials: 'TA', color: '#4F8CFF' },
];

const SENT: Invitation[] = [
  { id: 'sofia', name: 'Sofia Ranaivo', detail: 'sofia.ranaivo@gmail.com', initials: 'SR', color: '#F2679D', state: 'pending' },
  { id: 'andry', name: 'Andry Rakoto', detail: 'andry.rakoto@gmail.com', initials: 'AR', color: '#F6BE4F', state: 'pending' },
  { id: 'lina', name: 'Lina Razafy', detail: 'lina.razafy@gmail.com', initials: 'LR', color: '#38D6E8', state: 'accepted' },
];

export function InvitePersonSheet({ visible, onClose }: InvitePersonSheetProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<InvitationTab>('received');
  const [query, setQuery] = useState('');
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tabsWidth, setTabsWidth] = useState(0);
  const indicator = useSharedValue(0);
  const copy = getCopy(language);

  useEffect(() => {
    indicator.value = withTiming(activeTab === 'received' ? 0 : tabsWidth / 2, { duration: 300 });
  }, [activeTab, indicator, tabsWidth]);

  const invitations = useMemo(() => {
    const source = activeTab === 'received' ? RECEIVED : SENT;
    const normalized = query.trim().toLocaleLowerCase(language === 'fr' ? 'fr-FR' : 'mg-MG');
    if (!normalized) return source;
    return source.filter((item) => `${item.name} ${item.detail}`.toLocaleLowerCase(language === 'fr' ? 'fr-FR' : 'mg-MG').includes(normalized));
  }, [activeTab, language, query]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: indicator.value }] }));

  function resetAndClose() {
    setActiveTab('received');
    setQuery('');
    setFeedback(null);
    onClose();
  }

  function handleInvitation(item: Invitation) {
    if (!sentIds.includes(item.id)) setSentIds((current) => [...current, item.id]);
    setFeedback(t('map.invitationSent'));
  }

  return (
    <Modal animationType="fade" onRequestClose={resetAndClose} presentationStyle="overFullScreen" visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <SafeAreaView style={styles.screen}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              onPress={resetAndClose}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor={COLORS.paleBlue} weight="medium" />
            </Pressable>
            <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>{t('map.addPerson')}</Text>
            <View style={styles.headerButton} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View accessibilityRole="search" style={styles.searchBox}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={22} tintColor={COLORS.outline} weight="medium" />
              <TextInput
                accessibilityLabel={t('map.searchPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setQuery}
                placeholder={t('map.searchPlaceholder')}
                placeholderTextColor={COLORS.outline}
                returnKeyType="search"
                selectionColor={COLORS.paleBlue}
                style={styles.searchInput}
                value={query}
              />
              {query ? (
                <Pressable accessibilityLabel={copy.clearSearch} accessibilityRole="button" onPress={() => setQuery('')} style={styles.clearButton}>
                  <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={19} tintColor={COLORS.textSecondary} weight="medium" />
                </Pressable>
              ) : null}
            </View>

            <View onLayout={(event) => setTabsWidth(event.nativeEvent.layout.width)} style={styles.tabs}>
              <TabButton active={activeTab === 'received'} label={copy.received} onPress={() => { setActiveTab('received'); setFeedback(null); }} />
              <TabButton active={activeTab === 'sent'} label={copy.sent} onPress={() => { setActiveTab('sent'); setFeedback(null); }} />
              <Animated.View style={[styles.tabIndicator, { width: tabsWidth / 2 }, indicatorStyle]} />
            </View>

            {feedback ? (
              <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOut.duration(160)} style={styles.feedbackBanner}>
                <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={18} tintColor={COLORS.green} weight="bold" />
                <Text style={styles.feedbackText}>{feedback}</Text>
              </Animated.View>
            ) : null}

            <Animated.View key={`${activeTab}-${query}`} entering={FadeIn.duration(250)} layout={LinearTransition} style={styles.list}>
              {invitations.map((item) => (
                <InvitationCard
                  activeTab={activeTab}
                  copy={copy}
                  invited={sentIds.includes(item.id)}
                  item={item}
                  key={item.id}
                  onPress={() => handleInvitation(item)}
                />
              ))}
              {invitations.length === 0 ? (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptyTitle}>{t('map.noResult')}</Text>
                  <Text style={styles.emptyText}>{t('map.tryAnother')}</Text>
                </View>
              ) : null}
            </Animated.View>

            <View style={styles.helpState}>
              <View style={styles.contactsIcon}>
                <SymbolView name={{ ios: 'person.crop.rectangle.stack.fill', android: 'contacts', web: 'contacts' }} size={34} tintColor={COLORS.paleBlue} weight="medium" />
              </View>
              <Text style={styles.helpText}>{copy.help}</Text>
            </View>
          </ScrollView>

          <BottomNavigation copy={copy} onBack={resetAndClose} onUnavailable={() => setFeedback(copy.demoNavigation)} />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function InvitationCard({ activeTab, copy, invited, item, onPress }: { activeTab: InvitationTab; copy: ReturnType<typeof getCopy>; invited: boolean; item: Invitation; onPress: () => void }) {
  const accepted = activeTab === 'sent' && item.state === 'accepted';
  const label = accepted ? copy.accepted : invited ? copy.invited : activeTab === 'sent' ? copy.remind : copy.invite;
  const disabled = accepted || invited;
  return (
    <Pressable
      accessibilityLabel={`${item.name}, ${item.detail}`}
      accessibilityRole="button"
      style={({ pressed }) => [styles.invitationCard, pressed && styles.cardPressed]}>
      <View style={styles.personIdentity}>
        <View style={styles.avatarWrap}>
          <Avatar backgroundColor={item.color} initials={item.initials} name={item.name} ringColor={COLORS.surfaceHigh} size={64} />
          {item.online ? <View style={styles.onlineDot} /> : null}
        </View>
        <View style={styles.personCopy}>
          <Text numberOfLines={1} style={styles.personName}>{item.name}</Text>
          <Text numberOfLines={1} style={styles.personDetail}>{item.detail}</Text>
        </View>
      </View>
      <Pressable
        accessibilityLabel={`${label} ${item.name}`}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [styles.inviteButton, disabled && styles.inviteButtonDone, pressed && styles.pressed]}>
        <Text style={[styles.inviteLabel, disabled && styles.inviteLabelDone]}>{label}</Text>
      </Pressable>
    </Pressable>
  );
}

function BottomNavigation({ copy, onBack, onUnavailable }: { copy: ReturnType<typeof getCopy>; onBack: () => void; onUnavailable: () => void }) {
  const items = [
    { id: 'map', icon: 'map', label: copy.map, active: false },
    { id: 'activity', icon: 'switch_account', label: copy.activity, active: false },
    { id: 'challenges', icon: 'emoji_events', label: copy.challenges, active: false },
    { id: 'spaces', icon: 'groups', label: copy.spaces, active: false },
    { id: 'profile', icon: 'person', label: copy.profile, active: true },
  ] as const;
  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: item.active }}
          key={item.id}
          onPress={item.id === 'map' ? onBack : onUnavailable}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
          <SymbolView
            name={{
              ios: item.id === 'map' ? 'map.fill' : item.id === 'activity' ? 'figure.2.arms.open' : item.id === 'challenges' ? 'trophy.fill' : item.id === 'spaces' ? 'person.3.fill' : 'person.fill',
              android: item.icon,
              web: item.icon,
            }}
            size={21}
            tintColor={item.active ? COLORS.paleBlue : COLORS.outline}
            weight={item.active ? 'bold' : 'medium'}
          />
          <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
          {item.active ? <View style={styles.navActiveDot} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

function getCopy(language: 'fr' | 'mg') {
  return language === 'mg'
    ? {
        clearSearch: 'Hamafa ny fikarohana', received: 'Fanasana voaray', sent: 'Fanasana nalefa', invite: 'Hanasa', invited: 'Nalefa', remind: 'Hampahatsiahy', accepted: 'Nekena', help: 'Asao ny havanao mba hifandray hatrany sy hiantohana ny fiarovany mivantana.', demoNavigation: 'Fitetezana santatra amin’ity efijery ity.', map: 'Sarintany', activity: 'Hetsika', challenges: 'Fanamby', spaces: 'Vondrona', profile: 'Mombamomba ahy',
      }
    : {
        clearSearch: 'Effacer la recherche', received: 'Invitations reçues', sent: 'Invitations envoyées', invite: 'Inviter', invited: 'Envoyée', remind: 'Relancer', accepted: 'Acceptée', help: 'Invitez vos proches pour rester connecté et assurer leur protection en temps réel.', demoNavigation: 'Navigation fictive sur cet écran.', map: 'Carte', activity: 'Activité', challenges: 'Défis', spaces: 'Espaces', profile: 'Profil',
      };
}

const styles = StyleSheet.create({
  modalRoot: { alignItems: 'center', backgroundColor: COLORS.shellBackground, flex: 1 },
  screen: { backgroundColor: COLORS.background, flex: 1, maxWidth: 430, width: '100%' },
  header: { alignItems: 'center', backgroundColor: 'rgba(30, 33, 21, 0.82)', borderBottomColor: COLORS.glassBorder, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 64, paddingHorizontal: spacing[2] },
  headerButton: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  title: { ...typography.titleLarge, color: COLORS.text, flex: 1, fontSize: 23, lineHeight: 30, textAlign: 'center' },
  content: { gap: spacing[6], paddingBottom: spacing[10], paddingHorizontal: spacing[5], paddingTop: spacing[6] },
  searchBox: { alignItems: 'center', backgroundColor: COLORS.surfaceLow, borderRadius: radius.extraLarge, flexDirection: 'row', minHeight: 56, paddingLeft: spacing[4] },
  searchInput: { ...typography.bodyMedium, color: COLORS.text, flex: 1, minHeight: 56, paddingHorizontal: spacing[3], paddingVertical: 0 },
  clearButton: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  tabs: { borderBottomColor: COLORS.outlineVariant, borderBottomWidth: 1, flexDirection: 'row', position: 'relative' },
  tabButton: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: spacing[2] },
  tabLabel: { ...typography.labelMedium, color: COLORS.outline, textAlign: 'center' },
  tabLabelActive: { color: COLORS.paleBlue, fontWeight: '700' },
  tabIndicator: { backgroundColor: COLORS.green, bottom: -1, height: 2, left: 0, position: 'absolute', shadowColor: COLORS.blue, shadowOpacity: 0.8, shadowRadius: 6 },
  feedbackBanner: { alignItems: 'center', backgroundColor: 'rgba(62, 224, 157, 0.10)', borderColor: 'rgba(62, 224, 157, 0.20)', borderRadius: radius.large, borderWidth: 1, flexDirection: 'row', gap: spacing[2], minHeight: 44, paddingHorizontal: spacing[4] },
  feedbackText: { ...typography.labelMedium, color: COLORS.green },
  list: { gap: spacing[4] },
  invitationCard: { alignItems: 'center', backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderRadius: 32, borderWidth: 1, flexDirection: 'row', gap: spacing[3], justifyContent: 'space-between', minHeight: 88, padding: spacing[4], shadowColor: COLORS.blue, shadowOpacity: 0.08, shadowRadius: 12 },
  cardPressed: { opacity: 0.90, transform: [{ scale: 0.99 }] },
  personIdentity: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing[3], minWidth: 0 },
  avatarWrap: { position: 'relative' },
  onlineDot: { backgroundColor: COLORS.green, borderColor: COLORS.surface, borderRadius: radius.circle, borderWidth: 2, bottom: 0, height: 16, position: 'absolute', right: 0, width: 16 },
  personCopy: { flex: 1, gap: spacing[1], minWidth: 0 },
  personName: { ...typography.bodyLarge, color: COLORS.text, fontWeight: '700' },
  personDetail: { ...typography.caption, color: COLORS.outline },
  inviteButton: { alignItems: 'center', backgroundColor: COLORS.lime, borderRadius: radius.pill, justifyContent: 'center', minHeight: 48, minWidth: 92, paddingHorizontal: spacing[4] },
  inviteButtonDone: { backgroundColor: COLORS.surfaceHigh, borderColor: COLORS.outlineVariant, borderWidth: 1 },
  inviteLabel: { ...typography.labelMedium, color: COLORS.onPrimary, fontWeight: '800' },
  inviteLabelDone: { color: COLORS.textSecondary },
  emptySearch: { alignItems: 'center', gap: spacing[1], paddingVertical: spacing[8] },
  emptyTitle: { ...typography.titleMedium, color: COLORS.text },
  emptyText: { ...typography.bodyMedium, color: COLORS.textSecondary, textAlign: 'center' },
  helpState: { alignItems: 'center', gap: spacing[4], paddingHorizontal: spacing[8], paddingTop: spacing[4] },
  contactsIcon: { alignItems: 'center', backgroundColor: COLORS.surfaceHigh, borderRadius: radius.circle, height: 64, justifyContent: 'center', width: 64 },
  helpText: { ...typography.bodyMedium, color: COLORS.textSecondary, textAlign: 'center' },
  bottomNav: { alignItems: 'center', backgroundColor: 'rgba(30, 33, 21, 0.94)', borderTopColor: COLORS.glassBorder, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing[2], paddingVertical: spacing[2] },
  navButton: { alignItems: 'center', gap: spacing[1], justifyContent: 'center', minHeight: 56, minWidth: 58, position: 'relative' },
  navLabel: { color: COLORS.outline, fontSize: 10, fontWeight: '600', lineHeight: 14 },
  navLabelActive: { color: COLORS.paleBlue, fontWeight: '800' },
  navActiveDot: { backgroundColor: COLORS.paleBlue, borderRadius: radius.circle, bottom: 0, height: 4, shadowColor: COLORS.paleBlue, shadowOpacity: 1, shadowRadius: 6, width: 4 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.96 }] },
});
