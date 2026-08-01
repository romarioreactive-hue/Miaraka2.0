import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal as NativeModal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { darkColors, lightColors, radius, shadowLarge, spacing, typography } from '@/theme';

export type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: ReactNode;
  dismissible?: boolean;
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>;

const sheetShadow = Platform.OS === 'web'
  ? shadowLarge.web
  : Platform.OS === 'android'
    ? shadowLarge.android
    : shadowLarge.ios;

export function BottomSheet({
  visible,
  onClose,
  title,
  description,
  footer,
  dismissible = true,
  scrollable = true,
  contentStyle,
  children,
}: BottomSheetProps) {
  const theme = useColorScheme() === 'light' ? lightColors : darkColors;
  const insets = useSafeAreaInsets();
  const Content = scrollable ? ScrollView : View;

  return (
    <NativeModal
      animationType="slide"
      onRequestClose={dismissible ? onClose : undefined}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}>
        <View style={styles.stage}>
          <Pressable
            accessibilityLabel={dismissible ? 'Fermer' : undefined}
            accessibilityRole={dismissible ? 'button' : undefined}
            onPress={dismissible ? onClose : undefined}
            style={[styles.backdrop, { backgroundColor: theme.overlay }]}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              sheetShadow,
              { backgroundColor: theme.surfaceElevated, paddingBottom: Math.max(insets.bottom, spacing[4]) },
            ]}>
            <View style={[styles.handle, { backgroundColor: theme.borderStrong }]} />
            {title || description ? (
              <View style={styles.heading}>
                {title ? <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text> : null}
                {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
              </View>
            ) : null}
            <Content
              {...(scrollable ? { contentContainerStyle: [styles.content, contentStyle], keyboardShouldPersistTaps: 'handled' as const } : { style: [styles.content, contentStyle] })}>
              {children}
            </Content>
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
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: radius.extraLarge,
    borderTopRightRadius: radius.extraLarge,
    maxHeight: '90%',
    overflow: 'hidden',
    paddingTop: spacing[2],
  },
  handle: {
    alignSelf: 'center',
    borderRadius: radius.pill,
    height: 4,
    marginBottom: spacing[4],
    width: 40,
  },
  heading: {
    gap: spacing[1],
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[5],
  },
  title: {
    ...typography.titleLarge,
  },
  description: {
    ...typography.bodyMedium,
  },
  content: {
    paddingHorizontal: spacing[5],
  },
  footer: {
    borderTopWidth: 1,
    marginTop: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
});
