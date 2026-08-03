import type { TranslationKey } from '@/i18n';
import type { SpacesErrorCode } from '@/services/spaces-service';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

const ERROR_KEY_BY_CODE: Record<SpacesErrorCode, TranslationKey> = {
  not_authenticated: 'auth.error.sessionExpired',
  not_found: 'spaces.error.notFound',
  validation_failed: 'spaces.error.validation',
  owner_cannot_leave: 'spaces.leaveOwnerBlocked',
  network_error: 'spaces.error.network',
  unknown: 'spaces.error.unknown',
};

export function getSpacesErrorMessage(t: Translate, code: SpacesErrorCode): string {
  return t(ERROR_KEY_BY_CODE[code] ?? 'spaces.error.unknown');
}
