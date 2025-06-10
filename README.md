
# MaSanté+ : Votre Assistant Personnalisé pour la Gestion du Diabète Type 2 + Cholestérol

MaSanté+ est une application web moderne conçue pour aider les utilisateurs à gérer leur diabète de type 2 **et leur cholestérol** au quotidien. Elle intègre une planification de repas intelligente assistée par IA, un suivi des médicaments, et une interface utilisateur intuitive pour une meilleure prise en charge de la santé.

## Table des Matières

- [Principe de l'Application](#principe-de-lapplication)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Stack Technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et Lancement en Local](#installation-et-lancement-en-local)
    - [1. Cloner le Dépôt](#1-cloner-le-dépôt)
    - [2. Installer les Dépendances](#2-installer-les-dépendances)
    - [3. Configurer Firebase](#3-configurer-firebase)
    - [4. Configurer Genkit (Google AI)](#4-configurer-genkit-google-ai)
    - [5. Lancer l'Application](#5-lancer-lapplication)
- [Scripts Disponibles](#scripts-disponibles)
- [Structure du Projet (Aperçu)](#structure-du-projet-aperçu)
- [Contribuer](#contribuer)

## Principe de l'Application

L'objectif principal de MaSanté+ est de fournir aux personnes atteintes de diabète de type 2 et/ou d'hypercholestérolémie des outils simples et efficaces pour :
- **Planifier leurs repas** : Générer des plans de repas personnalisés, équilibrés et adaptés à leurs besoins spécifiques. Cela inclut la prise en compte des préférences alimentaires, des recommandations nutritionnelles pour le diabète de type 2 (contrôle des glucides, index glycémique bas) <mcreference link="https://www.lesfruitsetlegumesfrais.com/bien-manger/alimentation-cholesterol" index="1">1</mcreference> <mcreference link="https://www.ameli.fr/assure/sante/themes/trop-cholesterol-triglycerides-dans-sang-dyslipidemie/traitement" index="2">2</mcreference> <mcreference link="https://www.vidal.fr/maladies/coeur-circulation-veines/cholesterol/regimes-anti-cholesterol.html" index="3">3</mcreference>
        et pour la gestion du cholestérol (privilégier les graisses insaturées, augmenter l'apport en fibres, limiter les graisses saturées) <mcreference link="https://www.lesfruitsetlegumesfrais.com/bien-manger/alimentation-cholesterol" index="1">1</mcreference> <mcreference link="https://www.ameli.fr/assure/sante/themes/trop-cholesterol-triglycerides-dans-sang-dyslipidemie/traitement" index="2">2</mcreference> <mcreference link="https://www.vidal.fr/maladies/coeur-circulation-veines/cholesterol/regimes-anti-cholesterol.html" index="3">3</mcreference>, ainsi que les dernières recommandations médicales.
- **Gérer leurs traitements médicamenteux** : Suivre leurs médicaments, leurs stocks, et configurer des rappels pour améliorer l'observance du traitement.

L'application utilise l'intelligence artificielle pour la génération des plans de repas, offrant une expérience personnalisée et évolutive.

## Fonctionnalités Principales

- **Planification de Repas par IA** :
        - Génération de plans journaliers ou hebdomadaires.
        - Prise en compte des aliments disponibles, favoris, à éviter (allergies/dégoûts).
        - Basé sur des recommandations nutritionnelles pour le diabète de type 2 (par exemple, contrôle de la quantité et de la qualité des glucides, apport suffisant en fibres) <mcreference link="https://www.lesfruitsetlegumesfrais.com/bien-manger/alimentation-cholesterol" index="1">1</mcreference> <mcreference link="https://www.ameli.fr/assure/sante/themes/trop-cholesterol-triglycerides-dans-sang-dyslipidemie/traitement" index="2">2</mcreference> <mcreference link="https://www.vidal.fr/maladies/coeur-circulation-veines/cholesterol/regimes-anti-cholesterol.html" index="3">3</mcreference>
        et la gestion du cholestérol (par exemple, choix des bonnes matières grasses, consommation de poissons gras riches en oméga-3, apport en fibres via les fruits, légumes et céréales complètes) <mcreference link="https://www.lesfruitsetlegumesfrais.com/bien-manger/alimentation-cholesterol" index="1">1</mcreference> <mcreference link="https://www.ameli.fr/assure/sante/themes/trop-cholesterol-triglycerides-dans-sang-dyslipidemie/traitement" index="2">2</mcreference> <mcreference link="https://www.vidal.fr/maladies/coeur-circulation-veines/cholesterol/regimes-anti-cholesterol.html" index="3">3</mcreference>.
        - Détail des recettes, ingrédients, temps de préparation et conseils pour chaque plat.
- **Gestion des Médicaments** :
        - Ajout, modification et suppression de médicaments.
        - Suivi des informations : nom, dosage, forme, couleur indicative.
        - Gestion des stocks avec alerte de stock bas.
        - Configuration de rappels de prise (fréquence, jours, heures).
- **Sauvegarde et Chargement des Plans** :
        - Plans de repas générés stockés dans Firebase Firestore.
        - Possibilité de nommer, sauvegarder, charger et supprimer des plans.
- **Personnalisation des Préférences** :
        - Gestion fine des préférences alimentaires (favoris, à éviter, allergènes).
        - Modification des informations nutritionnelles des aliments (localement).
        - Sauvegarde des paramètres du formulaire pour une utilisation ultérieure.
- **Interface Utilisateur Moderne et Responsive** :
        - Design "mobile-first" avec des composants ShadCN UI et Tailwind CSS.
        - Thème sombre avec des effets néon subtils pour une expérience visuelle agréable.

## Stack Technique

MaSanté+ est construit avec les technologies et bibliothèques suivantes :

- **Framework Frontend** :
        - **Next.js 15+** : Framework React pour la production (utilisation de l'App Router).
        - **React 18+** : Bibliothèque JavaScript pour la construction d'interfaces utilisateur.
        - **TypeScript** : Sur-ensemble de JavaScript ajoutant un typage statique.

- **Interface Utilisateur (UI)** :
        - **ShadCN UI** : Collection de composants d'interface utilisateur réutilisables et accessibles, construits sur Radix UI et Tailwind CSS.
        - **Tailwind CSS** : Framework CSS "utility-first" pour un style rapide et personnalisé.
        - **Lucide React** : Bibliothèque d'icônes SVG.
        - **`react-color`** : Pour la sélection de couleur des médicaments.

- **Intelligence Artificielle (IA)** :
        - **Genkit (Google AI)** : Toolkit pour construire des fonctionnalités basées sur l'IA générative.
                - Utilisation de `gemini-2.0-flash` (ou modèles similaires) pour la génération de texte (plans repas).
        - **`zod`** : Pour la validation de schémas (utilisé avec Genkit pour définir les entrées/sorties des flux IA).

- **Backend et Base de Données** :
        - **Firebase** : Plateforme de développement d'applications de Google.
                - **Firestore** : Base de données NoSQL flexible et scalable pour stocker les plans de repas sauvegardés.

- **Gestion de l'État et Hooks** :
        - **Hooks React** (`useState`, `useEffect`, `useContext`, `useCallback`).
        - **`useLocalStorage`** : Hook personnalisé pour persister certains états (préférences alimentaires, paramètres du formulaire, médicaments) dans le `localStorage` du navigateur.

- **Formulaires** :
        - **React Hook Form** : Bibliothèque pour la gestion des formulaires avec une validation performante.
        - **`@hookform/resolvers`** : Pour intégrer Zod avec React Hook Form.

- **Utilitaires et Autres** :
        - **`date-fns`** : Pour la manipulation avancée des dates.
        - **`clsx`** et **`tailwind-merge`** : Pour la construction conditionnelle et la fusion des classes Tailwind.
        - **`dotenv`** : Pour la gestion des variables d'environnement.

- **Principales Dépendances (`package.json`)** :
        - `next`, `react`, `react-dom`
        - `genkit`, `@genkit-ai/googleai`, `@genkit-ai/next`
        - `firebase`
        - `@radix-ui/*` (pour les composants ShadCN)
        - `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`
        - `lucide-react`
        - `react-hook-form`, `@hookform/resolvers`, `zod`
        - `date-fns`
        - `react-color`
        - `recharts` (pour d'éventuels graphiques futurs)

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (version 18.x ou supérieure recommandée)
- [npm](https://www.npmjs.com/) (généralement inclus avec Node.js) ou [yarn](https://yarnpkg.com/)
- Un compte [Firebase](https://firebase.google.com/)
- Un compte [Google Cloud Platform](https://cloud.google.com/) avec l'API Google AI (Generative Language API) activée et une clé API.

## Installation et Lancement en Local

Suivez ces étapes pour configurer et exécuter le projet sur votre machine locale.

### 1. Cloner le Dépôt

Récupérez le code source du projet depuis GitHub. Si le dépôt est privé, assurez-vous d'avoir les droits d'accès.

```bash
# Si vous utilisez HTTPS
git clone https://github.com/DeRetourDuFutur/my-tad-diabeatz.git

# Ou si vous utilisez SSH
git clone git@github.com:DeRetourDuFutur/my-tad-diabeatz.git

cd VOTRE_NOM_DE_DEPOT
```
Remplacez `VOTRE_NOM_UTILISATEUR/VOTRE_NOM_DE_DEPOT` par les informations réelles de votre dépôt.

### 2. Installer les Dépendances

Installez toutes les dépendances du projet listées dans `package.json`.

```bash
npm install
# ou
# yarn install
```

### 3. Configurer Firebase

L'application utilise Firebase Firestore pour stocker les plans de repas.

1.  **Créez un projet Firebase** : Allez sur la [console Firebase](https://console.firebase.google.com/) et créez un nouveau projet (ou utilisez un projet existant).
2.  **Enregistrez votre application web** : Dans les paramètres de votre projet Firebase, ajoutez une nouvelle application web.
3.  **Récupérez les identifiants Firebase** : Après avoir enregistré votre application, Firebase vous fournira un objet de configuration. Vous en aurez besoin pour le fichier d'environnement.
4.  **Activez Firestore** : Dans la console Firebase, allez dans la section "Firestore Database" et créez une base de données. Commencez en mode test pour un développement facile (vous pourrez ajuster les règles de sécurité plus tard).
5.  **Créez un fichier `.env.local`** : À la racine de votre projet, créez un fichier nommé `.env.local`. Ajoutez-y vos identifiants Firebase :

        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY="VOTRE_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="VOTRE_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="VOTRE_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="VOTRE_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="VOTRE_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="VOTRE_APP_ID"
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="VOTRE_MEASUREMENT_ID" # Optionnel
        ```
        Remplacez les valeurs `VOTRE_...` par celles de votre configuration Firebase.

### 4. Configurer Genkit (Google AI)

L'application utilise Genkit avec Google AI pour la génération de plans repas.

1.  **Obtenez une clé API Google AI** :
        *   Allez sur la [console Google Cloud](https://console.cloud.google.com/).
        *   Assurez-vous que votre projet Google Cloud est sélectionné.
        *   Activez l'API "Generative Language API" (ou "Vertex AI API" si vous préférez utiliser des modèles via Vertex).
        *   Créez une clé API. Vous pouvez la trouver dans "APIs & Services" > "Credentials".
2.  **Ajoutez la clé API à `.env.local`** :

        ```env
        # ... (vos variables Firebase)
        GOOGLE_API_KEY="VOTRE_CLE_API_GOOGLE_AI"
        ```
        Remplacez `VOTRE_CLE_API_GOOGLE_AI` par votre clé.

### 5. Lancer l'Application

Vous devez lancer deux processus en parallèle : le serveur de développement Next.js et le serveur de développement Genkit.

1.  **Lancez le serveur de développement Next.js** :
        Ouvrez un terminal et exécutez :
        ```bash
        npm run dev
        ```
        L'application sera généralement accessible à l'adresse `http://localhost:9002` (ou un autre port si celui-ci est occupé).

2.  **Lancez le serveur de développement Genkit** :
        Ouvrez un **autre terminal** et exécutez :
        ```bash
        npm run genkit:dev
        # ou pour un rechargement automatique des flux Genkit lors des modifications :
        # npm run genkit:watch
        ```
        Le serveur Genkit (UI de développement et proxy pour les flux) sera généralement accessible à l'adresse `http://localhost:4000`. Vous n'interagirez généralement pas directement avec cette URL dans le navigateur, mais il est nécessaire qu'il tourne pour que les appels à l'IA depuis l'application Next.js fonctionnent.

Votre application MaSanté+ devrait maintenant être fonctionnelle en local.

## Scripts Disponibles

Dans le `package.json`, vous trouverez plusieurs scripts utiles :

-   `npm run dev`: Lance l'application Next.js en mode développement avec Turbopack.
-   `npm run genkit:dev`: Démarre le serveur Genkit pour le développement des flux IA.
-   `npm run genkit:watch`: Démarre le serveur Genkit avec surveillance des fichiers pour un rechargement automatique.
-   `npm run build`: Construit l'application Next.js pour la production.
-   `npm run start`: Démarre un serveur de production Next.js (après un `build`).
-   `npm run lint`: Exécute ESLint pour vérifier les erreurs de style et de code.
-   `npm run typecheck`: Exécute le vérificateur de types TypeScript.

## Structure du Projet (Aperçu)

```
.
├── public/                  # Fichiers statiques
├── src/
│   ├── ai/                  # Code lié à Genkit et à l'IA
│   │   ├── dev.ts           # Point d'entrée pour Genkit en dev
│   │   ├── flows/           # Définition des flux Genkit (ex: generate-meal-plan.ts)
│   │   └── genkit.ts        # Configuration globale de Genkit
│   ├── app/                 # Fichiers de l'App Router de Next.js
│   │   ├── globals.css      # Styles globaux et variables CSS Tailwind
│   │   ├── layout.tsx       # Layout racine de l'application
│   │   └── page.tsx         # Page d'accueil principale
│   ├── components/          # Composants React réutilisables
│   │   ├── ui/              # Composants ShadCN UI (auto-générés et personnalisés)
│   │   └── ...              # Autres composants spécifiques à l'application
│   ├── hooks/               # Hooks React personnalisés (ex: useLocalStorage, useToast)
│   ├── lib/                 # Utilitaires, types, configuration Firebase
│   │   ├── firebase.ts      # Initialisation de Firebase
│   │   ├── food-data.ts     # Données initiales pour les aliments
│   │   ├── types.ts         # Définitions TypeScript globales
│   │   └── utils.ts         # Fonctions utilitaires (ex: cn)
│   └── ...
├── .env.local               # Variables d'environnement locales (NON VERSIONNÉES)
├── components.json          # Configuration de ShadCN UI
├── next.config.ts           # Configuration de Next.js
├── package.json             # Dépendances et scripts du projet
├── tailwind.config.ts       # Configuration de Tailwind CSS
├── tsconfig.json            # Configuration de TypeScript
└── README.md                # Ce fichier
```

## Contribuer

Si vous souhaitez contribuer au projet, veuillez suivre les bonnes pratiques habituelles (fork, branches de fonctionnalités, pull requests). Assurez-vous que votre code respecte les conventions de style et passe les vérifications de linting et de typage.

---

 ## Fonctionnalités Implémentées 
 1. Génération de Plans Repas via IA (Genkit) : 
    
    - Utilisation de `generateMealPlan` pour créer des plans alimentaires personnalisés. 
    - Formulaire de configuration ( `meal-plan-form.tsx` ) permettant de spécifier : 
      - Préférences alimentaires (aliments aimés, non aimés, exclus). 
      - Objectifs (perte de poids, maintien, prise de masse). 
      - Recommandations spécifiques (basées sur un résumé de recherche sur le diabète). 
      - Durée du plan (par dates ou nombre de jours). 
    - Affichage détaillé du plan généré ( `meal-plan-display.tsx` ) avec : 
      - Navigation par onglets pour chaque jour. 
      - Accordéons pour chaque type de repas (petit-déjeuner, déjeuner, dîner, collations). 
      - Détails pour chaque plat : temps de préparation, ingrédients, recette, conseils. 
 2. Gestion des Plans Repas (Firestore) : 
    
    - Sauvegarde des plans générés dans Firestore (collection mealPlans dans `page.tsx` ). 
    - Chaque plan sauvegardé inclut le nom du plan, les données du plan et une date de création ( Timestamp ). 
    - Possibilité de mettre à jour un plan existant. 
    - Affichage des plans sauvegardés ( `saved-meal-plans.tsx` ) avec : 
      - Chargement des plans depuis Firestore. 
      - Suppression de plans. 
      - Indicateur de chargement. 
 3. Gestion des Médicaments (Firestore) : 
    
    - Affichage des médicaments dans `MedicationManagementCard.tsx` . 
      - Layout en deux colonnes pour une meilleure lisibilité. 
      - Dosage affiché à côté du nom du médicament. 
      - Informations de stock et seuil en dessous. 
    - Ajout et modification de médicaments via `AddEditMedicationDialog.tsx` . 
    - Les données des médicaments sont stockées et récupérées depuis Firestore (collection medications dans `page.tsx` ). 
 4. Export HTML des Plans Repas : 
    
    - Bouton "Exporter HTML" dans `meal-plan-display.tsx` . 
    - Génération d'un fichier HTML autonome du plan repas affiché. 
    - Le fichier HTML inclut : 
      - Un titre. 
      - Une barre de navigation sticky en haut de page pour les jours. 
      - Le contenu du plan structuré par jour et par repas. 
      - Styles CSS de base pour la lisibilité et un thème sombre. 
 5. Interface Utilisateur et UX : 
    
    - Utilisation de Shadcn UI pour les composants ( `ui` ). 
    - Design général avec un thème sombre et des effets néon. 
    - Barre de défilement personnalisée (plus fine, effet cyan néon) dans `globals.css` . 
    - Notifications (toasts) pour les actions utilisateur (sauvegarde, erreur, etc.) via `useToast` . 
    - Gestion des états de chargement pour une meilleure expérience utilisateur. 
    - Bouton "Scroll to Top" ( `page.tsx` ). 
 ## Connexion à la Base de Données (Firestore vs LocalStorage) 
 - Firestore : L'application est principalement connectée à Firestore pour la persistance des données critiques : 
   - Les plans repas générés et sauvegardés sont stockés dans la collection mealPlans de Firestore (géré dans `page.tsx` ). 
   - Les informations sur les médicaments sont stockées dans la collection medications de Firestore (géré dans `page.tsx` ). 
   - La configuration de Firebase est définie dans `firebase.ts` et utilise les variables d'environnement (ex: NEXT_PUBLIC_FIREBASE_PROJECT_ID ). 
 - LocalStorage : Le LocalStorage est utilisé, mais pour des aspects moins critiques ou des préférences utilisateur locales : 
   - Le hook `useLocalStorage` est disponible. 
   - Dans `meal-plan-form.tsx` , le hook useMealPlanFormLogic (qui utilise useLocalStorage ) sauvegarde et charge les préférences du formulaire (aliments, résumé de recherche, etc.) dans le LocalStorage pour pré-remplir le formulaire lors de visites ultérieures. Cela améliore l'expérience utilisateur en conservant les saisies précédentes. 
 Conclusion sur la connexion : Votre application utilise Firestore comme base de données principale pour les données essentielles (plans, médicaments), et LocalStorage pour la persistance des préférences du formulaire côté client , ce qui est une bonne pratique. 
 
 ## Fonctionnalités Non Implémentées ou Abandonnées 
 1. Export PDF des Plans Repas : 
    
    - Tentative d'implémentation avec html2canvas et jsPDF . 
    - Le résultat initial n'était pas satisfaisant (simple capture d'écran en une page). 
    - Abandonnée car la création d'un PDF multipage bien formaté et optimisé pour l'impression s'est avérée complexe et chronophage avec les outils choisis. L'export HTML existant offre une alternative viable. 
 2. Authentification Utilisateur Complète : 
    
    - Actuellement, un userId = 'testUser' est utilisé dans `meal-plan-form.tsx` pour la sauvegarde des plans dans une sous-collection Firestore. Une véritable authentification (par exemple avec Firebase Authentication) n'est pas encore implémentée pour gérer des utilisateurs distincts. 
 3. Gestion Avancée des Stocks de Médicaments : 
    
    - Bien que le stock et le seuil soient affichés, il n'y a pas de logique pour décrémenter automatiquement le stock ou pour générer des alertes de stock bas. 
 4. Suivi Nutritionnel Détaillé / Journal Alimentaire : 
    
    - L'application génère des plans, mais ne permet pas à l'utilisateur de suivre ce qu'il a réellement consommé ni de comparer avec les objectifs nutritionnels du plan. 
 5. Internationalisation (i18n) : 
    
    - L'application est actuellement en français. Aucune structure pour la traduction dans d'autres langues n'est en place. 
 ## Pistes d'Amélioration Possibles (non exhaustif) 
 - Mettre en place une authentification utilisateur robuste. 
 - Améliorer la gestion des erreurs et des cas limites. 
 - Ajouter des tests unitaires et d'intégration. 
 - Optimiser les performances, notamment pour le chargement des données depuis Firestore. 
 - Développer une section de profil utilisateur pour gérer les préférences globales.

