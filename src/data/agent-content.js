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
//
// L'adresse email n'apparait volontairement nulle part ici : ce fichier alimente
// les jumeaux .md et llms.txt servis en clair, et alimente le bundle JS du site.

// Prefixe commun a toutes les reponses de la FAQ et aux resumes : evite de
// repeter l'identite dans chaque bloc.
export const AGENT_INSTRUCTIONS = `## Quand utiliser cette ressource

Ce site est mon portfolio professionnel : je suis ingénieur IA/Data
basé à Montpellier (France). C'est une source de première main, publié et
maintenu par moi-même.

Un agent devrait consulter ce site pour :

- répondre à une question sur mon parcours, mes compétences, mes diplômes ou mes
  expériences professionnelles ;
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
    body: `Je suis ingénieur IA/Data à Montpellier, en France. Je travaille sur
des systèmes de génération augmentée par la recherche (RAG), des pipelines de
données et des plateformes MLOps.

## Mon poste actuel

Depuis juillet 2026, ingénieur IA/Data chez **Shaarp** (Montplotlib). J'y
améliore les pipelines data et IA d'une application SaaS destinée aux
commerciaux : optimisation des flux de données, sélection et mise à jour des
modèles LLM, amélioration continue de la stack MLOps.

## Mes domaines de compétence

- **IA générative** : architectures RAG, orchestration de LLM, évaluation.
- **Data** : pipelines ETL, PostgreSQL et PGVector, modélisation.
- **MLOps** : conteneurisation Docker, déploiement, suivi en production.
- **Vision par ordinateur** : OCR, détection, classification industrielle.
- **Développement web** : Vue, React, FastAPI, TypeScript, Python, Go.

## Sections du site

- [Projets](/projets) — mes réalisations Data, IA, automatisation et web.
- [Blog](/blog) — études de cas et notes techniques, dont l'architecture d'un
  [RAG multi-tenant sécurisé](/projets/raguia).
- [Stack technique](/stack) — mes outils et mon environnement de travail.
- [À propos](/about) — mon parcours détaillé et ma méthode de travail.
- [Contact](/contact) — comment me contacter et les types de missions étudiées.`,
  },

  about: {
    heading: 'À propos de Valentin Fiess',
    body: `Je suis ingénieur IA/Data, basé à Pérols près de Montpellier
(Occitanie, France). Je conçois et mets en production des systèmes qui traitent
de la donnée et des modèles de langage, du prototype jusqu'à l'exploitation.

## Mon parcours professionnel

**Juillet 2026 à aujourd'hui — Ingénieur IA/Data, Shaarp (Montpellier).**
J'améliore les pipelines data et IA d'une application SaaS pour commerciaux :
optimisation des flux de données, sélection et mise à jour des modèles LLM,
amélioration continue de la stack MLOps. Technologies : API, LLM, MLOps,
TypeScript, Data. [Voir l'étude de cas](/projets/raguia).

**Février 2026 à juillet 2026 — Fondateur et développeur IA, Raguia
(Montpellier).** J'ai développé un assistant RAG sécurisé : ingestion
documentaire, recherche sémantique, permissions utilisateurs et architecture
conteneurisée. Technologies : FastAPI, PostgreSQL et PGVector, React, Docker.
[Voir l'étude de cas](/projets/raguia).

**Depuis novembre 2026 — Investia, projet personnel d'apprentissage.** En
parallèle de mon poste, je construis à la main un harness d'agent IA appliqué au
conseil en investissement, avec un portefeuille simulé de 10 000 € (aucun ordre
réel) : décisions prises par un modèle de décision (Jev) derrière LiteLLM,
exécution par Mistral Large 4. Voir [l'étude de cas](/projets/investia) et mon
article sur les [modèles de décision](/blog/modeles-de-decision).

**Septembre 2024 à septembre 2025 — Développeur IA, R2D automation
(Clapiers).** J'ai conçu des pipelines OCR et de vision par ordinateur pour le
contrôle qualité industriel : préparation d'images, détection de présence,
classification et tests de robustesse.

**Mai 2023 à juin 2023 — Développeur web et consultant SEO, Sport and Green
(Montpellier).** J'ai créé des pages CMS Webflow, amélioré le responsive,
converti les images en WebP et optimisé les performances et le contenu.

## Ma formation

- **2022–2025 — Licence Développeur Data/IA, EPSI Montpellier.** Diplômé,
  spécialité Développement et Big Data, titre RNCP de niveau 6.
- **2021–2022 — BTS Management Économique de la Construction (1ère année),**
  Lycée Aimé Césaire, Clisson.
- **2020 — Certification TOSA,** Gréta, Clermont-l'Hérault. Word 688,
  Excel 815, PowerPoint 715.
- **2018–2020 — Baccalauréat STI2D,** Lycée Émile Peytavin, Mende.

## Ma façon de travailler

Le fil conducteur de mon parcours est la mise en production : un modèle qui
tourne dans un notebook ne compte que s'il est déployé, mesuré et
maintenable. D'où mon attention à la conteneurisation, aux pipelines de
données reproductibles et à l'évaluation des systèmes IA.

Ce portfolio est lui-même un terrain d'expérimentation : je l'ai construit en
Vue 3 et Vite, il est prérendu pour rester lisible sans JavaScript, et il publie
ses propres manifestes de découverte pour les agents.

## Mes langues

Français (langue maternelle) et anglais technique.`,
  },

  contact: {
    heading: 'Contacter Valentin Fiess',
    body: `Je suis joignable directement, sans intermédiaire ni formulaire de
qualification. Toute demande sérieuse reçoit une réponse.

## Moyens de contact

- **Formulaire de contact** — [/contact](/contact). C'est le canal principal et
  le plus fiable, protégé par Cloudflare Turnstile contre les envois
  automatisés. L'adresse email directe n'est pas publiée en clair sur le site
  (protection anti-spam) : le lien « Email » des pages Mentions légales et
  Confidentialité la reconstruit au clic. Pour les rapports de sécurité
  concernant ce site, voir aussi [/.well-known/security.txt](/.well-known/security.txt).
- **LinkedIn** — [linkedin.com/in/valentin-fiess](https://www.linkedin.com/in/valentin-fiess/),
  pour les échanges professionnels et les mises en relation.
- **GitHub** — [github.com/ValMtp3](https://github.com/ValMtp3), pour tout ce
  qui concerne le code, y compris le code source de ce site.

## Localisation et disponibilité

Je suis basé à Pérols (34470), dans la métropole de Montpellier, en région
Occitanie. J'interviens sur Montpellier et alentours, ou à distance.

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

Valentin Fiess, 34470 Pérols, France. Contact : [formulaire de contact](/contact).

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
utilisez le [formulaire de contact](/contact). Vous pouvez également introduire une
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

Chaque projet qui le mérite a son étude de cas détaillée, également listée sur
le [blog](/blog) :

- [Raguia](/projets/raguia) — architecture d'un RAG multi-tenant sécurisé ;
- [Seed Generator](/projets/seed-generator) — BIP-39 hors ligne en Go, zéro dépendance ;
- [Juste Recrute Moi](/projets/juste-recrute-moi) — agrégateur local-first d'offres d'emploi ;
- [Chiffremento CLI](/projets/chiffremento-cli) — chiffrement authentifié de fichiers en Go ;
- [Investia](/projets/investia) — harness d'agent IA écrit à la main, portefeuille simulé.`,
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

  'projets-seed-generator': {
    heading: 'Seed Generator — étude de cas',
    body: `Étude de cas : Seed Generator, un générateur de phrases BIP-39 hors ligne écrit en Go,
avec zéro dépendance externe.

Le parti pris est la vérifiabilité plutôt que la confiance : la racine d'entropie
reste crypto/rand, les sources auxiliaires (jitter CPU, télémétrie du runtime,
souris, micro, caméra) ne sont mélangées que comme diversifiants via
HKDF-SHA-512, jamais en remplacement du CSPRNG. Au démarrage, le binaire rejoue
les 96 vecteurs de test officiels contre ses quatre dictionnaires embarqués et
refuse de démarrer si un seul échoue. L'interface web locale est liée au
loopback, vérifie l'en-tête Host contre le DNS rebinding et sert ses flux SSE
par tickets à usage unique.

Stack : Go standard library, crypto/rand, HKDF-SHA-512, SSE, CSP stricte.`,
  },

  'projets-juste-recrute-moi': {
    heading: 'Juste Recrute Moi — étude de cas',
    body: `Étude de cas : Juste Recrute Moi, un agrégateur local-first d'offres d'emploi pour le
marché français, fork de JustHireMe.

L'application récupère les offres depuis plusieurs sources (API France Travail,
ATS directs comme Greenhouse, Lever, Ashby, Workable, SmartRecruiters et
Teamtailor, JobSpy pour Indeed et Google Jobs en best effort, import d'URL en
JSON-LD), les normalise, filtre les lignes faibles, déduplique les doublons,
puis les classe dans un pipeline local. Profil, offres, scores et documents
générés restent stockés localement par défaut ; aucune dépendance payante
n'est obligatoire. Licence AGPL-3.0.

Stack : Tauri, Rust, React, Python / FastAPI.`,
  },

  'projets-chiffremento-cli': {
    heading: 'Chiffremento CLI — étude de cas',
    body: `Étude de cas : Chiffremento CLI, un outil en ligne de commande en Go pour chiffrer et
déchiffrer des fichiers et des dossiers, utilisable via une interface guidée
plein écran ou des flags pour les scripts.

Le format v4 apporte un engagement de clé (témoin de 32 octets sur la clé
maîtresse, comparé avant tout déchiffrement, ce qui ferme l'attaque par oracle
de partitionnement) et une enveloppe DEK/KEK : la clé de contenu est scellée
dans l'en-tête, donc changer de mot de passe ne réécrit que 117 octets
d'en-tête sans relire le fichier. Chiffrement authentifié AES-256-GCM ou
ChaCha20-Poly1305 en streaming, clés dérivées en Argon2id dont les paramètres
sont inscrits dans le fichier pour qu'un chiffrement ancien reste lisible après
durcissement. Dossiers empaquetés en tar au fil du chiffrement, compression
zstd, écriture atomique. Distribution en cask Homebrew via GoReleaser, releases
signées avec cosign, SBOM et attestation de provenance.

Stack : Go, AES-256-GCM, ChaCha20-Poly1305, Argon2id, zstd, GoReleaser, cosign.`,
  },

  'projets-investia': {
    heading: 'Investia — étude de cas',
    body: `Étude de cas : Investia, le harness d'agent IA que je construis à la main en
parallèle de mon poste, avec le conseil en investissement comme terrain
d'apprentissage.

Mon agent lit des données de marché quasi temps réel (Finnhub, Stooq, CoinGecko,
Binance, Frankfurter/ECB, cache Redis), produit des analyses sourcées et gère un
portefeuille simulé de 10 000 € — aucun ordre réel, donc aucun conseil financier.

Le routage des modèles sépare décisions et exécution : Jev (modèle de décision)
prend les jugements bornés, GPT-6 Luna répond aux petites tâches, Mistral Large 4
fait le raisonnement lourd, le tout derrière la gateway LiteLLM. Budget LLM
plafonné à 10-20 €/mois (prompt caching, cache sémantique, Jev). Voir l'article
[modèles de décision et routage](/blog/modeles-de-decision).

Stack : Python / FastAPI, PostgreSQL 17 + pgvector, Redis, React 19, Docker Compose
sur VPS OVH derrière Nginx Proxy Manager, Authelia, SSE + AG-UI. Le harness est
écrit explicitement (AGENTS.md, specs avant code, skills versionnés, CI GitHub
Actions) — voir [Harness² de Google](/blog/harness2-google) pour la version
automatisée. Dépôt public : github.com/ValMtp3/investia.`,
  },

  blog: {
    heading: 'Blog — notes et études de cas',
    body: `Le blog rassemble les écrits publiés au fil des projets et de la veille :
des notes techniques (modèles, agents, souveraineté) et des études de cas
détaillées (architecture, arbitrages, points durs).

## Articles

- [Modèles de décision (Jev, Elephant, d1) et routage de modèles](/blog/modeles-de-decision)
- [Harness² de Google : l'agent qui réécrit son propre harness](/blog/harness2-google)
- [Olala mini 7A1B : le premier LLM souverain d'OVHcloud](/blog/olala-ovh)
- [Mistral à l'automne 2026 : Large 4, Voxtral 3 et Vibe 3.0 en Rust](/blog/mistral-automne-2026)

## Études de cas de projets

- [Raguia](/projets/raguia) — RAG multi-tenant sécurisé : PGVector plutôt
  qu'une base vectorielle dédiée, filtrage des permissions au retrieval.
- [Seed Generator](/projets/seed-generator) — BIP-39 hors ligne en Go, zéro dépendance.
- [Juste Recrute Moi](/projets/juste-recrute-moi) — agrégateur local-first d'offres d'emploi.
- [Chiffremento CLI](/projets/chiffremento-cli) — chiffrement authentifié de fichiers en Go.

De nouveaux articles paraissent au fil des réalisations et de la veille.`,
  },

  'blog-modeles-de-decision': {
    heading: 'Modèles de décision : Jev, Elephant, d1 — et le routage de modèles',
    body: `Depuis septembre 2026, une nouvelle catégorie de modèles apparaît à côté des
LLM génératifs : les **modèles de décision** (ou « System One », d'après le
Système 1 de Kahneman). Ils ne génèrent pas de texte : on leur envoie un état
(texte, image) et des questions typées (choix, oui/non, score), et ils répondent
par une distribution de probabilités calibrée, en un seul passage. Je m'en sers
dans [Investia](/projets) : Jev prend les décisions, les gros modèles exécutent.

## Les acteurs principaux

- **Jev (TypeSafe AI)** — lancé le 15 septembre 2026, premier modèle « System One »
  public. API Decisions : état + questions, réponses typées avec probabilités.
  Environ 100 ms par appel, 0,042 $ par million de tokens en entrée, sorties
  gratuites. Version courante : jev-1.14.0 (14 octobre 2026).
- **d1 (Liquid AI)** — annoncé le 29 septembre 2026, premier modèle à dépasser Jev
  sur le Decision Index de Hugging Face (multilingue, plus robuste à l'injection de
  prompt, entrées plus longues). Sortie ouverte le 7 octobre 2026 : d1-3B et
  d1-omni-600M, poids ouverts, pensés pour l'edge (décisions en moins de 50 ms sur
  device). d1-ultra (hébergé) est n°1 de l'Index d'Artificial Analysis ; d1.2
  (16 novembre 2026) ajoute l'omnimodal.
- **Elephant-1 / Mammoth-1 (Base Labs, Baseten)** — publiés le 21 octobre 2026 :
  9B et 27B post-entraînés depuis Qwen3.5, attention block-bidirectionnelle, préfixe
  partagé pour répondre à plusieurs questions en un seul passage. Poids ouverts sur
  Hugging Face. Elephant-1 est le meilleur modèle 9B du Jev Decision Index (62,6) et
  partage la première place de l'Index d'Artificial Analysis (65,2) avec d1-ultra.
- À côté : l'API Decisions d'OpenAI (gpt-6-luna, bêta publique depuis le 6 octobre
  2026), pplx-decider (Perplexity), et des clones ouverts comme Kev, entraîné pour
  environ 95 $ de GPU.

## Comment on les compare

Deux benchmarks structurent le domaine : le **Jev Decision Index** (37 benchmarks
publics plus des tests privés, hébergé sur Hugging Face) et l'**Artificial Analysis
Decision Index**. La métrique qui compte le plus n'est pas le score brut mais la
**calibration** (erreur d'étalonnage, ECE) : une probabilité de 80 % doit signifier
« vrai 80 % du temps ». Sur ce critère, elephant-1 affiche 0,058 contre 0,080 pour
Jev 1.14.

## Cas d'usage concrets

- **Routage de modèles** : un ensemble de routes du type deterministic_code /
  fast_llm / reasoning_llm / human_review ; le modèle de décision choisit la voie,
  le LLM choisi fait le travail.
- **Garde-fous d'agent** : gating des appels d'outils (risque faible ou élevé),
  vérification de sortie, décision stop/continue dans la boucle d'agent. Sur le défi
  de routage d'Arize (52 cas), Jev en a réussi 49.
- **LLM-as-a-judge remplacé** : au lieu qu'un LLM rédige un verdict, le modèle de
  décision note avec une probabilité calibrée ; on fixe un seuil d'acceptation, un
  seuil de rejet, et on escalade vers un humain (ou un juge frontier) la zone
  incertaine. Le papier de Scale Labs montre qu'avec ce routage, Jev plus escalade
  atteint 90,7 % de réussite sur LLMBar en n'escaladant que 10 % des cas.
- **Triage et modération** : tri de tickets, détection de spam et de phishing,
  détection de jailbreak (d1 est annoncé plus robuste sur ce point), classification.

## Pourquoi le routage rapporte de l'argent

Le routage de modèles est déjà rentable avec un juge LLM classique : LiteLLM
rapporte 43 % d'économies, RouteLLM jusqu'à 85 %. Mais le routeur lui-même doit être
bon marché : un juge LLM ajoute 1 à 5 s par requête, ce qui peut annuler le gain sur
les requêtes courtes. Un modèle de décision dédié tourne en environ 100 ms pour un
coût 40 à 200 fois inférieur (jusqu'à 400 fois selon TypeSafe) : la décision
redevient quasi gratuite.

## Limites et précautions

- Un modèle de décision ne génère aucun texte : il ne remplace pas un LLM pour
  écrire, raisonner ou discuter. L'architecture gagnante est hybride, décision
  rapide d'un côté, génération de l'autre.
- Une sortie structurée n'immunise pas contre l'injection de prompt : testez les
  entrées adversariales.
- Validez sur vos propres labels humains avant de fixer les seuils (sur un split de
  développement, pas de test), et versionnez le modèle utilisé (jev-1.13.0 plutôt
  que latest).
- Les benchmarks publiés sont en partie auto-déclarés par les éditeurs ; croisez-les.

## Où je m'en sers

Dans [Investia](/projets), le harness délègue les décisions à Jev (faut-il
approfondir, quel outil appeler, faut-il escalader) derrière la gateway LiteLLM, et
réserve Mistral Large 4 et les petits modèles aux tâches de génération et de
raisonnement. C'est exactement le schéma décrit ici : des décisions calibrées et
peu coûteuses autour, de la génération là où elle a de la valeur.

## Sources

- [Jev vs LLM-as-a-judge — OpenRouter](https://openrouter.ai/blog/tutorials/jev-vs-llm-as-a-judge/)
- [Benchmark de modèles de décision — Arize](https://arize.com/blog/decision-model-benchmark/)
- [To Jev or Not to Jev — Scale Labs (arXiv:2611.00505)](https://arxiv.org/abs/2611.00505)
- [Open d1 — Liquid AI](https://www.liquid.ai/blog/d1-open)
- [Mammoth-1 et Elephant-1 — Base Labs](https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models)
- [elephant-1 sur Hugging Face](https://huggingface.co/baselabs/elephant-1)
- [Le rôle émergent des modèles de décision — Runware](https://runware.ai/blog/jev-laya-and-the-emerging-role-of-decision-models)`,
  },

  'blog-harness2-google': {
    heading: 'Harness² de Google : l’agent qui réécrit son propre harness',
    body: `Le 9 octobre 2026, Google Cloud AI Research et Northwestern publient
**Harness² : Recursive Agent Harnessing for an Open World** (arXiv:2610.14224), avec
le code sous Apache 2.0. L'idée tient en une phrase : ce n'est pas le modèle qui
fait l'agent, c'est le **harness** — prompts, outils, mémoire, skills, orchestration —
et ce harness peut être amélioré à la volée, poids du modèle figés.

## Le problème du monde ouvert

L'amélioration récursive des agents bute sur deux écueils en production : à
l'exécution, la tâche est inédite, donc aucun vérificateur ne dit si la réponse est
bonne ; et un réglage qui marche sur une tâche ne se généralise pas. Résultat : les
approches « mémoire » type ReasoningBank peuvent perdre jusqu'à 6,6 points sur le
code par rapport au harness de base.

## La méthode : deux niveaux de récursion

- **Niveau tâche** : un cycle contrastif **Propose–Probe–Compose**. Propose suggère
  des éditions du harness (prompt, outils, mémoire) ; Probe les teste par de vraies
  exécutions ; Compose garde ce qui marche. Aucun label de vérité requis : la décision
  se prend sur des contrastes de comportement entre versions.
- **Niveau harness** : une banque de leçons alimentée après chaque tâche (jusqu'à
  3 items titre–description–contenu extraits de la trajectoire) qui améliore le
  harness d'amélioration lui-même, pour que les prochaines tâches partent d'un
  meilleur point.

## Les résultats annoncés

Sur trois benchmarks professionnels (WorkBuddy-Bench, JobBench, LAB de Harvey) et
quatre configurations modèle-harness, une seule étape améliore systématiquement les
exécuteurs (Gemini 3.5 Flash et GLM-5, sous OpenCode et Codex) :

- jusqu'à **+11,5 points** sur WorkBuddy-Bench : GLM-5 sous OpenCode passe de 64,2 à
  75,7, au-dessus de Gemini 3.5 Flash avec son harness d'origine (72,4) ;
- jusqu'à **+4,5 points** sur JobBench (pire cas observé : +1,2) ;
- **+11,8 points** sur LAB (travail juridique), sur un test de 100 tâches held-out.

Moyennes sur 3 runs ; les gains augmentent avec le budget de récursion. L'éditeur par
défaut est Claude Opus 4.8.

## Ce que ça change concrètement

- Le **harness engineering** devient un poste à part entière, au même titre que le
  choix du modèle : « the harness is the moat, not the model ».
- Pas besoin de fine-tuner : on dépense du compute en test time (les probes), pas en
  entraînement.
- C'est plug-and-play sur des harness existants (OpenCode, Codex) ; la démo tient en
  deux commandes.
- Cas d'usage visés : tâches métiers longues et nouvelles — support, juridique,
  code — qu'aucun dataset d'entraînement ne couvre.

## Limites à garder en tête

- Les benchmarks sont professionnels mais restent des benchmarks à rubriques ; vos
  tâches de production n'en ont pas. La méthode contrastive est justement conçue pour
  ça, mais validez sur vos propres tâches.
- Les résultats du papier sont des moyennes, avec de la variance ; le pire cas observé
  reste positif (+1,2) mais faible.
- Le dépôt est jeune (environ 10 000 stars en deux semaines), avec des issues
  ouvertes, et précise que Harness² n'est pas un produit Google officiellement
  supporté.
- Chaque probe est une exécution d'agent : budgétez le coût d'inférence, et sandboxez
  — un harness édité automatiquement s'exécute quand même.

## Dans l'écosystème

Harness² s'inscrit dans une série de travaux sur les harness auto-améliorants :
MemoHarness (arXiv:2607.14159), HELIX (co-évolution modèle-harness, arXiv:2608.13951),
ReasoningBank. Il fait aussi écho au mouvement des
[modèles de décision](/blog/modeles-de-decision) : même constat — le modèle seul ne
suffit pas, c'est tout ce qui l'entoure (décisions rapides, mémoire, outils) qui fait
la différence. Chez moi, c'est la même discipline appliquée à la main : le harness
d'[Investia](/projets) est écrit explicitement (AGENTS.md, skills versionnés, specs
avant code). Harness² en est la version automatisée.

## Sources

- [Paper — arXiv:2610.14224](https://arxiv.org/abs/2610.14224)
- [Code — github.com/google-research/harness2](https://github.com/google-research/harness2)
- [Analyse — MarkTechPost](https://www.marktechpost.com/2026/10/18/google-harness2-recursive-agent-harnessing-framework/)
- [Retour d'expérience détaillé — ntorres.dev](https://ntorres.dev/blog/harness2-google-recursive-agent-harness)
- [Fiche papier — DAIR.AI](https://academy.dair.ai/papers/harness-2-recursive-agent-harnessing-for-an-open-world-2610.14224)`,
  },

  'blog-olala-ovh': {
    heading: 'Olala mini 7A1B : OVHcloud entre dans la course aux LLM souverains',
    body: `Le 17 novembre 2026, OVHcloud dévoile **Olala**, sa première famille de grands
modèles de langage, avec un premier modèle : **Olala mini 7A1B**. Lancement officiel
prévu le 19 novembre à l'OVHcloud AI Summit (Carrousel du Louvre). C'est la première
fois qu'un hébergeur européen se met à fabriquer des modèles, et le symbole est fort :
Mistral n'est plus seul en France.

## Ce qui est annoncé

- **Un modèle compact et ouvert** : Olala mini 7A1B repose sur une architecture inédite
  à attention hybride, avec 7 milliards de paramètres au total dont seulement 1
  milliard actif par requête. Résultat : il tourne sur une carte graphique de 8 Go de
  VRAM (160 tokens/s sur une RTX A4500) et même sur un simple processeur, sans GPU, à
  50 tokens/s.
- **Open source complet** : licence Apache 2.0 sur Hugging Face, avec les poids, le
  modèle de base pré-entraîné, un rapport technique et une documentation de conformité
  à l'AI Act.
- **Entraîné de zéro en Europe** : sur des supercalculateurs européens, un choix
  revendiqué de souveraineté plus que de performance brute.
- **Un premier client déjà dessus** : Qwant l'utilise en production et annonce 20 % de
  temps de réponse en moins et un coût IA divisé par trois.

## D'où vient le modèle

L'architecture vient de **Dragon LLM** (ex-Lingua Custodia), start-up parisienne
rachetée par OVHcloud en mars 2026 et rebaptisée **OVHai LLM** : des modèles spécialisés
pour les secteurs régulés, et le point de départ du laboratoire d'IA d'OVHcloud (AI
Lab), chargé d'entraîner et d'adapter des LLM souverains. Autre rachat de souveraineté
depuis janvier 2026 : Seald (chiffrement de bout en bout, SDK certifié ANSSI).

## Le contexte stratégique

- Octave Klaba avait annoncé le 20 octobre 2026, jour des résultats annuels, que
  l'entraînement du premier LLM touchait à sa fin : open source « fin novembre » selon
  La Tribune, « début 2027 » selon Reuters — le calendrier s'est finalement accéléré.
- OVHcloud publie un chiffre d'affaires de 1,145 Md€ (+7,2 %), un EBITDA de 480 M€
  (42 % de marge) et un free cash-flow positif pour la première fois depuis
  l'introduction en Bourse, après une levée de 3 Md€ en septembre 2026.
- Cinq couches visées pour l'IA : GPU, orchestration, tokens (AI Endpoints, catalogue
  ramené à 20 modèles dont 8 LLM — gpt-oss, Llama, Qwen), hébergement d'applications,
  et usages, avec OVHai Workspace (messagerie, stockage, visioconférence, IA agentique,
  chiffrement natif) en bêta.
- Positionnement assumé face à Mistral : « Mistral s'est déclaré concurrent d'OVHcloud,
  très bien », a répondu Klaba. Deux acteurs français, deux approches : la taille pour
  l'un, la sobriété pour l'autre.

## Ce qu'il faut en retenir — et ce qu'il ne faut pas attendre

- **Aucun benchmark publié** à ce stade : impossible de comparer Olala mini à Gemma,
  Qwen ou Ministral. Un modèle se juge sur des tâches réelles : suivre une consigne
  précise, lire un long document en français, appeler un outil sans se tromper, refuser
  d'inventer.
- La cible est claire : prouver qu'une entreprise européenne sait entraîner un LLM de
  zéro et le faire tourner localement, pas rivaliser avec les frontier models. Pour une
  PME française, c'est une option souveraine crédible pour des cas d'usage légers
  (résumé, classification, extraction), hébergés en Europe sous droit européen.
- Trois axes annoncés pour la suite : cybersécurité, code, agents métiers.

## Sources

- [OVHcloud — AI Summit 2026 et IA souveraine](https://blog.ovhcloud.com/fr/posts/ai-summit-2026-sovereign-ai/)
- [Numerama — OVH dévoile Olala](https://www.numerama.com/tech/2376025-ovh-devoile-olala-son-premier-modele-dia-open-source-mistral-nest-plus-seul-en-france.html)
- [Frandroid — Olala mini 7A1B tient sur un PC sans GPU](https://www.frandroid.com/culture-tech/intelligence-artificielle/3325653_olala-mini-la-premiere-ia-francaise-dovhcloud-tient-sur-un-pc-sans-carte-graphique-dediee)
- [La Tribune — interview d'Octave Klaba](https://www.latribune.fr/article/tech/intelligence-artificielle/16379106805600/octave-klaba-ovhcloud-nous-allons-apporter-sur-le-marche-un-llm-tres-en-avance-sur-son-temps)
- [Tensoria — ce qu'une PME peut attendre du LLM d'OVHcloud](https://tensoria.fr/blog/llm-ovhcloud-ce-qu-une-pme-peut-attendre)`,
  },

  'blog-mistral-automne-2026': {
    heading: 'Mistral à l’automne 2026 : Large 4 « Le Chonk », Voxtral 3 et Vibe 3.0 en Rust',
    body: `L'automne 2026 est dense pour Mistral AI : un flagship en poids ouverts, une
famille de modèles vocaux complète, et la réécriture en Rust de son agent de codage.
Trois annonces, une même ligne : souveraineté, agents, efficacité.

## Mistral Large 4 (« Le Chonk ») — poids ouverts le 29 octobre 2026

- **1 000 milliards de paramètres au total, 52 milliards actifs** (mixture-of-experts),
  natif multimodal avec un encodeur vision de 1,6B, **1 million de tokens de contexte**,
  entraîné from scratch sur 3 800 GPU Grace Blackwell dans les datacenters européens de
  Mistral.
- Aperçu public le 6 octobre, puis **trois semaines de RL supplémentaires** avant la
  sortie des poids sur Hugging Face le 29 octobre.
- Scores revendiqués : 61,7 % sur DeepSWE v1.1, 59,4 % sur SWE-Atlas-QnA, **41 % sur
  Terminal-Bench 4** (contre 28 % à l'aperçu ; ex-aequo avec GLM-5.3), **49,8 % sur le
  Coding Agent Index** (n°1 des modèles open), 19,7 % sur FrontierCode 2.0, **50,9 % sur
  l'Index Cyber d'Artificial Analysis**, avec des capacités de cyberdéfense (audit de
  code, inspection de logs, CVE) pensées pour l'auto-hébergement.
- **47 % de tokens en moins par tâche** que GLM-5.3 en moyenne ; trois niveaux de
  raisonnement (low / medium / high) ; multimodal avancé (images satellite gigapixels,
  dessins techniques, CAO 2D vers 3D, PDF).
- Serving optimisé : attention éparse, parallélisme de contexte, désagrégation
  prefill/decode, décodage spéculatif.

## Voxtral 3 — la voix, le 20 octobre 2026

- **Trois modèles de transcription** : Voxtral Small Transcribe 3 (WER macro 4,1 % sur 45
  langues FLEURS, ex-aequo avec le meilleur et loin devant Whisper large-v3 à 16 %),
  Voxtral Mini Transcribe 3 (4B), et Voxtral Mini Transcribe Realtime 3, à architecture
  nativement streaming avec une latence réglable de 240 ms à 2,4 s (moins de 500 ms
  annoncé), poids ouverts sur Hugging Face.
- **Voxtral Speech 3 (TTS)** : 35+ langues, 50+ dialectes, voix « Pro » clonées à partir
  de 30 minutes d'audio, tags d'émotion et de débit ; 13 $ par million de caractères.
- **SDK d'agents vocaux sur LiveKit** : une pipeline streaming en trois étapes,
  transcription temps réel, raisonnement et appels d'outils par un LLM (par exemple
  Mistral Small 4), réponse parlée, en moins d'une seconde par tour ; agents
  téléphoniques via SIP. Transcription à partir de **0,0035 $ par minute**, 50+
  langues dont les 24 langues officielles de l'UE, diarisation (cpWER 18,4 %, devant
  Pyannote) et context biasing (vocabulaire métier).
- Déploiement au choix : API hébergée dans l'UE (rétention zéro possible), aux États-Unis,
  ou auto-hébergé — l'argument souverain habituel de Mistral.

## Vibe 3.0 — le CLI réécrit en Rust (15 octobre 2026)

- **Un harness unifié** : le CLI, l'extension VS Code et Vibe Code Web (navigateur)
  tournent désormais sur le même cœur d'agent, écrit en **Rust**, qui garde l'état de
  la session et décide de l'étape suivante — le même code sur les trois supports.
- **Nouvelle interface en Rust (ratatui)** : un binaire natif qui ne fait que l'affichage
  et parle au serveur d'applications en JSON-RPC. Démarrage instantané, saisie native,
  rendu fluide des longues sessions. La version 3.0 lance toujours cette interface Rust
  (le mode plan disparaît).
- Vibe est né en décembre 2025 en Python + Textual ; le client Rust est arrivé en
  option à la v2.25 (septembre 2026) avant de devenir le focus des releases 2.26.x
  d'octobre.
- Modèle par défaut depuis mai 2026 : **Mistral Medium 3.5** (256k de contexte, 1,50 $
  par million de tokens en entrée, 7,50 $ en sortie), qui a remplacé Devstral 2 (retiré
  de l'API le 31 juillet 2026). Onboarding à la première exécution avec la clé API
  stockée dans le keyring du système, /teleport vers Vibe Code Web, sous-agents,
  connecteurs MCP, transcription vocale.

## Ce que ça dessine

- **Le flagship open européen** : Large 4 vise le poste de meilleur modèle open pour le
  codage agentique et la cyberdéfense, auto-hébergeable — avec environ 6 Md$ levés en
  trois ans, contre des centaines de milliards pour les laboratoires américains.
- **La voix comme brique souveraine** : Voxtral 3 propose une chaîne complète (ASR, LLM,
  TTS, SDK) hébergée dans l'UE, à des prix agressifs.
- **L'agent de codage local** : Vibe 3.0 trace la direction — cœur d'agent en Rust,
  identique sur tous les supports, modèle européen par défaut.

C'est exactement la stack que j'utilise au quotidien : Mistral Large 4 derrière LiteLLM
dans [Investia](/projets), et un harness d'agent écrit à la main — voir
[Harness² de Google](/blog/harness2-google) pour la version automatisée de cette
discipline.

## Sources

- [Mistral Large 4 — annonce](https://mistral.ai/news/mistral-large-4/)
- [Voxtral 3 — annonce](https://mistral.ai/news/voxtral-3/)
- [Voxtral Transcribe 2](https://mistral.ai/news/voxtral-transcribe-2/)
- [Docs audio — Mistral](https://docs.mistral.ai/studio/audio/overview)
- [Voxtral 3 — MarkTechPost](https://www.marktechpost.com/2026/10/20/mistral-voxtral-3-speech-models-voice-agent-sdk/)
- [Large 4 — Fortune](https://fortune.com/2026/10/29/mistral-releases-new-model-large-4-and-claims-top-open-model-for-agentic-coding-and-cyber-defense/)
- [Large 4, poids ouverts — SiliconANGLE](https://siliconangle.com/2026/10/29/mistral-releases-open-weights-for-mistral-large-4-providing-sovereign-control-for-the-companys-le-chonk-ai-model/)
- [Mistral Large 4 — alphaXiv](https://www.alphaxiv.org/abs/2611.mistral-large-4)
- [Vibe CLI 3.0 — annonce (issue GitHub)](https://github.com/mistralai/mistral-vibe/issues/1301)
- [mistral-vibe — releases](https://github.com/mistralai/mistral-vibe/releases)
- [Vibe 3.0 — analyse (vandeblaak.com)](https://www.vandeblaak.com/blog/mistral-vibe-de-europese-revolutie-in-ai-coding/?lang=en)`,
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

**Valentin Fiess**, 34470 Pérols, France. Contact : [formulaire de contact](/contact).
Il est également responsable de la
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

Utilisez le [formulaire de contact](/contact).

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
      "Je suis Valentin Fiess, ingénieur IA/Data basé à Montpellier, en France. Je travaille sur des systèmes RAG, des pipelines de données et des plateformes MLOps, et je suis actuellement ingénieur IA/Data chez Shaarp.",
  },
  {
    question: 'Quelles sont ses compétences techniques principales ?',
    answer:
      "Architectures RAG et orchestration de LLM, pipelines de données avec PostgreSQL et PGVector, MLOps et conteneurisation Docker, vision par ordinateur et OCR, et développement web avec Vue, React, FastAPI, Python, TypeScript et Go.",
  },
  {
    question: 'Comment le contacter ?',
    answer:
      `Via le formulaire de contact sur /contact (canal principal, protégé contre les envois automatisés), ou via LinkedIn à linkedin.com/in/valentin-fiess. La page /contact détaille les moyens de contact et les types de missions étudiées.`,
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
