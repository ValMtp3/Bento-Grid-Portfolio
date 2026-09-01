export const projets = [
  {
    alt: "Juste Recrute Moi - Plateforme d'agregation d'offre d'emploi",
    image: 'https://v2.tauri.app/_astro/logo_light.C7Zm2ZoX.svg',
    date: 'Juin 2026',
    team: 'Valentin Fiess',
    description: "Agrégateur local-first d'offres d'emploi pour le marché français",
    descriptionlongue:
      "Fork de Just Hire Me adapté au marché français. L'outil agrège les offres de plusieurs sources, les nettoie, les déduplique et prépare des dossiers de candidature. Tout tourne en local : aucune donnée de candidature ne sort de la machine.",
    src: 'https://github.com/ValMtp3/Juste-Recrute-Moi',
    name: 'Juste Recrute Moi',
    linkLabel: 'Accéder au GitHub',
    technos: ['Tauri', 'Rust', 'Python', 'React', 'API', 'IA Local', 'ETL'],
  },
  {
    alt: 'Raguia -  SaaS B2B de RAG IA sécurisé et souverain pour les PME',
    image: '/assets/assets_index/raguia.webp',
    date: 'Mars 2026',
    team: 'Valentin Fiess',
    description: 'Assistant RAG sur les documents internes des PME.',
    descriptionlongue:
      "Mon premier SaaS. L'entreprise dépose ses documents, Raguia les découpe, les indexe dans PGVector et répond aux questions des équipes en citant ses sources. Gestion des permissions par utilisateur et déploiement conteneurisé, pour que les documents restent chez le client.",
    src: 'https://raguia.valentin-fiess.fr',
    name: 'Raguia',
    linkLabel: 'Accéder au SaaS',
    technos: ['FastAPI', 'PostgreSQL / PGVector', 'React', 'Docker'],
  },
  {
    alt: 'Chiffremento App - Application de chiffrement de fichiers en TypeScript',
    image: '/assets/assets_index/Chiffremento.webp',
    date: 'Novembre 2025',
    team: 'Valentin Fiess',
    description: 'Chiffrement de fichiers AES-256 avec stéganographie et déni plausible',
    descriptionlongue:
      'Chiffrement de fichiers en TypeScript : AES-256, stéganographie pour dissimuler un fichier dans un autre, déni plausible via un second volume caché, et chiffrement temporisé qui ne libère la clé qu\'après une date donnée.',
    src: 'https://chiffremento-app.vercel.app/',
    name: 'chiffremento-app',
    technos: ['TypeScript'],
  },
  {
    alt: "Raisonnement IA - Implémentation d'une couche de raisonnement autour d'un LLM Mistral",
    image: '/assets/assets_index/RaisonnementIA.png',
    date: 'Novembre 2025',
    team: 'Valentin Fiess',
    description: "Implémentation d'une couche de raisonnement autour d'un LLM Mistral.",
    descriptionlongue:
      "Implémentation d'une couche de raisonnement autour d'un LLM Mistral pour résoudre des problèmes complexes en plusieurs étapes (ReAct, CoT, RAG)",
    src: 'https://github.com/ValMtp3/Raisonnement_IA',
    name: 'Raisonnement_IA',
    technos: ['Jupyter Notebook', 'Python', 'Mistral LLM', 'ReAct', 'CoT', 'RAG'],
  },
  {
    alt: "Brave RAG - Projet connectant un LLM à internet via l'API Brave Search",
    image: '/assets/assets_index/Brave.png',
    date: 'Novembre 2025',
    team: 'Valentin Fiess',
    description:
      "Projet RAG utilisant l'API de Brave Search pour connecter un LLM léger à internet",
    descriptionlongue:
      "Intégration de l'API Brave Search pour permettre à un modèle de langage léger (Mistral-small) d'accéder à des informations en temps réel sur internet. Utilisation de techniques de RAG (Retrieval-Augmented Generation) pour améliorer la pertinence des réponses fournies par le chatbot.",
    src: 'https://huggingface.co/spaces/ValMtp3/Brave_RAG',
    name: 'Brave RAG',
    technos: ['Python', 'Brave Search API'],
  },
  {
    alt: 'To-do-go - Application CLI de gestion de tâches développée en Go',
    image: '/assets/assets_index/to-do-go.png',
    date: 'Octobre 2025',
    team: 'Valentin Fiess',
    description: 'Application de gestion de tâches cli en go',
    descriptionlongue:
      "Application de gestion de tâches simple avec fonctionnalités d'ajout, suppression et marquage comme terminée. Premier projet GO.",
    src: 'https://github.com/ValMtp3/todo-go',
    name: 'To-do-go',
    technos: ['Go'],
  },
  {
    alt: 'Cyber-Hôpital - Escape-game éducatif simulant une cyber-attaque en milieu hospitalier',
    image: '/assets/assets_index/CyberHopital.webp',
    date: 'Septembre 2025',
    team: 'Dunvael Le Roux, Robin Peyraud, Quentin Richard, Gaëtan Faucher',
    description: 'Escape-game éducatif en ligne simulant une cyber-attaque dans un hôpital',
    descriptionlongue:
      'Escape-game éducatif en ligne simulant une cyber-attaque dans un hôpital avec la résolution de plusieurs salles. Projet réalisé avec HTML/Tailwind CSS et Vue.js.',
    src: 'https://github.com/Workshop-M1-CyberHopital/Escape-game-numerique',
    name: 'Cyber-Hopital',
    technos: ['Html', 'Tailwind', 'VueJS'],
  },
  {
    alt: 'Chatbot IA CV - RAG chatbot connecté au CV de Valentin Fiess pour les recruteurs',
    image: '/assets/assets_index/CV.svg',
    date: 'Juin 2024',
    team: 'Valentin Fiess',
    description: "RAG d'un chatbot IA connecté au CV destiné aux recruteurs",
    descriptionlongue:
      "Création d'un chatbot CV intelligent utilisant un RAG avec Mistral-small et des données stockées en JSON pour des réponses personnalisées.",
    src: 'https://huggingface.co/spaces/ValMtp3/Chatbot_IA_CV',
    name: 'Chatbot IA CV',
    technos: ['Jupyter Notebook', 'Python', 'Mistral'],
  },
  {
    alt: "WildLens - Application de reconnaissance de traces d'animaux avec intelligence artificielle",
    image: '/assets/assets_index/WildLens.webp',
    date: 'Décembre 2024',
    team: 'Cedric Sanchez, Valentin Fiess, Jason Tchaga, Louis Gardet',
    description:
      "Application de reconnaissance de traces d'animaux avec pipeline ETL et intelligence artificielle.",
    descriptionlongue:
      "Reconnaissance d'empreintes d'animaux sauvages à partir d'une photo. Pipeline ETL de préparation des images, enrichissement des métadonnées via Mistral et Gemini, puis classification avec un MobileNetV3Small ré-entraîné.",
    src: 'https://github.com/CedricSanchezGithub/ETL',
    name: 'WildLens',
    technos: ['Python', 'MobileNetV3Small', 'Mistral', 'Gemini', 'ETL'],
  },
  {
    alt: 'Fake News Detection - Pipeline de détection de fausses informations par machine learning',
    image: '/assets/assets_index/FakeNewsDetection.webp',
    date: 'Juin 2024',
    team: 'Valentin Fiess',
    description: 'Pipeline de détection de fake news avec machine learning en Python.',
    descriptionlongue:
      "Classification d'articles en vrai ou faux à partir de leur texte. Nettoyage et vectorisation du corpus, comparaison de plusieurs modèles scikit-learn, analyse des erreurs dans un notebook Jupyter.",
    src: 'https://github.com/ValMtp3/Fakenews-detection',
    name: 'Fakenews Detection',
    technos: ['Jupyter Notebook', 'Python', 'scikit-learn', 'NLP', 'Machine Learning'],
  },
  {
    alt: 'Sentiment Analysis Allociné - Analyse de sentiment des critiques cinéma avec NLP',
    image: '/assets/assets_index/Allocine.webp',
    date: 'Juin 2024',
    team: 'Valentin Fiess',
    description: 'Analyse de sentiment des critiques cinéma avec machine learning.',
    descriptionlongue:
      "Classification positive ou négative des critiques de films du jeu de données IMDB/Allociné. Comparaison entre une approche scikit-learn classique et un transformer, avec une démo Gradio pour tester une critique à la volée.",
    src: 'https://github.com/ValMtp3/sentiment-analysis-allocine',
    name: 'Sentiment Analysis Allociné',
    technos: ['Python', 'NLP', 'Gradio', 'Scikit-learn'],
  },
  {
    alt: 'Chiffremento CLI - Application en ligne de commande pour chiffrer des fichiers en Python',
    image: '/assets/assets_index/Chiffremento.webp',
    date: 'Novembre 2024',
    team: 'Valentin Fiess',
    description: 'Application CLI de chiffrement/déchiffrement de fichiers en Python',
    descriptionlongue:
      "Outil en ligne de commande pour chiffrer et déchiffrer un fichier, écrit en Python avec la bibliothèque cryptography. La version TypeScript de Chiffremento reprend et étend ce premier essai.",
    src: 'https://github.com/ValMtp3/Chiffremento',
    name: 'Chiffremento cli',
    technos: ['Python', 'cryptography'],
  },
  {
    alt: 'Portfolio Bento-Grids - Site portfolio personnel de Valentin Fiess en Vue.js',
    image: '/assets/assets_index/Valentin_Fiess.webp',
    date: 'Mai 2024',
    team: 'Valentin Fiess',
    description: 'Ce site : grille Bento, Vue 3 et Tailwind.',
    descriptionlongue:
      "Le site que vous lisez. Mise en page en grille Bento, direction artistique documentée, chargement différé section par section et images WebP générées par un processeur maison écrit en Go.",
    src: '',
    name: 'Portfolio Bento-Grids',
    technos: ['VueJS', 'JavaScript', 'HTML', 'Tailwind'],
  },
  {
    alt: "TD Site - Premier projet Vue.js avec routage et consommation d'API",
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/1280px-Vue.js_Logo_2.svg.png',
    date: 'Décembre 2023',
    team: 'Valentin Fiess',
    description: "Découverte de Vue.js : routage, webhooks et consommation d'API",
    descriptionlongue:
      "Premier projet avec Vue.js : implémentation du routage pour la navigation, connexion à des webhooks pour les interactions temps réel, et consommation d'APIs REST pour afficher des données dynamiques.",
    src: 'https://github.com/ValMtp3/TD-Site',
    name: 'TD Site',
    technos: ['VueJS', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    alt: "InvestManagment - Application de gestion de portefeuille d'investissements en Python",
    image: '/assets/assets_index/InvestManagment.png',
    date: 'Décembre 2023',
    team: 'Valentin Fiess',
    description: "Application de gestion de portefeuille d'investissements",
    descriptionlongue:
      "Suivi d'un portefeuille d'investissements : saisie des lignes, calcul des performances et historique stocké en MySQL. Interface de bureau en Tkinter.",
    src: 'https://github.com/ValMtp3/InvestManagment/tree/main',
    name: 'InvestManagment',
    technos: ['Python', 'Tkinter', 'MySQL'],
  },
  {
    alt: 'HarmoniSound - Bibliothèque musicale avec Symfony, CRUD et API REST',
    image: '/assets/assets_index/HarmoniSound.webp',
    date: 'Novembre 2023',
    team: 'Valentin Fiess',
    description: 'Bibliothèque musicale avec Symfony : CRUD, authentification et API REST',
    descriptionlongue:
      "Bibliothèque musicale en Symfony : CRUD albums et morceaux, authentification, API REST et tests unitaires. Premier projet mené avec un framework PHP complet.",
    src: 'https://github.com/ValMtp3/HarmoniSound',
    name: 'HarmoniSound',
    technos: ['PHP', 'Symfony', 'MySQL', 'API REST'],
  },
  {
    alt: 'ProSwipe - Plateforme de mise en relation étudiants-professionnels avec système de swipe',
    image: '/assets/assets_index/ProSwipe.webp',
    date: 'Septembre 2023',
    team: 'Groupe de classe',
    description: 'Plateforme de mise en relation étudiants-professionnels avec système de swipe',
    descriptionlongue:
      "Développement d'une plateforme web fictive de mise en relation entre étudiants et professionnels, inspirée de Tinder avec un système de swipe. Technologies : PHP, HTML, CSS. Méthodologie : gestion de projet Kanban avec Trello.",
    src: 'https://github.com/ProSwipe/Application',
    name: 'ProSwipe',
    technos: ['PHP', 'HTML', 'CSS'],
  },
  {
    alt: "Pizza O'Plomo - Site web complet pour pizzeria avec stratégie digitale intégrée",
    image: '/assets/assets_index/pizzaoplomo.webp',
    date: 'Février 2022',
    team: 'Groupe de classe',
    description: 'Site web complet pour pizzeria avec stratégie digitale intégrée',
    descriptionlongue:
      "Site vitrine d'une pizzeria réalisé en équipe : conception du MCD, intégration, référencement, campagne emailing et présence sur les réseaux.",
    src: 'https://www.pizzaoplomo.gaetandev.fr',
    name: "Pizza O'Plomo",
    technos: ['HTML', 'CSS', 'JavaScript', 'PHP'],
  },
  {
    alt: "Hôtel Neptune - Refonte du site web d'un hôtel avec système de réservation en ligne",
    image: '/assets/assets_index/HotelNeptune.webp',
    date: 'Novembre 2022',
    team: 'Groupe de classe',
    description: "Refonte complète du site web d'un hôtel avec système de réservation",
    descriptionlongue:
      "Refonte du site d'un hôtel avec réservation en ligne : gestion des chambres, des disponibilités et des réservations en base MySQL.",
    src: 'https://github.com/HotelNeptune/Application/tree/dev',
    name: 'Neptune',
    technos: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
  },
  {
    alt: "Damso - Première page web de présentation d'artiste en HTML et CSS",
    image: '/assets/assets_index/Ipseite1.webp',
    date: 'Septembre 2022',
    team: 'Valentin Fiess',
    description: 'Première page web artiste : présentation de Damso en HTML/CSS',
    descriptionlongue:
      "Premier projet web personnel : création d'une page de présentation pour l'artiste Damso. Technologies de base : HTML et CSS pour la mise en page et le style.",
    src: 'https://github.com/ValMtp3/Damso',
    name: 'Damso',
    technos: ['HTML', 'CSS'],
  },
];

// Libelle du lien et action Matomo deduits de l'hebergeur du projet, partages
// entre le carrousel de la page d'accueil et la page /projets.
export const getProjectLinkLabel = (project) => {
  if (project.linkLabel) return project.linkLabel;
  if (project.src.includes('github.com')) return 'Voir le dépôt';
  if (project.src.includes('huggingface.co')) return 'Tester la démo';
  return 'Découvrir le projet';
};

export const getProjectAnalyticsAction = (project) => {
  if (project.src.includes('github.com')) return 'open_repository';
  if (project.src.includes('huggingface.co')) return 'open_demo';
  return 'open_project';
};
