import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { ListItem } from '@/components/ui/list-item';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';
import type { Coordinates } from '@/types/location';
import { distanceMeters, formatDistance } from '@/utils/geo-distance';

import type { LocationMapViewHandle, LocationMapViewProps, VisibleMemberMarker } from './location-map-view.types';

/**
 * Repli web : react-native-maps n'a pas de support web (module natif
 * uniquement, aucune dépendance web ajoutée pour combler ça). Plutôt qu'un
 * simple message "carte non disponible", cet écran reste un vrai panneau
 * utile : ma position, et la liste des membres visibles triée par
 * proximité (nom, statut, distance, dernière mise à jour). La mention de la
 * carte visuelle complète reste discrète, en pied de panneau.
 *
 * Le contrat (props/ref) reste identique à la version native pour que
 * l'écran appelant n'ait jamais besoin de savoir laquelle des deux
 * implémentations est active. La géolocalisation elle-même fonctionne
 * normalement sur le web (expo-location utilise l'API du navigateur, jamais
 * appelée pendant le rendu serveur) : seule la carte visuelle manque ici.
 */
export const LocationMapView = forwardRef<LocationMapViewHandle, LocationMapViewProps>(
  function LocationMapView({ myLocation, marker, members, onSelectMember }, ref) {
    const { t } = useLanguage();

    useImperativeHandle(ref, () => ({
      // Pas de caméra à déplacer : rien à faire sur le web.
      recenter: () => {},
    }));

    const sortedMembers = useMemo(
      () => [...(members ?? [])].sort((a, b) => distanceMeters(myLocation, a.coordinates) - distanceMeters(myLocation, b.coordinates)),
      [members, myLocation],
    );

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.selfCard}>
          <Avatar imageUrl={marker.imageUrl} name={marker.label} size={48} />
          <View style={styles.selfCopy}>
            <Text style={styles.selfTitle}>{t('location.screenTitle')}</Text>
            <Text style={styles.coords}>
              {myLocation.latitude.toFixed(5)}, {myLocation.longitude.toFixed(5)}
            </Text>
          </View>
        </View>

        {sortedMembers.length > 0 ? (
          <View style={styles.membersCard}>
            <Text style={styles.membersTitle}>{t('location.webMembersTitle')}</Text>
            {sortedMembers.map((member) => (
              <MemberRow key={member.id} member={member} myLocation={myLocation} onPress={onSelectMember} />
            ))}
          </View>
        ) : null}

        <Text style={styles.mobileHint}>{t('location.webFallbackHint')}</Text>
      </ScrollView>
    );
  },
);

function MemberRow({
  member,
  myLocation,
  onPress,
}: {
  member: VisibleMemberMarker;
  myLocation: Coordinates;
  onPress?: (memberId: string) => void;
}) {
  const { language, t } = useLanguage();
  const { label, variant } = FRESHNESS_COPY[member.freshness];
  const distance = formatDistance(distanceMeters(myLocation, member.coordinates));
  const updatedTime = new Date(member.updatedAt).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ListItem
      leading={<Avatar imageUrl={member.imageUrl} name={member.label} size={32} />}
      onPress={onPress ? () => onPress(member.id) : undefined}
      style={styles.memberRow}
      subtitle={`${distance} · ${t('location.member.updatedAt', { time: updatedTime })}`}
      title={member.label}
      trailing={<Badge label={t(label)} variant={variant} />}
    />
  );
}

const FRESHNESS_COPY: Record<VisibleMemberMarker['freshness'], { label: 'location.member.live' | 'location.member.recent' | 'location.member.stale'; variant: BadgeVariant }> = {
  live: { label: 'location.member.live', variant: 'success' },
  recent: { label: 'location.member.recent', variant: 'primary' },
  stale: { label: 'location.member.stale', variant: 'neutral' },
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
    padding: spacing[4],
  },
  selfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.extraLarge,
    backgroundColor: darkColors.surface,
  },
  selfCopy: { flex: 1, gap: spacing[1] },
  selfTitle: { ...typography.titleMedium, color: darkColors.textPrimary },
  coords: { ...typography.caption, color: darkColors.textSecondary },
  membersCard: {
    borderRadius: radius.extraLarge,
    backgroundColor: darkColors.surface,
    overflow: 'hidden',
  },
  membersTitle: {
    ...typography.labelLarge,
    color: darkColors.textSecondary,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  memberRow: {
    borderTopColor: darkColors.border,
    borderTopWidth: 1,
  },
  mobileHint: {
    ...typography.caption,
    color: darkColors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing[6],
  },
});
