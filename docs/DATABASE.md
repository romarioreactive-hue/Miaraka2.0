# Miaraka — Base de données Supabase

Ce document décrit l'architecture SQL définie dans [`database.sql`](../database.sql).
Il complète [`PRODUCT.md`](./PRODUCT.md), qui reste la référence pour les règles
de confidentialité et le fonctionnement attendu de l'application.

Ce fichier a été mis à jour après un **audit de sécurité complet** du schéma
(voir [section 10](#10-audit-de-sécurité)). `database.sql` intègre déjà
toutes les corrections décrites ici.

## 1. Vue d'ensemble

- Moteur : PostgreSQL (Supabase).
- Les tables applicatives vivent dans le schéma `public` et sont liées,
  directement ou indirectement, à `auth.users` via `profiles.id`. Les
  fonctions internes utilisées par les policies RLS vivent dans un schéma
  séparé, `private`, jamais exposé par l'API (voir section 4).
- Toutes les tables sont protégées par **Row Level Security (RLS)** : rien
  n'est accessible via l'API sans policy explicite, et chaque policy est
  restreinte au rôle `authenticated` — le rôle `anon` ne correspond à aucune
  policy, sur aucune table.
- Principe central : **personne n'est visible par défaut**. Le partage de
  position et d'activité n'est visible par un autre membre que si (1) les
  deux profils partagent un espace commun **et** (2) le propriétaire de la
  donnée a explicitement activé le partage correspondant dans
  `user_settings`.
- Les distances (`activities`, `challenges`, `challenge_members`) sont
  stockées en **mètres** (entiers).

## 2. Schéma texte (relations)

```
auth.users
   │ 1:1 (trigger on_auth_user_created)
   ▼
profiles ──────────────────────────────────────────────────────────────┐
   │ 1:1                                                                │
   ▼                                                                    │
user_settings                                                          │
                                                                         │
profiles 1───* space_members *───1 spaces                              │
                    │                  │ 1:1 (trigger on_space_created) │
                    │                  └──> space_members (role=owner)  │
                    │                                                   │
                    ▼                                                   │
              (rôle par espace : owner / admin / member)                │
                                                                         │
profiles 1───* invitations *───1 spaces                                 │
   (sender_id, receiver_id — immuables après création)                  │
   └── acceptée ──> insertion automatique dans space_members            │
                                                                         │
profiles 1───1 locations            profiles 1───* location_history     │
profiles 1───* activities                                               │
                                                                         │
spaces 1───* challenges 1───* challenge_members *───1 profiles ─────────┘

profiles 1───* notifications
```

### Cardinalités clés

| Relation | Cardinalité | Remarque |
|---|---|---|
| `auth.users` → `profiles` | 1:1 | créé automatiquement à l'inscription |
| `profiles` → `user_settings` | 1:1 | créé automatiquement à l'inscription |
| `profiles` → `locations` | 1:1 | une seule position "en direct" par profil |
| `spaces` ↔ `profiles` | N:N via `space_members` | avec un `role` par ligne |
| `spaces` → `invitations` | 1:N | une invitation cible toujours un espace précis |
| `spaces` → `challenges` | 1:N | un défi appartient à un seul espace, immuable |
| `challenges` ↔ `profiles` | N:N via `challenge_members` | avec `distance` (m), `steps`, `rank` |
| `profiles` → `activities` | 1:N | une ligne par profil et par jour (`unique(profile_id, activity_date)`) |
| `profiles` → `location_history` | 1:N | historique brut, append-only |
| `profiles` → `notifications` | 1:N | |

## 3. Description des tables

### `profiles`
Profil applicatif d'un utilisateur, en relation 1:1 avec `auth.users`.
Créé automatiquement par le trigger `on_auth_user_created`, qui lit
`raw_user_meta_data` (nom, avatar) fourni par le fournisseur d'authentification.

- `status` : état du compte (`active`, `suspended`, `deleted`) — distinct de
  `is_online`, qui reflète la présence en temps réel.
- `language` : `fr` ou `mg`, aligné sur les langues réellement supportées par
  l'application (`src/i18n`).
- `email` : toujours stocké en minuscules (`check (email = lower(email))`) et
  **non modifiable directement par le client** (trigger `protect_profile_email`)
  — seul `handle_new_user` peut l'écrire, à partir de `auth.users.email`.

### `spaces`
Espace privé (`family`, `friends`, `team`). Le créateur (`owner_id`) est
automatiquement inséré dans `space_members` avec le rôle `owner` par le
trigger `on_space_created`. `owner_id` est **immuable** après création
(trigger `protect_space_owner`) : il n'existe pas de fonctionnalité de
transfert de propriété en version 1.

### `space_members`
Association profil ↔ espace avec un rôle (`owner`, `admin`, `member`).
Table pivot utilisée par la quasi-totalité des policies RLS pour déterminer
qui a accès à quoi. L'appartenance est binaire : quitter un espace supprime
la ligne (il n'existe pas de statut "membre inactif").

### `invitations`
Invitation d'un profil (`receiver_id`) à rejoindre un espace, envoyée par un
membre (`sender_id`). Un index unique empêche plusieurs invitations `pending`
simultanées vers la même personne pour le même espace.

`sender_id`, `receiver_id`, `space_id` et `created_at` sont **immuables**
après création, et **seul le destinataire** peut modifier le statut d'une
invitation (accepter/refuser) — l'expéditeur ne peut que l'annuler (DELETE)
tant qu'elle est `pending`. Le trigger `handle_invitation_update` :
- refuse toute modification des colonnes immuables ;
- refuse de modifier une invitation déjà traitée (statut différent de `pending`) ;
- ajoute automatiquement le destinataire à `space_members` quand `status`
  passe à `accepted`.

### `locations`
Position "en direct" : **une seule ligne par profil** (contrainte `unique`
sur `profile_id`), réécrite à chaque mise à jour GPS. Ce n'est pas un
historique — voir `location_history` pour cela.

### `activities`
Résumé quotidien de l'activité physique. Les distances à pied, en vélo, en
course et motorisées sont **strictement séparées** et stockées **en mètres**
(règle produit : les kilomètres motorisés ne comptent jamais comme marche).
Une ligne par profil et par jour.

### `challenges`
Défi collectif (`walking`, `cycling`, `running`) rattaché à un espace, avec
une distance cible en mètres (`target_distance`) et une période
(`start_date` / `end_date`). `owner_id` et `space_id` sont **immuables**
après création (trigger `protect_challenge_ownership`) : un défi ne peut pas
être réassigné à un autre espace.

### `challenge_members`
Participation d'un profil à un défi. `distance` (mètres) et `steps` sont mis
à jour par le client (ou une synchronisation) ; **`rank` est entièrement géré
par le serveur** — le trigger `protect_challenge_member_rank` ignore toute
valeur envoyée par le client, et `recalculate_challenge_ranks()` le
recalcule automatiquement à chaque changement de progression ou de départ
d'un participant.

### `notifications`
Notifications applicatives adressées à un profil. Aucune policy `INSERT`
n'est ouverte aux utilisateurs authentifiés : elles sont créées côté serveur
(fonctions `SECURITY DEFINER` ou rôle de service dans une Edge Function).

### `user_settings`
Réglages de confidentialité et de préférences, une ligne par profil, créée
automatiquement à l'inscription avec des valeurs **désactivées par défaut**
(`share_location`, `share_activity`, `share_last_seen`, `share_battery`
= `false`). C'est cette table qui matérialise la règle « invisible par
défaut » du produit.

### `location_history`
Historique brut des positions, **strictement privé** : même les membres d'un
espace commun ne peuvent pas le consulter, seul le propriétaire le peut.
Table en ajout seul (pas de policy `UPDATE`). Une fonction de maintenance
`cleanup_old_location_history(retention_days)` permet de purger les
anciennes positions (30 jours par défaut) — voir section 8. Elle est
réservée au rôle de service (voir section 10).

## 4. Fonctions internes (schéma `private`)

Ces fonctions `SECURITY DEFINER` sont utilisées par les policies pour éviter
toute récursion RLS (une policy sur `space_members` ne peut pas interroger
`space_members` directement). Elles vivent dans un schéma **`private`**
séparé du schéma `public`, afin de ne jamais être exposées comme point
d'accès direct de l'API (PostgREST n'expose que les schémas configurés,
`public` par défaut) : un utilisateur authentifié ne peut donc pas les
appeler lui-même pour sonder des relations d'appartenance qui ne le
concernent pas. Leur droit `EXECUTE` est explicitement limité au rôle
`authenticated`.

| Fonction | Rôle |
|---|---|
| `private.is_space_member(space_id, profile_id?)` | l'utilisateur appartient-il à cet espace ? |
| `private.is_space_admin(space_id, profile_id?)` | l'utilisateur est-il `owner`/`admin` de cet espace ? |
| `private.shares_space_with(profile_id)` | l'utilisateur connecté partage-t-il un espace avec ce profil ? |
| `private.is_challenge_visible(challenge_id)` | l'utilisateur connecté est-il membre de l'espace du défi ? |

## 5. Triggers

| Trigger | Table | Rôle |
|---|---|---|
| `set_updated_at` | plusieurs tables | met à jour `updated_at` à chaque modification |
| `on_auth_user_created` | `auth.users` | crée `profiles` + `user_settings` à l'inscription (e-mail normalisé) |
| `protect_profile_email` | `profiles` | empêche toute modification de `email` par le client |
| `on_space_created` | `spaces` | ajoute le créateur comme `owner` dans `space_members` |
| `protect_space_owner` | `spaces` | empêche toute modification de `owner_id` |
| `on_invitation_update` | `invitations` | protège les colonnes immuables, valide les transitions, ajoute le membre si acceptée |
| `protect_challenge_ownership` | `challenges` | empêche toute modification de `owner_id` / `space_id` |
| `protect_challenge_member_rank` | `challenge_members` | ignore toute valeur de `rank` envoyée par le client |
| `on_challenge_member_progress` / `on_challenge_member_removed` | `challenge_members` | recalcule `rank` |

## 6. Explication des policies RLS

Règle générale : **toute table a RLS activé, chaque policy est restreinte au
rôle `authenticated`, et rien n'est accessible sans policy explicite.** Le
rôle `anon` ne correspond à aucune policy sur aucune table : un appel non
authentifié ne peut lire ni écrire aucune ligne, quelle que soit la requête.

- **profiles** : visible par son propriétaire et par tout membre d'un espace
  commun (nécessaire pour les listes de membres et la carte). Modifiable
  uniquement par son propriétaire, à l'exception de `email` (immuable, voir
  section 3).
- **spaces** : visible et modifiable par ses membres (lecture) / administrateurs
  (écriture). Suppression réservée au propriétaire. `owner_id` reste immuable
  même pour un administrateur (voir section 3).
- **space_members** : visible par les membres de l'espace. Ajout/suppression
  de membres réservés aux administrateurs, sauf pour un membre qui se retire
  lui-même. L'ajout initial (création d'espace, acceptation d'invitation)
  passe par des triggers `SECURITY DEFINER`, indépendants de ces policies.
- **invitations** : visible par l'expéditeur et le destinataire uniquement.
  Un membre de l'espace peut inviter ; **seul le destinataire** peut faire
  évoluer le statut (accepter/refuser) ; annulation réservée à l'expéditeur
  tant que l'invitation est `pending`.
- **locations** / **activities** : visibles par leur propriétaire, ou par un
  membre d'un espace commun **si et seulement si** `user_settings.share_location`
  / `share_activity` est activé. Écriture réservée au propriétaire.
- **challenges** : visibles par les membres de l'espace concerné. Création
  réservée à un membre de l'espace ; modification/suppression réservées au
  créateur ou à un administrateur de l'espace. `owner_id`/`space_id` restent
  immuables même pour le créateur (voir section 3).
- **challenge_members** : visibles par les membres de l'espace du défi.
  Chaque participant gère sa propre ligne (rejoindre, mettre à jour sa
  progression, quitter) ; `rank` reste hors de portée du client (voir section 3).
- **notifications** : strictement privées à leur destinataire ; créées côté
  serveur uniquement.
- **user_settings** : strictement privées ; jamais lisibles par un autre
  profil, y compris dans un espace commun (les indicateurs `share_*` sont
  interrogés en interne par les policies `locations`/`activities`, jamais
  exposés directement à un autre utilisateur).
- **location_history** : strictement privé au propriétaire, même au sein
  d'un espace commun — conformément à la règle produit « historique privé ».

## 7. Index

Index créés pour les colonnes de jointure et de tri les plus fréquentes :
`profile_id`, `space_id`, `challenge_id`, `updated_at`, `created_at`,
`email`, plus des index ciblés (invitations `pending` uniques par espace,
notifications non lues, historique de position trié par profil/date).

## 8. Maintenance

`location_history` grandit en continu. `cleanup_old_location_history(30)`
supprime les positions de plus de 30 jours (paramètre modifiable), **pour
tous les profils**. Cette fonction est réservée au rôle de service
(`service_role`) — voir section 10 : un utilisateur normal ne peut pas
l'appeler. À planifier via l'extension `pg_cron` si elle est activée sur le
projet Supabase, ou via une tâche externe (Edge Function planifiée, job
CI...).

## 9. Ce que ce schéma ne couvre pas encore

- Les lieux enregistrés (Maison, Bureau, lieux personnalisés) mentionnés
  dans `PRODUCT.md` ne font pas partie de cette première version de la base
  de données — à ajouter dans une itération ultérieure si besoin.
- Aucun index géospatial (PostGIS) n'est créé : les recherches "personne la
  plus proche" utilisées par MIA se feront initialement en calcul applicatif
  ou avec des fonctions PostgreSQL standard. PostGIS pourra être ajouté plus
  tard si les volumes le justifient.

## 10. Audit de sécurité

Le schéma a fait l'objet d'un audit complet avant sa première exécution sur
Supabase. Les vulnérabilités suivantes ont été trouvées et corrigées dans
`database.sql` :

| # | Problème trouvé | Gravité | Correction |
|---|---|---|---|
| 1 | `cleanup_old_location_history()` était appelable par **n'importe quel utilisateur connecté** (et potentiellement anonyme) via l'API RPC de Supabase, avec un paramètre `retention_days` arbitraire — un appel avec `retention_days = 0` aurait effacé l'historique GPS de **tous les utilisateurs**. | Critique | `EXECUTE` révoqué pour `anon` et `authenticated` ; réservée à `service_role`. |
| 2 | La policy `UPDATE` de `invitations` autorisait l'expéditeur **et** le destinataire à modifier la ligne, sans restreindre les colonnes modifiables. Un destinataire aurait pu réécrire `space_id` sur une invitation qui lui était destinée pour rejoindre **n'importe quel espace privé** sans y avoir été invité. | Élevée | Policy restreinte au destinataire seul ; `sender_id`/`receiver_id`/`space_id`/`created_at` rendus immuables par trigger. |
| 3 | `challenge_members.rank` était modifiable par le participant si sa requête ne touchait que la colonne `rank` (le trigger de recalcul ne se déclenchait alors pas, car il n'écoute que `distance`/`steps`). Un participant aurait pu se déclarer 1er sans avoir progressé. | Élevée | Nouveau trigger `protect_challenge_member_rank` qui ignore systématiquement toute valeur de `rank` envoyée par le client. |
| 4 | `spaces.owner_id` était modifiable par n'importe quel administrateur de l'espace via la policy `spaces_update_admins` (qui ne restreint pas les colonnes) : un admin pouvait silencieusement s'attribuer la propriété. | Moyenne | `owner_id` rendu immuable par trigger. |
| 5 | `challenges.owner_id`/`space_id` étaient modifiables par le créateur du défi, qui aurait pu réassigner son défi à un espace qu'il n'administre pas. | Moyenne | `owner_id`/`space_id` rendus immuables par trigger. |
| 6 | `is_space_member`, `is_space_admin` et `shares_space_with` étaient de simples fonctions du schéma `public`, donc automatiquement exposées comme points d'accès RPC par Supabase, avec des paramètres modifiables par l'appelant. Un utilisateur connecté aurait pu sonder des paires (espace, profil) arbitraires pour apprendre qui appartient à quel espace privé sans y être lui-même. | Moyenne | Fonctions déplacées dans un schéma `private` non exposé par l'API, avec `EXECUTE` limité à `authenticated`. |
| 7 | `profiles.email` était modifiable librement par son propriétaire via `profiles_update_self`, permettant de diverger de l'e-mail réel (`auth.users.email`) ou de "squatter" l'adresse d'un tiers (contrainte unique). | Faible | Colonne verrouillée par trigger ; seule l'inscription (`handle_new_user`) peut l'écrire, en minuscules. |
| 8 | Les policies ne précisaient pas explicitement `TO authenticated`. Le comportement était déjà correct (le rôle `anon` n'a pas de session, donc `auth.uid()` vaut toujours `NULL`), mais reposait sur ce détail plutôt que sur une restriction structurelle. | Faible (durcissement) | `to authenticated` ajouté explicitement à toutes les policies. |
| 9 | Les distances étaient stockées en kilomètres (`numeric(10,3)`), une convention moins standard qu'une unité de base en mètres pour une couche de données brutes. | Non sécuritaire (cohérence des données) | `activities.*_distance`, `challenges.target_distance`, `challenge_members.distance` convertis en mètres (`integer`). |

### Points vérifiés sans correction nécessaire

- **RLS activé sur les 11 tables** du schéma `public`.
- **Aucune policy `USING (true)`** : aucune table n'est lisible publiquement.
- **Pas de récursion RLS** : les fonctions `private.*` contournent
  volontairement RLS (`SECURITY DEFINER`, propriétaire de la table) pour
  interroger `space_members`/`challenges` sans redéclencher leurs propres
  policies. La chaîne `challenge_members → challenges (RLS) →
  private.is_space_member (contourne RLS)` se termine correctement, sans
  boucle.
- **`search_path` fixé explicitement** sur toutes les fonctions
  `SECURITY DEFINER` (et, par précaution, sur les fonctions `SECURITY
  INVOKER` du fichier) pour éviter tout détournement par manipulation du
  chemin de recherche.
- **Contraintes d'unicité** : un seul membre par espace
  (`space_members.unique(space_id, profile_id)`), un seul participant par
  défi (`challenge_members.unique(challenge_id, profile_id)`), une seule
  ligne `user_settings` par profil, une seule activité par profil et par
  jour, une seule position en direct par profil (`locations.profile_id
  unique`).
- **Types de colonnes** : latitude/longitude en `double precision` avec
  contraintes `check` sur les bornes valides ; tous les horodatages en
  `timestamptz` (avec fuseau horaire) ; les dates pures (`birth_date`,
  `activity_date`, `start_date`/`end_date`) restent en `date`, ce qui est le
  type correct pour une valeur calendaire sans heure ; toutes les clés en
  `uuid` ; valeurs contrôlées par `check` pour tous les champs de type énuméré
  (`language`, `gender`, `status`, `type`, `role`, invitation `status`).
- **Le script s'exécute sur un projet Supabase neuf** : il ne dépend que de
  `auth.users`, `auth.uid()` et des rôles `anon`/`authenticated`, tous
  présents par défaut dans tout projet Supabase.
- **Script non ré-exécutable, et documenté comme tel** en tête de fichier
  (aucune clause `if not exists` sur les tables/policies/triggers/index, à
  dessein).

### Recommandation pour la suite

Ce fichier reste néanmoins un point de départ : avant une mise en production
avec de vrais utilisateurs, il est recommandé de faire tourner le script sur
un projet Supabase de test, de vérifier le résultat de l'audit de sécurité
intégré au tableau de bord Supabase (Database → Security Advisor), et de
tester manuellement quelques scénarios clés (un utilisateur A ne doit voir
aucune donnée d'un utilisateur B tant qu'ils ne partagent pas d'espace avec
partage activé).
