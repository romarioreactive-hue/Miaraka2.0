import type { TextStyle } from 'react-native';

export type TypographyToken = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'
> & {
  readonly usage: string;
};

const systemFont = undefined;

export const typography = {
  displayLarge: {
    fontFamily: systemFont,
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    letterSpacing: -0.8,
    usage: 'Chiffres clés, distance ou progression héroïque.',
  },
  displayMedium: {
    fontFamily: systemFont,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
    usage: 'Valeur principale d’une carte ou d’un résumé.',
  },
  titleLarge: {
    fontFamily: systemFont,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.2,
    usage: 'Titre principal d’un écran ou d’une bottom sheet.',
  },
  titleMedium: {
    fontFamily: systemFont,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0,
    usage: 'Titre de section, carte ou dialogue.',
  },
  bodyLarge: {
    fontFamily: systemFont,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: 0,
    usage: 'Texte important, introduction et message principal.',
  },
  bodyMedium: {
    fontFamily: systemFont,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.1,
    usage: 'Texte courant, description et contenu de carte.',
  },
  labelLarge: {
    fontFamily: systemFont,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
    usage: 'Bouton principal, onglet et action importante.',
  },
  labelMedium: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.2,
    usage: 'Petit bouton, badge et libellé de champ.',
  },
  caption: {
    fontFamily: systemFont,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.2,
    usage: 'Heure, aide courte, état secondaire et annotation.',
  },
} as const satisfies Record<string, TypographyToken>;

export type TypographyStyle = keyof typeof typography;

