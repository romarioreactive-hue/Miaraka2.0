# Miaraka — Définition du produit, version 1

## 1. Résumé

**Miaraka** signifie « ensemble » en malgache.

Miaraka est une application mobile privée destinée aux familles, aux amis, aux collègues et aux équipes privées. Elle permet à des personnes qui se connaissent de partager volontairement leur position, de voir où se trouvent les membres autorisés, de suivre leur activité physique et de participer à des défis hebdomadaires.

La version 1 doit répondre simplement à quatre questions :

1. Où sont les personnes importantes pour moi ?
2. Sont-elles en route, arrivées ou hors ligne ?
3. Combien de kilomètres ont-elles marché ?
4. Qui progresse dans les défis de la semaine ?

La confidentialité est une règle centrale du produit : personne n'est visible par défaut et aucune position n'est publique.

## 2. Objectifs de la version 1

La version 1 doit permettre à un utilisateur de :

- se connecter avec Google et créer son profil ;
- créer ou rejoindre un espace privé de type Famille, Amis ou Équipe ;
- rechercher et inviter une personne ;
- accepter ou refuser une invitation ;
- choisir avec qui partager sa position ;
- voir sur une carte les personnes qui l'y ont autorisé ;
- distinguer une position en direct d'une dernière position connue ;
- enregistrer des lieux importants ;
- connaître son temps estimé d'arrivée au bureau ;
- consulter ses pas, ses kilomètres à pied et ses kilomètres motorisés ;
- participer à un défi hebdomadaire et voir le classement ;
- poser des questions simples à l'assistant MIA ;
- suspendre le partage de sa position ou quitter un espace à tout moment.

## 3. Utilisateurs concernés

| Public | Besoin principal | Exemple d'utilisation |
|---|---|---|
| Famille | Se rassurer et mieux se coordonner | Vérifier qu'un proche est arrivé à la maison |
| Amis | Se retrouver avec consentement | Voir qui est le plus proche du lieu de rendez-vous |
| Collègues | Faciliter les arrivées au bureau | Consulter le temps estimé d'arrivée d'un collègue autorisé |
| Équipes privées | Suivre une activité commune | Comparer les kilomètres à pied dans un défi hebdomadaire |

Miaraka n'est pas un outil de surveillance, de contrôle d'employés ou de suivi secret.

## 4. Périmètre obligatoire de la version 1

| Domaine | Fonctions incluses |
|---|---|
| Compte | Connexion Google, création et modification du profil |
| Espaces privés | Création et gestion d'espaces Famille, Amis et Équipe |
| Membres | Recherche, invitation, acceptation, refus et départ d'un espace |
| Position | Partage volontaire, position en direct, dernière position connue et heure de mise à jour |
| Carte | Affichage des personnes autorisées et consultation de leur fiche |
| Lieux | Maison, Bureau et lieu personnalisé |
| Déplacement | État en route, arrivé ou hors ligne ; temps estimé d'arrivée au bureau |
| Activité | Nombre de pas, kilomètres à pied et kilomètres motorisés séparés |
| Défis | Défis hebdomadaires et classement entre membres |
| Assistant | Questions simples traitées par MIA selon les droits de l'utilisateur |
| Confidentialité | Réglages par espace, suspension et désactivation du partage |

### 4.1 Définitions communes

- **En direct** : la position est partagée activement et a été actualisée récemment. L'application affiche l'heure exacte de la mise à jour.
- **Dernière position connue** : la personne ne partage plus une position récente, mais a autorisé l'affichage de sa dernière position. L'application la présente explicitement comme ancienne, avec sa date et son heure.
- **En route** : la personne se déplace vers le Bureau enregistré et partage les informations nécessaires.
- **Arrivé** : la personne se trouve dans la zone du Bureau enregistré. Cet état reste indicatif.
- **Hors ligne** : aucune nouvelle donnée ne peut être reçue. La dernière position ne doit jamais être présentée comme une position actuelle.
- **Kilomètres à pied** : distance estimée comme marche, séparée de la distance motorisée.
- **Kilomètres motorisés** : distance estimée comme déplacement en véhicule. Elle ne compte pas dans les défis de marche.

## 5. Hors périmètre de la version 1

Les fonctions suivantes ne doivent pas être développées ni présentées comme disponibles dans la version 1 :

- chat entre utilisateurs ;
- appels vidéo ;
- réseau social public ;
- paiements ;
- publicité ;
- marketplace ;
- réservation de taxi ;
- livraison ;
- pharmacie ;
- parking ;
- drone ;
- université.

## 6. Principes de confidentialité

### 6.1 Règles obligatoires

1. **Invisible par défaut** : après la création du compte, la position de l'utilisateur n'est partagée avec personne.
2. **Acceptation obligatoire** : une invitation doit être acceptée avant toute relation dans un espace. Accepter un espace ne doit pas activer silencieusement le partage de position.
3. **Partage volontaire** : l'utilisateur choisit d'activer le partage et peut le suspendre à tout moment.
4. **Droits par espace** : les réglages peuvent être différents dans Famille, Amis et Équipe.
5. **Aucune position publique** : les positions ne sont jamais accessibles hors des espaces privés et des autorisations accordées.
6. **Aucune surveillance cachée** : l'application indique clairement quand la position est partagée, avec qui et dans quels espaces.
7. **Dernière position identifiable** : toute position non actuelle porte la mention « Dernière position connue » ainsi que sa date et son heure.
8. **Historique privé** : les données passées ne sont visibles que par leur propriétaire dans la version 1. MIA et les autres membres n'y accèdent pas sans droit explicite.
9. **Départ libre** : chaque membre peut quitter un espace. Son partage avec cet espace s'arrête immédiatement.
10. **Refus sans conséquence** : refuser une invitation ou une demande de partage ne doit pas révéler de position ni de donnée d'activité.

### 6.2 Permissions selon le type d'espace

Les valeurs ci-dessous sont les réglages proposés au départ. L'utilisateur garde toujours le contrôle final.

| Information | Famille | Amis | Équipe |
|---|---|---|---|
| Position en direct | Désactivée, activation proposée | Désactivée | Désactivée |
| Dernière position connue | Désactivée, activation proposée | Désactivée | Désactivée |
| État en route / arrivé | Désactivé, activation proposée | Désactivé | Désactivé |
| Temps d'arrivée au bureau | Désactivé | Désactivé | Désactivé, activation proposée |
| Pas et kilomètres à pied | Désactivés, sauf participation à un défi | Désactivés, sauf participation à un défi | Désactivés, sauf participation à un défi |
| Kilomètres motorisés | Privés par défaut | Privés par défaut | Privés par défaut |

Une « activation proposée » est une demande visible à laquelle l'utilisateur répond. Ce n'est jamais une activation automatique.

### 6.3 Niveaux de partage par espace

Pour chaque espace, l'utilisateur peut choisir :

- **Aucun partage** : aucune position n'est visible ;
- **Dernière position seulement** : la dernière position autorisée et son heure sont visibles ;
- **Position en direct** : la position récente est visible tant que le partage est actif.

Le partage de l'activité et la participation aux défis sont réglés séparément du partage de position.

### 6.4 Suspension et désactivation

- La suspension doit être accessible rapidement depuis la Carte et la page Confidentialité.
- L'utilisateur peut suspendre un espace précis ou tous les espaces.
- L'écran doit confirmer clairement que le partage est arrêté.
- Aucun redémarrage de l'application ne doit réactiver un partage suspendu sans action claire de l'utilisateur.
- Lorsque l'utilisateur retire l'autorisation de localisation du téléphone, Miaraka doit l'expliquer sans afficher une fausse position en direct.

## 7. Parcours principaux

### 7.1 Première utilisation

1. L'utilisateur ouvre Miaraka et voit le Splash screen.
2. Il se connecte avec Google.
3. Il vérifie ou complète son profil.
4. Il lit une explication courte sur la confidentialité.
5. Il choisit s'il souhaite autoriser la localisation. Un refus n'empêche pas d'accéder aux fonctions qui n'en ont pas besoin.
6. Il crée un espace ou accepte une invitation.
7. Il active volontairement les partages souhaités.

### 7.2 Invitation

1. Un membre ouvre « Ajouter une personne » depuis un espace.
2. Il recherche une personne avec une information autorisée, par exemple son nom ou son adresse électronique.
3. Il vérifie le bon profil et envoie l'invitation.
4. Le destinataire accepte ou refuse.
5. Après acceptation, les deux personnes règlent séparément leurs permissions de partage.

### 7.3 Consultation d'une personne

1. L'utilisateur sélectionne une personne autorisée sur la Carte ou dans un espace.
2. La fiche indique son état, le type de position et l'heure de mise à jour.
3. Si les droits le permettent, la fiche affiche aussi l'activité partagée et le temps d'arrivée au bureau.
4. Si une donnée n'est pas autorisée, elle n'est pas affichée et n'est pas déduite.

### 7.4 Défi hebdomadaire

1. Un membre autorisé crée un défi dans un espace.
2. Il choisit une mesure simple, par exemple les pas ou les kilomètres à pied.
3. Les membres rejoignent volontairement le défi.
4. Le classement se met à jour avec les données autorisées.
5. Le défi se termine à la date indiquée et le résultat reste consultable par ses participants.

## 8. Description des écrans

### 8.1 Splash screen

- **Objectif** : présenter Miaraka pendant le démarrage et diriger rapidement l'utilisateur vers la bonne étape.
- **Informations affichées** : logo, nom Miaraka et courte phrase liée au fait d'être ensemble.
- **Boutons** : aucun bouton pendant un chargement normal ; « Réessayer » si le démarrage échoue.
- **Actions possibles** : attendre l'ouverture de la Connexion ou de la Carte si une session valide existe déjà.
- **État vide** : non applicable.
- **État de chargement** : animation légère, sans bloquer inutilement l'utilisateur.
- **Erreurs possibles** : session impossible à vérifier, absence de réseau ou service indisponible. Le message doit rester simple.
- **Comportement mobile** : plein écran, respect de l'encoche et ouverture automatique de l'écran suivant.

### 8.2 Connexion

- **Objectif** : permettre une connexion sûre avec Google et expliquer brièvement ce qui sera utilisé.
- **Informations affichées** : logo, bénéfice principal, rappel que la position est invisible par défaut et lien vers la politique de confidentialité.
- **Boutons** : « Continuer avec Google » et, en cas d'échec, « Réessayer ».
- **Actions possibles** : choisir un compte Google, accepter ou annuler la connexion.
- **État vide** : non applicable.
- **État de chargement** : bouton désactivé et indication « Connexion… ».
- **Erreurs possibles** : connexion annulée, réseau absent, compte non disponible ou service temporairement indisponible.
- **Comportement mobile** : bouton principal facile à atteindre au pouce ; le retour du téléphone annule correctement la fenêtre Google.

### 8.3 Carte

- **Objectif** : répondre rapidement à « Où sont les personnes autorisées ? ».
- **Informations affichées** : carte, position de l'utilisateur si autorisée, repères des personnes autorisées, état en direct ou dernière position connue, heure de mise à jour, lieux enregistrés et état général du partage.
- **Boutons** : recentrer, ouvrir la liste des membres, ajouter une personne, accéder à Confidentialité, activer ou suspendre le partage.
- **Actions possibles** : déplacer ou agrandir la carte, sélectionner un membre, ouvrir sa fiche, sélectionner un lieu et suspendre le partage.
- **État vide** : message expliquant qu'aucune personne n'est encore visible, avec accès à l'ajout d'une personne ou aux autorisations.
- **État de chargement** : emplacement réservé aux repères et indicateur discret pendant la récupération des positions.
- **Erreurs possibles** : localisation refusée, GPS désactivé, carte indisponible, réseau absent ou position trop ancienne. Une donnée ancienne reste marquée comme telle.
- **Comportement mobile** : carte plein écran, commandes regroupées dans la zone basse, fiche résumée ouvrable d'un glissement et repères assez grands pour être touchés.

### 8.4 Ajouter une personne

- **Objectif** : rechercher une personne et l'inviter dans un espace privé précis.
- **Informations affichées** : champ de recherche, espace destinataire, résultats avec nom et photo, et statut éventuel d'une invitation existante.
- **Boutons** : « Rechercher », « Inviter » et « Annuler ».
- **Actions possibles** : saisir une recherche, choisir un résultat, vérifier l'espace puis envoyer une invitation.
- **État vide** : avant recherche, une explication courte ; après recherche sans résultat, un message invitant à vérifier les informations.
- **État de chargement** : indicateur dans la liste pendant la recherche ou l'envoi.
- **Erreurs possibles** : personne introuvable, invitation déjà envoyée, membre déjà présent, réseau absent ou envoi impossible.
- **Comportement mobile** : clavier adapté, résultats lisibles sur une seule colonne et confirmation avant l'envoi au mauvais espace.

### 8.5 Invitations

- **Objectif** : consulter et traiter les invitations reçues ou envoyées.
- **Informations affichées** : auteur, photo, type et nom de l'espace, date, permissions demandées et état de chaque invitation.
- **Boutons** : « Accepter », « Refuser » et « Annuler l'invitation » pour une invitation envoyée.
- **Actions possibles** : ouvrir le détail, accepter, refuser ou annuler une invitation en attente.
- **État vide** : « Aucune invitation en attente » avec retour vers les Espaces.
- **État de chargement** : cartes provisoires ou indicateur lors du traitement d'une réponse.
- **Erreurs possibles** : invitation expirée, déjà traitée, espace supprimé, réseau absent ou réponse non enregistrée.
- **Comportement mobile** : onglets simples « Reçues » et « Envoyées », actions assez espacées pour éviter une mauvaise réponse.

### 8.6 Fiche d'une personne

- **Objectif** : réunir les informations que l'utilisateur a le droit de voir sur un membre.
- **Informations affichées** : nom, photo, espaces communs, état en route, arrivé ou hors ligne, position en direct ou dernière position connue, heure de mise à jour, activité partagée, classement et temps d'arrivée au bureau si autorisé.
- **Boutons** : « Voir sur la carte », « Gérer les permissions » et « Retirer de l'espace » si l'utilisateur possède ce droit.
- **Actions possibles** : revenir à la Carte, consulter l'activité autorisée, modifier ses propres partages envers cette personne ou cet espace.
- **État vide** : sections absentes remplacées par une explication claire, par exemple « Rica ne partage pas sa position avec vous ».
- **État de chargement** : photo et blocs d'information provisoires ; aucune ancienne information ne doit sembler actuelle.
- **Erreurs possibles** : membre parti de l'espace, droit retiré, donnée indisponible ou réseau absent.
- **Comportement mobile** : contenu vertical, informations prioritaires en premier et actions sensibles placées dans un menu distinct.

### 8.7 Activité

- **Objectif** : montrer l'activité physique et séparer clairement la marche des déplacements motorisés.
- **Informations affichées** : pas du jour et de la semaine, kilomètres à pied, kilomètres motorisés, période consultée et source ou disponibilité des données.
- **Boutons** : choix « Jour » ou « Semaine », accès aux réglages de partage et action pour autoriser l'accès aux données d'activité si nécessaire.
- **Actions possibles** : changer de période, consulter son résumé et choisir ce qui est partagé dans les défis.
- **État vide** : aucune donnée disponible, avec une explication et l'action nécessaire pour commencer.
- **État de chargement** : valeurs remplacées par des indicateurs provisoires, sans afficher zéro comme résultat définitif.
- **Erreurs possibles** : accès refusé aux données d'activité, appareil non compatible, données non synchronisées ou calcul indisponible.
- **Comportement mobile** : grands chiffres lisibles, graphiques simples si utiles et distinction visuelle accessible entre marche et motorisé.

### 8.8 Défis

- **Objectif** : créer une motivation collective autour d'un objectif hebdomadaire privé.
- **Informations affichées** : défis en cours et terminés, espace concerné, dates, objectif, progression personnelle, progression du groupe et classement.
- **Boutons** : « Créer un défi », « Rejoindre », « Quitter le défi » et accès au détail.
- **Actions possibles** : créer un défi simple, rejoindre volontairement, consulter le classement et quitter un défi.
- **État vide** : aucun défi en cours, avec une invitation à en créer un dans un espace.
- **État de chargement** : progression et classement provisoires avec date de dernière synchronisation.
- **Erreurs possibles** : activité non autorisée, défi terminé, membre non admissible, synchronisation impossible ou réseau absent.
- **Comportement mobile** : cartes verticales, classement facile à parcourir et position de l'utilisateur toujours repérable sans rendre publiques les données.

### 8.9 Espaces

- **Objectif** : créer et gérer les groupes privés Famille, Amis et Équipe.
- **Informations affichées** : liste des espaces, type, nom, nombre de membres, rôle de l'utilisateur et état de son partage dans chaque espace.
- **Boutons** : « Créer un espace », ouvrir un espace, inviter une personne, gérer l'espace et « Quitter l'espace ».
- **Actions possibles** : créer, renommer si autorisé, consulter les membres, inviter, régler ses permissions ou quitter.
- **État vide** : explication des trois types d'espaces et bouton de création.
- **État de chargement** : liste provisoire et blocage uniquement des actions qui nécessitent la fin du chargement.
- **Erreurs possibles** : espace introuvable, droit insuffisant, nom invalide, départ impossible temporairement ou réseau absent.
- **Comportement mobile** : une carte par espace, statut de partage immédiatement visible et confirmation pour les actions sensibles.

### 8.10 Assistant MIA

- **Objectif** : répondre en langage simple aux questions courantes à partir des seules données autorisées.
- **Informations affichées** : champ de question, exemples de questions, réponse de MIA, heure des données utilisées et avertissement lorsqu'une position est ancienne.
- **Boutons** : envoyer la question, choisir une question proposée, effacer la conversation locale et ouvrir la fiche ou la carte correspondante lorsque cela est autorisé.
- **Actions possibles** : poser une question prévue, consulter la réponse et ouvrir l'information source.
- **État vide** : message d'accueil avec les six exemples de questions prises en charge.
- **État de chargement** : « MIA cherche dans les informations que vous pouvez consulter… » et possibilité d'annuler.
- **Erreurs possibles** : personne ambiguë, information non partagée, donnée indisponible, question non comprise ou réseau absent.
- **Comportement mobile** : zone de saisie au-dessus du clavier, réponses courtes, boutons de questions rapides et défilement vertical.

### 8.11 Profil

- **Objectif** : consulter et modifier les informations personnelles du compte.
- **Informations affichées** : photo, nom, adresse électronique Google, éventuel nom d'affichage et résumé des espaces rejoints.
- **Boutons** : « Modifier », « Enregistrer », « Se déconnecter » et accès à Confidentialité.
- **Actions possibles** : changer les informations modifiables, enregistrer ou annuler, se déconnecter.
- **État vide** : les informations absentes sont signalées et peuvent être complétées ; l'adresse Google ne doit pas être inventée.
- **État de chargement** : profil provisoire et bouton d'enregistrement désactivé pendant la sauvegarde.
- **Erreurs possibles** : nom invalide, photo impossible à charger, sauvegarde échouée ou session expirée.
- **Comportement mobile** : formulaire court, photo facilement modifiable et clavier qui ne cache pas les actions.

### 8.12 Confidentialité

- **Objectif** : donner une vue complète et compréhensible de tous les partages actifs.
- **Informations affichées** : état global du partage, permissions par espace, personnes autorisées, dernière position, partage d'activité, historique privé et rappel de l'autorisation du téléphone.
- **Boutons** : « Suspendre tout », activer ou désactiver par espace, gérer les données partagées, quitter un espace et ouvrir les autorisations du téléphone.
- **Actions possibles** : suspendre ou reprendre volontairement, modifier chaque permission, retirer un accès et quitter un espace.
- **État vide** : « Vous ne partagez aucune information » avec une explication rassurante.
- **État de chargement** : les commandes attendent les réglages réels ; l'application ne doit pas afficher un partage comme désactivé sans confirmation.
- **Erreurs possibles** : réglage non enregistré, droit système retiré, session expirée ou réseau absent. L'état précédent reste clairement indiqué jusqu'à confirmation.
- **Comportement mobile** : réglages regroupés par espace, textes simples, confirmation des actions importantes et accès rapide à la suspension globale.

### 8.13 Autorisations de localisation

- **Objectif** : expliquer pourquoi la localisation est demandée et laisser l'utilisateur décider sans pression.
- **Informations affichées** : utilité de la localisation, moments où elle est utilisée, personnes susceptibles de la voir, différence entre utilisation de l'application et arrière-plan, et moyen de changer d'avis.
- **Boutons** : « Continuer », « Pas maintenant » et « Ouvrir les réglages » lorsqu'une autorisation a déjà été refusée.
- **Actions possibles** : lancer la demande du téléphone, refuser, revenir plus tard ou ouvrir les réglages du système.
- **État vide** : non applicable.
- **État de chargement** : courte attente pendant la vérification de l'autorisation actuelle.
- **Erreurs possibles** : permission refusée, GPS désactivé, précision insuffisante ou réglages inaccessibles. Le reste de l'application doit demeurer utilisable dans la mesure du possible.
- **Comportement mobile** : la demande du système n'apparaît qu'après l'explication ; les textes s'adaptent au système du téléphone et l'état est revérifié au retour dans l'application.

## 9. Assistant MIA

### 9.1 Questions prises en charge en version 1

| Question | Réponse attendue |
|---|---|
| « Où est Rica ? » | Lieu ou position autorisée, état en direct ou dernière position connue, avec heure de mise à jour |
| « Qui est au bureau ? » | Membres autorisés actuellement considérés comme arrivés au Bureau |
| « Qui est le plus proche ? » | Personne autorisée la plus proche de l'utilisateur ou du lieu précisé ; MIA demande une précision si nécessaire |
| « Quelle est la dernière position de Mario ? » | Dernière position autorisée, clairement datée, ou explication qu'elle n'est pas accessible |
| « Qui est premier du défi ? » | Premier membre du défi concerné ; MIA demande lequel si plusieurs défis sont actifs |
| « Combien de kilomètres ai-je marché cette semaine ? » | Total personnel des kilomètres à pied pour la semaine en cours |

### 9.2 Règles de sécurité de MIA

- MIA utilise exactement les mêmes permissions que l'utilisateur dans le reste de l'application.
- MIA ne révèle jamais une position, une activité, un classement ou un historique que l'utilisateur ne peut pas ouvrir directement.
- MIA ne contourne pas un partage suspendu et ne déduit pas une position à partir d'informations cachées.
- Si plusieurs personnes portent le même nom, MIA demande laquelle est concernée sans révéler de donnée supplémentaire.
- Si la donnée est ancienne, MIA donne sa date et son heure et emploie « dernière position connue ».
- Si l'information n'est pas autorisée, MIA répond simplement qu'elle n'est pas accessible.
- Si la question dépasse les capacités de la version 1, MIA l'indique sans inventer de réponse.
- Chaque réponse liée à une position doit permettre d'ouvrir la Carte ou la fiche correspondante, lorsque l'accès est autorisé.

## 10. Règles fonctionnelles importantes

### 10.1 Lieux enregistrés

- Un utilisateur peut enregistrer un lieu « Maison », un lieu « Bureau » et des lieux personnalisés.
- Un nom personnalisé et une position sur la carte sont nécessaires.
- Les lieux personnels sont privés par défaut.
- Leur utilisation pour indiquer « arrivé » ou calculer un temps d'arrivée respecte les permissions de l'espace.
- La version 1 ne doit pas prétendre qu'une arrivée est certaine : il s'agit d'une estimation fondée sur la position disponible.

### 10.2 Temps estimé d'arrivée au bureau

- Le calcul concerne uniquement le lieu enregistré comme Bureau.
- Il n'est affiché que si la personne partage les données nécessaires avec l'utilisateur demandeur.
- L'heure de calcul doit être visible.
- Si aucun Bureau n'est enregistré, si la position est trop ancienne ou si le calcul échoue, l'application l'explique au lieu d'afficher un temps trompeur.

### 10.3 Activité et déplacements

- Les pas, kilomètres à pied et kilomètres motorisés sont affichés séparément.
- Les kilomètres motorisés ne comptent jamais comme kilomètres à pied.
- Les estimations doivent être présentées comme telles lorsque le téléphone ne permet pas une mesure exacte.
- Un utilisateur peut consulter ses propres données sans être obligé de les partager.
- Les membres d'un défi ne voient que les mesures nécessaires au classement du défi.

### 10.4 Défis hebdomadaires

- Un défi appartient à un espace privé.
- Sa date de début, sa date de fin, sa mesure et son objectif sont visibles avant de le rejoindre.
- La participation est volontaire.
- Les mesures autorisées en version 1 sont les pas et les kilomètres à pied.
- Le classement affiche uniquement les participants et les données nécessaires.
- En cas d'égalité, les membres concernés occupent la même position ou sont départagés par une règle annoncée avant le début.
- Le fuseau horaire du défi est défini dès sa création afin que la semaine ait les mêmes limites pour tous.

## 11. Exigences générales d'expérience mobile

- Les actions principales doivent être utilisables d'une seule main.
- Les textes et boutons doivent rester lisibles avec une taille de texte agrandie.
- Une couleur ne doit jamais être le seul moyen de distinguer « en direct », « dernière position » et « hors ligne ».
- Les actions sensibles demandent une confirmation claire.
- Les écrans doivent expliquer les permissions sans culpabiliser l'utilisateur.
- Une absence de réseau ne doit jamais transformer une ancienne donnée en information actuelle.
- Les dates et heures utilisent le fuseau horaire du téléphone, avec une précision suffisante pour éviter les malentendus.
- Les états de chargement évitent les doubles actions et conservent le contexte de l'utilisateur.

## 12. Checklist complète de la version 1

### Compte et profil

- [ ] Connexion Google fonctionnelle
- [ ] Création du profil après la première connexion
- [ ] Consultation et modification du profil
- [ ] Déconnexion
- [ ] Explication initiale de la confidentialité

### Espaces et invitations

- [ ] Création d'un espace Famille
- [ ] Création d'un espace Amis
- [ ] Création d'un espace Équipe
- [ ] Liste des espaces et des membres
- [ ] Recherche d'une personne
- [ ] Envoi d'une invitation dans un espace précis
- [ ] Liste des invitations reçues et envoyées
- [ ] Acceptation d'une invitation
- [ ] Refus d'une invitation
- [ ] Annulation d'une invitation envoyée
- [ ] Possibilité de quitter un espace

### Carte, position et lieux

- [ ] Utilisateur invisible par défaut
- [ ] Activation volontaire du partage
- [ ] Réglages de partage différents par espace
- [ ] Carte avec uniquement les personnes autorisées
- [ ] Position en direct clairement identifiée
- [ ] Dernière position connue clairement identifiée
- [ ] Date et heure de dernière mise à jour
- [ ] État en route, arrivé ou hors ligne
- [ ] Suspension du partage par espace
- [ ] Suspension globale du partage
- [ ] Désactivation du partage de position
- [ ] Enregistrement du lieu Maison
- [ ] Enregistrement du lieu Bureau
- [ ] Enregistrement d'un lieu personnalisé
- [ ] Temps estimé d'arrivée au Bureau, si autorisé
- [ ] Gestion correcte d'un GPS ou réseau indisponible

### Activité

- [ ] Nombre de pas du jour et de la semaine
- [ ] Kilomètres à pied du jour et de la semaine
- [ ] Kilomètres motorisés affichés séparément
- [ ] Aucun kilomètre motorisé compté comme marche
- [ ] Données personnelles consultables sans partage obligatoire
- [ ] Gestion du refus d'accès aux données d'activité

### Défis

- [ ] Création d'un défi hebdomadaire dans un espace
- [ ] Participation volontaire
- [ ] Défi basé sur les pas ou les kilomètres à pied
- [ ] Progression personnelle
- [ ] Classement entre les participants
- [ ] Dates et fuseau horaire clairement affichés
- [ ] Résultat d'un défi terminé
- [ ] Possibilité de quitter un défi

### Assistant MIA

- [ ] Réponse à « Où est Rica ? »
- [ ] Réponse à « Qui est au bureau ? »
- [ ] Réponse à « Qui est le plus proche ? »
- [ ] Réponse à « Quelle est la dernière position de Mario ? »
- [ ] Réponse à « Qui est premier du défi ? »
- [ ] Réponse à « Combien de kilomètres ai-je marché cette semaine ? »
- [ ] Respect strict des permissions dans chaque réponse
- [ ] Mention visible de l'ancienneté d'une position
- [ ] Gestion des noms ambigus et des données absentes

### Confidentialité et qualité

- [ ] Aucune position publique
- [ ] Aucun partage avant acceptation et activation volontaire
- [ ] Aucun suivi caché
- [ ] Liste claire des personnes et espaces autorisés
- [ ] Historique privé
- [ ] Retrait d'un accès pris en compte immédiatement
- [ ] Départ d'un espace arrêtant le partage correspondant
- [ ] Écrans vides, chargements et erreurs traités sur les 13 écrans
- [ ] Comportement mobile vérifié sur plusieurs tailles d'écran
- [ ] Aucune fonction hors périmètre présentée comme disponible

## 13. Fonctions envisagées pour une version 2

La version 2 ne commence qu'après validation de la version 1 avec de vrais utilisateurs. Les pistes suivantes restent à confirmer par la recherche utilisateur :

- notifications choisies d'arrivée ou de départ d'un lieu ;
- partage de position limité à une durée définie ;
- plus de types de défis et objectifs collectifs ;
- tendances d'activité sur plusieurs semaines ;
- historique personnel plus détaillé avec suppression et durée de conservation réglables ;
- rôles plus précis pour les responsables d'un espace ;
- invitation par lien privé ou code temporaire ;
- plusieurs lieux Maison ou Bureau ;
- estimation d'arrivée vers un lieu personnalisé ;
- meilleure gestion des téléphones utilisés hors connexion ;
- export des données personnelles ;
- suppression complète du compte et de ses données depuis l'application ;
- options d'accessibilité et de langues supplémentaires, notamment le malgache.

Ces pistes ne changent pas les règles fondamentales : consentement explicite, confidentialité et absence de surveillance cachée.

## 14. Ordre recommandé de développement

1. **Fondations de confidentialité** : règles d'accès, personne invisible par défaut, gestion des consentements et retrait immédiat des droits.
2. **Compte et profil** : connexion Google, création du profil et déconnexion.
3. **Espaces privés** : Famille, Amis, Équipe, membres et possibilité de quitter.
4. **Invitations** : recherche, envoi, acceptation, refus et annulation.
5. **Autorisations de localisation** : explications, choix de l'utilisateur et gestion des refus.
6. **Partage de position** : activation, suspension, position en direct, dernière position connue et heure de mise à jour.
7. **Carte et fiche d'une personne** : affichage limité aux personnes et informations autorisées.
8. **Lieux et déplacements** : Maison, Bureau, lieu personnalisé, états et temps estimé d'arrivée.
9. **Activité** : pas, kilomètres à pied et kilomètres motorisés séparés.
10. **Défis hebdomadaires** : création, participation, progression et classement.
11. **Assistant MIA** : six questions prévues, avec contrôle strict des permissions.
12. **Finition mobile** : états vides, chargements, erreurs, accessibilité, consommation de batterie et tests sur appareils réels.

Les règles de confidentialité doivent être testées à chaque étape, et pas seulement à la fin.

## 15. Critères pour tester avec de vrais utilisateurs

L'application est prête pour un test limité avec de vrais utilisateurs lorsque tous les critères suivants sont satisfaits :

### Fonctionnement essentiel

- La checklist obligatoire de la version 1 est terminée ou chaque exception est clairement documentée et sans risque pour la confidentialité.
- Un nouvel utilisateur peut se connecter, créer son profil, rejoindre un espace et comprendre comment activer le partage sans aide technique.
- Deux utilisateurs peuvent s'inviter, régler leurs permissions et se voir sur la carte uniquement après consentement.
- La position en direct, la dernière position connue et l'état hors ligne ne peuvent pas être confondus.
- Les pas, kilomètres à pied et kilomètres motorisés sont séparés de manière fiable.
- Un défi complet peut être créé, rejoint et terminé avec un classement cohérent.
- MIA répond aux six questions prévues et refuse correctement les informations non autorisées.

### Confidentialité et sécurité

- Aucun test ne permet à un utilisateur de consulter une personne ou une donnée sans permission.
- Retirer une permission, suspendre le partage ou quitter un espace arrête réellement l'accès concerné.
- Une nouvelle installation est invisible par défaut.
- Les permissions du téléphone correspondent aux explications affichées.
- Les données anciennes portent toujours leur date et leur heure.
- Les données sensibles ne sont pas rendues publiques et ne figurent pas inutilement dans les messages d'erreur.
- Un plan simple existe pour signaler et traiter un problème de confidentialité pendant le test.

### Qualité mobile

- Les 13 écrans fonctionnent sur les tailles de téléphone retenues pour le test.
- Les parcours principaux restent compréhensibles avec un réseau lent ou temporairement absent.
- Les erreurs fréquentes ont un message clair et une action de reprise.
- Le partage en arrière-plan ne provoque pas une consommation de batterie jugée excessive lors d'un essai réel.
- Les boutons, textes et états sont lisibles, y compris avec une taille de texte agrandie.
- Aucun blocage majeur ni perte de données n'est connu sur les parcours principaux.

### Organisation du test

- Les participants savent qu'il s'agit d'une version de test et donnent leur accord.
- Le groupe de test reste petit et privé au départ, avec des profils Famille, Amis et Équipe.
- Les participants disposent d'un moyen simple de signaler un problème ou de demander la suppression de leurs données.
- Les responsables du test savent arrêter le test rapidement en cas de problème de confidentialité.
- Les questions à observer sont définies : compréhension du partage, confiance dans l'ancienneté des positions, utilité de la Carte, lisibilité de l'activité, motivation des défis et pertinence de MIA.

## 16. Définition du succès de la version 1

La version 1 est réussie si une personne non technique peut, sans assistance :

- comprendre qu'elle est invisible par défaut ;
- inviter un proche ou un collègue dans le bon espace ;
- choisir précisément ce qu'elle partage ;
- identifier si une position est actuelle ou ancienne ;
- consulter son activité sans confondre marche et déplacement motorisé ;
- rejoindre un défi et comprendre le classement ;
- demander une information simple à MIA ;
- suspendre immédiatement son partage ou quitter un espace.

La confiance de l'utilisateur est prioritaire sur la quantité de fonctions.
