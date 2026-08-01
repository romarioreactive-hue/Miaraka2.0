import { Image, Platform, StyleSheet, Text, View, useColorScheme, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, glow, lightColors, palette, radius, typography } from '@/theme';

const liveGlowStyle = Platform.OS === 'web'
  ? glow.live.web
  : Platform.OS === 'android'
    ? glow.live.android
    : glow.live.ios;

export type AvatarSize = 32 | 48 | 64 | 88;
export type AvatarStatus = 'live' | 'last-known' | 'offline';

export type AvatarProps = {
  name: string;
  source?: ImageSourcePropType;
  initials?: string;
  size?: AvatarSize;
  backgroundColor?: string;
  ringColor?: string;
  status?: AvatarStatus;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  name,
  source,
  initials,
  size = 48,
  backgroundColor = palette.blue500,
  ringColor,
  status,
  style,
}: AvatarProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const fallback = initials ?? getInitials(name);
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
        {source ? (
          <Image source={source} resizeMode="cover" style={{ height: size, width: size }} />
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
