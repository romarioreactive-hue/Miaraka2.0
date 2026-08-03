import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import type { AuthError } from '@/auth';
import { AppBackground } from '@/components/ui/app-background';
import { PrimaryButton } from '@/components/ui/buttons';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { darkColors, radius, spacing, typography } from '@/theme';

import { getAuthErrorMessage, isValidEmail, MIN_PASSWORD_LENGTH } from './auth-validation';

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function SignUpScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { status, signUpWithEmail } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [awaitingResult, setAwaitingResult] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  // signUpWithEmail() ne renvoie rien directement : on observe le statut
  // global pour savoir si Supabase exige une confirmation par e-mail
  // (status repasse alors à 'unauthenticated' au lieu de 'authenticated').
  useEffect(() => {
    if (!awaitingResult) return;
    if (status === 'authenticated') {
      setAwaitingResult(false);
    } else if (status === 'unauthenticated') {
      setAwaitingResult(false);
      setConfirmationEmail(email.trim());
    }
  }, [status, awaitingResult, email]);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!fullName.trim()) errors.fullName = t('auth.error.fullNameRequired');
    if (!email.trim()) errors.email = t('auth.error.emailRequired');
    else if (!isValidEmail(email)) errors.email = t('auth.error.emailInvalid');
    if (!password) errors.password = t('auth.error.passwordRequired');
    else if (password.length < MIN_PASSWORD_LENGTH) errors.password = t('auth.error.passwordTooShort');
    if (confirmPassword !== password) errors.confirmPassword = t('auth.error.passwordsDontMatch');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    setAwaitingResult(true);
    try {
      await signUpWithEmail({ email: email.trim(), password, fullName: fullName.trim() });
    } catch (error) {
      setAwaitingResult(false);
      setFormError(getAuthErrorMessage(t, (error as AuthError).code));
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationEmail) {
    return (
      <AppBackground variant="onboarding">
        <SafeAreaView style={styles.safeArea}>
          <Header onBack={() => router.replace('/login')} title={t('auth.signupTitle')} />
          <View style={styles.confirmationWrap}>
            <SymbolView
              name={{ ios: 'envelope.badge.fill', android: 'mark_email_unread', web: 'mark_email_unread' }}
              size={40}
              tintColor={darkColors.primary}
              weight="medium"
            />
            <Text style={styles.confirmationTitle}>{t('auth.confirmationTitle')}</Text>
            <Text style={styles.confirmationMessage}>
              {t('auth.confirmationMessage', { email: confirmationEmail })}
            </Text>
            <PrimaryButton
              fullWidth
              label={t('auth.confirmationBackToLogin')}
              onPress={() => router.replace('/login')}
              style={styles.submitButton}
            />
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground variant="onboarding">
      <SafeAreaView style={styles.safeArea}>
        <Header onBack={() => router.back()} title={t('auth.signupTitle')} />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>

          {formError ? (
            <Text accessibilityRole="alert" style={styles.formError}>{formError}</Text>
          ) : null}

          <Input
            autoCapitalize="words"
            autoComplete="name"
            error={fieldErrors.fullName}
            label={t('auth.fullName')}
            onChangeText={(value) => {
              setFullName(value);
              setFieldErrors((current) => ({ ...current, fullName: undefined }));
            }}
            placeholder={t('auth.fullNamePlaceholder')}
            textContentType="name"
            value={fullName}
          />

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
            autoComplete="password-new"
            error={fieldErrors.password}
            label={t('auth.password')}
            onChangeText={(value) => {
              setPassword(value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            trailing={
              <PasswordVisibilityToggle
                hideLabel={t('auth.hidePassword')}
                onPress={() => setShowPassword((value) => !value)}
                showLabel={t('auth.showPassword')}
                visible={showPassword}
              />
            }
            value={password}
          />

          <Input
            autoCapitalize="none"
            autoComplete="password-new"
            error={fieldErrors.confirmPassword}
            label={t('auth.confirmPassword')}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
            }}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            value={confirmPassword}
          />

          <PrimaryButton
            fullWidth
            label={t('auth.signUpButton')}
            loading={submitting}
            onPress={handleSubmit}
            style={styles.submitButton}
          />

          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/login')}
            style={styles.switchLink}>
            <Text style={styles.switchText}>
              {t('auth.hasAccount')} <Text style={styles.switchTextStrong}>{t('auth.signIn')}</Text>
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
  confirmationWrap: {
    alignItems: 'center',
    flex: 1,
    gap: spacing[3],
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  confirmationTitle: { ...typography.titleLarge, color: darkColors.textPrimary, textAlign: 'center' },
  confirmationMessage: {
    ...typography.bodyMedium,
    color: darkColors.textSecondary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
});
