# Déploiement — variables d'environnement

Miaraka utilise deux variables `EXPO_PUBLIC_*` (voir `src/lib/supabase.ts`) :

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Comme tout préfixe `EXPO_PUBLIC_`, ces valeurs sont **injectées au moment du
build** (Metro/Expo lit `.env` et les inline dans le bundle JS) — jamais
lues depuis l'appareil ou le serveur au runtime. `.env` est volontairement
absent du dépôt Git (`.gitignore`), donc chaque environnement de build doit
les recevoir autrement :

| Environnement | Où les définir |
|---|---|
| Local (`expo start`) | Fichier `.env` à la racine (voir `.env.example`) |
| EAS Build (APK / AAB / IPA) | Variables d'environnement du projet EAS — `eas env:create`, ou tableau de bord [expo.dev](https://expo.dev) → Project → Environment variables. Doivent être associées aux profils utilisés (`development`, `preview`, `production` dans `eas.json`), visibilité "Plaintext" (ce sont déjà des clés publiques côté client) |
| Vercel (web) | Project Settings → Environment Variables sur [vercel.com](https://vercel.com), mêmes deux clés |

**Si ces variables sont absentes au moment d'un build EAS**, `supabase.ts`
retombe sur un client factice (`isSupabaseConfigured === false`) plutôt que
de planter l'app au démarrage : voir le commentaire dans ce fichier. C'était
la cause du crash immédiat à l'ouverture observé sur l'APK — corrigé le
2026-08-12, mais la vraie solution reste de configurer ces variables côté
EAS pour que l'app fonctionne réellement (pas seulement qu'elle ne plante
plus).
