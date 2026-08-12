import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { AuthProvider } from '@/auth';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LanguageProvider } from '@/contexts/language-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import { darkColors, spacing, typography } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  if (!isSupabaseConfigured) {
    // Voir src/lib/supabase.ts : évite un crash silencieux au démarrage
    // quand EXPO_PUBLIC_SUPABASE_URL/KEY manquent au moment du build
    // (typiquement un profil EAS Build sans ces variables configurées).
    return <ConfigurationMissingScreen />;
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {/* PWA minimale (web uniquement) : sans effet sur Android/iOS, voir ExpoHead.ios.js (no-op natif). */}
          <Head>
            <meta content="#6C63FF" name="theme-color" />
            <link href="/manifest.json" rel="manifest" />
          </Head>
          <AnimatedSplashOverlay />
          <Slot />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

/**
 * Écran de secours affiché à la place de toute l'app quand la config
 * Supabase est absente du build. Masque le splash lui-même (RootLayout ne
 * monte jamais le reste de l'arbre qui s'en chargerait normalement via
 * AnimatedSplashOverlay) pour ne jamais laisser l'utilisateur bloqué sur un
 * splash figé. Voir docs/DEPLOY.md pour la correction réelle.
 */
function ConfigurationMissingScreen() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Configuration manquante</Text>
      <Text style={styles.body}>
        Les variables EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        n&apos;ont pas été fournies à ce build. Voir docs/DEPLOY.md.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: darkColors.background,
    flex: 1,
    gap: spacing[3],
    justifyContent: 'center',
    padding: spacing[6],
  },
  title: { ...typography.titleMedium, color: darkColors.textPrimary, textAlign: 'center' },
  body: { ...typography.bodyMedium, color: darkColors.textSecondary, textAlign: 'center' },
});
