import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AuthProvider } from '@/auth';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LanguageProvider } from '@/contexts/language-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
