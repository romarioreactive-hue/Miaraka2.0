import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { alpha, darkColors, groupColors, radius, spacing, typography } from '@/theme';
import { useLanguage } from '@/contexts/language-context';

import {
  EditProfileModal,
  LogoutConfirmationModal,
  PauseSharingModal,
  ProfileDetails,
  SpacePermissionsModal,
  SpacePermissionSettings,
} from './profile-modals';

type SpaceKey = 'family' | 'friends' | 'team';

const SPACE_META: Record<SpaceKey, { nameKey: 'groups.family' | 'groups.friends' | 'groups.team'; icon: string; color: string }> = {
  family: { nameKey: 'groups.family', icon: '⌂', color: groupColors.family },
  friends: { nameKey: 'groups.friends', icon: '✦', color: groupColors.friends },
  team: { nameKey: 'groups.team', icon: '◆', color: groupColors.team },
};

const INITIAL_SPACE_SETTINGS: Record<SpaceKey, SpacePermissionSettings> = {
  family: { position: true, activity: true, lastPosition: true },
  friends: { position: true, activity: true, lastPosition: false },
  team: { position: true, activity: true, lastPosition: true, schedule: '08:00 – 18:00' },
};

export function ProfileScreen() {
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<ProfileDetails>({ name: 'Rica Rakoto', email: 'rica.rakoto@gmail.com', initials: 'RR' });
  const [location, setLocation] = useState({ share: true, background: true, lastKnown: true, batterySaver: false });
  const [notifications, setNotifications] = useState({ arrival: true, departure: false, invitation: true, challenge: true, offline: true, lowBattery: false });
  const [spaceSettings, setSpaceSettings] = useState(INITIAL_SPACE_SETTINGS);
  const [darkTheme, setDarkTheme] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<SpaceKey | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [sharingPause, setSharingPause] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function showFeedback(message: string) {
    setFeedback(message);
  }

  return (
    <>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{profile.initials}</Text></View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.profileCopy}>
            <Text accessibilityRole="header" style={styles.profileName}>{profile.name}</Text>
            <Text numberOfLines={1} style={styles.profileEmail}>{profile.email}</Text>
            <View style={styles.verifiedRow}><Text style={styles.verifiedIcon}>✓</Text><Text style={styles.verifiedText}>{t('profile.verified')}</Text></View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setEditOpen(true)} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
            <Text style={styles.editButtonText}>{t('profile.edit')}</Text>
          </Pressable>
        </Animated.View>

        {feedback && (
          <Pressable accessibilityRole="button" onPress={() => setFeedback(null)} style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>✓  {feedback}</Text><Text style={styles.feedbackClose}>×</Text>
          </Pressable>
        )}

        <Section icon="◉" title={t('profile.account')} delay={60}>
          <InfoRow icon="Aa" label={t('profile.fullName')} value={profile.name} />
          <InfoRow icon="◍" label={t('profile.photo')} value={t('profile.fakeAvatar')} />
          <InfoRow icon="G" label={t('profile.googleAccount')} value={profile.email} />
          <View style={styles.settingRow}>
            <View style={styles.rowIcon}><Text style={styles.rowIconText}>文</Text></View>
            <View style={styles.rowCopy}><Text style={styles.rowLabel}>{t('profile.language')}</Text></View>
            <View style={styles.segmented}>
              {(['fr', 'mg'] as const).map((item) => (
                <Pressable accessibilityRole="radio" accessibilityState={{ checked: language === item }} key={item} onPress={() => setLanguage(item)} style={[styles.segment, language === item && styles.segmentActive]}>
                  <Text style={[styles.segmentText, language === item && styles.segmentTextActive]}>{item.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setLogoutOpen(true)} style={({ pressed }) => [styles.logoutRow, pressed && styles.pressed]}>
            <Text style={styles.logoutText}>{t('profile.logout')}</Text><Text style={styles.chevron}>›</Text>
          </Pressable>
        </Section>

        <Section icon="⌖" title={t('profile.location')} delay={100}>
          <ToggleRow label={t('profile.sharePosition')} description={t('profile.visibleBySpace')} value={location.share} onValueChange={(share) => setLocation((current) => ({ ...current, share }))} />
          <ToggleRow label={t('profile.backgroundLocation')} description={t('profile.simulationActive')} value={location.background} onValueChange={(background) => setLocation((current) => ({ ...current, background }))} />
          <ToggleRow label={t('profile.lastKnown')} value={location.lastKnown} onValueChange={(lastKnown) => setLocation((current) => ({ ...current, lastKnown }))} />
          <ToggleRow label={t('profile.batterySaver')} description={t('profile.lessFrequent')} value={location.batterySaver} onValueChange={(batterySaver) => setLocation((current) => ({ ...current, batterySaver }))} />
          <View style={styles.gpsCard}><View><Text style={styles.gpsLabel}>{t('profile.gpsAccuracy')}</Text><Text style={styles.gpsValue}>{t('profile.excellent')}</Text></View><View style={styles.signalBars}>{[12, 18, 24, 30].map((height) => <View key={height} style={[styles.signalBar, { height }]} />)}</View></View>
        </Section>

        <Section icon="◎" title={t('profile.spaceVisibility')} delay={140}>
          {(Object.keys(SPACE_META) as SpaceKey[]).map((key) => {
            const meta = SPACE_META[key];
            const settings = spaceSettings[key];
            return (
              <Pressable accessibilityHint="Ouvre les permissions de cet espace" accessibilityRole="button" key={key} onPress={() => setSelectedSpace(key)} style={({ pressed }) => [styles.spaceRow, pressed && styles.rowPressed]}>
                <View style={[styles.spaceIcon, { backgroundColor: `${meta.color}22` }]}><Text style={[styles.spaceIconText, { color: meta.color }]}>{meta.icon}</Text></View>
                <View style={styles.spaceCopy}>
                  <Text style={styles.rowLabel}>{t(meta.nameKey)}</Text>
                  <View style={styles.permissionChips}>
                    <PermissionChip short="P" label={t('profile.position')} enabled={settings.position} />
                    <PermissionChip short="A" label={t('profile.activity')} enabled={settings.activity} />
                    <PermissionChip short="D" label={t('profile.lastKnown')} enabled={settings.lastPosition} />
                  </View>
                  {settings.schedule && <Text style={styles.scheduleText}>{t('profile.schedule', { schedule: settings.schedule })}</Text>}
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })}
        </Section>

        <Section icon="◌" title={t('profile.notifications')} delay={180}>
          <ToggleRow label={t('profile.arrivalOffice')} value={notifications.arrival} onValueChange={(arrival) => setNotifications((current) => ({ ...current, arrival }))} />
          <ToggleRow label={t('profile.departureOffice')} value={notifications.departure} onValueChange={(departure) => setNotifications((current) => ({ ...current, departure }))} />
          <ToggleRow label={t('profile.invitationReceived')} value={notifications.invitation} onValueChange={(invitation) => setNotifications((current) => ({ ...current, invitation }))} />
          <ToggleRow label={t('profile.challengeFinished')} value={notifications.challenge} onValueChange={(challenge) => setNotifications((current) => ({ ...current, challenge }))} />
          <ToggleRow label={t('profile.closeOffline')} value={notifications.offline} onValueChange={(offline) => setNotifications((current) => ({ ...current, offline }))} />
          <ToggleRow label={t('profile.lowBattery')} value={notifications.lowBattery} onValueChange={(lowBattery) => setNotifications((current) => ({ ...current, lowBattery }))} />
        </Section>

        <Section icon="◇" title={t('profile.privacy')} delay={220}>
          {sharingPause ? (
            <View style={styles.pauseActive}><View style={styles.pauseDot} /><View style={styles.pauseCopy}><Text style={styles.pauseTitle}>{t('profile.sharingPaused')}</Text><Text style={styles.pauseText}>{sharingPause === '1 heure' ? t('profile.oneHour') : t('profile.untilResume')}</Text></View><Pressable accessibilityRole="button" onPress={() => setSharingPause(null)} style={styles.resumeButton}><Text style={styles.resumeText}>{t('profile.resume')}</Text></Pressable></View>
          ) : (
            <ActionRow icon="Ⅱ" label={t('profile.pauseSharing')} value={t('profile.pauseValue')} onPress={() => setPauseOpen(true)} />
          )}
          <ActionRow icon="👁" label={t('profile.whoSees')} value={t('profile.authorizedPeople')} onPress={() => showFeedback(t('profile.feedbackWho'))} />
          <ActionRow icon="↗" label={t('profile.leaveSpace')} onPress={() => showFeedback(t('profile.feedbackLeave'))} />
          <ActionRow danger icon="×" label={t('profile.deleteAccount')} value={t('profile.fakeAction')} onPress={() => showFeedback(t('profile.feedbackDelete'))} />
        </Section>

        <Section icon="⚙" title={t('profile.application')} delay={260}>
          <ToggleRow label={t('profile.darkTheme')} description={t('profile.officialTheme')} value={darkTheme} onValueChange={setDarkTheme} />
          <InfoRow icon="i" label={t('profile.appVersion')} value={`1.0.0 · ${t('common.fictional')}`} />
          <ActionRow icon="?" label={t('profile.help')} onPress={() => showFeedback(t('profile.feedbackHelp'))} />
          <ActionRow icon="◇" label={t('profile.privacyPolicy')} onPress={() => showFeedback(t('profile.feedbackDocument'))} />
          <ActionRow icon="≡" label={t('profile.terms')} onPress={() => showFeedback(t('profile.feedbackDocument'))} />
        </Section>
      </ScrollView>

      <EditProfileModal onClose={() => setEditOpen(false)} onSave={setProfile} profile={profile} visible={editOpen} />
      {selectedSpace && (
        <SpacePermissionsModal
          color={SPACE_META[selectedSpace].color}
          initialSettings={spaceSettings[selectedSpace]}
          onClose={() => setSelectedSpace(null)}
          onSave={(settings) => setSpaceSettings((current) => ({ ...current, [selectedSpace]: settings }))}
          spaceName={t(SPACE_META[selectedSpace].nameKey)}
          visible
        />
      )}
      <PauseSharingModal onClose={() => setPauseOpen(false)} onConfirm={(duration) => setSharingPause(duration)} visible={pauseOpen} />
      <LogoutConfirmationModal onClose={() => setLogoutOpen(false)} onConfirm={() => showFeedback(t('profile.feedbackLogout'))} visible={logoutOpen} />
    </>
  );
}

function Section({ children, delay, icon, title }: { children: React.ReactNode; delay: number; icon: string; title: string }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(420)}>
      <View style={styles.sectionHeading}><View style={styles.sectionIcon}><Text style={styles.sectionIconText}>{icon}</Text></View><Text style={styles.sectionTitle}>{title}</Text></View>
      <View style={styles.sectionCard}>{children}</View>
    </Animated.View>
  );
}

function ToggleRow({ description, label, onValueChange, value }: { description?: string; label: string; onValueChange: (value: boolean) => void; value: boolean }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text>{description && <Text style={styles.rowValue}>{description}</Text>}</View>
      <Switch accessibilityLabel={label} onValueChange={onValueChange} thumbColor={darkColors.textPrimary} trackColor={{ false: darkColors.disabledSurface, true: darkColors.success }} value={value} />
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.settingRow}><View style={styles.rowIcon}><Text style={styles.rowIconText}>{icon}</Text></View><View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text numberOfLines={1} style={styles.rowValue}>{value}</Text></View></View>
  );
}

function ActionRow({ danger = false, icon, label, onPress, value }: { danger?: boolean; icon: string; label: string; onPress: () => void; value?: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}><View style={[styles.rowIcon, danger && styles.dangerIcon]}><Text style={[styles.rowIconText, danger && styles.dangerText]}>{icon}</Text></View><View style={styles.rowCopy}><Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>{value && <Text style={styles.rowValue}>{value}</Text>}</View><Text style={[styles.chevron, danger && styles.dangerText]}>›</Text></Pressable>
  );
}

function PermissionChip({ enabled, label, short }: { enabled: boolean; label: string; short: string }) {
  const { t } = useLanguage();
  return <View accessibilityLabel={`${label} ${enabled ? t('common.enabled') : t('common.disabled')}`} style={[styles.permissionChip, enabled ? styles.permissionChipOn : styles.permissionChipOff]}><Text style={[styles.permissionChipText, enabled && styles.permissionChipTextOn]}>{short} {enabled ? '✓' : '–'}</Text></View>;
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: darkColors.background },
  content: { paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[10], gap: spacing[5] },
  profileHeader: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: alpha.primary32, backgroundColor: darkColors.surface },
  avatarWrap: { width: 66, height: 66 },
  avatar: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle, borderWidth: 2, borderColor: darkColors.accent, backgroundColor: darkColors.primarySoft },
  avatarText: { ...typography.titleMedium, color: darkColors.textPrimary },
  onlineDot: { position: 'absolute', right: 1, bottom: 2, width: 15, height: 15, borderRadius: radius.circle, borderWidth: 3, borderColor: darkColors.surface, backgroundColor: darkColors.live },
  profileCopy: { flex: 1, minWidth: 0 },
  profileName: { ...typography.titleMedium, color: darkColors.textPrimary },
  profileEmail: { ...typography.caption, color: darkColors.textMuted, marginTop: 1 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  verifiedIcon: { width: 15, height: 15, borderRadius: radius.circle, textAlign: 'center', textAlignVertical: 'center', backgroundColor: darkColors.success, color: darkColors.textInverse, fontSize: 9, fontWeight: '800' },
  verifiedText: { fontSize: 9, lineHeight: 13, color: darkColors.success },
  editButton: { minWidth: 72, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: darkColors.primarySoft },
  editButtonText: { ...typography.labelMedium, color: darkColors.primary },
  feedbackBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingHorizontal: spacing[3], borderRadius: radius.medium, borderWidth: 1, borderColor: alpha.success16, backgroundColor: darkColors.successSoft },
  feedbackText: { flex: 1, ...typography.caption, color: darkColors.success },
  feedbackClose: { color: darkColors.success, fontSize: 20 },
  sectionHeading: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2], paddingHorizontal: spacing[1] },
  sectionIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: radius.small, backgroundColor: darkColors.primarySoft },
  sectionIconText: { color: darkColors.primary, fontSize: 14, fontWeight: '700' },
  sectionTitle: { ...typography.titleMedium, color: darkColors.textPrimary },
  sectionCard: { paddingHorizontal: spacing[3], borderRadius: radius.extraLarge, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface, overflow: 'hidden' },
  settingRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: darkColors.border },
  rowPressed: { backgroundColor: darkColors.disabledSurface },
  rowIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.medium, backgroundColor: darkColors.disabledSurface },
  rowIconText: { color: darkColors.textSecondary, fontSize: 13, fontWeight: '700' },
  rowCopy: { flex: 1, minWidth: 0 },
  rowLabel: { ...typography.labelLarge, color: darkColors.textPrimary },
  rowValue: { ...typography.caption, color: darkColors.textMuted, marginTop: 1 },
  segmented: { flexDirection: 'row', padding: 3, borderRadius: radius.pill, backgroundColor: darkColors.disabledSurface },
  segment: { minWidth: 42, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  segmentActive: { backgroundColor: darkColors.primary },
  segmentText: { ...typography.caption, color: darkColors.textMuted, fontWeight: '700' },
  segmentTextActive: { color: darkColors.textPrimary },
  logoutRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoutText: { ...typography.labelLarge, color: darkColors.error },
  chevron: { color: darkColors.textMuted, fontSize: 26, fontWeight: '300' },
  gpsCard: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: spacing[3], padding: spacing[3], borderRadius: radius.large, backgroundColor: darkColors.successSoft },
  gpsLabel: { fontSize: 8, lineHeight: 12, fontWeight: '700', letterSpacing: 0.8, color: darkColors.success },
  gpsValue: { ...typography.labelLarge, color: darkColors.textPrimary, marginTop: 2 },
  signalBars: { height: 32, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  signalBar: { width: 4, borderRadius: radius.pill, backgroundColor: darkColors.success },
  spaceRow: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: darkColors.border },
  spaceIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.large },
  spaceIconText: { fontSize: 20, fontWeight: '800' },
  spaceCopy: { flex: 1, minWidth: 0 },
  permissionChips: { flexDirection: 'row', gap: 4, marginTop: 5 },
  permissionChip: { minWidth: 35, paddingHorizontal: 6, paddingVertical: 3, borderRadius: radius.pill },
  permissionChipOn: { backgroundColor: darkColors.successSoft },
  permissionChipOff: { backgroundColor: darkColors.disabledSurface },
  permissionChipText: { fontSize: 8, lineHeight: 11, fontWeight: '700', color: darkColors.textMuted },
  permissionChipTextOn: { color: darkColors.success },
  scheduleText: { fontSize: 9, lineHeight: 13, color: darkColors.textMuted, marginTop: 4 },
  pauseActive: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginVertical: spacing[3], padding: spacing[3], borderRadius: radius.large, backgroundColor: darkColors.warningSoft },
  pauseDot: { width: 10, height: 10, borderRadius: radius.circle, backgroundColor: darkColors.warning },
  pauseCopy: { flex: 1 },
  pauseTitle: { ...typography.labelLarge, color: darkColors.textPrimary },
  pauseText: { ...typography.caption, color: darkColors.warning },
  resumeButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing[2] },
  resumeText: { ...typography.labelMedium, color: darkColors.warning },
  dangerIcon: { backgroundColor: darkColors.errorSoft },
  dangerText: { color: darkColors.error },
  pressed: { opacity: 0.76 },
});
