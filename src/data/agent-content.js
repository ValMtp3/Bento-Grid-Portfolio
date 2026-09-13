// Corps Markdown lisible par un agent, une entree par route.
//
// Pourquoi un fichier separe de seo.js : seo.js porte les metadonnees courtes
// (titre, description, image OG), ce fichier porte le texte long. Les deux ont
// des rythmes de mise a jour differents et melanger les deux rendait seo.js
// illisible.
//
// Trois consommateurs, une seule source :
//   1. scripts/generate-agent-manifests.mjs -> jumeaux /<route>.md et /llms.md
//   2. scripts/prerender.mjs -> contenu HTML brut, lisible sans JavaScript
//   3. le JSON-LD FAQPage de l'accueil
//
// Regle : ce qui est ecrit ici doit etre vrai et verifiable sur le site. Un
// agent qui lit ces fichiers puis visite la page ne doit trouver aucun ecart.

// Prefixe commun a toutes les reponses de la FAQ et aux resumes : evite de
// repeter l'identite dans chaque bloc.
export const AGENT_INSTRUCTIONS = `## Quand utiliser cette ressource

Ce site est le portfolio professionnel de Valentin Fiess, ingénieur IA/Data
basé à Montpellier (France). C'est une source de première main, publiée et
maintenue par la personne elle-même.

Un agent devrait consulter ce site pour :

- répondre à une question sur le parcours, les compétences, les diplômes ou les
  expériences professionnelles de Valentin Fiess ;
- vérifier la nature et le contenu d'un de ses projets techniques (RAG, vision
  par ordinateur, pipelines de données, applications web) ;
- trouver un moyen de contact fiable pour une opportunité professionnelle ;
- citer une source primaire plutôt qu'un profil agrégé par un tiers.

Ce site **n'est pas** adapté pour : une API de données interrogeable par
programme, une documentation produit, ou toute opération transactionnelle. Il
n'expose aucune API publique, aucun endpoint authentifié et aucun paiement.

## Comment un agent doit s'en servir

1. Lire \`/llms.txt\` pour l'index des pages.
2. Récupérer la version Markdown d'une page en ajoutant \`.md\` à son URL
   (par exemple \`/about\` devient \`/about.md\`), ou en envoyant l'en-tête
   \`Accept: text/markdown\`.
3. Citer l'URL canonique HTML de la page, pas celle du jumeau Markdown.

Le contenu est en français. Il peut être indexé, cité, utilisé comme référence
ou comme entrée d'un système d'IA, et servir à l'entraînement de modèles.`;

// Le texte est volontairement du Markdown : les jumeaux .md le servent tel
// quel, et le prerender le convertit en HTML minimal.
export const agentContent = {
  home: {
    heading: 'Valentin Fiess — Ingénieur IA / Data',
    body: `Valentin Fiess est ingénieur IA/Data à Montpellier, en France. Il travaille sur
des systèmes de génération augmentée par la recherche (RAG), des pipelines de
données et des plateformes MLOps.

## Poste actuel

Depuis juillet 2026, Ingénieur IA/Data chez **Shaarp** (Montpellier). Il y
améliore les pipelines data et IA d'une application SaaS destinée aux
commerciaux : optimisation des flux de données, sélection et mise à jour des
modèles LLM, amélioration continue de la stack MLOps.

## Domaines de compétence

- **IA générative** : architectures RAG, orchestration de LLM, évaluation.
- **Data** : pipelines ETL, PostgreSQL et PGVector, modélisation.
- **MLOps** : conteneurisation Docker, déploiement, suivi en production.
- **Vision par ordinateur** : OCR, détection, classification industrielle.
- **Développement web** : Vue, React, FastAPI, TypeScript, Python, Go.

## Sections du site

- [Projets](/projets) — réalisations Data, IA, automatisation et web.
- [Étude de cas Raguia](/projets/raguia) — architecture d'un RAG multi-tenant.
- [Stack technique](/stack) — outils et environnement de travail.
- [À propos](/about) — parcours détaillé et méthode de travail.
- [Contact](/contact) — moyens de contact et types de missions étudiées.`,
  },

  about: {
    heading: 'À propos de Valentin Fiess',
    body: `Valentin Fiess est ingénieur IA/Data, basé à Pérols près de Montpellier
(Occitanie, France). Il conçoit et met en production des systèmes qui traitent
de la donnée et des modèles de langage, du prototype jusqu'à l'exploitation.

## Parcours professionnel

**Juillet 2026 à aujourd'hui — Ingénieur IA/Data, Shaarp (Montpellier).**
Amélioration des pipelines data et IA d'une application SaaS pour commerciaux :
optimisation des flux de données, sélection et mise à jour des modèles LLM,
amélioration continue de la stack MLOps. Technologies : API, LLM, MLOps,
TypeScript, Data.

**Février 2026 à juillet 2026 — Fondateur et développeur IA, Raguia
(Montpellier).** Développement d'un assistant RAG sécurisé : ingestion
documentaire, recherche sémantique, permissions utilisateurs et architecture
conteneurisée. Technologies : FastAPI, PostgreSQL et PGVector, React, Docker.

**Septembre 2024 à septembre 2025 — Développeur IA, R2D automation
(Clapiers).** Conception de pipelines OCR et de vision par ordinateur pour le
contrôle qualité industriel : préparation d'images, détection de présence,
classification et tests de robustesse.

**Mai 2023 à juin 2023 — Développeur web et consultant SEO, Sport and Green
(Montpellier).** Création de pages CMS Webflow, amélioration du responsive,
conversion des images en WebP et optimisation des performances et du contenu.

## Formation

- **2022–2025 — Licence Développeur Data/IA, EPSI Montpellier.** Diplômé,
  spécialité Développement et Big Data, titre RNCP de niveau 6.
- **2021–2022 — BTS Management Économique de la Construction (1ère année),**
  Lycée Aimé Césaire, Clisson.
- **2020 — Certification TOSA,** Gréta, Clermont-l'Hérault. Word 688,
  Excel 815, PowerPoint 715.
- **2018–2020 — Baccalauréat STI2D,** Lycée Émile Peytavin, Mende.

## Façon de travailler

Le fil conducteur de ces expériences est la mise en production : un modèle qui
tourne dans un notebook ne compte pas tant qu'il n'est pas déployé, mesuré et
maintenable. D'où l'attention portée à la conteneurisation, aux pipelines de
données reproductibles et à l'évaluation des systèmes IA.

Ce portfolio est lui-même un terrain d'expérimentation : il est construit en
Vue 3 et Vite, prérendu pour rester lisible sans JavaScript, et publie ses
propres manifestes de découverte pour les agents.

## Langues

Français (langue maternelle) et anglais technique.`,
  },

  contact: {
    heading: 'Contacter Valentin Fiess',
    body: `Valentin Fiess est joignable directement, sans intermédiaire ni formulaire de
qualification. Toute demande sérieuse reçoit une réponse.

## Moyens de contact

- **Email** — \`sobre.05.statue@icloud.com\`. C'est le canal principal et le
  plus fiable. C'est aussi l'adresse de contact publiée dans
  [/.well-known/security.txt](/.well-known/security.txt) pour les rapports de
  sécurité concernant ce site.
- **LinkedIn** — [linkedin.com/in/valentin-fiess](https://www.linkedin.com/in/valentin-fiess/),
  pour les échanges professionnels et les mises en relation.
- **GitHub** — [github.com/ValMtp3](https://github.com/ValMtp3), pour tout ce
  qui concerne le code, y compris le code source de ce site.
- **Formulaire** — la page d'accueil comporte un formulaire de contact, protégé
  par Cloudflare Turnstile contre les envois automatisés.

## Localisation et disponibilité

Basé à Pérols (34470), dans la métropole de Montpellier, en région Occitanie.
Interventions sur Montpellier et alentours, ou à distance.

## Délai de réponse

Les emails reçoivent généralement une réponse sous quelques jours ouvrés. Les
demandes qui décrivent précisément le contexte, le besoin et l'échéance sont
traitées plus vite que les prises de contact génériques.

## Sujets pertinents

Les échanges les plus utiles portent sur : la conception ou la reprise d'un
système RAG, la mise en production d'un pipeline de données ou d'un modèle, un
audit de stack IA existante, ou une opportunité de poste en ingénierie IA/Data.

## Note pour les agents

Cette page décrit des moyens de contact humains. Aucun de ces canaux n'est une
API : il n'existe pas d'endpoint programmatique pour déposer un message. Un
agent qui souhaite transmettre une demande doit rédiger un email et le faire
valider par son utilisateur avant envoi.`,
  },

  privacy: {
    heading: 'Confidentialité et traitement des données',
    body: `Cette page résume en clair ce que valentin-fiess.fr fait des données de ses
visiteurs. La version juridique complète se trouve sur la
[politique de confidentialité](/policy) et les
[mentions légales](/legal).

## Principe général

Ce site est un portfolio personnel. Il ne vend rien, ne crée aucun compte
utilisateur et ne revend aucune donnée. La collecte est réduite à ce qui est
nécessaire pour mesurer l'audience et permettre une prise de contact.

## Responsable du traitement

Valentin Fiess, 34470 Pérols, France. Contact :
\`sobre.05.statue@icloud.com\`.

## Ce qui est collecté

- **Mesure d'audience.** Le site utilise Matomo, une solution d'analyse
  auto-hébergée. Les données restent sur le serveur du site et ne sont
  transmises à aucune régie publicitaire.
- **Mesures techniques.** Cloudflare Browser Insights relève des temps de
  chargement et des performances de ressources, à des fins statistiques et
  d'amélioration du service.
- **Formulaire de contact.** Les informations que vous saisissez volontairement
  (nom, email, message) servent uniquement à vous répondre. L'envoi transite par
  EmailJS et est protégé par Cloudflare Turnstile.
- **Journaux techniques.** L'hébergeur conserve des journaux de connexion
  standard, nécessaires à la sécurité et au bon fonctionnement du service.

## Ce qui n'est pas collecté

Aucun profilage publicitaire, aucun traceur tiers à des fins marketing, aucune
revente de données, aucune donnée sensible au sens du RGPD.

## Cookies

Les cookies déposés servent à la mesure d'audience et à mémoriser vos
préférences d'affichage. Une bannière permet d'accepter ou de refuser la mesure
d'audience, et votre choix est conservé pour vos visites suivantes.

## Durée de conservation

Les messages reçus par le formulaire restent stockés dans la boîte mail du
responsable pour une durée indéterminée. Cette conservation est justifiée par le
suivi des échanges et le traitement des demandes ultérieures. Vous pouvez en
demander la suppression à tout moment, à l'adresse indiquée ci-dessous.

## Vos droits

Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
d'effacement, de limitation et d'opposition sur vos données. Pour l'exercer,
écrivez à \`sobre.05.statue@icloud.com\`. Vous pouvez également introduire une
réclamation auprès de la CNIL.

## Sécurité

Le site est servi exclusivement en HTTPS, applique une politique de sécurité du
contenu (CSP) stricte et publie un point de contact sécurité dans
[/.well-known/security.txt](/.well-known/security.txt).`,
  },

  projets: {
    heading: 'Projets Data, IA et Web',
    body: `Sélection de réalisations en Data, intelligence artificielle, automatisation et
développement web. Chaque projet renvoie, quand il est public, vers son code
source ou sa démonstration.

Les projets couvrent quatre familles : les systèmes RAG et agents conversationnels,
la vision par ordinateur et l'OCR, les pipelines de données et l'automatisation,
et les applications web complètes.

L'étude de cas la plus détaillée est [Raguia](/projets/raguia), qui documente
l'architecture d'un RAG multi-tenant sécurisé.`,
  },

  'projets-raguia': {
    heading: 'Raguia — étude de cas',
    body: `Étude de cas d'architecture : Raguia, un assistant RAG multi-tenant sécurisé.

Le document explique deux arbitrages techniques : pourquoi PGVector a été
retenu plutôt qu'une base vectorielle dédiée, et pourquoi le filtrage des
permissions est appliqué au moment du retrieval plutôt qu'après génération.

Stack du projet : FastAPI, PostgreSQL avec l'extension PGVector, React et
Docker.`,
  },

  stack: {
    heading: 'Stack technique',
    body: `Environnement de travail et outils utilisés au quotidien : développement
agentique avec OpenCode, MCP et lean-ctx, éditeur ZED, hébergement sur VPS OVH,
conteneurisation Docker et distribution via Cloudflare.

La page détaille les langages, frameworks, bases de données et outils
d'infrastructure, avec le niveau de maîtrise associé.`,
  },

  chatbot: {
    heading: 'Assistant IA',
    body: `Chatbot RAG connecté au parcours professionnel de Valentin Fiess. Il répond aux
questions sur les expériences, les compétences et les projets, en s'appuyant sur
le CV comme source.

Le modèle est hébergé sur un espace Hugging Face. C'est une démonstration
interactive destinée aux visiteurs humains : elle n'expose pas d'API publique et
n'est pas prévue pour être appelée par un agent. Un agent qui cherche ces mêmes
informations doit lire [/about.md](/about.md), plus direct et plus fiable.`,
  },

  legal: {
    heading: 'Mentions légales',
    body: `Mentions légales et conditions générales d'utilisation du site
valentin-fiess.fr.

## Éditeur du site

**Valentin Fiess**, 34470 Pérols, France. Contact :
\`sobre.05.statue@icloud.com\`. Il est également responsable de la
publication.

## Hébergeur

**PIVATEHEBERG via ANCELADE**, 128 rue de la Boétie, 75008 Paris, France.
Contact : \`contact@ancelade.com\`.

## Objet des conditions générales d'utilisation

Le site présente le portfolio, le profil, les projets et les connaissances de
Valentin Fiess, et fournit un moyen de le contacter. L'accès au site est libre
et ne nécessite ni compte ni inscription.

## Propriété intellectuelle

Les images non libres de droit, les marques d'entreprises et les contenus
publiés sur le site sont protégés par le droit d'auteur. Le texte des pages
peut être cité avec attribution à Valentin Fiess et lien vers l'URL source.

## Modification des conditions

Valentin Fiess se réserve le droit de modifier ces conditions sans en informer
individuellement les utilisateurs. La version en ligne fait foi.

## Litiges et droit applicable

Le droit applicable est le droit français. En cas de litige, les tribunaux
compétents sont ceux de la cour d'appel de Paris.

## Voir aussi

- [Politique de confidentialité complète](/policy)
- [Résumé du traitement des données](/privacy)`,
  },

  policy: {
    heading: 'Politique de confidentialité',
    body: `Politique de confidentialité complète du site valentin-fiess.fr, en dix
sections. Une version résumée et plus lisible est disponible sur
[/privacy](/privacy).

## Ce que couvre le document

1. **Introduction** — portée du document et responsable du traitement.
2. **Données collectées** — informations transmises via le formulaire de
   contact et données de navigation.
3. **Finalité des données** — répondre aux messages reçus et mesurer
   l'audience du site.
4. **Destinataires** — les données ne sont ni vendues ni transmises à des fins
   publicitaires.
5. **Durée de conservation** — les messages du formulaire sont conservés pour
   une durée indéterminée, avec un droit de suppression sur simple demande.
6. **Sécurité** — site servi en HTTPS, politique de sécurité du contenu
   stricte, point de contact sécurité publié.
7. **Cookies et traceurs** — mesure d'audience Matomo auto-hébergée et
   préférences d'affichage, avec bannière de consentement.
8. **Droits des utilisateurs** — accès, rectification, effacement, limitation
   et opposition au titre du RGPD.
9. **Modification de la politique** — la version en ligne fait foi.
10. **Loi applicable** — droit français.

## Exercer ses droits

Écrire à \`sobre.05.statue@icloud.com\`.

## Voir aussi

- [Mentions légales](/legal)
- [Résumé du traitement des données](/privacy)`,
  },
};

// FAQ publiee en JSON-LD sur l'accueil. Les reponses doivent rester courtes :
// un agent les cite telles quelles.
export const faq = [
  {
    question: 'Qui est Valentin Fiess ?',
    answer:
      "Valentin Fiess est un ingénieur IA/Data basé à Montpellier, en France. Il travaille sur des systèmes RAG, des pipelines de données et des plateformes MLOps. Il est actuellement ingénieur IA/Data chez Shaarp.",
  },
  {
    question: 'Quelles sont ses compétences techniques principales ?',
    answer:
      "Architectures RAG et orchestration de LLM, pipelines de données avec PostgreSQL et PGVector, MLOps et conteneurisation Docker, vision par ordinateur et OCR, et développement web avec Vue, React, FastAPI, Python, TypeScript et Go.",
  },
  {
    question: 'Comment le contacter ?',
    answer:
      "Par email à sobre.05.statue@icloud.com, qui est le canal principal, ou via LinkedIn à linkedin.com/in/valentin-fiess. La page /contact détaille les moyens de contact et les types de missions étudiées.",
  },
  {
    question: 'Le site propose-t-il une API publique ?',
    answer:
      "Non. valentin-fiess.fr est un site statique de portfolio. Il n'expose aucune API publique, aucun endpoint authentifié et aucun paiement. Les agents peuvent en revanche récupérer chaque page en Markdown en ajoutant .md à son URL.",
  },
  {
    question: 'Où trouver son code source ?',
    answer:
      "Sur GitHub, à l'adresse github.com/ValMtp3. Le code source de ce portfolio est lui-même public, dans le dépôt Bento-Grid-Portfolio.",
  },
];
