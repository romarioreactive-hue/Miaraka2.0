import { darkColors } from '@/theme';

export type PlaceType = 'maison' | 'bureau' | 'personnalise';

export type Place = {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  photoTone: string;
};

export const PLACE_TYPE_ICON: Record<PlaceType, string> = {
  maison: '⌂',
  bureau: '◆',
  personnalise: '✦',
};

export const PHOTO_TONES = [darkColors.primary, darkColors.accent, darkColors.success, darkColors.warning, darkColors.error] as const;

export const INITIAL_PLACES: Place[] = [
  { id: 'maison', name: 'Maison', type: 'maison', address: 'Ambohipo, Antananarivo', photoTone: darkColors.primary },
  { id: 'bureau', name: 'Bureau', type: 'bureau', address: 'Ankorondrano, Antananarivo', photoTone: darkColors.success },
];
