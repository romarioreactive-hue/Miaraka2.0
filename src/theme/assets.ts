/**
 * Référence centralisée de toutes les images locales du projet.
 * Aucun écran ne doit appeler require(...) directement sur assets/ : passer par ce fichier.
 */

export const logos = {
  /** Logo complet (fond sombre inclus dans le fichier, pastille pin + texte "MIARAKA"). */
  mark: require('../../assets/brading/logo-miaraka.png'),
  /** Variante haute résolution avec signature, utilisée pour les grands formats. */
  appIcon: require('../../assets/brading/app-icon.png'),
} as const;

export const avatars = {
  moi: require('../../assets/avatars/moi.png'),
  rica: require('../../assets/avatars/rica.png'),
  taratra: require('../../assets/avatars/taratra.png'),
  papa: require('../../assets/avatars/papa.png'),
  maman: require('../../assets/avatars/maman.png'),
  // mario.png n'existe pas encore dans assets/avatars/ : réutilisation temporaire
  // de la photo de papa en attendant le bon fichier (décision produit validée).
  mario: require('../../assets/avatars/papa.png'),
} as const;

export type AvatarKey = keyof typeof avatars;
