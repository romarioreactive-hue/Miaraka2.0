# Miaraka — Architecture de localisation

Ce document décrit l'architecture créée dans `src/types/location.ts`,
`src/services/location-service.ts`, `src/hooks/use-current-location.ts`,
`src/lib/location/` et `src/components/location/`, et son branchement dans
le véritable onglet "Carte" (`src/app/demo.tsx`).

**État actuel : seule la position de l'utilisateur connecté est affichée.**
Aucun autre membre, aucun temps réel, aucun envoi vers Supabase. Cette
architecture prépare ces évolutions sans qu'il soit nécessaire de la
refaire (voir section 6).

## 1. Pourquoi cette architecture

Quatre couches, chacune avec une seule responsabilité — le même principe
que l'architecture d'authentification (`docs/AUTHENTICATION.md`) :

```
┌──────────────────────────────────────────────────────────────┐
│  src/types/location.ts                                        │
│  Contrats partagés par toutes les couches (aucune logique).    │
├──────────────────────────────────────────────────────────────┤
│  src/services/location-service.ts                              │
│  Appels bruts à expo-location : permissions, lecture unique,   │
│  suivi continu. Aucune logique d'état React.                   │
├──────────────────────────────────────────────────────────────┤
│  src/hooks/use-current-location.ts                              │
│  Hook autonome : vérifie la permission (sans la demander) →     │
│  attend un geste utilisateur → services activés → lecture →     │
│  suivi. Utilisable seul, sans Provider.                         │
├──────────────────────────────────────────────────────────────┤
│  src/lib/location/ (LocationContext, LocationProvider,          │
│  useLocation)                                                   │
│  Partage UNE SEULE instance de useCurrentLocation() entre       │
│  plusieurs composants, pour éviter les abonnements GPS et les   │
│  demandes de permission en double.                               │
├──────────────────────────────────────────────────────────────┤
│  src/components/location/ (carte, prompt, états, écran)         │
│  Rendu : carte native (react-native-maps) ou repli web,         │
│  explication Miaraka avant la demande système, états de         │
│  permission/erreur, écran complet branché dans l'onglet Carte.  │
└──────────────────────────────────────────────────────────────┘
```

Avantage concret : ajouter les autres membres, le temps réel ou
l'historique plus tard ne touchera que les couches hautes
(composants/écran) — `location-service.ts` et les types restent stables.

## 2. Arborescence

```
src/types/location.ts              Coordinates, LocationSample, LocationState,
                                    LocationStatus, LocationServiceError, ...

src/services/location-service.ts   Appels expo-location : permissions,
                                    getCurrentLocation(), watchLocation()

src/hooks/
└── use-current-location.ts        useCurrentLocation() — hook autonome

src/lib/location/
├── LocationContext.ts             React.Context<LocationContextValue | null>
├── LocationProvider.tsx           Monte useCurrentLocation() une seule fois
├── useLocation.ts                 Hook de consommation du contexte
└── index.ts

src/components/location/
├── location-map-view.types.ts     Types partagés (aucun import react-native-maps)
├── location-map-view.tsx          Carte native (Android : Google Maps,
│                                   iOS : Apple Maps, via react-native-maps)
├── location-map-view.web.tsx      Repli web (pas de carte visuelle encore ;
│                                   la géolocalisation, elle, fonctionne)
├── location-permission-prompt.tsx Explication Miaraka avant la demande système
├── location-status-view.tsx       États plein écran : permission refusée/
│                                   bloquée, GPS désactivé, chargement, erreur
├── location-error-messages.ts     Traduction des codes d'erreur
└── my-location-screen.tsx         Écran complet, branché dans l'onglet Carte
                                    (filtres désactivés, carte, bandeau
                                    d'état, boutons Recentrer/Ma position)

docs/LOCATION.md                   Ce document
```

`src/app/demo.tsx` (l'app réelle) affiche `<MyLocationScreen />` pour
l'onglet "Carte" — plus aucune carte fictive. La position n'est donc
demandée que si l'utilisateur ouvre cet onglet, jamais avant.

## 3. Cycle de vie

```
Ouverture de l'onglet Carte
         │
         ▼
  <LocationProvider>  ──► useCurrentLocation({ watch: true })
         │
         ▼
  Vérification SILENCIEUSE de la permission (aucune boîte de dialogue)
         │
         ├─ déjà accordée ──────────────────────────────┐
         │                                                │
         ▼ jamais demandée                                │
  status: 'permission_undetermined'                       │
  → <LocationPermissionPrompt> (explication Miaraka)       │
         │                                                │
         ├─ "Plus tard" ──► état local (pas d'appel API)   │
         │                   bouton "Activer" ↺             │
         │                                                │
         ▼ "Autoriser"                                     │
  status: 'requesting_permission' (boîte système)          │
         │                                                │
         ├─ refusée ──► status: 'permission_denied'         │
         │              (copie différente si bloquée :      │
         │               permission.canAskAgain === false)  │
         │                                                │
         ▼ accordée ◄─────────────────────────────────────┘
  vérifie hasServicesEnabledAsync()
         │
         ├─ GPS désactivé ────────────────► status: 'services_disabled'
         │
         ▼ GPS activé
  status: 'locating' ──► getCurrentPositionAsync()
         │
         ├─ échec ────────────────────────► status: 'error'
         │
         ▼ succès
  status: 'available', sample rempli → carte affichée
         │
         ▼ (watch: true par défaut)
  watchPositionAsync() démarre
         │
         ▼
  chaque nouvelle position ──► sample mis à jour, status reste 'available'
         │
         ▼
  démontage de l'écran (changement d'onglet) ──► subscription.remove()
```

Une fois qu'une position réelle a été obtenue une première fois
(`sample !== null`), la carte reste affichée même si le statut se
dégrade ensuite (GPS perdu, erreur de lecture) : un bandeau non bloquant
apparaît par-dessus la carte avec la dernière position connue, plutôt que
de tout recouvrir — voir `LocationBanner` dans `my-location-screen.tsx`.

`refresh()` relit la position une seule fois sans re-demander la
permission (utilisé par le bouton "Ma position") et renvoie la mesure
obtenue, pour recentrer immédiatement. `requestPermission()` — appelé
uniquement depuis le bouton "Autoriser" ou "Réessayer" — déclenche la
vraie boîte de dialogue système puis relance tout le cycle.

## 4. Permissions

- **Explication Miaraka avant la demande système** : `useCurrentLocation()`
  ne demande JAMAIS la permission de lui-même — au montage, il se contente
  de *vérifier* l'état actuel (`getForegroundPermission`, sans boîte de
  dialogue). Si elle n'a jamais été demandée, l'écran affiche
  `LocationPermissionPrompt` ("Autoriser votre position" / "Plus tard").
  C'est uniquement le bouton "Autoriser" qui appelle `requestPermission()`
  et déclenche la vraie boîte système.
- **Uniquement au premier plan** (`requestForegroundPermissionsAsync`) :
  aucune permission "toujours" / arrière-plan n'est demandée à cette étape
  (`isIosBackgroundLocationEnabled`/`isAndroidBackgroundLocationEnabled` :
  `false` dans `app.json`).
- **Demandée seulement à l'ouverture de l'onglet Carte**, jamais au
  démarrage de l'app : `LocationProvider` n'est pas monté dans
  `src/app/_layout.tsx`, volontairement.
- **"Plus tard"** : dismiss purement local (aucun appel à expo-location) —
  un bouton "Activer" ré-affiche l'explication Miaraka.
- **Refusée vs bloquée** : `permission.canAskAgain` distingue "l'OS peut
  encore proposer la boîte de dialogue" (bouton "Réessayer") de "il faut
  passer par les réglages système" (bouton "Ouvrir les réglages" only) —
  géré dans `LocationStatusView`.
- **États couverts** : non demandée (prompt Miaraka), "plus tard", en
  cours de demande, refusée, bloquée, GPS désactivé, recherche en cours,
  position indisponible/erreur — chacun avec un titre, une description et
  une action claire, dans les deux langues (FR/MG).

## 5. Flux de données

- **Aucun envoi vers Supabase à cette étape.** `location-service.ts` ne
  contient aucun appel réseau vers Supabase ; la position reste locale à
  l'appareil et à la mémoire du composant React.
- **Précision** : `LocationAccuracy.Balanced` est utilisé (bon compromis
  batterie/précision). Ajustable plus tard sans changer l'architecture.
- **Suivi continu** : `timeInterval: 4000` ms / `distanceInterval: 10` m —
  évite de solliciter le GPS en continu tant que l'utilisateur ne bouge pas
  significativement.
- **Marqueur** : la photo de profil réelle (`profiles.avatar_url`, via
  `useAuth().profile`) est affichée via le composant `Avatar` existant,
  directement comme enfant React du `Marker` (react-native-maps accepte
  n'importe quelle vue comme marqueur personnalisé — pas de conversion
  d'image native nécessaire, contrairement à l'ancienne implémentation
  expo-maps). Un halo pulsé (Reanimated, désactivé si "réduire les
  animations" est actif) et un badge "Moi" l'accompagnent.
- **Cercle de précision** : un `<Circle>` optionnel est dessiné autour de
  la position quand `sample.accuracy` est connu.
- **Web** : la géolocalisation fonctionne réellement (expo-location utilise
  `navigator.geolocation` / `navigator.permissions` en interne, appelés
  uniquement dans des effets — jamais pendant le rendu serveur d'Expo
  Router). Seule la carte visuelle manque sur le web (voir section 8).

## 6. Évolutions prévues (non commencées)

Cette architecture est conçue pour absorber, sans refonte :

| Évolution | Ce qui changerait | Ce qui NE changerait PAS |
|---|---|---|
| Plusieurs utilisateurs | `location-map-view.tsx` recevrait un tableau de marqueurs au lieu d'un seul | Le contrat `LocationMapMarker`, déjà pensé pour une liste |
| Temps réel (autres membres) | Un nouveau service lirait les positions partagées depuis Supabase (table `locations`, déjà créée dans `database.sql`, RLS déjà en place) | `useCurrentLocation()` reste responsable uniquement de MA position |
| Envoi de MA position à Supabase | Un appel d'écriture dans `location-service.ts` ou un service dédié, déclenché depuis le hook ou l'écran | Le hook resterait la seule source de vérité pour la position locale |
| Trajets / historique | Nouvelle table + service dédié consommant `LocationSample` au fil du temps | `LocationSample` contient déjà tous les champs utiles (vitesse, cap, altitude, précision, horodatage) |
| Géofencing | `expo-location` expose déjà `startGeofencingAsync` : un nouveau service pourrait l'utiliser | Indépendant du hook de position au premier plan |
| Notifications de proximité | Nouvelle logique métier comparant les positions de plusieurs membres | Consommerait les types déjà définis (`Coordinates`, `LocationSample`) |
| Filtres Famille/Amis/Équipe actifs | `FilterRow` dans `my-location-screen.tsx` deviendrait interactive, filtrant une vraie liste de marqueurs | Le style visuel des puces existe déjà |
| Carte web réelle | Remplacer uniquement `location-map-view.web.tsx` par une vraie implémentation | `location-map-view.types.ts` et le contrat de props/ref restent identiques |
| Batterie | Remplir `LocationSample.batteryLevel` (actuellement toujours `null`) via `expo-battery`, à installer après validation | Le champ existe déjà dans le type |

## 7. Pourquoi deux fichiers pour la carte (`location-map-view.tsx` / `.web.tsx`)

`react-native-maps` est un module **natif uniquement** (Android/iOS) : il
n'a aucune version web et son import échoue si le bundler web tente de le
charger. React Native/Expo résolvent automatiquement
`location-map-view.web.tsx` sur le web et `location-map-view.tsx` sur
Android/iOS — le même mécanisme déjà utilisé ailleurs dans le projet (ex.
`src/hooks/use-color-scheme.web.ts`). Les deux fichiers partagent le même
contrat de props/ref (`location-map-view.types.ts`, qui n'importe jamais
`react-native-maps`), donc l'écran appelant (`my-location-screen.tsx`) n'a
jamais besoin de savoir laquelle des deux implémentations est active.

## 8. Dépendances

- `expo-location` (~57.0.7) — API officielle Expo pour la position, les
  permissions et le suivi GPS. Déjà installé.
- `react-native-maps` (1.27.2) — carte native (Google Maps sur Android,
  Apple Maps sur iOS par défaut, sans clé requise). Déjà installé ; c'est
  la bibliothèque utilisée pour cette étape (remplace l'essai précédent
  avec `expo-maps`, retiré de `app.json` mais toujours listé dans
  `package.json` — voir "Limites connues" dans le résumé de cette étape).

### Clé Google Maps (Android uniquement)

Sans clé, la carte s'affiche mais **les tuiles Google Maps resteront
grises sur Android** (iOS utilise Apple Maps par défaut, sans clé). À
faire avant un test Android réel :

1. Créer une clé "Maps SDK for Android" dans Google Cloud Console.
2. L'ajouter dans `app.json`, dans la config du plugin `react-native-maps` :
   ```json
   ["react-native-maps", { "androidGoogleMapsApiKey": "VOTRE_CLE" }]
   ```
3. Relancer `npx expo prebuild --clean` (ou un nouveau build) pour que la
   clé soit injectée dans le projet Android natif.
