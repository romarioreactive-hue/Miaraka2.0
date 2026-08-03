# Miaraka — Design System officiel

## Introduction

Ce document définit l'identité visuelle officielle de Miaraka pour la version 1. Il sert de référence commune pour concevoir les futurs écrans et composants sans modifier les fonctions du produit.

Miaraka signifie « ensemble » en malgache. Son interface doit rapprocher les personnes, inspirer confiance et rendre les informations de position ou d'activité faciles à comprendre. Le mode sombre est prioritaire. Un mode clair cohérent est préparé pour une utilisation future.

Les valeurs techniques de référence se trouvent dans `src/theme`. Ce document explique comment les utiliser.

## 1. Vision de la marque

Miaraka est une présence calme et rassurante. L'application aide à savoir où sont les personnes autorisées, sans donner l'impression de les surveiller.

La marque repose sur sept qualités :

- **Proximité** : les personnes importantes restent au centre de l'expérience.
- **Confiance** : les informations sont claires, datées et jamais ambiguës.
- **Sécurité** : les états sensibles sont visibles sans être alarmistes.
- **Modernité** : la présentation est nette, fluide et adaptée au mobile.
- **Mouvement** : la carte, l'activité et les progrès donnent une sensation de vie.
- **Simplicité** : une action principale par zone, peu de texte et des choix évidents.
- **Chaleur humaine** : photos, prénoms et couleurs de groupes rendent l'expérience personnelle.

L'inspiration vient de la clarté de Find My, du sens du groupe de Life360, de l'énergie d'Apple Fitness et de la lisibilité cartographique de Google Maps. Miaraka conserve toutefois sa propre identité, sa palette et ses règles.

## 2. Principes visuels

1. **La personne avant la donnée** : montrer un prénom et un avatar avant une suite de chiffres.
2. **Calme avant spectacle** : limiter les couleurs fortes, les effets et les mouvements.
3. **Clarté immédiate** : distinguer sans effort une position en direct, ancienne ou indisponible.
4. **Une hiérarchie forte** : un titre, une information principale et une action prioritaire.
5. **Confort tactile** : grandes zones tactiles, espacement généreux et commandes accessibles au pouce.
6. **Profondeur légère** : utiliser surfaces, bordures et ombres pour organiser, pas pour décorer.
7. **Cohérence** : utiliser les tokens officiels plutôt que créer une nouvelle valeur dans chaque écran.

## 3. Palette de couleurs

### Palette fondatrice

| Nom | Valeur | Rôle principal |
|---|---:|---|
| Bleu nuit | `#06142B` | Fond principal sombre |
| Bleu profond | `#0C2147` | Surface principale sombre |
| Indigo principal | `#6C63FF` | Action principale et information |
| Bleu Famille | `#4F8CFF` | Repère de l'espace Famille uniquement |
| Cyan | `#38D6E8` | Accent, mouvement et focus |
| Vert | `#29D391` | En direct, succès et progression positive |
| Blanc | `#FFFFFF` | Texte principal sombre et surface claire |
| Gris clair | `#E7ECF5` | Texte ou fond clair secondaire |
| Gris moyen | `#8B97AC` | Texte discret et état hors ligne |
| Rouge alerte | `#FF6577` | Erreur et action dangereuse |
| Jaune attention | `#F6BE4F` | Avertissement et attention |

### Couleurs sémantiques du mode sombre

| Usage | Token | Intention |
|---|---|---|
| Fond principal | `dark.background` | Base de chaque écran |
| Fond élevé | `dark.backgroundElevated` | Zone distincte du fond |
| Surface | `dark.surface` | Carte, panneau, champ |
| Surface élevée | `dark.surfaceElevated` | Élément flottant ou sélectionné |
| Bordure | `dark.border` | Séparation légère |
| Texte principal | `dark.textPrimary` | Titres et contenu important |
| Texte secondaire | `dark.textSecondary` | Description lisible |
| Texte discret | `dark.textMuted` | Heure et information moins importante |
| Désactivé | `dark.disabled` | Texte ou icône non disponible |
| Succès / en direct | `dark.success`, `dark.live` | Confirmation et position actuelle |
| Avertissement | `dark.warning` | Attention sans échec |
| Erreur | `dark.error` | Échec et danger |
| Information | `dark.info` | Explication ou action informative |
| Overlay | `dark.overlay` | Fond derrière une bottom sheet ou un dialogue |

### Couleurs des espaces

| Espace | Couleur | Utilisation |
|---|---|---|
| Famille | Bleu Famille | Pastille, repère ou accent associé à Famille |
| Amis | Cyan | Pastille, repère ou accent associé à Amis |
| Équipe | Vert | Pastille, repère ou accent associé à Équipe |

Ces couleurs aident à reconnaître un espace. Elles ne remplacent jamais le texte ou l'icône du type d'espace.

### Transparences

Le fichier `colors.ts` fournit des blancs, noirs et couleurs principales avec plusieurs niveaux de transparence. Ils servent aux overlays, bordures, fonds doux et effets lumineux. Une transparence doit toujours conserver un contraste suffisant sur son fond réel.

## 4. Règles d'utilisation des couleurs

- Utiliser le indigo principal pour l'action la plus importante d'un écran.
- Réserver le vert aux succès, à la progression positive et à l'état « En direct ».
- Réserver le rouge aux erreurs, alertes fortes et actions destructrices.
- Employer le jaune pour une attention temporaire, jamais comme confirmation de succès.
- Utiliser le cyan comme accent de mouvement ou de focus, pas comme deuxième bouton principal concurrent.
- Limiter chaque carte à une couleur d'accent dominante.
- Associer une couleur d'état à un texte ou une icône. La couleur seule ne suffit pas.
- Utiliser les couleurs sémantiques du thème, et non une valeur hexadécimale directement dans un futur écran.
- Vérifier le contraste après ajout d'une transparence, d'une image ou d'un fond cartographique.

## 5. Typographie

Miaraka utilise la police système du téléphone. Elle est familière, rapide à afficher, compatible avec Expo et respecte mieux les réglages d'accessibilité de l'utilisateur.

| Style | Taille | Graisse | Hauteur de ligne | Usage recommandé |
|---|---:|---:|---:|---|
| Display Large | 40 | 700 | 48 | Chiffre clé ou progression héroïque |
| Display Medium | 32 | 700 | 40 | Valeur principale d'une carte |
| Title Large | 24 | 700 | 32 | Titre d'écran ou de bottom sheet |
| Title Medium | 20 | 600 | 28 | Titre de section, carte ou dialogue |
| Body Large | 17 | 400 | 26 | Introduction ou message important |
| Body Medium | 15 | 400 | 22 | Texte courant et description |
| Label Large | 15 | 600 | 20 | Bouton principal, onglet ou action |
| Label Medium | 13 | 600 | 18 | Petit bouton, badge ou libellé |
| Caption | 12 | 400 | 16 | Heure, aide et annotation |

Règles :

- Ne pas utiliser plus de trois styles typographiques dans une même carte.
- Préférer une phrase courte à une réduction de la taille du texte.
- Ne jamais descendre sous 12 points pour une information utile.
- Respecter l'agrandissement du texte configuré sur le téléphone.
- Utiliser les graisses 400, 600 et 700 ; éviter une accumulation de texte gras.
- Les nombres d'activité peuvent employer les styles Display, avec leur unité clairement visible.

## 6. Espacements

L'échelle suit une base de 4 points.

| Token | Valeur | Usage courant |
|---:|---:|---|
| `1` | 4 | Écart minimal entre icône et détail |
| `2` | 8 | Écart interne compact |
| `3` | 12 | Groupe de petits éléments |
| `4` | 16 | Marge mobile standard |
| `5` | 20 | Padding confortable d'une carte |
| `6` | 24 | Séparation de sections proches |
| `8` | 32 | Grande séparation de sections |
| `10` | 40 | Zone respirante ou grande cible |
| `12` | 48 | Hauteur tactile minimale recommandée |
| `16` | 64 | Grande respiration de page |

Utiliser principalement 16 ou 20 points pour les bords d'un écran mobile. Une zone tactile doit mesurer au moins 48 × 48 points, même si son icône est plus petite.

## 7. Rayons

| Token | Valeur | Usage recommandé |
|---|---:|---|
| `small` | 8 | Petit badge ou élément compact |
| `medium` | 12 | Champ, bouton secondaire |
| `large` | 16 | Carte standard |
| `extraLarge` | 24 | Grande carte ou bottom sheet |
| `pill` | 999 | Badge, filtre et bouton capsule |
| `circle` | 9999 | Avatar et bouton rond |

Ne pas multiplier les rayons dans une même zone. Les éléments imbriqués utilisent généralement un rayon plus petit que leur conteneur.

## 8. Ombres

Cinq niveaux sont disponibles :

- `shadowSmall` : petite carte ou commande posée sur la carte ;
- `shadowMedium` : carte flottante ou barre de navigation ;
- `shadowLarge` : bottom sheet ou dialogue important ;
- `glowPrimary` : accent exceptionnel autour d'une action principale ;
- `glowLive` : halo léger autour d'un état réellement en direct.

Chaque token contient une variante `web`, `android` et `ios`. Le futur composant choisira la variante correspondant à sa plateforme. Sur Android, l'élévation produit l'essentiel de la profondeur. Sur iOS et le web, l'opacité, le flou et le décalage sont définis précisément.

Règles :

- Ne pas cumuler plusieurs ombres sur le même élément.
- Ne pas mettre de halo sur tous les boutons ou marqueurs.
- Réserver `glowLive` à une information réellement en direct.
- Préférer une bordure discrète à une ombre dans les listes denses.

## 9. Boutons

### Bouton principal

- Fond indigo principal, texte blanc, rayon `medium` ou `pill` selon le contexte.
- Hauteur minimale de 48 points.
- Une seule action principale visible par section.
- État pressé plus sombre et animation courte.

### Bouton secondaire

- Surface sombre élevée ou fond transparent avec bordure.
- Texte principal ou indigo principal selon l'importance.
- Même taille tactile que le bouton principal.

### Bouton discret

- Pas de fond permanent ; texte et icône suffisent.
- Convient aux actions secondaires comme « Annuler » ou « Plus ».

### Bouton dangereux

- Rouge seulement pour une action réellement destructive : quitter un espace, retirer un accès ou supprimer.
- Demander une confirmation lorsque l'action est difficile à annuler.

### États

- Désactivé : surface et texte désactivés, sans réduire excessivement la lisibilité.
- Chargement : conserver la largeur du bouton, remplacer le contenu par un indicateur et bloquer les doubles appuis.
- Focus : anneau cyan visible sur le web ou avec une navigation adaptée.

## 10. Cartes

- Fond `surface`, rayon `large`, padding de 16 à 20 points.
- Bordure discrète en mode sombre ; ombre seulement si la carte flotte réellement.
- Titre court, information prioritaire visible en premier et au plus une action principale.
- Une carte sélectionnée peut utiliser `surfaceElevated` et une bordure indigo principal.
- Les cartes de personnes donnent la priorité à l'avatar, au prénom, à l'état et à l'heure.
- Éviter les cartes imbriquées. Utiliser des séparateurs ou des groupes simples.

## 11. Champs de saisie

- Hauteur minimale de 48 points, fond `surface`, rayon `medium`.
- Libellé toujours visible lorsque le contenu peut être ambigu.
- Placeholder en texte discret ; il ne remplace pas un libellé nécessaire.
- Focus signalé par une bordure cyan ou indigo principal.
- Erreur affichée sous le champ en rouge, avec une explication courte et utile.
- Icône d'action tactile d'au moins 48 points si elle efface ou révèle le contenu.
- Ne pas demander une information qui n'est pas nécessaire au parcours.

## 12. Avatars

Tailles recommandées : 32 points pour une liste dense, 48 pour une carte standard, 64 pour une fiche et 88 pour un profil.

- Forme toujours circulaire.
- Photo centrée et recadrée sans déformation.
- En l'absence de photo, afficher les initiales sur une couleur stable.
- Un anneau peut indiquer l'espace, mais jamais sans autre indication textuelle.
- L'état en direct utilise une petite pastille verte accompagnée d'un libellé à proximité.
- Un avatar reste identifiable sur un fond cartographique chargé grâce à un contour contrasté.

## 13. Badges

- Forme `pill`, texte `labelMedium`, hauteur confortable et padding horizontal de 8 à 12 points.
- Les badges d'espace utilisent Famille, Amis ou Équipe avec leur nom ou icône.
- Les badges d'état utilisent une couleur sémantique et un texte : « En direct », « Dernière position » ou « Hors ligne ».
- Un badge informe ; il ne remplace pas un bouton.
- Limiter le nombre de badges visibles sur une même carte.

## 14. États en direct

Trois états doivent être impossibles à confondre :

| État | Couleur | Présentation |
|---|---|---|
| En direct | Vert | Pastille, texte « En direct » et heure récente |
| Dernière position connue | Jaune ou texte secondaire | Libellé complet avec date et heure |
| Hors ligne | Gris moyen | Libellé « Hors ligne » et dernière mise à jour disponible |

Une pulsation douce peut accompagner l'état en direct. Elle s'arrête si l'utilisateur réduit les animations. Une donnée ancienne ne reçoit jamais de halo vert.

## 15. Bottom sheets

- Surface élevée, coins supérieurs `extraLarge` et poignée discrète.
- Titre `titleLarge`, contenu vertical et action principale proche du bas.
- Hauteur adaptée au contenu, avec défilement si nécessaire.
- Overlay sombre derrière la feuille sans masquer totalement le contexte.
- Geste de fermeture possible si aucune saisie importante ne risque d'être perdue.
- Respecter la zone sûre basse et l'ouverture du clavier.
- Utiliser `shadowLarge` uniquement pour renforcer la séparation avec la carte ou l'écran.

## 16. Navigation inférieure

- Entre trois et cinq destinations principales au maximum.
- Icône et libellé toujours visibles ; ne pas utiliser une icône seule pour une destination importante.
- Élément actif en indigo principal, éléments inactifs en gris moyen.
- Surface légèrement élevée avec bordure supérieure discrète.
- Hauteur confortable et respect de la zone sûre du téléphone.
- Un badge de notification doit rester rare, petit et compréhensible.
- La navigation ne doit pas masquer une action ou un contenu situé en bas d'écran.

## 17. Carte et marqueurs

- La carte reste lisible en mode sombre et ne concurrence pas les personnes.
- Le marqueur d'une personne utilise son avatar, un contour contrasté et éventuellement la couleur de son espace.
- La personne sélectionnée est agrandie légèrement et mise en avant par le indigo principal.
- L'état en direct peut employer `glowLive` avec retenue.
- Une dernière position connue porte un indicateur d'ancienneté ; elle ne ressemble jamais à un marqueur en direct.
- Les marqueurs regroupés affichent un nombre clair et s'ouvrent progressivement.
- Maison, Bureau et lieu personnalisé utilisent des icônes distinctes.
- Les commandes de carte ont une cible tactile de 48 points et `shadowSmall`.
- Les informations détaillées apparaissent dans une carte basse ou une bottom sheet, pas directement surchargées sur la carte.

## 18. Graphiques

- Utiliser des graphiques simples : anneau de progression, barre ou courbe courte.
- Montrer une valeur principale et son unité en texte, même si un graphique est présent.
- Utiliser bleu pour la donnée principale, vert pour un objectif atteint et gris pour le reste.
- Distinguer marche et motorisé par couleur, libellé et motif ou icône si nécessaire.
- Ne pas utiliser plus de quatre séries en même temps sur mobile.
- Les axes et légendes restent lisibles avec une taille de texte agrandie.
- Une animation de graphique doit durer peu de temps et ne jamais retarder l'accès à la valeur.

## 19. Défis et progression

- Une carte de défi montre le nom, la période, l'objectif, la progression et l'espace concerné.
- La progression personnelle est prioritaire avant le classement complet.
- Une barre utilise le indigo principal avant l'objectif et le vert lorsque l'objectif est atteint.
- Ne pas donner une apparence d'échec agressive à une progression faible.
- Le podium peut mettre en valeur les trois premiers avec sobriété, sans couleur métallique obligatoire.
- Le rang reste accompagné du prénom et de la valeur mesurée.
- Les célébrations sont courtes, chaleureuses et désactivables via la réduction des animations.

## 20. Assistant MIA

MIA doit sembler proche, clair et discret, pas robotique ni omniscient.

- Accent principal cyan, associé au mouvement et à l'assistance.
- Avatar ou symbole simple, différent d'un avatar humain.
- Réponses courtes, texte `bodyLarge` ou `bodyMedium` et donnée clé mise en valeur.
- Questions proposées sous forme de boutons capsules.
- Les réponses de position affichent toujours l'état et l'heure de la donnée.
- Une réponse peut proposer une action claire : « Voir sur la carte ».
- Si une information n'est pas autorisée, MIA l'explique calmement sans suggérer de contournement.
- Éviter les bulles multiples et les longs paragraphes sur téléphone.

## 21. Animations

- Les animations renforcent la compréhension d'un changement d'état.
- Durée courte : environ 150 à 250 ms pour une interaction, jusqu'à 400 ms pour une transition importante.
- Utiliser des accélérations douces, sans rebond excessif.
- Une carte sélectionnée peut monter ou grandir légèrement.
- Un état en direct peut pulser lentement avec une amplitude faible.
- Le chargement ne doit pas produire de mouvement agressif ou continu inutile.
- Respecter le réglage système de réduction des animations.
- Ne jamais animer une position ancienne comme si elle était actuelle.

## 22. Accessibilité

- Cible tactile minimale de 48 × 48 points.
- Contraste visuel suffisant pour le texte, les icônes et les états.
- Une couleur est toujours accompagnée d'un mot, d'une icône ou d'une forme.
- Le texte peut s'agrandir sans être coupé ni recouvrir une action.
- L'ordre de lecture suit l'ordre visuel et commence par l'information principale.
- Chaque icône interactive possède un nom compréhensible pour le lecteur d'écran.
- Les cartes et marqueurs donnent un résumé utile au lecteur d'écran.
- Les vibrations et sons restent complémentaires, jamais obligatoires pour comprendre.
- L'interface fonctionne avec la réduction des animations et un contraste renforcé.
- Le français reste simple, direct et sans jargon technique.

## 23. États vides

Un état vide doit expliquer ce qui manque et proposer une prochaine action utile.

Structure recommandée :

1. illustration ou icône calme et facultative ;
2. titre court ;
3. phrase d'explication ;
4. un bouton principal si une action est possible.

Exemple : « Personne sur la carte — Invitez un proche ou vérifiez vos autorisations de partage. »

Ne pas utiliser un ton alarmant pour une liste vide normale. Ne pas afficher une grande illustration si elle repousse l'action hors de l'écran.

## 24. Chargement

- Montrer un squelette lorsque la structure du contenu est connue.
- Utiliser un petit indicateur pour une action locale ou courte.
- Conserver la taille du contenu afin d'éviter les sauts visuels.
- Ne pas afficher `0`, « Hors ligne » ou une position précédente comme résultat définitif pendant le chargement.
- Indiquer une attente prolongée avec une phrase simple et une option pour réessayer si utile.
- Bloquer seulement les actions concernées, pas l'écran entier sans nécessité.
- Éviter plusieurs indicateurs animés concurrents.

## 25. Erreurs

- Dire ce qui s'est passé en langage simple.
- Expliquer ce que l'utilisateur peut faire ensuite.
- Conserver les informations saisies lorsque c'est sûr.
- Utiliser le rouge pour l'erreur elle-même, pas pour colorer tout l'écran.
- Une erreur de réseau peut proposer « Réessayer ».
- Une permission refusée doit proposer une explication ou l'ouverture des réglages, sans culpabiliser.
- Une donnée de position indisponible ne doit jamais être remplacée par une estimation non signalée.
- Les erreurs graves peuvent utiliser un dialogue ; les erreurs locales restent près de l'élément concerné.

## 26. Mode sombre

Le mode sombre est l'expérience officielle prioritaire de Miaraka.

- Fond bleu nuit, jamais noir pur pour les écrans principaux.
- Surfaces bleu profond permettant une profondeur calme.
- Texte principal blanc et texte secondaire légèrement bleuté.
- Bordures blanches transparentes et légères.
- Bleu, cyan et vert utilisés comme accents limités.
- Les photographies et la carte doivent rester naturelles, sans filtre bleu excessif.
- Tester toutes les transparences sur leur véritable fond.
- La barre système et les zones sûres doivent prolonger le fond de l'écran.

## 27. Mode clair futur

La palette claire existe déjà dans `colors.ts`, mais son activation n'appartient pas à cette étape.

- Fond gris bleuté très clair et surfaces blanches.
- Texte bleu nuit pour conserver l'identité Miaraka.
- Couleurs sémantiques légèrement assombries afin d'assurer le contraste sur fond clair.
- Bordures plus visibles, ombres plus légères.
- Les mêmes espacements, rayons et styles typographiques sont conservés.
- Avant activation, chaque écran et état devra être vérifié séparément en accessibilité et sur appareil réel.

## 28. Règles à ne jamais enfreindre

1. Ne jamais présenter une ancienne position comme une position en direct.
2. Ne jamais utiliser la couleur seule pour transmettre une information.
3. Ne jamais réduire une cible tactile sous 48 × 48 points pour gagner de la place.
4. Ne jamais inventer une nouvelle couleur, un espacement ou un rayon si un token officiel convient.
5. Ne jamais afficher deux actions principales concurrentes dans la même zone.
6. Ne jamais surcharger une carte avec des textes, badges et boutons inutiles.
7. Ne jamais utiliser un halo « En direct » pour une donnée en attente ou hors ligne.
8. Ne jamais sacrifier le contraste ou la taille du texte à l'esthétique.
9. Ne jamais employer une animation qui empêche de lire, de toucher ou de comprendre.
10. Ne jamais donner à MIA une apparence omnisciente ou intrusive.
11. Ne jamais copier directement l'apparence d'une autre application.
12. Ne jamais utiliser le Design System pour suggérer une fonction qui n'existe pas.

## Référence des fichiers

| Fichier | Contenu |
|---|---|
| `src/theme/colors.ts` | Palette fondatrice, transparences, thèmes sombre et clair, couleurs d'espaces |
| `src/theme/spacing.ts` | Échelle officielle de 4 à 64 points |
| `src/theme/typography.ts` | Neuf styles utilisant la police système |
| `src/theme/radius.ts` | Six rayons officiels |
| `src/theme/shadows.ts` | Ombres et halos pour le web, Android et iOS |
| `src/theme/index.ts` | Point d'entrée unique du Design System |

Ce socle définit les règles et valeurs visuelles. Il ne crée aucun composant et ne modifie aucun écran existant.
