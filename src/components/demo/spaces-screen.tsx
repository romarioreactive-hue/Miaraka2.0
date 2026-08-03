import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { useAuth } from '@/auth';
import { AppBackground } from '@/components/ui/app-background';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { useLanguage } from '@/contexts/language-context';
import {
  getMySpaces,
  type SpaceSummary,
  type SpacesServiceError,
} from '@/services/spaces-service';
import { alpha, avatars, darkColors, groupColors, radius, spacing, typography } from '@/theme';

import { SpaceFormSheet } from './space-form-sheet';
import { getSpacesErrorMessage } from './spaces-error-messages';

type SpacesScreenProps = {
  onSelectSpace: (spaceId: string) => void;
};

const TYPE_COLOR: Record<SpaceSummary['type'], string> = {
  family: groupColors.family,
  friends: groupColors.friends,
  team: groupColors.team,
};

const TYPE_ICON: Record<SpaceSummary['type'], string> = {
  family: '⌂',
  friends: '✦',
  team: '◆',
};

export function SpacesScreen({ onSelectSpace }: SpacesScreenProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const enter = (delay: number) => (reduceMotion ? FadeInDown.duration(1) : FadeInDown.delay(delay).duration(420));

  const [spaces, setSpaces] = useState<SpaceSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadSpaces = useCallback(async () => {
    if (!user) return;
    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await getMySpaces(user.id);
      setSpaces(result);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getSpacesErrorMessage(t, (error as SpacesServiceError).code));
      setStatus('error');
    }
  }, [t, user]);

  useEffect(() => {
    void loadSpaces();
  }, [loadSpaces]);

  const totalMembers = spaces.reduce((sum, space) => sum + space.memberCount, 0);

  return (
    <AppBackground variant="dashboard">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.topBarIdentity}>
            <Avatar backgroundColor="#253B63" name={t('common.me')} ringColor={alpha.white24} size={32} source={avatars.moi} />
            <Text accessibilityRole="header" style={styles.topBarTitle}>{t('spaces.title')}</Text>
          </View>
        </View>

        <Animated.View entering={enter(60)} style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{t('spaces.eyebrow')}</Text>
          <Text style={styles.subtitle}>{t('spaces.subtitle')}</Text>
        </Animated.View>

        <Animated.View entering={enter(120)} style={styles.actionRow}>
          <Pressable
            accessibilityLabel={t('spaces.create')}
            accessibilityRole="button"
            onPress={() => setCreateOpen(true)}
            style={({ pressed }) => [styles.actionButtonPrimary, pressed && styles.pressed]}>
            <Text style={styles.actionButtonPlus}>＋</Text>
            <Text style={styles.actionButtonPrimaryText}>{t('spaces.create')}</Text>
          </Pressable>
        </Animated.View>

        {status === 'ready' && spaces.length > 0 ? (
          <Animated.View entering={enter(180)} style={styles.summary}>
            <SummaryItem value={String(spaces.length)} label={t('nav.spaces').toLocaleLowerCase()} />
            <View style={styles.summaryDivider} />
            <SummaryItem value={String(totalMembers)} label={t('common.members')} />
          </Animated.View>
        ) : null}

        {status === 'loading' ? (
          <Loading label={t('spaces.loading')} style={styles.stateBlock} />
        ) : status === 'error' ? (
          <EmptyState
            actionLabel={t('common.retry')}
            description={errorMessage ?? ''}
            onAction={loadSpaces}
            style={styles.stateBlock}
            title={t('spaces.errorTitle')}
          />
        ) : spaces.length === 0 ? (
          <EmptyState
            actionLabel={t('spaces.create')}
            description={t('spaces.emptyDescription')}
            onAction={() => setCreateOpen(true)}
            style={styles.stateBlock}
            title={t('spaces.emptyTitle')}
          />
        ) : (
          <View style={styles.cards}>
            {spaces.map((space, index) => (
              <Animated.View entering={enter(220 + index * 90)} key={space.id}>
                <SpaceCard space={space} onPress={() => onSelectSpace(space.id)} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      <SpaceFormSheet
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          setCreateOpen(false);
          void loadSpaces();
          onSelectSpace(created.id);
        }}
        visible={createOpen}
      />
    </AppBackground>
  );
}

function SummaryItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function SpaceCard({ space, onPress }: { space: SpaceSummary; onPress: () => void }) {
  const { t } = useLanguage();
  const color = space.color || TYPE_COLOR[space.type];
  const icon = space.icon || TYPE_ICON[space.type];
  const typeLabel = t(space.type === 'family' ? 'groups.family' : space.type === 'friends' ? 'groups.friends' : 'groups.team');
  const roleLabel = t(space.myRole === 'owner' ? 'spaces.roleOwner' : space.myRole === 'admin' ? 'spaces.roleAdmin' : 'spaces.roleMember');
  const glowShadow = Platform.OS === 'web'
    ? { boxShadow: `0 12px 32px ${color}26` }
    : { shadowColor: color, shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 };

  return (
    <Pressable
      accessibilityHint="Ouvre le détail de cet espace"
      accessibilityLabel={`${space.name}, ${typeLabel}, ${space.memberCount} ${t('common.members')}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, glowShadow, { borderColor: `${color}52` }, pressed && styles.cardPressed]}>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <View style={styles.cardHeader}>
        <View style={[styles.spaceIcon, { backgroundColor: `${color}24` }]}>
          <Text style={[styles.spaceIconText, { color }]}>{icon}</Text>
        </View>
        <View style={styles.cardTitleBlock}>
          <Text numberOfLines={1} style={styles.cardTitle}>{space.name}</Text>
          <Text style={styles.cardType}>{typeLabel}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      {space.description ? (
        <Text numberOfLines={2} style={styles.cardDescription}>{space.description}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.memberCount}>{space.memberCount} {t('common.members')}</Text>
        <View style={[styles.roleBadge, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.roleBadgeText, { color }]}>{roleLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[10], gap: spacing[4] },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  topBarIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  topBarTitle: { ...typography.titleLarge, color: darkColors.textPrimary },
  headerCopy: { marginTop: -spacing[2] },
  eyebrow: { ...typography.caption, color: darkColors.accent, fontWeight: '700', letterSpacing: 1.1 },
  subtitle: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: spacing[3] },
  actionButtonPrimary: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: spacing[3], borderRadius: radius.pill, backgroundColor: darkColors.primary },
  actionButtonPlus: { color: darkColors.textInverse, fontSize: 18, fontWeight: '700' },
  actionButtonPrimaryText: { ...typography.labelMedium, color: darkColors.textInverse },
  pressed: { opacity: 0.78 },
  summary: { minHeight: 66, flexDirection: 'row', alignItems: 'center', borderRadius: radius.large, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { ...typography.titleMedium, color: darkColors.textPrimary },
  summaryLabel: { ...typography.caption, color: darkColors.textMuted },
  summaryDivider: { width: 1, height: 28, backgroundColor: darkColors.border },
  stateBlock: { marginTop: spacing[4] },
  cards: { gap: spacing[3] },
  card: { minHeight: 148, padding: spacing[4], borderRadius: radius.extraLarge, borderWidth: 1, backgroundColor: darkColors.surface, overflow: 'hidden' },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  accent: { position: 'absolute', left: 0, top: 28, bottom: 28, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  spaceIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.large },
  spaceIconText: { fontSize: 23, fontWeight: '800' },
  cardTitleBlock: { flex: 1, marginLeft: spacing[3], minWidth: 0 },
  cardTitle: { ...typography.titleMedium, color: darkColors.textPrimary },
  cardType: { ...typography.caption, color: darkColors.textMuted, marginTop: 2 },
  chevron: { color: darkColors.textMuted, fontSize: 30, fontWeight: '300' },
  cardDescription: { ...typography.bodyMedium, color: darkColors.textSecondary, marginTop: spacing[3] },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2], marginTop: spacing[4] },
  memberCount: { ...typography.caption, color: darkColors.textMuted },
  roleBadge: { minHeight: 26, justifyContent: 'center', paddingHorizontal: spacing[2], borderRadius: radius.pill },
  roleBadgeText: { fontSize: 10, lineHeight: 14, fontWeight: '700' },
});
