import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SecondaryButton } from '@/components/ui/buttons';
import { useLanguage } from '@/contexts/language-context';
import type { VisibleMemberLocation } from '@/services/members-location-service';
import { darkColors, spacing, typography } from '@/theme';
import type { Coordinates } from '@/types/location';
import { distanceMeters, formatDistance } from '@/utils/geo-distance';
import { getLocationFreshness } from '@/utils/location-freshness';

interface MemberSheetProps {
  /** `null` : la fiche est fermée. */
  member: VisibleMemberLocation | null;
  /** Ma position actuelle, pour calculer la distance. `null` si indisponible : la ligne distance est alors simplement omise. */
  myCoordinates: Coordinates | null;
  onClose: () => void;
}

const FRESHNESS_COPY: Record<'live' | 'recent' | 'stale', { key: 'location.member.live' | 'location.member.recent' | 'location.member.stale'; variant: BadgeVariant }> = {
  live: { key: 'location.member.live', variant: 'success' },
  recent: { key: 'location.member.recent', variant: 'primary' },
  stale: { key: 'location.member.stale', variant: 'neutral' },
};

/**
 * Fiche membre ouverte au clic sur un marqueur (natif) ou une ligne de la
 * liste (web). Ne montre volontairement ni ETA, ni trajet, ni lieu Google,
 * ni activité physique, ni batterie — hors scope de cette étape.
 */
export function MemberSheet({ member, myCoordinates, onClose }: MemberSheetProps) {
  const { language, t } = useLanguage();

  if (!member) {
    return <BottomSheet onClose={onClose} visible={false} />;
  }

  const freshness = getLocationFreshness(member.updatedAt);
  // getLocationFreshness ne renvoie jamais 'unavailable' ici : member.updatedAt existe toujours (voir VisibleMemberLocation).
  const { key, variant } = FRESHNESS_COPY[freshness as 'live' | 'recent' | 'stale'];

  const updatedTime = new Date(member.updatedAt).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const speedKmh = member.speed != null && member.speed >= 0 ? Math.round(member.speed * 3.6) : null;
  const distance = myCoordinates ? formatDistance(distanceMeters(myCoordinates, { latitude: member.latitude, longitude: member.longitude })) : null;
  const name = member.fullName || t('location.member.unknownName');

  return (
    <BottomSheet onClose={onClose} visible={member !== null}>
      <View style={styles.header}>
        <Avatar imageUrl={member.avatarUrl} name={name} size={64} />
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.spacesRow}>
            {member.spaces.map((space) => (
              <Badge key={space.id} label={space.name} variant={space.type === 'family' ? 'family' : space.type === 'friends' ? 'friends' : 'team'} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Badge label={t(key)} variant={variant} />
        <Text style={styles.detailText}>{t('location.member.updatedAt', { time: updatedTime })}</Text>
      </View>

      <View style={styles.details}>
        {member.accuracy != null ? (
          <Text style={styles.detailText}>{t('location.accuracyLabel', { value: Math.round(member.accuracy) })}</Text>
        ) : null}
        {speedKmh != null ? <Text style={styles.detailText}>{t('location.member.speedLabel', { value: speedKmh })}</Text> : null}
        {distance ? <Text style={styles.detailText}>{t('location.member.distanceLabel', { value: distance })}</Text> : null}
      </View>

      <SecondaryButton fullWidth label={t('common.close')} onPress={onClose} style={styles.closeButton} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingBottom: spacing[4],
  },
  headerCopy: {
    flex: 1,
    gap: spacing[2],
  },
  name: {
    ...typography.titleMedium,
    color: darkColors.textPrimary,
  },
  spacesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingBottom: spacing[3],
  },
  details: {
    gap: spacing[2],
    paddingBottom: spacing[5],
  },
  detailText: {
    ...typography.bodyMedium,
    color: darkColors.textSecondary,
  },
  closeButton: {
    marginBottom: spacing[2],
  },
});
