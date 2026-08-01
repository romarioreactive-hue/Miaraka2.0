import { forwardRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useColorScheme, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { darkColors, lightColors, radius, spacing, typography } from '@/theme';

export type SearchBarProps = Omit<TextInputProps, 'style'> & {
  value: string;
  onChangeText: (value: string) => void;
  onClear?: () => void;
  leading?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export const SearchBar = forwardRef<TextInput, SearchBarProps>(function SearchBar(
  {
    value,
    onChangeText,
    onClear,
    leading,
    containerStyle,
    placeholder = 'Rechercher',
    ...props
  },
  ref,
) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const clear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      accessibilityRole="search"
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }, containerStyle]}>
      {leading ?? <Text importantForAccessibility="no" style={[styles.searchIcon, { color: theme.textMuted }]}>⌕</Text>}
      <TextInput
        ref={ref}
        accessibilityLabel={placeholder}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        returnKeyType="search"
        selectionColor={theme.primary}
        style={[styles.input, { color: theme.textPrimary }]}
        value={value}
        {...props}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Effacer la recherche"
          accessibilityRole="button"
          hitSlop={4}
          onPress={clear}
          style={({ pressed }) => [styles.clear, pressed && styles.pressed]}>
          <Text style={[styles.clearText, { color: theme.textSecondary }]}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingLeft: spacing[4],
  },
  searchIcon: {
    fontSize: 24,
    lineHeight: 26,
  },
  input: {
    ...typography.bodyMedium,
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing[3],
    paddingVertical: 0,
  },
  clear: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  clearText: {
    fontSize: 26,
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.6,
  },
});
