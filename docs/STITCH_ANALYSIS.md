# Analyse des maquettes Google Stitch

## Périmètre et méthode

Ce document analyse les 17 fichiers `design-references/screen-01.html` à `design-references/screen-17.html`. Ces fichiers sont traités uniquement comme des références visuelles et fonctionnelles : leur HTML, leurs classes CSS et leurs scripts ne doivent pas être copiés dans l'application React Native. En revanche, leurs informations, leurs textes et leurs choix de couleurs constituent des références à conserver lors des futures reconstructions.

L'analyse compare chaque maquette au Design System Miaraka (`docs/DESIGN_SYSTEM.md`) et aux composants actuellement présents dans `src/`. Les mentions **existant**, **à adapter** et **à reconstruire** décrivent l'écart fonctionnel observé ; elles ne constituent pas une modification du code.

### Lecture générale

- L'identité la plus cohérente avec Miaraka est : fond bleu nuit `#06142B` ou `#071424`, surface `#0C2147`, vert `#29D391` / `#3EE09D`, cyan `#38D6E8`, bleu `#4F8CFF`, blanc et gris bleutés.
- Les références contiennent aussi une palette olive Stitch (`#12140A`, `#C9F23B`, `#AED518`, etc.). Cette palette est volontairement conservée comme direction visuelle, même si tous ses rôles ne sont pas encore décrits dans le Design System actuel.
- Les textes, données fictives, statuts, libellés et informations visibles dans les maquettes sont également conservés comme référence produit. Ils pourront être centralisés et traduits, mais leur intention ne doit pas être supprimée.
- Les maquettes utilisent Inter et Material Symbols. Le Design System actuel privilégie la police système. Les icônes devront être remappées vers le système d'icônes retenu par l'application, sans ajouter automatiquement une dépendance.
- Les écrans partagent une structure forte : barre supérieure, cartes sombres, accents lumineux, grands boutons arrondis, navigation basse et bouton central MIA.
- La cible tactile du Design System est de 48 px. Elle doit primer sur les références Stitch qui emploient parfois 40 ou 44 px.
- Les animations permanentes doivent rester discrètes et respecter la préférence système de réduction des animations.

## 1. Analyse écran par écran

### Écran 01 — Lancement Miaraka

**Référence :** `screen-01.html`  
**Nom proposé :** `SplashScreen` — Écran de lancement  
**Objectif :** installer immédiatement la marque pendant le chargement initial et signaler que l'application démarre.

- **Composants principaux :** fond atmosphérique, logo Miaraka central, symbole de localisation et de personnes, nom de la marque, signature, barre de progression et libellé de chargement.
- **Couleurs :** bleu nuit `#06142B`, blanc, dégradé vert `#3EE09D` → cyan `#38D6E8` → bleu `#4F8CFF`.
- **Cartes :** aucune ; la composition est volontairement ouverte et centrée.
- **Boutons :** aucun.
- **Bottom sheet :** aucun.
- **Animations :** apparition progressive du contenu, légère montée/échelle du logo, halo pulsé, progression linéaire de la barre.
- **Transitions :** fondu vers l'écran suivant une fois le chargement terminé.
- **Interactions :** aucune interaction obligatoire ; l'avancement est automatique.
- **Icônes :** `location_on`, `person`, combinées dans le logo illustratif.
- **État dans l'application :** `AnimatedSplashOverlay` et `AnimatedIcon` existent. Le mouvement est réutilisable, mais l'habillage devra être adapté pour correspondre à cette identité Miaraka.

### Écran 02 — Onboarding : cercle proche

**Référence :** `screen-02.html`  
**Nom proposé :** `OnboardingConnectionsScreen` — Restez proche  
**Objectif :** expliquer que famille, amis et équipe sont regroupés dans des espaces privés.

- **Composants principaux :** logo, point central de localisation, quatre avatars reliés, titre, texte explicatif, indicateurs de progression, action principale et lien de passage.
- **Couleurs :** fond `#071424`, vert `#29D391` / `#3EE09D`, cyan, bleu `#4F8CFF`, bleu clair `#AFC6FF`, texte blanc/gris bleuté.
- **Cartes :** avatars circulaires et petits panneaux translucides ; pas de grande carte de contenu.
- **Boutons :** `Continuer` en bouton principal arrondi ; `Passer` en action texte.
- **Bottom sheet :** aucun.
- **Animations :** apparition décalée des avatars, flottement doux, pulsation du point central, tracé progressif des lignes de connexion.
- **Transitions :** passage horizontal ou fondu vers l'étape suivante ; morphing de l'indicateur actif.
- **Interactions :** continuer, passer l'introduction.
- **Icônes :** `location_on` ; les personnes sont représentées par des photos/avatars.
- **État dans l'application :** `OnboardingScreen`, `ProgressDots` et `ConnectedPeopleVisual` existent et constituent une base directe à adapter.

### Écran 03 — Onboarding : localisation autorisée

**Référence :** `screen-03.html`  
**Nom proposé :** `OnboardingLocationScreen` — Déplacements autorisés  
**Objectif :** présenter la carte, la dernière position connue et l'estimation d'arrivée, tout en insistant sur l'autorisation de partage.

- **Composants principaux :** carte stylisée plein écran, trajet courbe, marqueurs origine/destination, badge `15 min`, panneau de texte, progression et navigation.
- **Couleurs :** fond `#06142B` / `#071424`, trajet cyan `#38D6E8`, origine bleue `#4F8CFF`, destination verte `#29D391`, bleu clair `#AFC6FF`.
- **Cartes :** badge ETA flottant et panneau inférieur en verre sombre.
- **Boutons :** `Continuer`, `Retour`, `Passer`.
- **Bottom sheet :** pas de sheet interactive ; le panneau inférieur en reprend seulement le langage visuel.
- **Animations :** tracé en pointillés du trajet, pulsation des marqueurs, apparition du badge ETA.
- **Transitions :** glissement/fondu du panneau et transition vers les étapes adjacentes.
- **Interactions :** continuer, revenir, passer ; aucune vraie interaction cartographique attendue dans l'onboarding.
- **Icônes :** `timer` et marqueurs de carte.
- **État dans l'application :** `OnboardingScreen` et `MapVisual` existent ; la carte illustrée et le trajet doivent être harmonisés avec cette référence.

### Écran 04 — Onboarding : bouger ensemble

**Référence :** `screen-04.html`  
**Nom proposé :** `OnboardingChallengesScreen` — Défis collectifs  
**Objectif :** montrer la dimension motivante des défis et du classement entre proches.

- **Composants principaux :** titre, carte de distance, classement hebdomadaire à trois participants, progressions, badge de réussite, pagination.
- **Couleurs :** fond sombre, vert/olive très lumineux Stitch, bleu clair et blanc. Cette combinaison doit être conservée comme référence pour cet écran.
- **Cartes :** carte flottante de distance, grande carte de classement, lignes de participants.
- **Boutons :** `Continuer`, `Retour`, `Passer`.
- **Bottom sheet :** aucun.
- **Animations :** entrée décalée des lignes, remplissage des barres, léger rebond du trophée, halo/pulsation sur la réussite.
- **Transitions :** fondu ou glissement entre les pages d'onboarding ; animation de l'indicateur actif.
- **Interactions :** continuer, revenir, passer.
- **Icônes :** `bolt`, `trending_up`, `emoji_events`, `chevron_left`.
- **État dans l'application :** `ChallengeVisual` et son `RankingRow` existent ; ils peuvent être adaptés, sans dupliquer le classement déjà présent dans les Défis.

### Écran 05 — Onboarding : contrôle et permissions

**Référence :** `screen-05.html`  
**Nom proposé :** `OnboardingPrivacyScreen` — Vous gardez le contrôle  
**Objectif :** rassurer et expliquer les trois catégories d'autorisation avant l'entrée dans l'application.

- **Composants principaux :** illustration de confidentialité, trois cartes de permission, interrupteurs, badge de chiffrement et navigation.
- **Couleurs :** fond sombre, vert `#29D391` / `#3EE09D`, bleu `#4F8CFF`, surfaces sombres, blanc et gris secondaires.
- **Cartes :** `Localisation — Indispensable`, `Notifications — Recommandé`, `Activité physique — Optionnel` ; chacune possède une icône, un texte court et un état.
- **Boutons :** `Continuer`, `Retour` ; interrupteurs dans chaque carte.
- **Bottom sheet :** aucun ; pied d'écran fixe translucide.
- **Animations :** pulsation du bouclier, apparition légère des cartes, déplacement du pouce des interrupteurs, petite mise à l'échelle de l'illustration.
- **Transitions :** changement d'état en 200 ms environ ; passage d'écran par fondu/glissement.
- **Interactions :** activer/désactiver les choix fictifs, continuer, revenir.
- **Icônes :** `shield_lock`, `location_on`, `notifications`, `directions_walk`, `verified_user`, `chevron_right`.
- **État dans l'application :** `PrivacyVisual` et ses cartes existent. Les états restent locaux et ne doivent pas déclencher de vraies permissions à ce stade.

### Écran 06 — Onboarding : assistant MIA

**Référence :** `screen-06.html`  
**Nom proposé :** `OnboardingMiaScreen` — Demandez à MIA  
**Objectif :** démontrer en une scène simple le principe de l'assistant vocal.

- **Composants principaux :** ambiance lumineuse, avatar de Rica, bouton micro, anneaux, onde vocale, bulle de réponse fictive, progression.
- **Couleurs :** fond `#071424`, vert `#3EE09D`, bleu `#4F8CFF`, bleu clair `#AFC6FF`, blanc.
- **Cartes :** bulle de réponse en verre sombre avec petite pointe et horodatage.
- **Boutons :** grand bouton micro, `Continuer`, `Retour`, `Passer`.
- **Bottom sheet :** aucun ; pied fixe en dégradé sombre.
- **Animations :** anneaux de pulsation, barres de l'onde vocale, flottement discret de l'avatar, apparition de la réponse.
- **Transitions :** micro enfoncé/relâché, entrée de la bulle, passage vers l'étape suivante.
- **Interactions :** appui fictif sur le micro, continuer, revenir, passer.
- **Icônes :** `auto_awesome`, `mic`, `arrow_back`.
- **État dans l'application :** `MiaVisual` existe pour l'onboarding ; le comportement reste une démonstration locale.

### Écran 07 — Carte et cercle de proximité

**Référence :** `screen-07.html`  
**Nom proposé :** `MapHomeScreen` — Carte  
**Objectif :** donner une vue immédiate des personnes autorisées, de leur groupe et de leur position ou zone connue.

- **Composants principaux :** carte plein écran, barre de recherche, notification, filtres `Tous/Famille/Amis/Équipe`, marqueurs individuels, groupe de marqueurs, contrôles de carte, navigation basse et bouton MIA.
- **Couleurs :** carte assombrie, fond `#06142B`, vert `#29D391`, bleu `#4F8CFF`, bleu clair `#AFC6FF`, surfaces translucides.
- **Cartes :** étiquettes de personnes reliées aux marqueurs ; barre de recherche et filtres en verre sombre.
- **Boutons :** filtres, notifications, recentrage, ma position, ajout, MIA, cinq destinations de navigation.
- **Bottom sheet :** aucun dans cette vue initiale ; un appui sur une personne mène logiquement à l'écran 09.
- **Animations :** pulsation des personnes actives, halo MIA, changement visuel du filtre, apparition ou sélection d'un marqueur.
- **Transitions :** filtres par fondu/échelle, sélection de marqueur puis ouverture de la fiche personne, changement d'onglet dans la navigation basse.
- **Interactions :** rechercher, filtrer, sélectionner une personne ou un groupe, recentrer, afficher sa position, ajouter une personne, ouvrir MIA, naviguer.
- **Icônes :** `search`, `notifications`, `center_focus_strong`, `my_location`, `add`, `mic`, `map`, `switch_account`, `emoji_events`, `person`.
- **État dans l'application :** `DemoHeader`, `DemoMap`, `DemoTabBar`, `PersonSheet` et `InvitePersonSheet` couvrent déjà l'ossature. L'ensemble est à adapter pour unifier recherche, filtres, marqueurs et contrôles.

### Écran 08 — Bienvenue et choix d'accès

**Référence :** `screen-08.html`  
**Nom proposé :** `WelcomeScreen` — Bienvenue dans Miaraka  
**Objectif :** conclure l'onboarding et proposer l'entrée dans la démonstration ou les options d'authentification futures.

- **Composants principaux :** logo, illustration principale, titre, signature, sélecteur de langue, bloc d'actions, message de sécurité et liens légaux.
- **Couleurs :** fond `#06142B` / `#071424`, vert et bleu Miaraka, blanc ; couleurs Google officielles uniquement dans le pictogramme Google.
- **Cartes :** panneau d'actions inférieur, options secondaires compactes et capsule de sécurité.
- **Boutons :** langue, `Continuer avec Google`, `Voir la démonstration`, `Email`, `Apple`, liens légaux.
- **Bottom sheet :** aucun.
- **Animations :** flottement de l'illustration, pulsation et onde légère autour du visuel, retour visuel à l'appui.
- **Transitions :** entrée dans la démonstration ; changement immédiat de langue ; éventuel fondu depuis la dernière étape.
- **Interactions :** choisir la langue, ouvrir la démonstration, sélectionner une méthode future, consulter les informations légales.
- **Icônes :** `shield_with_heart`, `language`, `play_circle`, `mail`, `file_download`, `verified_user`, logos Google/Apple.
- **État dans l'application :** l'écran d'accueil `src/app/index.tsx` et le parcours d'onboarding existent. Les méthodes non fonctionnelles doivent rester clairement fictives tant que l'authentification n'est pas configurée.

### Écran 09 — Fiche d'une personne

**Référence :** `screen-09.html`  
**Nom proposé :** `PersonLocationSheet` — Détail de position  
**Objectif :** afficher les informations utiles d'une personne sélectionnée sans quitter complètement la carte.

- **Composants principaux :** carte assombrie, bottom sheet avec poignée, avatar, nom, lieu, statut en direct, batterie, moyen de déplacement, ETA, statistiques et actions.
- **Couleurs :** fond `#06142B`, surface sombre, bleu clair `#AFC6FF`, accents vert/bleu, texte blanc/gris.
- **Cartes :** bannière de statut, grille bento pour pas et distance, bloc d'identité.
- **Boutons :** fermer, `Voir le trajet`, `Définir destination`, `Fermer`, MIA et navigation basse.
- **Bottom sheet :** élément central de l'écran ; état ouvert et état réduit, poignée et fond de carte conservé.
- **Animations :** pulsation du statut actif, halo MIA.
- **Transitions :** ouverture/fermeture verticale avec courbe douce de 400 ms dans la référence ; réduction possible à une poignée visible ; fondu de l'arrière-plan.
- **Interactions :** fermer ou réduire la fiche, voir le trajet, définir une destination fictive, ouvrir MIA, changer d'onglet.
- **Icônes :** `notifications`, `motorcycle`, `location_on`, `sensors`, `battery_horiz_075`, `close`, `navigation`, `footprint`, `distance`, `route`, `flag`, `mic`, icônes de navigation.
- **État dans l'application :** `PersonSheet` existe et doit être généralisé plutôt que remplacé par du HTML reproduit.

### Écran 10 — Tableau de bord Activité

**Référence :** `screen-10.html`  
**Nom proposé :** `ActivityDashboardScreen` — Activité  
**Objectif :** résumer l'activité personnelle ou celle d'une personne autorisée sur plusieurs périodes.

- **Composants principaux :** en-tête, segments `Aujourd'hui/Semaine/Mois`, sélecteur de personne, anneau de progression, métriques, histogramme hebdomadaire, liste des trajets, navigation et MIA.
- **Couleurs :** fond `#071424`, vert `#29D391`, bleu `#4F8CFF`, bleu clair `#AFC6FF`, surfaces sombres et couleur d'erreur pour les calories.
- **Cartes :** grande carte de progression, quatre mini-cartes de métriques, carte de graphique, lignes de trajets.
- **Boutons :** notification, segments de période, avatars, ajout de personne, lignes de détail, MIA et navigation basse.
- **Bottom sheet :** aucun ; la sélection avancée d'une personne pourrait en utiliser un ultérieurement, mais elle n'est pas représentée ici.
- **Animations :** remplissage de l'anneau, montée des barres sur une seconde dans la référence, changement de segment, mise en évidence du jour actif.
- **Transitions :** contenu croisé lors du changement de période/personne, appui des cartes, navigation d'onglet.
- **Interactions :** choisir une période, une personne, ajouter quelqu'un, ouvrir un trajet, ouvrir les notifications ou MIA.
- **Icônes :** `notifications`, `chevron_right`, `add`, `directions_walk`, `directions_car`, `local_fire_department`, `emoji_events`, `commute`, `verified`, `mic`, icônes de navigation.
- **État dans l'application :** `ActivityScreen` et son `MetricCard` existent. Le sélecteur de personne, l'histogramme et les détails devront être adaptés ou complétés.

### Écran 11 — Ajouter une personne et gérer les invitations

**Référence :** `screen-11.html`  
**Nom proposé :** `PeopleInvitationsScreen` — Ajouter une personne  
**Objectif :** rechercher une personne et suivre les invitations reçues ou envoyées.

- **Composants principaux :** retour, titre, champ de recherche, onglets reçues/envoyées, cartes d'invitation, état d'aide et navigation basse.
- **Couleurs :** fond `#071424`, vert `#29D391`, bleu `#4F8CFF`, bleu clair `#AFC6FF`, surfaces sombres.
- **Cartes :** une carte par contact/invitation avec avatar, nom, contexte, statut et action ; carte d'information en fin de liste.
- **Boutons :** retour, recherche/contacts, deux onglets, accepter/refuser/relancer selon l'état, navigation basse.
- **Bottom sheet :** aucun dans la référence ; il s'agit d'un écran complet.
- **Animations :** déplacement de l'indicateur d'onglet, fondu de la liste, réduction légère des cartes et boutons à l'appui.
- **Transitions :** navigation retour ; transition entre invitations reçues et envoyées ; confirmation visuelle après action.
- **Interactions :** saisir une recherche, changer d'onglet, accepter/refuser ou consulter une invitation, ouvrir un contact.
- **Icônes :** `arrow_back`, `search`, `contacts`, ainsi que les icônes de navigation basse.
- **État dans l'application :** `InvitePersonSheet` existe sous forme de feuille. La référence demande une expérience plus complète avec deux listes ; une reconstruction de l'écran est donc nécessaire, en réutilisant ses données et actions.

### Écran 12 — Défis et classement

**Référence :** `screen-12.html`  
**Nom proposé :** `ChallengesScreen` — Défis  
**Objectif :** afficher le défi principal, la progression collective, le classement et permettre d'en créer un.

- **Composants principaux :** en-tête, carte héro du défi, objectif collectif, barre de progression, podium/liste classée, CTA de création, navigation et MIA.
- **Couleurs :** fond `#06142B`, vert `#29D391` / `#3EE09D`, bleu `#4F8CFF`, bleu clair `#AFC6FF`, surfaces sombres.
- **Cartes :** grande carte de défi, lignes classées de participants, carte/zone de création.
- **Boutons :** notification, `Voir tout`, `Créer un défi`, ligne de défi, MIA et navigation basse.
- **Bottom sheet :** aucun affiché ; la création peut ouvrir une sheet existante.
- **Animations :** progression qui se remplit, pulsation légère du trophée ou du défi actif, entrée décalée du classement, halo au survol/appui.
- **Transitions :** ouverture du classement complet, ouverture du formulaire de création, navigation basse.
- **Interactions :** consulter le défi, ouvrir le classement, créer un défi, sélectionner un participant.
- **Icônes :** `notifications`, `groups`, `chevron_right`, `add_circle`, `mic`, icônes de navigation.
- **État dans l'application :** `ChallengesScreen`, `ParticipantRow`, `ProgressBar`, `AchievementPulse` et `CreateChallengeSheet` existent. Ils sont à harmoniser avec la hiérarchie de cette référence.

### Écran 13 — Liste des Espaces

**Référence :** `screen-13.html`  
**Nom proposé :** `SpacesScreen` — Espaces  
**Objectif :** séparer clairement Famille, Amis et Équipe, afficher leurs indicateurs et proposer les actions de gestion.

- **Composants principaux :** en-tête, résumé, trois cartes d'espace, avatars superposés, compteurs, lieu, niveau de partage, actions principales, navigation et MIA.
- **Couleurs :** fond `#06142B`, surface `#0C2147`, vert `#29D391`, bleu clair `#AFC6FF`, blanc/gris ; chaque type peut recevoir un accent distinct issu des tokens de groupe.
- **Cartes :** `Famille`, `Amis`, `Équipe XR`, avec membre(s), actifs, lieu principal et partage.
- **Boutons :** `Créer un espace`, `Inviter un membre`, chaque carte, notification, MIA et navigation basse.
- **Bottom sheet :** aucun affiché ; les deux actions peuvent ouvrir les sheets existantes.
- **Animations :** entrée décalée des cartes, pulsation des membres actifs, légère variation de lumière au survol/appui.
- **Transitions :** ouverture du détail d'espace, ouverture des formulaires, navigation basse.
- **Interactions :** ouvrir un espace, créer, inviter, consulter les notifications, appeler MIA.
- **Icônes :** `notifications`, `add_circle`, `person_add`, `family_restroom`, `location_on`, `groups`, `map`, `architecture`, `business`, `mic`, icônes de navigation.
- **État dans l'application :** `SpacesScreen`, `SpaceDetailScreen`, `CreateSpaceSheet`, `InviteSpaceMemberSheet` et `spaces-data` existent. C'est l'un des ensembles les plus complets ; il reste surtout à harmoniser les cartes et les états visuels.

### Écran 14 — Assistant MIA

**Référence :** `screen-14.html`  
**Nom proposé :** `MiaAssistantScreen` — Assistant vocal  
**Objectif :** offrir un point central pour poser une question et afficher une réponse fictive contextualisée.

- **Composants principaux :** barre supérieure, historique, réponse en verre, orbite de micro, anneaux, onde vocale, suggestions de questions, navigation basse.
- **Couleurs :** surfaces sombres, vert/olive lumineux Stitch, blanc et gris. Cette palette doit être conservée avec le dégradé vert-cyan-bleu Miaraka.
- **Cartes :** grande bulle de réponse et trois cartes de suggestion.
- **Boutons :** historique, notification, micro, chaque suggestion, navigation basse.
- **Bottom sheet :** aucun ; écran dédié plein format.
- **Animations :** anneaux de pulsation, onde vocale, halo du micro, entrée de la réponse et des suggestions.
- **Transitions :** états `repos → écoute → traitement → réponse`, ouverture de l'historique, changement d'onglet.
- **Interactions :** maintenir/appuyer pour parler, choisir une suggestion, revoir l'historique, naviguer.
- **Icônes :** `notifications`, `history`, `mic`, `arrow_forward_ios`, icônes de navigation.
- **État dans l'application :** il n'existe pas d'écran MIA complet. Seuls `MiaVisual` et le bouton MIA de `DemoTabBar` peuvent être réutilisés ; cet écran devra être reconstruit.

### Écran 15 — Profil et paramètres

**Référence :** `screen-15.html`  
**Nom proposé :** `ProfileSettingsScreen` — Profil et paramètres  
**Objectif :** regrouper les informations du compte, le partage de position, la visibilité par espace, les notifications, la confidentialité et l'application.

- **Composants principaux :** carte profil, sections titrées, lignes de réglage, interrupteurs, niveaux de visibilité, version, déconnexion, navigation et MIA.
- **Couleurs :** fond `#071424`, bleu clair `#AFC6FF`, surfaces sombres, vert pour les états actifs, rouge d'erreur pour les actions dangereuses.
- **Cartes :** carte de profil ; groupes Compte, Localisation, Visibilité, Notifications/Confidentialité, Application.
- **Boutons :** modifier, lignes ouvrant un détail, interrupteurs, déconnexion, notification, MIA et navigation basse.
- **Bottom sheet :** aucun visible, mais plusieurs lignes sont conçues pour ouvrir une fenêtre ou une sheet de réglage.
- **Animations :** déplacement du pouce des interrupteurs, changement de couleur des états, retour tactile des lignes.
- **Transitions :** ouverture des fenêtres de profil/permissions/pause, confirmation de déconnexion, navigation basse.
- **Interactions :** modifier le profil, changer la langue, gérer la localisation, ajuster la visibilité par espace, régler les notifications, suspendre le partage, changer de thème, se déconnecter.
- **Icônes :** `notifications`, `edit`, `person`, `chevron_right`, `image`, `language`, `my_location`, `gps_fixed`, `family_restroom`, `group`, `work`, `notifications_active`, `privacy_tip`, `dark_mode`, `info`, `logout`, `mic`, icônes de navigation.
- **État dans l'application :** `ProfileScreen`, `ToggleRow`, `InfoRow`, `ActionRow`, `PermissionChip` et les quatre composants de `profile-modals.tsx` existent. L'écran est largement présent et doit surtout être normalisé en composants partagés.

### Écran 16 — Chargement du tableau de bord

**Référence :** `screen-16.html`  
**Nom proposé :** `DashboardLoadingState` — État de chargement  
**Objectif :** conserver la structure de l'interface pendant le chargement et rassurer l'utilisateur lors d'une écoute MIA.

- **Composants principaux :** en-tête, carte stylisée, marqueur pulsé, blocs squelette d'activité et de défi, capsule `MIA écoute`, navigation et bouton MIA.
- **Couleurs :** fond `#06142B`, surface `#0C2147`, squelette `#142031`, accent bleu clair `#AFC6FF`, blanc atténué.
- **Cartes :** squelettes reprenant exactement les futures cartes, sans contenu fictif trompeur.
- **Boutons :** navigation et MIA restent visibles ; les actions de contenu sont désactivées pendant le chargement.
- **Bottom sheet :** aucun ; la capsule MIA est un panneau flottant de statut.
- **Animations :** scintillement horizontal `shimmer`, pulsation du marqueur, animation d'écoute MIA et onde vocale.
- **Transitions :** fondu croisé du squelette vers le contenu réel ; apparition/disparition de la capsule MIA.
- **Interactions :** navigation possible selon la stratégie produit ; annulation ou fin d'écoute MIA à prévoir explicitement.
- **Icônes :** `notifications`, `mic`, icônes de navigation.
- **État dans l'application :** aucun composant de squelette partagé n'a été identifié. Les états doivent être reconstruits avec des primitives réutilisables.

### Écran 17 — Centre des états vides et erreurs

**Référence :** `screen-17.html`  
**Nom proposé :** `InterfaceStatesGallery` — Référence des états d'interface  
**Objectif :** documenter les cas où une zone n'a pas encore de contenu ou ne peut pas fonctionner. Ce fichier ressemble davantage à une planche de référence qu'à un écran final unique.

- **Composants principaux :** en-tête `Centre d'États`, quatre cartes illustrées, actions de résolution, navigation et MIA.
- **Couleurs :** fond `#06142B`, vert `#29D391`, bleu `#4F8CFF`, bleu clair `#AFC6FF`, rouge/jaune sémantiques selon le problème.
- **Cartes :** aucune personne à proximité ; aucun défi actif ; position désactivée ; GPS indisponible.
- **Boutons :** inviter quelqu'un, créer un défi, activer le partage, réessayer, consulter l'aide, navigation et MIA.
- **Bottom sheet :** aucun.
- **Animations :** entrée douce de l'état, pulsation limitée de l'illustration, retour visuel sur réessayer, halo discret de MIA.
- **Transitions :** remplacement de l'état après l'action, ouverture du flux concerné, passage vers l'aide.
- **Interactions :** chaque carte fournit une action principale contextualisée et parfois une action secondaire.
- **Icônes :** `notifications`, `group_add`, `emoji_events`, `security`, `shield_person`, `satellite_alt`, `refresh`, `help_outline`, `mic`, icônes de navigation.
- **État dans l'application :** aucune bibliothèque centralisée d'états vides/erreurs n'a été identifiée. Il faut reconstruire ces états comme composants, puis les insérer dans les écrans concernés plutôt que créer un `Centre d'États` visible par les utilisateurs.

## 2. Composants réutilisables à créer

Ces composants sont proposés pour éviter de reconstruire la même structure dans plusieurs écrans. Ils devront utiliser les tokens de `src/theme` et non les valeurs générées par Stitch.

### Structure et navigation

- `AppScreen` : gestion commune du fond, des zones sûres, de la largeur maximale Web et des espacements.
- `TopAppBar` : titre/logo, retour, notification et action contextuelle.
- `BottomNavigation` : cinq destinations, état actif et réservation centrale pour MIA. Il devra généraliser `DemoTabBar` plutôt que le dupliquer.
- `MiaFloatingButton` : bouton micro avec états repos, écoute, traitement et réponse.
- `OnboardingLayout` : visuel, titre, texte, progression, retour, continuer et passer.
- `ActionFooter` : pied fixe avec dégradé/scrim, adapté aux zones sûres.

### Primitives d'interface

- `SurfaceCard` et `GlassCard` : cartes pleines ou translucides, bordure, rayon, ombre et état pressé.
- `PrimaryButton`, `SecondaryButton`, `GhostButton`, `DangerButton` et `IconButton` : variantes cohérentes, avec état désactivé et chargement.
- `SettingsRow` et `ToggleRow` : ligne de paramètre accessible, icône, titre, valeur, description et interrupteur optionnel.
- `SegmentedControl` et `FilterChip` : périodes, groupes et onglets d'invitations.
- `SearchField` : recherche avec icône, effacement et état de focus.
- `Avatar`, `AvatarStack` et `PresenceDot` : tailles et bordures normalisées.
- `StatusBadge` : en direct, dernière position, hors ligne, recommandé, optionnel et erreur.
- `ProgressBar`, `RingProgress` et `ProgressDots` : progression linéaire, circulaire et onboarding.

### Composants métier

- `PersonMarker` et `PersonClusterMarker` : marqueurs accessibles, sélection et statut.
- `MapControls` : recentrer, ma position et ajouter.
- `PersonListRow` et `InvitationCard` : personne, contexte, statut et actions.
- `PersonSelector` : liste horizontale d'avatars avec ajout.
- `MetricCard`, `ActivityChart` et `TripRow` : activité, histogramme et détail de trajet.
- `RankingRow`, `ChallengeCard` et `AchievementBadge` : défis et classement.
- `SpaceCard`, `SpaceSummary` et `SharingLevelBadge` : cartes Famille/Amis/Équipe.
- `PermissionCard` et `SpaceVisibilityRow` : permissions générales et réglages par espace.
- `VoiceWaveform`, `MiaResponseBubble` et `SuggestionCard` : expérience MIA.

### États, retours et panneaux

- `BottomSheet` : fond, poignée, fermeture, états ouvert/réduit et animation commune. Les sheets existantes devraient converger vers cette base.
- `ModalShell` : dialogue accessible pour les formulaires et confirmations.
- `EmptyState` : illustration, titre, texte court et action.
- `ErrorState` : erreur, action de reprise et lien d'aide optionnel.
- `SkeletonBlock`, `SkeletonCard` et `ScreenSkeleton` : chargement cohérent.
- `InlineMessage` ou `Toast` : invitation envoyée, réglage enregistré, action impossible.

## 3. Composants déjà existants

### Fondations du Design System

- `src/theme/colors.ts` : palette, couleurs sémantiques, transparences et couleurs de groupe.
- `src/theme/spacing.ts` : échelle d'espacement.
- `src/theme/typography.ts` : styles typographiques.
- `src/theme/radius.ts` : rayons.
- `src/theme/shadows.ts` : ombres et halos.
- `ThemedText` et `ThemedView` : primitives thémées de base.

### Lancement et onboarding

- `AnimatedSplashOverlay` et `AnimatedIcon` : lancement animé sur natif et Web.
- `OnboardingScreen` et `ProgressDots` : structure et navigation de l'onboarding.
- `ConnectedPeopleVisual`, `MapVisual`, `ChallengeVisual`, `MiaVisual`, `PrivacyVisual` : cinq illustrations déjà codées.

### Démonstration principale

- `DemoHeader` : en-tête et filtres de la carte.
- `DemoMap` et son marqueur : carte fictive et sélection d'une personne.
- `DemoTabBar` : navigation basse et entrée MIA.
- `PersonSheet` : détail d'une personne.
- `InvitePersonSheet` : invitation d'une personne.
- `ActivityScreen` et `MetricCard` : écran Activité.
- `ChallengesScreen`, `ParticipantRow`, `ProgressBar`, `AchievementPulse` et `CreateChallengeSheet` : défis.
- `SpacesScreen`, `SpaceCard`, `SpaceDetailScreen`, `CreateSpaceSheet`, `InviteSpaceMemberSheet` et `spaces-data` : espaces.
- `ProfileScreen`, `Section`, `ToggleRow`, `InfoRow`, `ActionRow`, `PermissionChip` et les fenêtres de `profile-modals.tsx` : profil et paramètres.

### Limite actuelle

La plupart de ces composants sont attachés à un écran particulier et contiennent leurs styles localement. Ils sont fonctionnellement réutilisables, mais pas encore organisés comme une bibliothèque de primitives commune. La reconstruction future devrait d'abord extraire les éléments partagés, puis adapter les écrans un par un.

## 4. Écrans qui devront être reconstruits

| Référence | Niveau estimé | Justification |
|---|---|---|
| 01 — Lancement | À adapter | Animation existante, identité visuelle à rapprocher de la référence. |
| 02 — Cercle proche | À adapter | Structure et illustration existent déjà. |
| 03 — Localisation | À adapter | Visuel existant, trajet et hiérarchie à harmoniser. |
| 04 — Défis onboarding | À adapter | Classement et progressions existent. |
| 05 — Permissions | À adapter | Cartes fictives déjà présentes, styles/états à normaliser. |
| 06 — MIA onboarding | À adapter | Illustration MIA existante. |
| 07 — Carte | Reconstruction partielle | Ossature existante ; recherche, contrôles, marqueurs et états doivent être unifiés. |
| 08 — Bienvenue | Reconstruction partielle | Accueil/onboarding présents ; composition finale et options d'accès à harmoniser. |
| 09 — Fiche personne | Reconstruction partielle | `PersonSheet` existe ; il faut généraliser la sheet et compléter les états. |
| 10 — Activité | Reconstruction partielle | Écran existant ; sélecteur, graphique et détails doivent être rapprochés de la référence. |
| 11 — Invitations | À reconstruire | La version existante est une sheet plus simple, sans les deux onglets complets. |
| 12 — Défis | Reconstruction partielle | Écran et création existent ; mise en page héro/classement à harmoniser. |
| 13 — Espaces | À adapter | Parcours déjà complet ; surtout un travail de composants et de finition. |
| 14 — Assistant MIA | À reconstruire | Aucun écran MIA complet n'existe actuellement. |
| 15 — Profil | À adapter | Fonctionnalités et fenêtres déjà présentes ; normalisation visuelle nécessaire. |
| 16 — Chargement | À reconstruire | Aucun système partagé de skeleton n'a été identifié. |
| 17 — États vides/erreurs | À reconstruire par composants | À distribuer dans les écrans concernés, pas à livrer comme écran utilisateur unique. |

### Ordre recommandé pour une future reconstruction

1. Extraire les composants communs : écran, barres, boutons, cartes, avatars, statuts et sheets.
2. Harmoniser lancement, onboarding et bienvenue.
3. Harmoniser la carte et la fiche personne.
4. Reprendre Activité, Défis et Espaces avec les mêmes primitives.
5. Construire l'écran Assistant MIA.
6. Normaliser Profil et Invitations.
7. Ajouter les skeletons, états vides et erreurs dans chaque écran.

## 5. Éléments manquants dans le Design System

Le Design System actuel fournit de bonnes fondations de couleurs, espacements, typographie, rayons et ombres. Les références Stitch font apparaître les besoins complémentaires suivants.

### Couleurs et surfaces

- Tokens de dégradés officiels : marque, MIA, succès et fond atmosphérique.
- Tokens de surfaces translucides : verre léger, verre fort, scrim de pied d'écran et backdrop de modal.
- Palette dédiée aux graphiques et aux trajets, avec contraste accessible.
- Tokens de skeleton : fond, reflet et contraste en modes sombre et clair.
- Tokens dédiés à la palette olive Stitch afin de conserver ses couleurs sans disperser des valeurs brutes dans les futurs écrans.
- Tableau de correspondance entre chaque couleur Stitch et son rôle : fond, surface, accent, texte, succès, avertissement ou décoration.

### Dimensions et composition

- Hauteurs communes des barres supérieure et inférieure.
- Dimensions du bouton MIA et espace réservé dans la navigation.
- Largeur maximale et marges responsives pour Expo Web.
- Échelle de tailles d'avatar, de marqueur et d'icône.
- Épaisseurs de bordure, traits de trajet et anneaux de progression.
- Niveaux de superposition : carte, marqueurs, scrim, sheet, MIA, navigation, modal et toast.

### États de composants

- États `default`, `hover`, `pressed`, `focused`, `disabled`, `loading` et `selected` pour boutons, cartes et lignes.
- Variantes normalisées de statut : en direct, dernière position, hors ligne, actif, masqué, avertissement et erreur.
- Interrupteur officiel avec taille, couleurs, focus et libellé accessible.
- Spécification de la bottom sheet : poignée, hauteurs, fermeture, gestes et comportement Web.
- Règles pour états vides, erreurs, chargement et confirmations.

### Iconographie et illustrations

- Catalogue sémantique des icônes Miaraka avec nom, taille et équivalent par plateforme.
- Décision documentée sur la bibliothèque d'icônes ; Material Symbols ne doit pas être supposé disponible.
- Style commun pour les illustrations de confidentialité, localisation, défi et états vides.
- Règles pour les photos fictives, initiales, bordures d'avatar et indicateurs de présence.

### Mouvement

- Tokens de durée : très courte, courte, standard et longue.
- Courbes d'accélération officielles pour appui, entrée, sortie, sheet et progression.
- Intensité des halos et fréquence maximale des pulsations.
- Politique `reduce motion` : remplacement des boucles, trajets et shimmer par des fondus ou états fixes.
- Règles d'animation sur Web afin d'éviter les effets coûteux de flou et d'ombre.

### Accessibilité et contenu

- Contraste minimal des textes sur cartes translucides et sur la carte.
- État de focus clavier visible sur Web.
- Libellés accessibles des marqueurs, icônes seules, graphiques et interrupteurs.
- Alternatives textuelles pour les animations MIA, graphiques et positions.
- Longueur maximale recommandée pour les titres, badges et boutons en français et en malgache.

## 6. Animations à développer

### Animations transversales

- `ScreenEnter` : fondu et translation très légère du contenu.
- `StaggeredListEnter` : arrivée décalée des cartes et lignes, sans ralentir la lecture.
- `PressFeedback` : réduction de 1 à 3 %, changement d'opacité ou de surface.
- `ActiveIndicator` : déplacement ou morphing des segments, filtres et navigation.
- `ModalBackdrop` : fondu du fond avec apparition de la fenêtre.
- `BottomSheetMotion` : ouverture, réduction et fermeture avec une courbe douce.
- `SuccessFeedback` : bref halo ou coche après invitation, activation ou sauvegarde.

### Animations propres aux fonctionnalités

- **Lancement :** apparition du logo, halo respirant et barre de progression.
- **Connexions :** avatars en entrée, flottement lent et lignes qui se dessinent.
- **Carte :** pulsation des statuts actifs, sélection d'un marqueur, trajet qui se révèle.
- **Activité :** anneau et barres qui se remplissent, changement de période en fondu croisé.
- **Défis :** progression, entrée du classement et badge de réussite.
- **Espaces :** arrivée décalée des cartes et pile d'avatars.
- **MIA :** quatre états distincts — repos, écoute, traitement, réponse — avec anneaux et onde vocale.
- **Paramètres :** interrupteur, changement de statut et confirmation sans mouvement excessif.
- **Chargement :** shimmer sobre et fondu vers les données.
- **Erreur :** retour tactile sur `Réessayer`, puis remplacement propre de l'état.

### Cadre recommandé

- Interactions courtes : environ 150 à 250 ms.
- Entrées/sorties importantes : environ 250 à 400 ms.
- Pulsations : lentes, de faible amplitude et limitées aux informations réellement actives.
- Les animations infinies doivent être réservées au direct, à l'écoute MIA ou à un chargement en cours.
- Lorsque la réduction des animations est activée, conserver les changements d'état et supprimer flottements, pulsations et tracés continus.

## Conclusion

Les 17 références forment un ensemble cohérent autour de six familles : lancement/onboarding, carte et personnes, activité, défis, espaces, profil/MIA/états système. L'application possède déjà une part importante de ces fonctionnalités. Le principal chantier futur n'est donc pas de copier les écrans Stitch, mais de transformer les composants de démonstration existants en primitives partagées, puis de reconstruire chaque composition avec les tokens officiels Miaraka.

La priorité visuelle est de conserver les informations, textes, données fictives et couleurs des maquettes — y compris la palette olive Stitch — ainsi que les grandes zones tactiles et les animations douces. Les futures réalisations devront traduire cette direction en composants React Native et en tokens centralisés, sans dépendance implicite aux polices Web et sans reproduction directe du HTML.
