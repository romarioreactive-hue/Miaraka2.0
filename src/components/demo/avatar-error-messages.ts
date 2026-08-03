import type { TranslationKey } from '@/i18n';
import type { AvatarErrorCode } from '@/services/avatar-service';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

const ERROR_KEY_BY_CODE: Record<AvatarErrorCode, TranslationKey> = {
  permission_denied: 'profile.photoError.permissionDenied',
  invalid_type: 'profile.photoError.invalidType',
  too_large: 'profile.photoError.tooLarge',
  upload_failed: 'profile.photoError.uploadFailed',
  update_failed: 'profile.photoError.updateFailed',
  not_authenticated: 'profile.photoError.notAuthenticated',
  unknown: 'profile.photoError.unknown',
};

export function getAvatarErrorMessage(t: Translate, code: AvatarErrorCode): string {
  return t(ERROR_KEY_BY_CODE[code] ?? 'profile.photoError.unknown');
}
