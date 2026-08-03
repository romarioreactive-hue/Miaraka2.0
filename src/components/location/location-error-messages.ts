import type { TranslationKey } from '@/i18n';
import type { LocationErrorCode } from '@/types/location';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

const ERROR_KEY_BY_CODE: Record<LocationErrorCode, TranslationKey> = {
  permission_denied: 'location.error.permissionDenied',
  services_disabled: 'location.error.servicesDisabled',
  unavailable: 'location.error.unavailable',
  timeout: 'location.error.timeout',
  unknown: 'location.error.unknown',
};

export function getLocationErrorMessage(t: Translate, code: LocationErrorCode): string {
  return t(ERROR_KEY_BY_CODE[code] ?? 'location.error.unknown');
}
