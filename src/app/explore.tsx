import { Redirect } from 'expo-router';

/**
 * Cet écran était le "Explore" de démonstration fourni par défaut par le
 * gabarit Expo (liens vers docs.expo.dev / reactnative.dev, texte "This
 * starter app includes example code..."). Jamais un écran Miaraka, jamais
 * lié depuis la navigation réelle (voir src/components/demo/demo-tab-bar.tsx)
 * — mais restait tout de même accessible en tapant /explore dans le
 * navigateur, avec Expo Router qui enregistre automatiquement une route par
 * fichier sous src/app/. Voir mission "lien fictif" : on ne supprime pas le
 * fichier (garder la route enregistrée pour ne jamais 404 un signet ou un
 * historique existant), on la neutralise en redirigeant vers l'accueil réel.
 */
export default function ExploreScreen() {
  return <Redirect href="/" />;
}
