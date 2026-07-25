export const projets = [
  {
    alt: "Juste Recrute Moi - Plateforme d'agregation d'offre d'emploi",
    image: 'https://v2.tauri.app/_astro/logo_light.C7Zm2ZoX.svg',
    date: 'Juin 2026',
    team: 'Valentin Fiess',
    description: "Agrégateur local-first d'offres d'emploi pour le marché français",
    descriptionlongue:
      "Fork de : Just Hire Me pour l'adapter au marché francais. JRM est un agrégateur d'offres d'emploi local-first dédié au marché français. L'outil centralise les offres, les nettoie, les déduplique et génère des dossiers de candidature sur mesure, le tout en gardant tes données 100% locales et privées par défaut.",
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
    description: 'SaaS B2B de RAG IA conçu pour connecter les entreprises à leurs connaissances.',
    descriptionlongue:
      "Raguia est mon premier SaaS B2B, construit autour du RAG IA pour aider les entreprises à exploiter leurs propres données et documents. Le projet vise à transformer une base de connaissances interne en assistant intelligent capable de retrouver les bonnes informations, contextualiser les réponses et simplifier l'accès au savoir métier.",
    src: 'https://raguia.valentin-fiess.fr',
    name: 'Raguia',
    linkLabel: 'Accéder au SaaS',
    technos: ['SaaS B2B', 'RAG', 'IA', 'Base de connaissances', 'Assistant IA'],
  },
  {
    alt: 'Chiffremento App - Application de chiffrement de fichiers en TypeScript',
    image: '/assets/assets_index/Chiffremento.webp',
    date: 'Novembre 2025',
    team: 'Valentin Fiess',
    description: 'Application de chiffrement de fichiers avec fonctionnalités avancées',
    descriptionlongue:
      'Application de chiffrement de fichiers sécurisée développée en TypeScript, offrant des fonctionnalités avancées telles que le chiffrement AES-256, un mode paranoïaque pour une sécurité maximale, de la stéganographie pour cacher des données, un déni plausible et un chiffrement temporisé.',
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
      "Application complète de reconnaissance de traces d'animaux sauvages. Pipeline ETL pour le traitement d'images, génération de métadonnées enrichies avec IA (Mistral et Gemini), puis entraînement d'un modèle de classification basé sur MobileNetV3Small.",
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
      'Pipeline complet de détection de fake news utilisant le machine learning pour classifier automatiquement les textes. Projet réalisé en Jupyter Notebook avec Python, scikit-learn et autres bibliothèques de data science.',
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
      'Analyse de sentiment automatisée sur les critiques de films du dataset IMDB/Allociné. Utilisation de modèles de machine learning et transformers pour classifier positivement ou négativement les avis des spectateurs. Réalisé en Jupyter Notebook avec Python.',
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
      'Application en ligne de commande pour chiffrer et déchiffrer des fichiers de manière sécurisée. Développé en Python avec la bibliothèque cryptography pour garantir la protection des données sensibles.',
    src: 'https://github.com/ValMtp3/Chiffremento',
    name: 'Chiffremento cli',
    technos: ['Python', 'cryptography'],
  },
  {
    alt: 'Portfolio Bento-Grids - Site portfolio personnel de Valentin Fiess en Vue.js',
    image: '/assets/assets_index/Valentin_Fiess.webp',
    date: 'Mai 2024',
    team: 'Valentin Fiess',
    description: 'Portfolio personnel avec un style moderne',
    descriptionlongue:
      "Création de mon portfolio moderne avec un syle Bento Grid. Intégration d'animations fluides, design responsive pour une expérience optimale sur tous les appareils.",
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
      "Application web de gestion de portefeuille d'investissements développée avec Python. Fonctionnalités : ajout/suppression d'investissements, suivi des performances, interface utilisateur interactive et responsive.",
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
      "Application web de gestion de bibliothèque musicale développée avec PHP Symfony. Fonctionnalités complètes : CRUD pour les albums/morceaux, système d'authentification, API REST, tests unitaires automatisés et base de données MySQL.",
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
      'Projet complet de création de site web pour pizzeria à plusieurs développeurs. Inclut : site responsive, conception MCD, optimisation SEO, campagne emailing et stratégie SMO. Technologies : HTML, CSS, JavaScript, PHP.',
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
      "Refonte totale du site web d'un hôtel avec système de réservation en ligne. Intégration d'une base de données MySQL pour la gestion des chambres et réservations. Technologies : HTML, CSS, JavaScript, PHP et MySQL.",
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
