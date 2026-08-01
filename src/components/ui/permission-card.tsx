import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { darkColors, lightColors, spacing, typography } from '@/theme';
import { Badge, type BadgeVariant } from './badge';
import { Card } from './cards';
import { Switch } from './switch';

export type PermissionImportance = 'required' | 'recommended' | 'optional';

export type PermissionCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  value: boolean;
  onValueChange: (value: boolean) => void;
  importance?: PermissionImportance;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const importanceCopy: Record<PermissionImportance, { label: string; variant: BadgeVariant }> = {
  required: { label: 'Indispensable', variant: 'primary' },
  recommended: { label: 'Recommandé', variant: 'success' },
  optional: { label: 'Optionnel', variant: 'neutral' },
};

export function PermissionCard({
  title,
  description,
  icon,
  value,
  onValueChange,
  importance = 'optional',
  disabled = false,
  style,
}: PermissionCardProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const importanceDetails = importanceCopy[importance];

  return (
    <Card style={style}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>{icon}</View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Badge label={importanceDetails.label} variant={importanceDetails.variant} />
        </View>
        <Switch
          accessibilityLabel={`${value ? 'Désactiver' : 'Activer'} ${title}`}
          disabled={disabled}
          onValueChange={onValueChange}
          value={value}
        />
      </View>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
  },
  icon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  copy: {
    flex: 1,
    gap: spacing[2],
  },
  title: {
    ...typography.titleMedium,
  },
  description: {
    ...typography.bodyMedium,
    marginTop: spacing[3],
  },
});
