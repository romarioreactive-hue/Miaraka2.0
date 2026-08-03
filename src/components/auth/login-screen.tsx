import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import type { AuthError } from '@/auth';
import { AppBackground } from '@/components/ui/app-background';
import { PrimaryButton } from '@/components/ui/buttons';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

import { getAuthErrorMessage, isValidEmail } from './auth-validation';

type FieldErrors = { email?: string; password?: string };

export function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = t('auth.error.emailRequired');
    else if (!isValidEmail(email)) errors.email = t('auth.error.emailInvalid');
    if (!password) errors.password = t('auth.error.passwordRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signInWithEmail({ email: email.trim(), password });
      // Succès : PublicRoute redirige automatiquement vers /demo dès que le statut passe à 'authenticated'.
    } catch (error) {
      setFormError(getAuthErrorMessage(t, (error as AuthError).code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppBackground variant="onboarding">
      <SafeAreaView style={styles.safeArea}>
        <Header onBack={() => router.back()} title={t('auth.loginTitle')} />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

          {formError ? (
            <Text accessibilityRole="alert" style={styles.formError}>{formError}</Text>
          ) : null}

          <Input
            autoCapitalize="none"
            autoComplete="email"
            error={fieldErrors.email}
            keyboardType="email-address"
            label={t('auth.email')}
            onChangeText={(value) => {
              setEmail(value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder={t('auth.emailPlaceholder')}
            textContentType="emailAddress"
            value={email}
          />

          <Input
            autoCapitalize="none"
            autoComplete="password"
            error={fieldErrors.password}
            label={t('auth.password')}
            onChangeText={(value) => {
              setPassword(value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry={!showPassword}
            textContentType="password"
            trailing={
              <PasswordVisibilityToggle
                onPress={() => setShowPassword((value) => !value)}
                showLabel={t('auth.showPassword')}
                hideLabel={t('auth.hidePassword')}
                visible={showPassword}
              />
            }
            value={password}
          />

          <PrimaryButton
            fullWidth
            label={t('auth.signInButton')}
            loading={submitting}
            onPress={handleSubmit}
            style={styles.submitButton}
          />

          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/signup')}
            style={styles.switchLink}>
            <Text style={styles.switchText}>
              {t('auth.noAccount')} <Text style={styles.switchTextStrong}>{t('auth.createAccount')}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

function PasswordVisibilityToggle({
  hideLabel,
  onPress,
  showLabel,
  visible,
}: {
  hideLabel: string;
  onPress: () => void;
  showLabel: string;
  visible: boolean;
}) {
  return (
    <Pressable accessibilityLabel={visible ? hideLabel : showLabel} accessibilityRole="button" hitSlop={8} onPress={onPress}>
      <SymbolView
        name={{
          ios: visible ? 'eye.slash.fill' : 'eye.fill',
          android: visible ? 'visibility_off' : 'visibility',
          web: visible ? 'visibility_off' : 'visibility',
        }}
        size={20}
        tintColor={darkColors.textMuted}
        weight="medium"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: spacing[4], paddingBottom: spacing[10], paddingHorizontal: spacing[5], paddingTop: spacing[2] },
  subtitle: { ...typography.bodyMedium, color: darkColors.textSecondary, marginBottom: spacing[2] },
  formError: {
    ...typography.caption,
    backgroundColor: darkColors.errorSoft,
    borderRadius: radius.medium,
    color: darkColors.error,
    padding: spacing[3],
  },
  submitButton: { marginTop: spacing[2] },
  switchLink: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: spacing[2] },
  switchText: { ...typography.bodyMedium, color: darkColors.textSecondary, textAlign: 'center' },
  switchTextStrong: { color: darkColors.primary, fontWeight: '700' },
});
