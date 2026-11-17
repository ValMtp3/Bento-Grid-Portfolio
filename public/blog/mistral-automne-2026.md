# Mistral à l’automne 2026 : Large 4 « Le Chonk », Voxtral 3 et Vibe 3.0 en Rust

> Trois annonces Mistral : Mistral Large 4 (1T paramètres, poids ouverts, n°1 open du Coding Agent Index, cyberdéfense), Voxtral 3 (transcription 50+ langues, TTS, SDK d'agents vocaux LiveKit) et Vibe CLI 3.0 réécrit en Rust avec un harness unifié.

- URL canonique : https://valentin-fiess.fr/blog/mistral-automne-2026
- Dernière mise à jour : 2026-11-17
- Auteur : Valentin Fiess

L'automne 2026 est dense pour Mistral AI : un flagship en poids ouverts, une
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
- [Vibe 3.0 — analyse (vandeblaak.com)](https://www.vandeblaak.com/blog/mistral-vibe-de-europese-revolutie-in-ai-coding/?lang=en)

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
