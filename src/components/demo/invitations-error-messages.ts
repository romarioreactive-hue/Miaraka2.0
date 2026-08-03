import type { TranslationKey } from '@/i18n';
import type { InvitationsErrorCode } from '@/services/invitations-service';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

const ERROR_KEY_BY_CODE: Record<InvitationsErrorCode, TranslationKey> = {
  not_authenticated: 'auth.error.sessionExpired',
  self_invite: 'invitations.error.selfInvite',
  duplicate_pending: 'invitations.error.duplicatePending',
  already_member: 'invitations.error.alreadyMember',
  not_authorized: 'invitations.error.notAuthorized',
  not_found: 'invitations.error.notFound',
  already_processed: 'invitations.error.alreadyProcessed',
  validation_failed: 'invitations.error.validation',
  network_error: 'invitations.error.network',
  unknown: 'invitations.error.unknown',
};

export function getInvitationsErrorMessage(t: Translate, code: InvitationsErrorCode): string {
  return t(ERROR_KEY_BY_CODE[code] ?? 'invitations.error.unknown');
}
