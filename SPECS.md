# Spécifications : site d'exercices pour la 6e

> Version 0.5, 15/10/2026. Brouillon à valider (voir les questions ouvertes au §14).

## 1. Objectif

Un petit site web où l'élève (en 6e) s'entraîne seule, d'abord en mathématiques. Le site doit :

- proposer des exercices variés et en nombre illimité sur le programme de 6e ;
- l'aider quand elle se trompe (indice, puis correction détaillée) plutôt que la sanctionner ;
- s'adapter à son niveau et lui reproposer plus tard les questions qu'elle a ratées ;
- lui donner envie de revenir (étoiles, badges, défis chronométrés, personnalisation) ;
- permettre au parent de suivre sa progression ;
- marcher sur ordinateur et sur tablette, sans compte ni serveur.

D'autres matières pourront s'ajouter plus tard. L'architecture le prévoit dès la v1, mais seules les maths sont développées pour l'instant.

### Hors périmètre v1

- Comptes utilisateurs, serveur, synchronisation automatique entre appareils
- Plusieurs profils, plusieurs élèves
- Niveaux autres que la 6e
- Interactions avancées : glisser-déposer, placer un point sur une droite graduée, géométrie interactive (rapporteur, tracés, constructions)
- Éditeur de questions dans l'interface
- Aménagements spécifiques (police dys, lecture audio), au-delà des bonnes pratiques de base

## 2. Décisions prises

| Sujet           | Décision                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Appareils       | Ordinateur **et** tablette Android (Chrome) : interface responsive, pavé numérique à l'écran sur tactile              |
| Contenu         | Générateurs aléatoires pour les exercices « mécaniques » + banque de questions rédigées pour les problèmes et les QCM |
| Domaines v1     | Nombres entiers & décimaux, Calcul, Fractions & proportionnalité, Mesures & géométrie                                 |
| En cas d'erreur | 1re erreur : indice + 2e essai. 2e erreur : correction détaillée                                                      |
| Séance          | Séries d'environ 10 questions, difficulté adaptative, révision des erreurs                                            |
| Interactions v1 | Saisie (nombre, fraction, plusieurs champs) + QCM                                                                     |
| Progression     | Stockée sur l'appareil (localStorage), export/import par fichier avec fusion                                          |
| Motivation      | Étoiles, badges, défis chronométrés, thèmes et avatars à débloquer                                                    |
| Espace parent   | Oui, protégé par un code à 4 chiffres                                                                                 |
| Hébergement     | GitHub Pages, déployé par la CI à chaque push ; installable (PWA), utilisable hors ligne                              |
| Stack           | Vite + TypeScript + Preact (§11.1)                                                                                    |
| Rédaction       | Claude rédige un premier lot de questions, le parent relit et complète                                                |

## 3. Utilisateurs

- **L'élève** : 11 ans, utilise le site seule. On la tutoie, le ton est bienveillant et les consignes sont courtes.
- **Le parent** : règle le site, consulte les statistiques, sauvegarde et restaure la progression, relit et ajoute du contenu (dans les fichiers du projet).

## 4. Parcours et écrans

### 4.1 Plan du site

```
Accueil
├── Maths → chapitre → compétence → Série → Bilan
│     (l'écran « Matières » est sauté tant qu'il n'y en a qu'une)
├── Révisions (si des questions sont « à revoir »)
├── Entraînement du jour (série mixte automatique)
├── Défis chronométrés → Défi → Résultat
├── Mes trophées (badges, étoiles, records)
├── Personnaliser (thème, avatar, sons)
└── Espace parent 🔒
```

### 4.2 Premier lancement

Elle choisit son prénom, un avatar et un thème. Rien d'autre.

### 4.3 Accueil

- Avatar, prénom, total d'étoiles.
- Bouton principal **« Continuer »** : reprend la dernière compétence travaillée.
- **« Révisions (n) »**, affiché seulement s'il y a des questions à revoir aujourd'hui.
- **« Entraînement du jour »** : une série mixte choisie automatiquement (§5.4).
- Accès à Maths, Défis, Trophées et Personnaliser. L'accès parent est discret (petite icône).

### 4.4 Chapitres et compétences

- La liste des chapitres d'une matière mène aux compétences d'un chapitre.
- Chaque compétence affiche son état (§5.2) et son niveau actuel (1 à 3).
- Les chapitres ou compétences masqués par le parent n'apparaissent pas.

### 4.5 Déroulement d'une question

1. L'écran affiche la progression dans la série (ex. 3/10), l'énoncé, la figure s'il y en a une, la zone de réponse et le bouton **Valider** (Entrée au clavier).
2. **Réponse illisible** (champ vide, `3,,4`…) : message « Je n'ai pas compris ta réponse ». Ça ne compte pas comme un essai.
3. **Juste du 1er coup** : retour positif (animation + son), +2 ⭐, puis bouton « Suivant » (ou Entrée).
4. **1re erreur** : « Pas tout à fait… » + **indice**. Le champ est vidé pour le 2e essai.
5. **Juste au 2e essai** : +1 ⭐.
6. **2e erreur** : **correction détaillée** (méthode étape par étape, bonne réponse, rappel de sa réponse), puis bouton « J'ai compris ». La question passe dans « À revoir ».
7. **QCM à 2 ou 3 choix** (ex. `<`, `>`, `=`) : un seul essai, puis correction directe, sinon le 2e essai se gagne au hasard. **QCM à 4 choix** : règle normale, le choix erroné est grisé au 2e essai.

- Un bouton « Quitter la série » demande confirmation. Les réponses déjà données sont conservées.
- Pas de calculatrice dans le site.

### 4.6 Bilan de série

- Score : réussies du 1er coup, réussies au 2e essai, ratées.
- Étoiles gagnées (bonus compris), changement de niveau éventuel, badges débloqués.
- Liste des questions ratées avec leur correction.
- Boutons : Recommencer / Autre compétence / Accueil.

## 5. Adaptation et révisions

### 5.1 Niveaux

Chaque compétence a 3 niveaux de difficulté, décrits au §9. Pour chaque compétence, on garde le niveau actuel et les résultats récents.

- **Monter** : 4 réussites du 1er coup sur les 5 dernières questions du niveau → niveau suivant, avec le message « Tu passes au niveau 2 ! ».
- **Descendre** : 3 questions ratées (après 2 essais) sur les 5 dernières → niveau précédent, **sans annonce**.
- Le niveau peut changer entre deux questions, y compris au milieu d'une série.
- Les seuils sont réglables dans un fichier de configuration.
- **Avant cette adaptation (lot 1)**, chaque série monte simplement en difficulté : 3 questions de niveau 1, 4 de niveau 2, puis 3 de niveau 3.

### 5.2 État d'une compétence (affiché à l'élève)

| État         | Condition                                                                   |
| ------------ | --------------------------------------------------------------------------- |
| Pas commencé | Aucune réponse                                                              |
| Découverte   | Niveau 1                                                                    |
| En cours     | Niveau 2                                                                    |
| Acquis       | Niveau 3                                                                    |
| Maîtrisé     | Niveau 3 et au moins 8 réussites du 1er coup sur les 10 dernières questions |

### 5.3 Révisions (« À revoir »)

- Une question ratée après 2 essais est copiée (énoncé, figure, réponse attendue) dans la file « À revoir », pour le lendemain.
- Réussie en révision, elle revient 3 jours plus tard, puis 7 jours plus tard, puis sort de la file. Ratée, elle revient le lendemain.
- Une série sur une compétence inclut jusqu'à 2 révisions dues pour cette compétence.
- L'écran « Révisions » propose une série avec toutes les révisions dues (10 au maximum).
- Les révisions comptent pour les étoiles et les statistiques, pas pour le changement de niveau.

### 5.4 Composition d'une série

- **Série sur une compétence** (10 questions) : les révisions dues (2 au maximum), puis des questions au niveau actuel.
- **Entraînement du jour** (10 questions) : jusqu'à 4 révisions dues, puis des questions tirées des compétences « Découverte » ou « En cours » travaillées récemment, mélangées.
- Jamais deux fois le même énoncé dans une série. Pour la banque, on privilégie les questions jamais vues, puis les moins récemment vues.

## 6. Défis chronométrés

- **Principe** : 60 secondes pour donner le plus de bonnes réponses possible. Pas d'indice. Une erreur est signalée brièvement (la bonne réponse s'affiche environ 1 s) et on passe à la question suivante.
- Les questions sont toutes générées, avec saisie numérique.
- Si l'onglet passe en arrière-plan, le défi est annulé (« Défi interrompu »).

| Défi                                                    | Exemples                     |
| ------------------------------------------------------- | ---------------------------- |
| Tables de multiplication (toutes, ou une table choisie) | 7 × 8                        |
| Compléments                                             | 100 − 37 ; 0,4 + ? = 1       |
| × et ÷ par 10, 100, 1 000                               | 3,7 × 100 ; 45 ÷ 10          |
| Doubles et moitiés                                      | moitié de 68 ; double de 2,5 |
| Additions et soustractions mentales                     | 48 + 27 ; 7,5 − 2,8          |

- **Score** : le nombre de bonnes réponses. On garde un record personnel par défi (et par table pour les tables), on affiche « Nouveau record ! » et on conserve l'historique (courbe dans l'espace parent et dans « Mes trophées »).
- **Étoiles** : 1 ⭐ par tranche de 5 bonnes réponses, +3 ⭐ pour un nouveau record.

## 7. Motivation

### 7.1 Principes

Rien de punitif : pas de vies, pas de perte d'étoiles, pas de classement, pas de « série de jours » qui se casse. Les messages d'encouragement varient et sont regroupés dans un fichier de textes.

### 7.2 Étoiles

- +2 ⭐ pour une réponse juste du 1er coup, +1 ⭐ au 2e essai, 0 sinon.
- +5 ⭐ de bonus pour une série parfaite (10/10 du 1er coup).
- Défis : voir §6.
- Les étoiles **ne se dépensent pas**. Leur total sert de palier pour débloquer des thèmes et des avatars. C'est plus simple et jamais frustrant.

### 7.3 Badges (liste initiale)

| Badge                       | Condition                                                    |
| --------------------------- | ------------------------------------------------------------ |
| Premiers pas                | Terminer sa 1re série                                        |
| Sans faute                  | Une série 10/10 du 1er coup                                  |
| Persévérance 🥉🥈🥇         | 10 / 50 / 200 questions réussies au 2e essai                 |
| Revanche                    | Réussir 10 questions « à revoir »                            |
| Grand tour                  | Au moins une série dans chaque chapitre                      |
| Acquis                      | Une compétence au niveau 3                                   |
| Maîtrise                    | Une compétence « Maîtrisé »                                  |
| Chapitre maîtrisé           | Toutes les compétences d'un chapitre « Maîtrisé »            |
| Éclair                      | Battre un record personnel en défi                           |
| Pro des tables              | 200 bonnes réponses au défi « Tables »                       |
| Régularité                  | S'entraîner 5 jours différents sur une période de 2 semaines |
| Bonnes réponses 🥉🥈🥇      | 100 / 500 / 2 000 bonnes réponses                            |
| Collection d'étoiles 🥉🥈🥇 | 100 / 500 / 1 000 ⭐                                         |

Les badges non obtenus sont visibles mais grisés, avec leur condition.

### 7.4 Personnalisation

- **Thèmes** : 6 thèmes (couleurs et fond). 3 sont disponibles dès le départ, les autres se débloquent à 100, 250 et 500 ⭐.
- **Avatars** : une vingtaine (emoji en v1). 8 sont disponibles dès le départ, les autres se débloquent par paliers d'étoiles ou avec certains badges.
- **Sons** : courts (bonne réponse, badge, record), désactivables.
- **Pavé numérique** : option pour l'afficher même sur ordinateur.

## 8. Espace parent

- **Accès** : un code à 4 chiffres, défini à la première ouverture et stocké haché. C'est une barrière symbolique, pas une vraie sécurité. La marche à suivre en cas d'oubli est décrite dans le README.
- **Tableau de bord**
  - Temps d'entraînement et nombre de questions par jour, sur 7 et 30 jours
  - Par chapitre et par compétence : niveau, état, taux de réussite, dernière activité
  - Dernières erreurs : énoncé, sa réponse, réponse attendue, date
  - Révisions en attente
  - Records des défis et leur évolution
- **Réglages**
  - Masquer ou afficher des chapitres et des compétences (ex. ce qui n'a pas encore été vu en classe)
  - Nom de l'appareil (« PC », « Tablette »), repris dans les exports
  - Changer le code
  - Réinitialiser la progression (double confirmation, avec proposition d'exporter avant)
- **Sauvegarde**
  - Exporter la progression dans un fichier `.json`
  - Importer un fichier : aperçu (appareil, date, nombre de réponses), puis fusion (§11.8)
  - Rappel « Dernière sauvegarde il y a N jours », mis en avant au-delà de 14 jours
- **Aperçu du contenu** : pour chaque compétence et chaque niveau, 10 questions d'exemple avec réponse, indice et correction. Ça permet de relire les générateurs et la banque sans faire les exercices.

## 9. Contenu pédagogique (maths, 6e)

> À recaler sur la progression de sa professeure (cahier de textes, Pronote, manuel) : ordre des chapitres, notations, vocabulaire.
> « Gén. » = générateur aléatoire, « Banque » = questions rédigées. « + SVG » = la question inclut une figure générée.

### Chapitre 1 : Nombres entiers (`entiers`)

| id                | Compétence                                                       | Source                                                         | Progression niveau 1 → 3                                         |
| ----------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `ecrire`          | Écrire les nombres en chiffres et en lettres                     | Gén. (lettres → chiffres en saisie, chiffres → lettres en QCM) | < 1 000 → < 1 000 000 → millions, milliards                      |
| `valeur-chiffres` | Valeur d'un chiffre, nombre de dizaines/centaines, décomposition | Gén.                                                           | < 10 000 → < 1 000 000 → milliards                               |
| `comparer-ranger` | Comparer, ranger, encadrer                                       | Gén. (QCM, saisie)                                             | < 1 000 → grands nombres → encadrer à la dizaine, à la centaine… |

### Chapitre 2 : Écriture décimale et fractions (`decimaux`), chapitre du lot 1

C'est ce qu'elle travaille en classe en ce moment (octobre 2026).

| id                    | Compétence                                                                  | Source                                                         | Progression niveau 1 → 3                                                                        |
| --------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `fractions-decimales` | Fraction décimale ↔ écriture décimale                                       | Gén.                                                           | 7/10 = 0,7 → 254/100 = 2,54 → 3 + 4/10 + 5/1 000 = ? ; 0,07 = ?/100                             |
| `decomposition`       | Décomposer un décimal, valeur d'un chiffre (dixièmes, centièmes, millièmes) | Gén.                                                           | chiffre des dixièmes → nombre de centièmes dans 3,25 (325) → décompositions variées             |
| `decimaux-lettres`    | Lire et écrire un décimal en lettres (« 3 unités et 25 centièmes »)         | Gén. (lettres → chiffres en saisie, chiffres → lettres en QCM) | dixièmes → centièmes → millièmes, formulations variées                                          |
| `fractions-usuelles`  | Fractions simples ↔ écriture décimale                                       | Gén.                                                           | 1/2 = 0,5 ; 1/4 = 0,25 → 3/4, 1/5, 2/5 → fractions > 1 (5/2, 7/4)                               |
| `droite-graduee`      | Lire l'abscisse d'un point, en écriture décimale ou en fraction décimale    | Gén. + SVG                                                     | dixièmes → centièmes → deux nombres seulement : trouver le pas (0,5 ; 0,25 ; 0,2 ; 0,05 ; 0,02) |
| `comparer-ranger`     | Comparer et ranger des décimaux                                             | Gén. (QCM)                                                     | même longueur → pièges (2,5 / 2,15) → le plus petit parmi 4 nombres                             |
| `encadrer-arrondir`   | Encadrer, intercaler, arrondir                                              | Gén.                                                           | à l'unité → au dixième → au centième, intercaler                                                |

### Chapitre 3 : Calcul (`calcul`)

| id                      | Compétence                                                      | Source                         | Progression niveau 1 → 3                                                              |
| ----------------------- | --------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| `calcul-mental`         | Tables, compléments, × et ÷ par 10/100/1 000                    | Gén.                           | tables → compléments → × et ÷ décimaux par 10, 100, 1 000                             |
| `addition-soustraction` | Additions et soustractions                                      | Gén.                           | entiers → décimaux de même longueur → décimaux de longueurs différentes (12,5 − 3,78) |
| `multiplication`        | Multiplication                                                  | Gén.                           | entier × 1 chiffre → entier × 2 chiffres → décimal × décimal                          |
| `division`              | Division euclidienne et décimale                                | Gén. (champs quotient + reste) | ÷ 1 chiffre → ÷ 2 chiffres → quotient décimal exact                                   |
| `multiples-diviseurs`   | Multiples, diviseurs, critères de divisibilité (2, 3, 5, 9, 10) | Gén. (QCM)                     | 2, 5, 10 → 3, 9 → mélange, liste des diviseurs                                        |
| `ordre-grandeur`        | Estimer un ordre de grandeur                                    | Gén. (QCM)                     | additions → multiplications → décimaux                                                |
| `problemes`             | Problèmes                                                       | Banque                         | 1 étape → 2 étapes → plusieurs étapes, données inutiles                               |

### Chapitre 4 : Fractions (`fractions`)

| id                   | Compétence                                                    | Source     | Progression niveau 1 → 3                                    |
| -------------------- | ------------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| `fraction-figure`    | Lire une fraction sur une figure (disque, rectangle, segment) | Gén. + SVG | demis, quarts → jusqu'aux douzièmes → fractions > 1         |
| `fraction-droite`    | Lire une fraction sur une droite graduée                      | Gén. + SVG | < 1 → > 1 → graduations à choisir                           |
| `fractions-egales`   | Fractions égales : compléter, simplifier                      | Gén.       | 1/2 = ?/4 → 6/8 = 3/? → simplifier 12/18                    |
| `comparer-fractions` | Comparer à 1, comparer à dénominateur ou numérateur égal      | Gén. (QCM) | à 1 → même dénominateur → même numérateur                   |
| `fraction-quantite`  | Fraction d'une quantité                                       | Gén.       | 1/2 de 18 → 3/4 de 20 → 7/10 de 250                         |
| `fraction-quotient`  | Fraction-quotient (7/3 × 3 = 7, 7/3 est entre 2 et 3)         | Gén.       | ? × 3 = 7 → encadrer entre deux entiers → écriture décimale |

### Chapitre 5 : Proportionnalité et données (`proportionnalite`)

| id                           | Compétence                                              | Source       | Progression niveau 1 → 3                                                  |
| ---------------------------- | ------------------------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `tableau-proportionnalite`   | Reconnaître ou compléter un tableau de proportionnalité | Gén.         | coefficient entier → passage par l'unité → linéarité, coefficient décimal |
| `problemes-proportionnalite` | Problèmes (recettes, prix, vitesses, échelles simples)  | Banque       |                                                                           |
| `pourcentages`               | Pourcentages simples                                    | Gén.         | 50 % → 10 %, 25 % → 75 %, 20 %, 30 %                                      |
| `lire-donnees`               | Lire un tableau, un diagramme en barres, un graphique   | Banque + SVG |                                                                           |

### Chapitre 6 : Grandeurs et mesures (`mesures`)

| id            | Compétence                                  | Source                   | Progression niveau 1 → 3                                                       |
| ------------- | ------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| `conversions` | Longueurs, masses, contenances              | Gén.                     | unité voisine, entiers → plusieurs rangs → décimaux (3,5 km en m)              |
| `durees`      | Durées et horaires                          | Gén. (champs h + min)    | h ↔ min → calcul d'une durée → horaires avec passage de l'heure                |
| `perimetres`  | Périmètres (polygones, cercle)              | Gén. + SVG               | carré, rectangle → polygones → cercle (π ≈ 3,14)                               |
| `aires`       | Aires et unités d'aire                      | Gén. + SVG               | rectangle, carré → triangle rectangle, conversions → disque, figures composées |
| `volumes`     | Volume du pavé droit, contenances           | Gén.                     | compter des cubes → formule → conversions cm³ ↔ L                              |
| `angles`      | Nature d'un angle, mesure lue au rapporteur | Gén. + SVG (QCM, saisie) | aigu/droit/obtus → lecture simple → lecture avec double graduation             |

### Chapitre 7 : Géométrie (`geometrie`)

En v1, uniquement de la reconnaissance (QCM + figures), sans construction.

| id                            | Compétence                                                         | Source        |
| ----------------------------- | ------------------------------------------------------------------ | ------------- |
| `vocabulaire`                 | Point, droite, segment, demi-droite, notations [AB], (AB), [AB)    | Banque + SVG  |
| `paralleles-perpendiculaires` | Reconnaître des droites parallèles ou perpendiculaires, propriétés | Banque + SVG  |
| `cercle`                      | Centre, rayon, diamètre, corde (rayon ↔ diamètre)                  | Banque + Gén. |
| `figures`                     | Triangles et quadrilatères particuliers, leurs propriétés          | Banque + SVG  |
| `symetrie`                    | Axes de symétrie, reconnaître le symétrique d'une figure           | Banque + SVG  |
| `solides`                     | Reconnaître les solides, patrons du cube et du pavé                | Banque + SVG  |

**Premier lot de la banque** : au moins 20 questions par compétence « Banque », réparties sur les 3 niveaux, rédigées par Claude et relues par le parent.

## 10. Formats de réponse et saisie

### 10.1 Types de réponse

| Type       | Saisie                                                           | Validation                                                                                                              |
| ---------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `number`   | Nombre entier ou décimal                                         | On ignore les espaces et les zéros inutiles (`03,50` = `3,5`), `.` vaut `,`. Comparaison exacte, sans nombres flottants |
| `fraction` | `a/b` (touche fraction sur le pavé)                              | Mode `equivalent` (par défaut), `exact` ou `irreductible`. Option pour accepter un entier quand la fraction en vaut un  |
| `multi`    | Plusieurs champs `number` avec étiquette (quotient/reste, h/min) | Tous les champs doivent être justes                                                                                     |
| `choice`   | QCM de 2 à 4 choix, ordre mélangé                                | Règle d'essais du §4.5                                                                                                  |

- Une **unité** éventuelle s'affiche à côté du champ. Elle n'est pas à taper.
- Les énoncés acceptent un mini-balisage pour les fractions, ex. `Calcule [[3/4]] de 20`.

### 10.2 Saisie

- **Ordinateur** : clavier physique, Entrée pour valider, focus automatique sur le champ.
- **Tablette** (détectée par `pointer: coarse`, ou forcée par l'option du §7.4) : pavé numérique à l'écran (0–9, virgule, barre de fraction si utile, effacer, valider). Le clavier système est désactivé (`inputmode="none"`) pour ne pas masquer l'énoncé.

### 10.3 Affichage mathématique

- Nombres au format français : `12 345,6` (espace insécable fine).
- Fractions empilées (en CSS), symboles ×, ÷, −.
- Figures en SVG générées : droite graduée, fractions de figures, polygones avec leurs dimensions, angles et rapporteur, diagrammes. Elles s'adaptent à la taille de l'écran. La mention « La figure n'est pas à l'échelle » s'affiche quand c'est le cas.

## 11. Architecture technique

### 11.1 Stack

| Brique                           | Rôle                                                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vite**                         | Serveur de développement avec rechargement instantané. Build de production : fichiers minifiés, avec un hash dans leur nom pour éviter les problèmes de cache |
| **TypeScript**                   | Vérifie les types, en particulier les formats de question et de réponse (§11.4) et les générateurs                                                            |
| **Preact** + **@preact/signals** | Interface en composants JSX (≈ 10 Ko). Les signals gèrent l'état : les valeurs dérivées (étoiles, niveaux) se recalculent automatiquement                     |
| **vite-plugin-pwa**              | Génère le service worker et le manifeste : mise en cache de tous les fichiers du build, détection des mises à jour                                            |
| **Vitest**                       | Tests unitaires, avec la même configuration que Vite                                                                                                          |
| **Prettier**                     | Formatage du code                                                                                                                                             |

- Seules `preact` et `@preact/signals` sont embarquées dans le site. Tout le reste ne sert qu'au développement.
- Les versions sont figées par `package-lock.json`. Node en version LTS.
- **Seul `src/ui/` dépend de Preact.** La logique (`core/`, `subjects/`) est en TypeScript pur, testable sans navigateur et réutilisable si on change de framework.
- Routage par hash (`#/maths/decimaux/droite-graduee`) : aucune configuration côté hébergeur, pas de 404 quand on recharge la page.
- `base: "./"` dans la configuration Vite : les chemins sont relatifs, donc le site marche quelle que soit son URL (`<user>.github.io/<dépôt>/`, `<user>.gitlab.io/<dépôt>/`…).
- Scripts npm : `dev` (serveur local), `build`, `preview` (tester le build, PWA comprise), `test`, `check` (`tsc --noEmit`).

### 11.2 Arborescence

```
index.html
package.json
vite.config.ts               base relative, plugins Preact et PWA
tsconfig.json
public/                      copié tel quel : icônes, sons, polices
src/
  main.tsx
  config.ts                  seuils, paliers, barème des étoiles
  texts.ts                   textes de l'interface, encouragements
  core/
    types.ts                 Subject, Skill, Question, Answer…
    router.ts
    storage.ts               localStorage, versions, migrations, export/import
    rng.ts                   aléatoire à graine
    decimal.ts               arithmétique décimale exacte
    answers.ts               normalisation et vérification des réponses
    adaptive.ts              niveaux, états, composition des séries
    reviews.ts               file « À revoir »
    rewards.ts               étoiles, badges, déblocages
  ui/
    screens/                 Accueil, Chapitres, Série, Bilan, Défis, Trophées, Parent…
    components/              Question, NumPad, Fraction, Feedback, Stars…
    figures/                 rendu SVG des figures
    styles/                  thèmes (variables CSS), styles globaux
  subjects/
    index.ts                 registre des matières
    maths/
      index.ts               chapitres et compétences
      generators/<chapitre>/ un fichier par compétence générée, avec son test (*.test.ts)
      lib/                   écriture des nombres, rangs, nombres en lettres
      bank/                  un fichier par compétence « Banque »
.github/workflows/deploy.yml   ou .gitlab-ci.yml
```

### 11.3 Contrat d'une matière

Ajouter une matière revient à ajouter un dossier dans `subjects/` et à l'enregistrer dans `subjects/index.js`.

```ts
// src/subjects/maths/index.ts
import type { Subject } from "../../core/types";

export default {
  id: "maths",
  name: "Mathématiques",
  icon: "📐",
  chapters: [
    {
      id: "calcul",
      name: "Calcul",
      skills: [
        {
          id: "multiplication",
          name: "Multiplier",
          levels: 3,
          generator: () => import("./generators/multiplication"),
        },
        { id: "problemes", name: "Problèmes", levels: 3, bank: () => import("./bank/problemes") },
      ],
    },
  ],
} satisfies Subject;
```

L'identifiant complet d'une compétence est `maths.calcul.multiplication`. **Les identifiants ne doivent jamais changer**, car ils sont enregistrés dans la progression.

### 11.4 Contrat d'une question

C'est le format commun produit par les générateurs et par la banque.

```ts
// src/core/types.ts (extrait)
type Answer =
  | { type: "number"; value: string } // "3,5"
  | { type: "fraction"; num: number; den: number; accept: "equivalent" | "exact" | "irreductible" }
  | { type: "multi"; fields: { label: string; value: string }[] } // quotient + reste, h + min
  | { type: "choice"; choices: string[]; correct: number };

interface Question {
  skill: string; // "maths.calcul.multiplication"
  level: 1 | 2 | 3;
  ref: string; // "gen:4021337" (graine) ou id de la question de banque
  prompt: string; // "Calcule : 4,5 × 12"
  figure?: Figure; // { kind: "number-line", ... }
  answer: Answer; // { type: "number", value: "54" }
  unit?: string; // "cm", affiché après le champ
  hint: string; // "Calcule d'abord 4,5 × 10, puis 4,5 × 2."
  solution: string[]; // ["4,5 × 10 = 45", "4,5 × 2 = 9", "45 + 9 = 54"]
}
```

### 11.5 Générateurs

- Ce sont des fonctions pures `generate({ level, rng }): Question`, sans accès au DOM, donc testables par Vitest sans navigateur.
- L'aléatoire utilise une graine (ex. mulberry32) : compétence + niveau + graine donnent toujours la même question, ce qui sert à l'aperçu et aux tests.
- **Arithmétique décimale exacte** : les calculs se font en entiers (ex. en millièmes), jamais avec `0.1 + 0.2` en flottant.
- Chaque générateur produit aussi l'indice et la correction, adaptés aux nombres tirés.
- Pas de questions triviales ou dégénérées : × 1, × 0, résultat négatif, quotient non exact quand on attend un quotient exact…
- Les mauvais choix des QCM reprennent les erreurs typiques (ex. « 2,15 > 2,5 parce que 15 > 5 »).

### 11.6 Banque de questions

Un fichier TypeScript par compétence. Les questions peuvent être commentées, et TypeScript signale tout champ manquant ou mal formé. Chaque question a un `id` stable, jamais réutilisé.

```ts
// src/subjects/maths/bank/problemes.ts
import type { BankQuestion } from "../../../core/types";

export default [
  {
    id: "pb-001",
    level: 1,
    prompt: "Un cahier coûte 2,40 €. Combien coûtent 5 cahiers ?",
    answer: { type: "number", value: "12" },
    unit: "€",
    hint: "On cherche le prix de 5 cahiers : c'est une multiplication.",
    solution: ["5 × 2,40 = 12", "5 cahiers coûtent 12 €."],
  },
] satisfies BankQuestion[];
```

### 11.7 Stockage

- **localStorage**, clés préfixées `exos.`, avec un numéro `schemaVersion` et des migrations à chaque changement de format.
- Les données de base forment un **journal** auquel on ne fait qu'ajouter. Tout le reste (niveaux, états, révisions, étoiles, badges) est **recalculé** à partir de lui, ce qui permet de fusionner deux appareils sans conflit.

```js
profile:  { name, avatar, theme, sound, forceKeypad, updatedAt }
settings: { pinHash, hidden: [], deviceName, lastExportAt, updatedAt }
attempts: [{ id, ts, sessionId, skill, level, mode,   // "serie" | "revision" | "defi"
             ok, tries, ms, reviewOf?,                 // reviewOf = id de l'essai raté d'origine
             snapshot? }]                              // si raté : { prompt, figure, answer, given, solution }
sessions: [{ id, ts, mode, skill?, challenge?, score, durationMs }]
seenBadges: [ids]                                      // pour ne pas re-célébrer un badge
```

- **Volume** : environ 100 octets par réponse, soit à peu près 2 Mo pour 20 000 réponses (une année intensive). Le quota de localStorage est d'environ 5 Mo. Si besoin plus tard : compactage des anciennes réponses ou passage à IndexedDB.
- Le site appelle `navigator.storage.persist()` pour limiter le risque d'effacement par le navigateur.
- **Tablette Android** : installer le site depuis Chrome (menu ⋮ → « Installer l'application » ou « Ajouter à l'écran d'accueil »). Il s'ouvre alors en plein écran comme une appli, marche hors ligne, et Chrome accorde plus facilement le stockage persistant. Sinon, Chrome peut effacer les données si la tablette manque d'espace.
- ⚠️ Le stockage est **lié à l'adresse du site** : changer d'hébergeur ou d'URL fait repartir de zéro. Il faut exporter avant toute migration.

### 11.8 Export, import et fusion

- Fichier `progression-<prénom>-<appareil>-AAAA-MM-JJ.json` contenant `{ app, schemaVersion, exportedAt, deviceName, data }`.
- Sur tablette, l'export passe par le menu de partage natif (Web Share API) quand il est disponible, sinon par un téléchargement.
- **Import** :
  1. Vérification du fichier : bonne application ; migration s'il vient d'une version plus ancienne ; refus s'il vient d'une version plus récente.
  2. Aperçu : appareil, date, nombre de réponses.
  3. **Fusion** : réunion des `attempts` et des `sessions` (dédoublonnées par `id`). Pour `profile` et `settings`, on garde la version la plus récente (`updatedAt`).
- Usage PC + tablette : exporter sur un appareil, importer sur l'autre, et inversement. Les deux appareils ont alors la même progression.

### 11.9 PWA et hébergement

- **vite-plugin-pwa** génère le manifeste (nom, icônes, couleurs, `display: standalone`) et le service worker, qui met en cache tous les fichiers du build.
- Quand une nouvelle version est disponible, le message « Mise à jour disponible » s'affiche, jamais au milieu d'une série.
- **Déploiement automatique sur GitHub Pages** à chaque push sur `main` (`.github/workflows/deploy.yml`) : la CI installe les dépendances, lance `check` et les tests, fait le build et publie `dist/`. Si un test échoue, rien n'est publié. Les pull requests sont vérifiées sans être publiées.
- GitHub Pages est gratuit avec un dépôt public (un dépôt privé demande une offre payante). Il sert le site en HTTPS, ce qui est nécessaire pour le service worker et pour le hachage du code parent.
- ⚠️ Sur GitHub Pages, tous les dépôts d'un même compte partagent l'adresse `<user>.github.io`, donc le même localStorage. D'où le préfixe `exos.` sur toutes les clés.
- Aucun appel réseau vers un tiers : pas d'outil de statistiques, polices hébergées avec le site.

### 11.10 Tests

- **Vitest** sur toute la logique : générateurs, vérification des réponses, adaptation, révisions, badges, fusion, migrations.
- `npm run check` : aucune erreur TypeScript. La CI lance `check` et les tests avant chaque déploiement.
- Pour chaque générateur, chaque niveau et 500 graines : question valide, réponse recalculée indépendamment, valeurs dans les bornes du niveau, pas de choix de QCM en double, indice et correction présents.
- Vérification de la banque : `id` uniques, champs obligatoires présents, bonne réponse de QCM existante.
- Tests manuels sur ordinateur (Firefox, Chrome) et sur la tablette.

## 12. Exigences non fonctionnelles

- **Responsive** : tablette en portrait et en paysage, ordinateur. Cibles tactiles d'au moins 48 px. Une question tient sur un écran de tablette sans défilement.
- **Léger** : moins de 300 Ko hors sons et polices, démarrage instantané une fois installé.
- **Hors ligne** dès la deuxième visite.
- **Navigateurs** : Chrome sur Android pour la tablette ; versions récentes de Chrome, Firefox et Edge sur ordinateur.
- **Vie privée** : aucune donnée ne quitte l'appareil, sauf par un export volontaire.
- **Accessibilité de base** : contrastes suffisants (AA), navigation au clavier, focus visible, retours juste/faux annoncés aux lecteurs d'écran (`aria-live`), aucune information portée uniquement par la couleur.
- **Lisibilité** : une police hébergée avec le site et facile à lire (ex. Lexend ou Atkinson Hyperlegible), avec des chiffres bien distincts.
- **Ton** : tutoiement, phrases courtes, jamais culpabilisant (« Pas tout à fait… » plutôt que « Faux ! »).
- Tous les textes de l'interface sont regroupés dans `texts.js`.

## 13. Découpage en lots

| Lot                  | Contenu                                                                                                                                                                                             | Résultat                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 0. Socle ✅          | Projet Vite + TypeScript + Preact, routage, thèmes, stockage versionné, PWA, tests, CI de déploiement                                                                                               | Site vide en ligne, installable             |
| 1. Première série ✅ | Affichage des questions (4 types de réponse), pavé numérique, indice et correction, bilan. Chapitre « Écriture décimale et fractions » en générateurs, avec la droite graduée (première figure SVG) | Elle peut s'entraîner sur sa leçon actuelle |
| 2. Progression       | Adaptation, révisions, étoiles, écran des compétences, export/import                                                                                                                                | Suivi, PC et tablette synchronisables       |
| 3. Motivation        | Défis chronométrés, badges, thèmes et avatars à débloquer, sons                                                                                                                                     | Côté ludique complet                        |
| 4. Espace parent     | Code, tableau de bord, réglages, aperçu du contenu                                                                                                                                                  | Suivi parent                                |
| 5. Contenu           | Autres chapitres (générateurs + figures SVG), premier lot de la banque                                                                                                                              | Programme de 6e couvert                     |

**Pistes pour la v2** : interactions supplémentaires (droite graduée cliquable, glisser-déposer, tableaux à compléter), géométrie interactive, questions de banque avec des nombres tirés au hasard, autres matières, 5e, synchronisation automatique, plusieurs profils, éditeur de questions, police dys et lecture audio.

## 14. Questions ouvertes

1. **Contenu exact du chapitre « Écriture décimale et fractions »** : la liste du §9 (chapitre 2) correspond-elle au sommaire de son cahier ? Y a-t-il aussi les fractions « partage » (lire une fraction sur une figure) ? Et dans quel ordre viennent les chapitres suivants ? La réponse fixe le contenu du lot 1 et l'ordre du lot 5.
2. **Conventions de sa professeure** :
   - nombres en lettres : traits d'union partout (orthographe de 1990, choisie par défaut) ou règle traditionnelle ?
   - notation des durées (`1 h 30 min`) ;
   - symbole de la division (`÷` ou `:`) ;
   - π : 3,14 ou touche π ;
   - faut-il toujours rendre les fractions irréductibles ?
3. **Nom du site** : elle pourrait le choisir.
4. **Sons** : activés ou coupés par défaut ?
