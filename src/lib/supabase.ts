import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * `true` seulement si les deux variables sont réellement présentes dans le
 * bundle. Sur un build EAS, EXPO_PUBLIC_* est injecté au moment du build
 * (lu depuis les "Environment Variables" du projet EAS, pas depuis un
 * fichier .env présent sur l'appareil au runtime) : si elles ne sont pas
 * configurées pour le profil de build utilisé, elles valent `undefined`
 * ici, exactement comme en local sans .env. Voir docs/DEPLOY.md.
 *
 * Ce module NE DOIT JAMAIS `throw` : il est importé depuis src/app/_layout.tsx,
 * donc avant tout rendu React — une exception ici plante tout le bundle au
 * démarrage, sans écran d'erreur ni log visible pour l'utilisateur final
 * (symptôme : "l'app se ferme automatiquement à l'ouverture"). À la place on
 * retombe sur un client factice : l'app se rend normalement et
 * RootLayout affiche un écran de configuration explicite (voir isSupabaseConfigured
 * et <ConfigurationMissingScreen> dans src/app/_layout.tsx).
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  console.error(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY manquantes : ' +
      "l'application tourne en mode dégradé (aucun appel réseau ne peut aboutir).",
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.invalid.supabase.co',
  supabasePublishableKey || 'placeholder-anon-key',
  {
    auth: {
      ...(Platform.OS !== 'web'
        ? { storage: AsyncStorage }
        : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
