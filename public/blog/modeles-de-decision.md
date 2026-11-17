# Modèles de décision : Jev, Elephant, d1 — et le routage de modèles

> Jev (TypeSafe), Elephant-1 (Base Labs) et d1 (Liquid AI) : ce que sont les modèles de décision System One, comment ils remplacent le LLM-as-a-judge et accélèrent le routage de modèles, avec cas d'usage, benchmarks et limites.

- URL canonique : https://valentin-fiess.fr/blog/modeles-de-decision
- Dernière mise à jour : 2026-11-17
- Auteur : Valentin Fiess

Depuis septembre 2026, une nouvelle catégorie de modèles apparaît à côté des
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
- [Le rôle émergent des modèles de décision — Runware](https://runware.ai/blog/jev-laya-and-the-emerging-role-of-decision-models)

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
