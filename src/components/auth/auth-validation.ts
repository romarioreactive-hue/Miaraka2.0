import type { AuthErrorCode } from '@/auth';
import type { TranslationKey } from '@/i18n';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export const MIN_PASSWORD_LENGTH = 8;

const ERROR_KEY_BY_CODE: Record<AuthErrorCode, TranslationKey> = {
  invalid_credentials: 'auth.error.invalidCredentials',
  email_already_in_use: 'auth.error.emailAlreadyInUse',
  weak_password: 'auth.error.weakPassword',
  network_error: 'auth.error.networkError',
  session_expired: 'auth.error.sessionExpired',
  profile_not_found: 'auth.error.profileNotFound',
  provider_not_connected: 'auth.error.providerNotConnected',
  unknown: 'auth.error.unknown',
};

export function getAuthErrorMessage(t: Translate, code: AuthErrorCode): string {
  return t(ERROR_KEY_BY_CODE[code] ?? 'auth.error.unknown');
}
