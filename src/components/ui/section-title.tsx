import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, spacing, typography } from '@/theme';

export type SectionTitleProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionTitle({ title, subtitle, action, style }: SectionTitleProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
    minHeight: 48,
  },
  copy: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    ...typography.titleMedium,
  },
  subtitle: {
    ...typography.caption,
  },
});
