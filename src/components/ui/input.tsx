import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, useColorScheme, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { darkColors, lightColors, radius, spacing, typography } from '@/theme';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leading,
    trailing,
    containerStyle,
    editable = true,
    multiline = false,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const [focused, setFocused] = useState(false);
  const descriptionId = error ? `${label}-error` : hint ? `${label}-hint` : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
      <View
        style={[
          styles.field,
          multiline && styles.multilineField,
          {
            backgroundColor: editable ? theme.surface : theme.disabledSurface,
            borderColor: error ? theme.error : focused ? theme.focusRing : theme.border,
          },
        ]}>
        {leading}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          aria-describedby={descriptionId}
          editable={editable}
          multiline={multiline}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={theme.textMuted}
          selectionColor={theme.primary}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            { color: editable ? theme.textPrimary : theme.disabled },
          ]}
          {...props}
        />
        {trailing}
      </View>
      {error ? <Text nativeID={descriptionId} style={[styles.helper, { color: theme.error }]}>{error}</Text> : null}
      {!error && hint ? <Text nativeID={descriptionId} style={[styles.helper, { color: theme.textMuted }]}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  label: {
    ...typography.labelMedium,
  },
  field: {
    alignItems: 'center',
    borderRadius: radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing[2],
    minHeight: 48,
    paddingHorizontal: spacing[3],
  },
  multilineField: {
    alignItems: 'flex-start',
    minHeight: 112,
    paddingVertical: spacing[3],
  },
  input: {
    ...typography.bodyMedium,
    flex: 1,
    minHeight: 46,
    paddingVertical: 0,
  },
  multilineInput: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  helper: {
    ...typography.caption,
  },
});
