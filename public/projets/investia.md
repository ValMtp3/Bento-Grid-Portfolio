# Investia — étude de cas

> Étude de cas Investia : le harness d'agent IA que je construis à la main — portefeuille simulé de 10 000 €, décisions par modèle de décision (Jev), exécution par Mistral Large 4, données de marché temps réel.

- URL canonique : https://valentin-fiess.fr/projets/investia
- Dernière mise à jour : 2026-11-17
- Auteur : Valentin Fiess

Étude de cas : Investia, le harness d'agent IA que je construis à la main en
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
automatisée. Dépôt public : github.com/ValMtp3/investia.

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
