# Miaraka — Architecture d'authentification

Ce document décrit l'architecture d'authentification créée dans `src/auth/`
et `src/lib/auth/`. **Aucun fournisseur (Google, Apple, e-mail) n'est encore
câblé sur les écrans** : ce document décrit une architecture prête à
l'emploi, pas encore branchée à l'interface.

## 1. Pourquoi cette architecture

Trois couches séparées, chacune avec une seule responsabilité :

```
┌─────────────────────────────────────────────────────────────┐
│  src/auth/                                                   │
│  Couche React : état, contexte, hooks, garde-fous de route.  │
│  Ne connaît PAS Supabase directement.                        │
├─────────────────────────────────────────────────────────────┤
│  src/auth/services/                                          │
│  Orchestration : combine les appels bas niveau en opérations │
│  complètes du point de vue métier (ex. "se connecter" =      │
│  connexion + chargement du profil).                          │
├─────────────────────────────────────────────────────────────┤
│  src/lib/auth/                                                │
│  Appels Supabase bruts, un fichier par opération, aucune      │
│  logique d'état React.                                       │
├─────────────────────────────────────────────────────────────┤
│  src/lib/supabase.ts (existant, non modifié)                 │
│  Client Supabase configuré (web / iOS / Android).             │
└─────────────────────────────────────────────────────────────┘
```

Avantage concret : ajouter Google ou Apple plus tard ne touchera que
`src/lib/auth/oauth.ts` (implémenter la vraie logique au lieu de lever une
erreur) — ni `AuthProvider`, ni les écrans, ni le contrat de types ne
changent.

## 2. Arborescence créée

```
src/auth/
├── types.ts              AuthUser, Profile, Session, AuthState, AuthError...
├── AuthContext.ts         React.Context<AuthContextValue | null>
├── AuthProvider.tsx        Fournit l'état + les actions (non branché sur _layout.tsx)
├── useAuth.ts              Hook de consommation du contexte
├── index.ts                 Point d'entrée public du module
├── services/
│   ├── auth-service.ts      Orchestration (sign-in + chargement profil, etc.)
│   └── index.ts
├── hooks/
│   ├── use-auth-status.ts   status seul
│   ├── use-current-user.ts  AuthUser seul
│   ├── use-profile.ts       Profile seul
│   └── index.ts
└── guards/
    ├── ProtectedRoute.tsx   Redirige si non connecté
    ├── PublicRoute.tsx      Redirige si déjà connecté
    └── index.ts

src/lib/auth/
├── errors.ts     Normalise toute erreur (Supabase Auth, Postgrest, réseau) en AuthError
├── session.ts    getCurrentSession, refreshCurrentSession, onAuthStateChange
├── sign-in.ts    signInWithEmail
├── sign-up.ts    signUpWithEmail
├── sign-out.ts   signOut
├── oauth.ts      signInWithOAuth (Google/Apple) — NON CONNECTÉ, lève une erreur explicite
├── profile.ts    getProfile, updateProfile
└── index.ts

docs/AUTHENTICATION.md   ce document
```

Rien d'autre n'a été modifié : ni les écrans, ni les composants, ni le
Design System, ni `src/lib/supabase.ts`, ni `src/app/_layout.tsx`.
`AuthProvider` n'enveloppe pas encore l'application.

## 3. Les types

Définis dans `src/auth/types.ts` :

| Type | Rôle |
|---|---|
| `AuthUser` | Identité Supabase Auth (`auth.users`) : id, email, fournisseur utilisé, dates. |
| `Profile` | Ligne `public.profiles` normalisée en camelCase (voir `database.sql`). `email` y est en lecture seule côté client. |
| `Session` | `accessToken`, `refreshToken`, `expiresAt`, `user`. |
| `AuthState` | `status` + `user` + `profile` + `session` + `error`, l'état complet exposé par le contexte. |
| `AuthStatus` | `'loading' \| 'authenticated' \| 'unauthenticated' \| 'error'`. |
| `AuthError` | `{ code, message, cause? }`, erreur normalisée quelle que soit la source. |
| `AuthErrorCode` | `invalid_credentials`, `email_already_in_use`, `weak_password`, `network_error`, `session_expired`, `profile_not_found`, `provider_not_connected`, `unknown`. |
| `AuthProviderId` | `'email' \| 'google' \| 'apple'` — seul `'email'` est câblé. |
| `SignInWithEmailInput`, `SignUpWithEmailInput`, `SignInWithOAuthInput`, `UpdateProfileInput` | Entrées des actions. |
| `AuthContextValue` | `AuthState` + toutes les actions (voir section 5). |

## 4. Cycle de connexion

```
Écran (futur)                AuthProvider                  services/auth-service        lib/auth                Supabase
    │  signInWithEmail() ──────►│                                  │                        │                        │
    │                           │  dispatch LOADING                │                        │                        │
    │                           │  authService.signInWithEmail() ─►│                        │                        │
    │                           │                                  │  signInWithEmail() ───►│                        │
    │                           │                                  │                        │  auth.signInWithPassword()►
    │                           │                                  │                        │◄──── session ou erreur │
    │                           │                                  │◄──── Session ──────────│                        │
    │                           │                                  │  getProfile(userId) ──►│                        │
    │                           │                                  │                        │  from('profiles')...   │
    │                           │                                  │◄──── Profile ───────────│                        │
    │                           │◄──── { session, profile } ───────│                        │                        │
    │                           │  dispatch AUTHENTICATED           │                        │                        │
    │◄── status: 'authenticated', user, profile ────────────────────                        │                        │
```

En cas d'erreur à n'importe quelle étape : `toAuthError()` normalise
l'erreur, `AuthProvider` passe en `status: 'error'` avec un `AuthError`
exploitable, et la Promise rejetée remonte à l'appelant (pour afficher un
message, par exemple).

## 5. Actions exposées par `useAuth()`

```ts
const {
  status, user, profile, session, error,       // état (AuthState)
  signInWithEmail, signUpWithEmail,             // e-mail/mot de passe
  signInWithOAuth,                              // Google/Apple — lève 'provider_not_connected' pour l'instant
  signOut,
  refreshSession,                               // force le renouvellement du token
  refreshProfile,                               // recharge le profil sans toucher à la session
  updateProfile,                                // ne permet pas de modifier email (protégé côté base)
  clearError,
} = useAuth();
```

## 6. Cycle de déconnexion

1. L'écran appelle `signOut()`.
2. `AuthProvider` passe en `status: 'loading'`.
3. `authService.signOut()` appelle `supabase.auth.signOut()`.
4. En cas de succès : `status: 'unauthenticated'`, `user`/`profile`/`session`
   redeviennent `null`.
5. Le listener `onAuthStateChange` (voir section 7) reçoit aussi
   l'événement `SIGNED_OUT` en parallèle et confirmerait le même état — la
   double notification est sans effet indésirable (idempotent).

## 7. Gestion des sessions

- **Au démarrage** : `AuthProvider` appelle `authService.getSession()`
  (lecture locale, pas nécessairement un appel réseau) puis, si une session
  existe, charge le profil associé avant de passer en `authenticated`.
- **Écoute continue** : `authService.onSessionChange()` s'abonne à
  `supabase.auth.onAuthStateChange`, qui notifie automatiquement les
  connexions, déconnexions, et **renouvellements automatiques de token**
  (le SDK Supabase rafraîchit le token tout seul avant expiration).
- **Renouvellement manuel** : `refreshSession()` est disponible si l'appli
  a besoin de forcer un renouvellement (ex. après une longue mise en
  arrière-plan).
- **Nettoyage** : le hook de session se désabonne (`unsubscribe()`) au
  démontage de `AuthProvider`, et un `mountedRef` évite de mettre à jour
  l'état après démontage.

## 8. Gestion des erreurs

Toute erreur (Supabase Auth, requête Postgrest sur `profiles`, erreur
réseau, erreur inconnue) passe par `toAuthError()`
(`src/lib/auth/errors.ts`), qui s'appuie sur les garde-fous officiels de
`@supabase/supabase-js` (`isAuthError`, `isAuthApiError`,
`isAuthRetryableFetchError`) et sur le champ `code` machine-readable que
Supabase Auth renvoie désormais (voir la
[liste officielle des codes d'erreur](https://supabase.com/docs/guides/auth/debugging/error-codes)),
pour produire systématiquement un `AuthError` `{ code, message, cause }`
exploitable par l'interface, quelle que soit la source de l'erreur.

## 9. Google, Apple, E-mail — préparation sans connexion

- **E-mail** : entièrement câblé (`signInWithEmail`, `signUpWithEmail`),
  utilisable dès qu'un écran de connexion existera.
- **Google / Apple** : `signInWithOAuth({ provider })` existe déjà dans le
  contrat de types et dans `AuthProvider`, mais `src/lib/auth/oauth.ts`
  lève volontairement une erreur `provider_not_connected` tant qu'aucune
  implémentation réelle n'est branchée. Le jour venu :
  - **Web** : `supabase.auth.signInWithOAuth({ provider: 'google' })` avec
    redirection navigateur.
  - **iOS/Android (natif)** : SDK natif (Google Sign-In / Apple
    Authentication) puis `supabase.auth.signInWithIdToken({ provider, token })`.
  - Dans les deux cas, seul le contenu de `oauth.ts` change — aucune
    dépendance n'est installée pour l'instant (ni `expo-auth-session`, ni
    SDK natif), conformément à la consigne de ne rien installer sans
    demander.

## 10. `ProtectedRoute` / `PublicRoute`

Composants prêts à l'emploi dans `src/auth/guards/`, **non utilisés pour
l'instant** dans `src/app/`. Exemple d'utilisation future (illustratif,
pas encore appliqué) :

```tsx
// src/app/(protected)/_layout.tsx (futur)
import { ProtectedRoute } from '@/auth';

export default function ProtectedLayout() {
  return (
    <ProtectedRoute redirectTo="/">
      <Slot />
    </ProtectedRoute>
  );
}
```

`ProtectedRoute` redirige vers `redirectTo` (défaut `/`) si l'utilisateur
n'est pas connecté ; `PublicRoute` redirige vers `redirectTo` (défaut
`/demo`) si une session est déjà active. Les deux affichent un indicateur
de chargement neutre pendant `status: 'loading'`.

## 11. Ce qui reste à faire (hors périmètre de cette tâche)

- Envelopper `src/app/_layout.tsx` avec `<AuthProvider>`.
- Créer les écrans de connexion / inscription et les relier à `useAuth()`.
- Appliquer `ProtectedRoute` / `PublicRoute` aux groupes de routes concernés.
- Implémenter réellement `signInWithOAuth` pour Google puis Apple.
- Décider d'une stratégie de confirmation d'e-mail (Supabase peut exiger un
  clic de confirmation avant l'ouverture de session — `signUpWithEmail`
  retourne alors `null`, déjà géré par `AuthProvider`).

Aucune de ces étapes n'a été commencée, conformément à la demande de
préparer uniquement l'architecture.
