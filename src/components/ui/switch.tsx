import { StyleSheet, Switch as NativeSwitch, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, spacing, typography } from '@/theme';

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  accessibilityLabel,
  style,
}: SwitchProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;

  return (
    <View style={[styles.container, style]}>
      {label || description ? (
        <View style={styles.copy}>
          {label ? <Text style={[styles.label, { color: disabled ? theme.disabled : theme.textPrimary }]}>{label}</Text> : null}
          {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
        </View>
      ) : null}
      <View style={styles.touchTarget}>
        <NativeSwitch
          accessibilityLabel={accessibilityLabel ?? label}
          disabled={disabled}
          ios_backgroundColor={theme.disabledSurface}
          onValueChange={onValueChange}
          thumbColor={value ? theme.textInverse : theme.textSecondary}
          trackColor={{ false: theme.disabledSurface, true: theme.primary }}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
    minHeight: 56,
  },
  copy: {
    flex: 1,
    gap: spacing[1],
  },
  label: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  description: {
    ...typography.caption,
  },
  touchTarget: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    minWidth: 48,
  },
});
