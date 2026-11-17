# Harness² de Google : l’agent qui réécrit son propre harness

> Le papier arXiv:2610.14224 et le framework open source google-research/harness2 : raffinement récursif du harness (prompts, outils, mémoire) à poids figés, Propose-Probe-Compose sans vérificateur, jusqu'à +11,5 points sur WorkBuddy-Bench.

- URL canonique : https://valentin-fiess.fr/blog/harness2-google
- Dernière mise à jour : 2026-11-17
- Auteur : Valentin Fiess

Le 9 octobre 2026, Google Cloud AI Research et Northwestern publient
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
- [Fiche papier — DAIR.AI](https://academy.dair.ai/papers/harness-2-recursive-agent-harnessing-for-an-open-world-2610.14224)

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
