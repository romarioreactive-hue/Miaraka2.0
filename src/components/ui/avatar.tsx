import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View, useColorScheme, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

import { alpha, darkColors, glow, lightColors, palette, radius, typography } from '@/theme';

const liveGlowStyle = Platform.OS === 'web'
  ? glow.live.web
  : Platform.OS === 'android'
    ? glow.live.android
    : glow.live.ios;

export type AvatarSize = 32 | 48 | 64 | 88;
export type AvatarStatus = 'live' | 'last-known' | 'offline';

export type AvatarProps = {
  name: string;
  /** Image locale (asset require()'d) ou distante déjà encapsulée dans un objet { uri }. */
  source?: ImageSourcePropType;
  /** URL distante (ex. Supabase Storage). Prioritaire sur `source` si fournie. */
  imageUrl?: string | null;
  initials?: string;
  size?: AvatarSize;
  backgroundColor?: string;
  ringColor?: string;
  status?: AvatarStatus;
  /** Affiche un indicateur de chargement par-dessus l'avatar (ex. envoi d'une nouvelle photo en cours). */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  name,
  source,
  imageUrl,
  initials,
  size = 48,
  backgroundColor = palette.blue500,
  ringColor,
  status,
  loading = false,
  style,
}: AvatarProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const fallback = initials ?? getInitials(name);
  const resolvedSource: ImageSourcePropType | undefined = imageUrl ? { uri: imageUrl } : source;
  const [imageFailed, setImageFailed] = useState(false);

  // Une image qui a échoué à charger une fois (ex. ancienne URL révoquée)
  // ne doit pas rester bloquée en erreur si une nouvelle source arrive.
  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl, source]);

  const showImage = Boolean(resolvedSource) && !imageFailed;
  const statusColor = status === 'live'
    ? theme.live
    : status === 'last-known'
      ? theme.warning
      : theme.offline;
  const statusLabel = status === 'live'
    ? 'En direct'
    : status === 'last-known'
      ? 'Dernière position connue'
      : status === 'offline'
        ? 'Hors ligne'
        : undefined;

  return (
    <View
      accessible
      accessibilityLabel={[name, statusLabel].filter(Boolean).join(', ')}
      style={[
        styles.wrapper,
        { height: size, width: size },
        status === 'live' && liveGlowStyle,
        style,
      ]}>
      <View
        style={[
          styles.avatar,
          {
            backgroundColor,
            borderColor: ringColor ?? theme.borderStrong,
            borderRadius: radius.circle,
            height: size,
            width: size,
          },
        ]}>
        {showImage ? (
          <Image
            onError={() => setImageFailed(true)}
            resizeMode="cover"
            source={resolvedSource}
            style={{ height: size, width: size }}
          />
        ) : (
          <Text
            numberOfLines={1}
            style={[
              styles.initials,
              { color: palette.white, fontSize: Math.max(12, Math.round(size * 0.34)) },
            ]}>
            {fallback}
          </Text>
        )}
        {loading ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.loadingOverlay,
              { backgroundColor: alpha.black56, borderRadius: radius.circle },
            ]}>
            <ActivityIndicator color={palette.white} size="small" />
          </View>
        ) : null}
      </View>
      {status ? (
        <View
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.status,
            {
              backgroundColor: statusColor,
              borderColor: theme.surface,
              height: Math.max(10, size * 0.25),
              width: Math.max(10, size * 0.25),
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.labelLarge,
    fontWeight: '700',
  },
  status: {
    borderRadius: radius.circle,
    borderWidth: 2,
    bottom: -1,
    position: 'absolute',
    right: -1,
  },
});
