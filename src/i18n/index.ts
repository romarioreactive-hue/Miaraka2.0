import { fr } from './fr';
import { mg } from './mg';

export { fr } from './fr';
export type TranslationKey = keyof typeof import('./fr').fr;

export type Language = 'fr' | 'mg';
export type TranslationParams = Record<string, string | number>;

export const dictionaries = { fr, mg } as const;

export function translate(language: Language, key: TranslationKey, params?: TranslationParams) {
  let value: string = dictionaries[language][key];
  if (!params) return value;
  Object.entries(params).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}
