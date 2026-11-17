# Olala mini 7A1B : OVHcloud entre dans la course aux LLM souverains

> OVHcloud dévoile Olala, sa première famille de LLM : Olala mini 7A1B, modèle compact 7A1B open source (Apache 2.0) entraîné de zéro sur des supercalculateurs européens, qui tourne sur 8 Go de VRAM voire sans GPU. Contexte, rachat de Dragon LLM et enjeux de souveraineté.

- URL canonique : https://valentin-fiess.fr/blog/olala-ovh
- Dernière mise à jour : 2026-11-17
- Auteur : Valentin Fiess

Le 17 novembre 2026, OVHcloud dévoile **Olala**, sa première famille de grands
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
- [Tensoria — ce qu'une PME peut attendre du LLM d'OVHcloud](https://tensoria.fr/blog/llm-ovhcloud-ce-qu-une-pme-peut-attendre)

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
