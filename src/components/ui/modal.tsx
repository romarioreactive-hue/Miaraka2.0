import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal as NativeModal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { darkColors, lightColors, radius, shadowLarge, spacing, typography } from '@/theme';

export type ModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  dismissible?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>;

const dialogShadow = Platform.OS === 'web'
  ? shadowLarge.web
  : Platform.OS === 'android'
    ? shadowLarge.android
    : shadowLarge.ios;

export function Modal({
  visible,
  onClose,
  title,
  description,
  footer,
  dismissible = true,
  contentStyle,
  children,
}: ModalProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;

  return (
    <NativeModal
      animationType="fade"
      onRequestClose={dismissible ? onClose : undefined}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}>
        <View style={[styles.stage, { backgroundColor: theme.overlayStrong }]}>
          {dismissible ? (
            <Pressable
              accessibilityLabel="Fermer"
              accessibilityRole="button"
              onPress={onClose}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View
            accessibilityViewIsModal
            style={[
              styles.dialog,
              dialogShadow,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}>
            <View style={styles.heading}>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
                {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
              </View>
              {dismissible ? (
                <Pressable
                  accessibilityLabel="Fermer"
                  accessibilityRole="button"
                  onPress={onClose}
                  style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
                  <Text style={[styles.closeText, { color: theme.textSecondary }]}>×</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={[styles.content, contentStyle]}>{children}</View>
            {footer ? <View style={[styles.footer, { borderTopColor: theme.border }]}>{footer}</View> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing[5],
  },
  dialog: {
    borderRadius: radius.extraLarge,
    borderWidth: 1,
    maxWidth: 480,
    overflow: 'hidden',
    width: '100%',
  },
  heading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  copy: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    ...typography.titleMedium,
  },
  description: {
    ...typography.bodyMedium,
  },
  close: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginRight: -spacing[3],
    marginTop: -spacing[3],
    width: 48,
  },
  closeText: {
    fontSize: 28,
    lineHeight: 30,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing[4],
  },
  pressed: {
    opacity: 0.6,
  },
});
